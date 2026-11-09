import { t as UPLOAD_CHUNK_BYTES } from "./upload-limits-Cnszi2p5.mjs";
import { join } from "node:path";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/uploads.server-BeVZhKw1.js
var ROOT = join(process.cwd(), "data", "uploads");
var ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function useDatabase() {
	return Boolean(process.env.DATABASE_URL?.trim());
}
async function openSql() {
	const { getSql } = await import("./db-Z6UP3KeQ.mjs");
	return getSql();
}
function assertId(id) {
	if (!ID_RE.test(id)) throw httpError(400, "Bad id.");
}
function httpError(status, message) {
	return Object.assign(new Error(message), { status });
}
function safeFileName(raw) {
	const lower = raw.toLowerCase();
	const ext = lower.endsWith(".rbxm") ? "rbxm" : lower.endsWith(".rbxl") ? "rbxl" : "";
	if (!ext) return null;
	return `${raw.slice(0, -(ext.length + 1)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "file"}.${ext}`;
}
function chunkCount(bytes) {
	return Math.ceil(bytes / UPLOAD_CHUNK_BYTES);
}
function expectedChunkLength(bytes, index) {
	const last = chunkCount(bytes) - 1;
	if (index < 0 || index > last) return -1;
	if (index < last) return UPLOAD_CHUNK_BYTES;
	return bytes - last * UPLOAD_CHUNK_BYTES;
}
async function listUploads() {
	if (useDatabase()) return (await (await openSql()).query("select id, name, file_name, bytes from uploads where ready = true order by created_at desc")).map((row) => ({
		id: row.id,
		name: row.name,
		file: row.file_name,
		bytes: Number(row.bytes)
	}));
	return (await readManifest()).filter((row) => row.ready).map(({ id, name, file, bytes }) => ({
		id,
		name,
		file,
		bytes
	}));
}
async function startUpload(rawName, bytes) {
	const file = safeFileName(rawName);
	if (!file) throw httpError(400, "Only .rbxl and .rbxm.");
	if (!Number.isFinite(bytes) || bytes < 1 || bytes > 67108864) throw httpError(400, "File is empty or larger than 64 MB.");
	const id = crypto.randomUUID();
	const name = rawName.replace(/\.(rbxl|rbxm)$/i, "") || file;
	const pending = {
		id,
		name,
		file,
		bytes,
		chunks: chunkCount(bytes)
	};
	if (useDatabase()) {
		await (await openSql()).query("insert into uploads (id, name, file_name, bytes, ready) values ($1, $2, $3, $4, false)", [
			id,
			name,
			file,
			bytes
		]);
		return { id };
	}
	await mkdir(join(ROOT, "parts", id), { recursive: true });
	await writeFile(join(ROOT, "parts", id, "meta.json"), JSON.stringify(pending));
	return { id };
}
async function saveChunk(id, index, body) {
	assertId(id);
	const expected = expectedChunkLength((await readPending(id)).bytes, index);
	if (expected < 1 || body.byteLength !== expected) throw httpError(400, "Bad chunk.");
	if (useDatabase()) {
		await (await openSql()).query("insert into upload_chunks (upload_id, idx, body) values ($1, $2, $3) on conflict (upload_id, idx) do update set body = excluded.body", [
			id,
			index,
			Buffer.from(body)
		]);
		return;
	}
	await writeFile(join(ROOT, "parts", id, String(index)), body);
}
async function finishUpload(id) {
	assertId(id);
	const pending = await readPending(id);
	const parts = [];
	if (useDatabase()) {
		const sql = await openSql();
		const rows = await sql.query("select idx, body from upload_chunks where upload_id = $1 order by idx", [id]);
		if (rows.length !== pending.chunks) throw httpError(400, "Upload incomplete.");
		for (let i = 0; i < rows.length; i += 1) {
			if (Number(rows[i].idx) !== i) throw httpError(400, "Upload incomplete.");
			parts.push(rows[i].body);
		}
		const body = Buffer.concat(parts);
		if (body.byteLength !== pending.bytes) throw httpError(400, "Upload incomplete.");
		await sql.query("update uploads set body = $2, ready = true where id = $1", [id, body]);
		await sql.query("delete from upload_chunks where upload_id = $1", [id]);
		return {
			id,
			name: pending.name,
			file: pending.file,
			bytes: pending.bytes
		};
	}
	for (let i = 0; i < pending.chunks; i += 1) parts.push(await readFile(join(ROOT, "parts", id, String(i))));
	const body = Buffer.concat(parts);
	if (body.byteLength !== pending.bytes) throw httpError(400, "Upload incomplete.");
	await mkdir(join(ROOT, "files"), { recursive: true });
	await writeFile(join(ROOT, "files", id), body);
	const manifest = await readManifest();
	manifest.unshift({
		...pending,
		ready: true
	});
	await writeManifest(manifest);
	await rm(join(ROOT, "parts", id), {
		recursive: true,
		force: true
	});
	return {
		id,
		name: pending.name,
		file: pending.file,
		bytes: pending.bytes
	};
}
async function readUpload(id) {
	if (!ID_RE.test(id)) return null;
	if (useDatabase()) {
		const row = (await (await openSql()).query("select name, file_name, bytes, body from uploads where id = $1 and ready = true", [id]))[0];
		if (!row?.body) return null;
		return {
			meta: {
				id,
				name: row.name,
				file: row.file_name,
				bytes: Number(row.bytes)
			},
			body: row.body
		};
	}
	const meta = (await readManifest()).find((row) => row.id === id && row.ready);
	if (!meta) return null;
	return {
		meta,
		body: await readFile(join(ROOT, "files", id))
	};
}
async function deleteUpload(id) {
	assertId(id);
	if (useDatabase()) {
		const sql = await openSql();
		await sql.query("delete from upload_chunks where upload_id = $1", [id]);
		await sql.query("delete from uploads where id = $1", [id]);
		return;
	}
	await writeManifest((await readManifest()).filter((row) => row.id !== id));
	await rm(join(ROOT, "files", id), { force: true });
	await rm(join(ROOT, "parts", id), {
		recursive: true,
		force: true
	});
}
async function readPending(id) {
	if (useDatabase()) {
		const row = (await (await openSql()).query("select name, file_name, bytes, ready from uploads where id = $1", [id]))[0];
		if (!row || row.ready) throw httpError(404, "Upload not found.");
		return {
			id,
			name: row.name,
			file: row.file_name,
			bytes: Number(row.bytes),
			chunks: chunkCount(Number(row.bytes))
		};
	}
	try {
		const raw = await readFile(join(ROOT, "parts", id, "meta.json"), "utf8");
		return JSON.parse(raw);
	} catch {
		throw httpError(404, "Upload not found.");
	}
}
async function readManifest() {
	try {
		const raw = await readFile(join(ROOT, "manifest.json"), "utf8");
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
async function writeManifest(rows) {
	await mkdir(ROOT, { recursive: true });
	await writeFile(join(ROOT, "manifest.json"), JSON.stringify(rows));
}
//#endregion
export { deleteUpload, finishUpload, listUploads, readUpload, saveChunk, startUpload };
