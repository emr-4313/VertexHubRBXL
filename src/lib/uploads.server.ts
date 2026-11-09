import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { UPLOAD_CHUNK_BYTES, UPLOAD_MAX_BYTES } from "./upload-limits";

export type UploadMeta = {
  id: string;
  name: string;
  file: string;
  bytes: number;
};

type Pending = UploadMeta & { chunks: number };

const ROOT = join(process.cwd(), "data", "uploads");
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function useDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function openSql() {
  const { getSql } = await import("./db");
  return getSql();
}

function assertId(id: string) {
  if (!ID_RE.test(id)) throw httpError(400, "Bad id.");
}

export function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export function safeFileName(raw: string): string | null {
  const lower = raw.toLowerCase();
  const ext = lower.endsWith(".rbxm") ? "rbxm" : lower.endsWith(".rbxl") ? "rbxl" : "";
  if (!ext) return null;
  const base = raw
    .slice(0, -(ext.length + 1))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base || "file"}.${ext}`;
}

function chunkCount(bytes: number) {
  return Math.ceil(bytes / UPLOAD_CHUNK_BYTES);
}

function expectedChunkLength(bytes: number, index: number) {
  const last = chunkCount(bytes) - 1;
  if (index < 0 || index > last) return -1;
  if (index < last) return UPLOAD_CHUNK_BYTES;
  return bytes - last * UPLOAD_CHUNK_BYTES;
}

export async function listUploads(): Promise<UploadMeta[]> {
  if (useDatabase()) {
    const sql = await openSql();
    const rows = await sql.query<{ id: string; name: string; file_name: string; bytes: number }>(
      "select id, name, file_name, bytes from uploads where ready = true order by created_at desc",
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      file: row.file_name,
      bytes: Number(row.bytes),
    }));
  }
  const manifest = await readManifest();
  return manifest.filter((row) => row.ready).map(({ id, name, file, bytes }) => ({ id, name, file, bytes }));
}

export async function startUpload(rawName: string, bytes: number): Promise<{ id: string }> {
  const file = safeFileName(rawName);
  if (!file) throw httpError(400, "Only .rbxl and .rbxm.");
  if (!Number.isFinite(bytes) || bytes < 1 || bytes > UPLOAD_MAX_BYTES) {
    throw httpError(400, "File is empty or larger than 64 MB.");
  }
  const id = crypto.randomUUID();
  const name = rawName.replace(/\.(rbxl|rbxm)$/i, "") || file;
  const pending: Pending = { id, name, file, bytes, chunks: chunkCount(bytes) };
  if (useDatabase()) {
    const sql = await openSql();
    await sql.query(
      "insert into uploads (id, name, file_name, bytes, ready) values ($1, $2, $3, $4, false)",
      [id, name, file, bytes],
    );
    return { id };
  }
  await mkdir(join(ROOT, "parts", id), { recursive: true });
  await writeFile(join(ROOT, "parts", id, "meta.json"), JSON.stringify(pending));
  return { id };
}

export async function saveChunk(id: string, index: number, body: Uint8Array) {
  assertId(id);
  const pending = await readPending(id);
  const expected = expectedChunkLength(pending.bytes, index);
  if (expected < 1 || body.byteLength !== expected) throw httpError(400, "Bad chunk.");
  if (useDatabase()) {
    const sql = await openSql();
    await sql.query(
      "insert into upload_chunks (upload_id, idx, body) values ($1, $2, $3) on conflict (upload_id, idx) do update set body = excluded.body",
      [id, index, Buffer.from(body)],
    );
    return;
  }
  await writeFile(join(ROOT, "parts", id, String(index)), body);
}

export async function finishUpload(id: string): Promise<UploadMeta> {
  assertId(id);
  const pending = await readPending(id);
  const parts: Uint8Array[] = [];
  if (useDatabase()) {
    const sql = await openSql();
    const rows = await sql.query<{ idx: number; body: Buffer }>(
      "select idx, body from upload_chunks where upload_id = $1 order by idx",
      [id],
    );
    if (rows.length !== pending.chunks) throw httpError(400, "Upload incomplete.");
    for (let i = 0; i < rows.length; i += 1) {
      if (Number(rows[i].idx) !== i) throw httpError(400, "Upload incomplete.");
      parts.push(rows[i].body);
    }
    const body = Buffer.concat(parts);
    if (body.byteLength !== pending.bytes) throw httpError(400, "Upload incomplete.");
    await sql.query("update uploads set body = $2, ready = true where id = $1", [id, body]);
    await sql.query("delete from upload_chunks where upload_id = $1", [id]);
    return { id, name: pending.name, file: pending.file, bytes: pending.bytes };
  }
  for (let i = 0; i < pending.chunks; i += 1) {
    parts.push(await readFile(join(ROOT, "parts", id, String(i))));
  }
  const body = Buffer.concat(parts);
  if (body.byteLength !== pending.bytes) throw httpError(400, "Upload incomplete.");
  await mkdir(join(ROOT, "files"), { recursive: true });
  await writeFile(join(ROOT, "files", id), body);
  const manifest = await readManifest();
  manifest.unshift({ ...pending, ready: true });
  await writeManifest(manifest);
  await rm(join(ROOT, "parts", id), { recursive: true, force: true });
  return { id, name: pending.name, file: pending.file, bytes: pending.bytes };
}

export async function readUpload(id: string): Promise<{ meta: UploadMeta; body: Uint8Array } | null> {
  if (!ID_RE.test(id)) return null;
  if (useDatabase()) {
    const sql = await openSql();
    const rows = await sql.query<{ name: string; file_name: string; bytes: number; body: Buffer }>(
      "select name, file_name, bytes, body from uploads where id = $1 and ready = true",
      [id],
    );
    const row = rows[0];
    if (!row?.body) return null;
    return {
      meta: { id, name: row.name, file: row.file_name, bytes: Number(row.bytes) },
      body: row.body,
    };
  }
  const meta = (await readManifest()).find((row) => row.id === id && row.ready);
  if (!meta) return null;
  const body = await readFile(join(ROOT, "files", id));
  return { meta, body };
}

export async function deleteUpload(id: string) {
  assertId(id);
  if (useDatabase()) {
    const sql = await openSql();
    await sql.query("delete from upload_chunks where upload_id = $1", [id]);
    await sql.query("delete from uploads where id = $1", [id]);
    return;
  }
  const manifest = (await readManifest()).filter((row) => row.id !== id);
  await writeManifest(manifest);
  await rm(join(ROOT, "files", id), { force: true });
  await rm(join(ROOT, "parts", id), { recursive: true, force: true });
}

async function readPending(id: string): Promise<Pending> {
  if (useDatabase()) {
    const sql = await openSql();
    const rows = await sql.query<{ name: string; file_name: string; bytes: number; ready: boolean }>(
      "select name, file_name, bytes, ready from uploads where id = $1",
      [id],
    );
    const row = rows[0];
    if (!row || row.ready) throw httpError(404, "Upload not found.");
    return {
      id,
      name: row.name,
      file: row.file_name,
      bytes: Number(row.bytes),
      chunks: chunkCount(Number(row.bytes)),
    };
  }
  try {
    const raw = await readFile(join(ROOT, "parts", id, "meta.json"), "utf8");
    return JSON.parse(raw) as Pending;
  } catch {
    throw httpError(404, "Upload not found.");
  }
}

type DiskRow = UploadMeta & { ready: boolean };

async function readManifest(): Promise<DiskRow[]> {
  try {
    const raw = await readFile(join(ROOT, "manifest.json"), "utf8");
    const parsed = JSON.parse(raw) as DiskRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeManifest(rows: DiskRow[]) {
  await mkdir(ROOT, { recursive: true });
  await writeFile(join(ROOT, "manifest.json"), JSON.stringify(rows));
}

