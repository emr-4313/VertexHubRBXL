import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, Search, Trash2, Upload } from "lucide-react";
import { ARCHIVE_BYTES, FILES, extOf, formatBytes, type PlaceExt } from "@/data/places";
import { OWNER_CODE } from "@/lib/owner-code";
import { UPLOAD_CHUNK_BYTES } from "@/lib/upload-limits";

export const Route = createFileRoute("/")({ component: Home });

const OWNER_FLAG = "vertex-owner";

type Filter = "all" | PlaceExt;
type SharedFile = { id: string; name: string; file: string; bytes: number };

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rbxl", label: "Place .rbxl" },
  { id: "rbxm", label: "Model .rbxm" },
];

type Row = {
  key: string;
  name: string;
  file: string;
  bytes: number;
  href: string;
  sharedId?: string;
};

function apiUrl(path: string) {
  return path;
}

function Home() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [owner, setOwner] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [shared, setShared] = useState<SharedFile[]>([]);
  const [addError, setAddError] = useState("");
  const [uploading, setUploading] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localStorage.getItem(OWNER_FLAG) === "1") setOwner(true);
    fetch(apiUrl("/api/uploads"))
      .then((response) => response.json())
      .then((payload: { files?: SharedFile[] }) => setShared(payload.files ?? []))
      .catch(() => {});
  }, []);

  const catalog = useMemo<Row[]>(() => {
    const uploaded = shared.map((file) => ({
      key: file.id,
      name: file.name,
      file: file.file,
      bytes: file.bytes,
      href: apiUrl(`/api/uploads/${file.id}`),
      sharedId: file.id,
    }));
    const bundled = FILES.map((file) => ({
      key: file.file,
      name: file.name,
      file: file.file,
      bytes: file.bytes,
      href: apiUrl(`/files/${file.file}`),
    }));
    return [...uploaded, ...bundled];
  }, [shared]);

  const files = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((file) => {
      const ext = extOf(file.file);
      if (filter !== "all" && ext !== filter) return false;
      if (!q) return true;
      return file.name.toLowerCase().includes(q) || file.file.toLowerCase().includes(q);
    });
  }, [catalog, query, filter]);

  async function copyLink(id: string, href: string) {
    const absolute = new URL(href, window.location.href).toString();
    try {
      await navigator.clipboard.writeText(absolute);
    } catch {
      const input = document.createElement("input");
      input.value = absolute;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1600);
  }

  function unlock() {
    if (code.trim().toLowerCase() !== OWNER_CODE) {
      setCodeError(true);
      return;
    }
    localStorage.setItem(OWNER_FLAG, "1");
    setOwner(true);
    setOwnerOpen(false);
    setCode("");
    setCodeError(false);
  }

  function lock() {
    localStorage.removeItem(OWNER_FLAG);
    setOwner(false);
  }

  async function onPick(list: FileList | null) {
    if (!list?.length) return;
    setAddError("");
    setUploading(true);
    try {
      for (const file of Array.from(list)) {
        const started = await fetch(apiUrl("/api/uploads"), {
          method: "POST",
          headers: { "content-type": "application/json", "x-owner-code": OWNER_CODE },
          body: JSON.stringify({ name: file.name, bytes: file.size }),
        });
        const created = (await started.json()) as { id?: string; error?: string };
        if (!started.ok || !created.id) throw new Error(created.error || "Upload failed.");
        const total = Math.ceil(file.size / UPLOAD_CHUNK_BYTES);
        for (let index = 0; index < total; index += 1) {
          const slice = file.slice(index * UPLOAD_CHUNK_BYTES, (index + 1) * UPLOAD_CHUNK_BYTES);
          const chunk = await fetch(apiUrl(`/api/uploads/${created.id}`), {
            method: "PUT",
            headers: {
              "content-type": "application/octet-stream",
              "x-owner-code": OWNER_CODE,
              "x-chunk-index": String(index),
            },
            body: slice,
          });
          if (!chunk.ok) {
            const payload = (await chunk.json().catch(() => ({}))) as { error?: string };
            throw new Error(payload.error || "Upload failed.");
          }
        }
        const finished = await fetch(apiUrl(`/api/uploads/${created.id}`), {
          method: "POST",
          headers: { "x-owner-code": OWNER_CODE },
        });
        const saved = (await finished.json()) as SharedFile & { error?: string };
        if (!finished.ok) throw new Error(saved.error || "Upload failed.");
        setShared((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      }
    } catch (error) {
      setAddError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (picker.current) picker.current.value = "";
    }
  }

  async function removeShared(id: string) {
    const response = await fetch(apiUrl(`/api/uploads/${id}`), {
      method: "DELETE",
      headers: { "x-owner-code": OWNER_CODE },
    });
    if (response.ok) setShared((current) => current.filter((file) => file.id !== id));
  }

  return (
    <div className="min-h-screen w-full bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="vertex-grid" aria-hidden="true" />
      <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-md">
        <a href="#files" className="flex items-center gap-3">
          <img src="/vertex-logo.png" alt="" className="size-8 object-contain mix-blend-screen" />
          <span className="text-xl font-bold tracking-tight">Vertex Hub</span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#files" className="text-sm font-medium text-muted transition-colors hover:text-foreground">
            Files
          </a>
          <a href="#open" className="text-sm font-medium text-muted transition-colors hover:text-foreground">
            How to open
          </a>
        </div>
        <a href="#files" className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-on-primary">
          Download
        </a>
      </nav>

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pt-32 pb-24 sm:px-6">
        <div className="mb-16 flex max-w-3xl flex-col items-center text-center">
          <img src="/vertex-logo.png" alt="" className="mb-8 size-32 object-contain mix-blend-screen" />
          <h1 className="mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
            Vertex Hub
          </h1>
          <p className="mb-4 max-w-2xl text-lg text-muted sm:text-xl">
            Not an app. Roblox place and model files. Download, then open in Studio.
          </p>
          <p className="mb-10 font-mono text-sm text-foreground">
            {FILES.length + shared.length} files · {formatBytes(ARCHIVE_BYTES + shared.reduce((sum, file) => sum + file.bytes, 0))}
          </p>
          <a href="#files" className="inline-flex h-12 items-center rounded-lg bg-primary px-8 text-lg font-semibold text-on-primary">
            Browse files
          </a>
        </div>

        <section id="files" className="mb-20 w-full max-w-5xl scroll-mt-24">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Files</h2>
            <p className="text-muted">Each file lives at files/name.rbxl or files/name.rbxm.</p>
          </div>

          {owner ? (
            <div className="mx-auto mb-6 flex max-w-xl flex-col items-center gap-3">
              <input
                ref={picker}
                type="file"
                accept=".rbxl,.rbxm,application/octet-stream"
                multiple
                className="sr-only"
                onChange={(event) => onPick(event.target.files)}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => picker.current?.click()}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold disabled:opacity-60"
              >
                <Upload className="size-4" aria-hidden="true" />
                {uploading ? "Uploading…" : "Upload a file"}
              </button>
              <p className="text-center text-sm text-muted">
                Goes on the site. Anyone can see it and download it. Only you can upload.
              </p>
              {addError ? <p className="text-sm text-foreground">{addError}</p> : null}
            </div>
          ) : null}

          <div className="mx-auto mb-4 flex max-w-xl items-center gap-2 rounded-xl border border-border/50 bg-card/50 px-4">
            <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <label className="sr-only" htmlFor="file-search">
              Search files
            </label>
            <input
              id="file-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name"
              suppressHydrationWarning
              className="h-12 w-full bg-transparent text-foreground outline-none placeholder:text-muted"
            />
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-2" role="group" aria-label="File type">
            {FILTERS.map((item) => {
              const active = filter === item.id;
              const count =
                item.id === "all" ? catalog.length : catalog.filter((file) => extOf(file.file) === item.id).length;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(item.id)}
                  className={
                    active
                      ? "h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary"
                      : "h-11 rounded-lg border border-border/50 bg-card/50 px-4 text-sm font-medium text-foreground"
                  }
                >
                  {item.label}
                  <span className="ml-2 font-mono">{count}</span>
                </button>
              );
            })}
          </div>

          {files.length === 0 ? (
            <p className="rounded-xl border border-border/50 bg-card/50 px-4 py-10 text-center text-muted">
              No files match this search.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {files.map((file) => {
                const ext = extOf(file.file);
                return (
                  <li
                    key={file.key}
                    className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card/50 p-6 transition-colors hover:border-border hover:bg-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">{file.name}</h3>
                        <p className="mt-1 truncate font-mono text-sm text-muted">
                          {file.sharedId ? "on the site" : `files/${file.file}`} · {formatBytes(file.bytes)}
                        </p>
                      </div>
                      <span className="rounded-lg border border-border/50 bg-background px-2 py-1 font-mono text-xs text-accent">
                        {ext.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted">
                      {ext === "rbxl"
                        ? "Place. Studio → File → Open from File."
                        : "Model. Drag it into the Explorer."}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <a
                        href={file.href}
                        download={file.file}
                        className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary"
                      >
                        <Download className="size-4" aria-hidden="true" />
                        Download
                      </a>
                      {owner && file.sharedId ? (
                        <button
                          type="button"
                          onClick={() => removeShared(file.sharedId!)}
                          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-transparent px-4 text-sm font-semibold text-foreground hover:bg-card"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => copyLink(file.key, file.href)}
                          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-transparent px-4 text-sm font-semibold text-foreground hover:bg-card"
                        >
                          <Copy className="size-4" aria-hidden="true" />
                          {copiedId === file.key ? "Copied" : "Copy link"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section id="open" className="w-full max-w-5xl scroll-mt-24">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">How to open</h2>
            <p className="text-muted">Two file types in Studio.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <article className="rounded-xl border border-border/50 bg-card/50 p-6">
              <p className="font-mono text-xs text-accent">.RBXL</p>
              <h3 className="mt-3 text-lg font-semibold">Place</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Roblox Studio → File → Open from File.
              </p>
            </article>
            <article className="rounded-xl border border-border/50 bg-card/50 p-6">
              <p className="font-mono text-xs text-accent">.RBXM</p>
              <h3 className="mt-3 text-lg font-semibold">Model</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                With a place open, drag the file into the Explorer.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/50 py-12 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} Vertex Hub. Place files.</p>
        {owner ? (
          <button type="button" onClick={lock} className="mt-3 text-xs hover:text-foreground">
            Lock this browser
          </button>
        ) : (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                setOwnerOpen((open) => !open);
                setCodeError(false);
              }}
              className="text-xs hover:text-foreground"
            >
              Owner
            </button>
            {ownerOpen ? (
              <form
                className="mx-auto mt-3 flex max-w-xs gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  unlock();
                }}
              >
                <label className="sr-only" htmlFor="owner-code">
                  Owner code
                </label>
                <input
                  id="owner-code"
                  type="password"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value);
                    setCodeError(false);
                  }}
                  placeholder="Code"
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-border/50 bg-card px-3 text-foreground outline-none"
                />
                <button type="submit" className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary">
                  Unlock
                </button>
              </form>
            ) : null}
            {codeError ? <p className="mt-2 text-xs">Wrong code.</p> : null}
          </div>
        )}
      </footer>
    </div>
  );
}
