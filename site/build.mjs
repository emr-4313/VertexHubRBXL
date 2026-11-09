import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { FILES, extOf, formatBytes } from "../src/data/places.ts";

const out = "_site";
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/files`, { recursive: true });
cpSync("public/files", `${out}/files`, { recursive: true });
cpSync("public/favicon.svg", `${out}/favicon.svg`);
cpSync("public/vertex-logo.png", `${out}/vertex-logo.png`);

const total = FILES.reduce((sum, file) => sum + file.bytes, 0);
const catalog = FILES.map((file) => ({
  name: file.name,
  file: file.file,
  bytes: file.bytes,
  ext: extOf(file.file),
  size: formatBytes(file.bytes),
}));

const html = `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vertex Hub</title>
  <meta name="description" content="Vertex Hub — Roblox place and model files. Download, then open in Studio." />
  <meta name="theme-color" content="#080808" />
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root { color-scheme: dark; --bg: hsl(0 0% 3%); --fg: hsl(0 0% 95%); --muted: hsl(0 0% 65%); --border: hsl(0 0% 12%); --card: hsl(0 0% 5%); --accent: hsl(230 100% 67%); }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: var(--bg); color: var(--fg); font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    .grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px); background-size: 40px 40px; animation: drift 14s linear infinite; }
    @keyframes drift { to { background-position: 40px 40px; } }
    @media (prefers-reduced-motion: reduce) { .grid { animation: none; } }
    nav, main, footer { position: relative; z-index: 1; }
    nav { position: sticky; top: 0; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 24px; border-bottom: 1px solid color-mix(in oklab, var(--border) 50%, transparent); background: color-mix(in oklab, var(--bg) 80%, transparent); backdrop-filter: blur(12px); }
    a { color: inherit; text-decoration: none; }
    .brand { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 20px; }
    .brand img { width: 32px; height: 32px; object-fit: contain; mix-blend-mode: screen; }
    .nav-links { display: flex; gap: 32px; color: var(--muted); font-size: 14px; font-weight: 500; }
    .btn { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 16px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--fg); font-weight: 600; font-size: 14px; cursor: pointer; }
    .btn.solid { background: #fff; color: #0d0d0d; border-color: #fff; }
    .hero { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 96px 16px 48px; }
    .hero img { width: 128px; height: 128px; object-fit: contain; mix-blend-mode: screen; margin-bottom: 32px; }
    h1 { margin: 0 0 24px; font-size: clamp(40px, 6vw, 60px); letter-spacing: -0.04em; background: linear-gradient(#f2f2f2, rgba(242,242,242,.6)); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .lede { max-width: 40rem; color: var(--muted); font-size: 20px; }
    .count { font-family: "JetBrains Mono", ui-monospace, monospace; }
    .wrap { width: min(64rem, calc(100% - 32px)); margin: 0 auto 80px; }
    h2 { text-align: center; font-size: clamp(28px, 4vw, 36px); margin: 0 0 8px; }
    .sub { text-align: center; color: var(--muted); margin: 0 0 32px; }
    .search { display: flex; align-items: center; max-width: 36rem; margin: 0 auto 16px; border: 1px solid color-mix(in oklab, var(--border) 50%, transparent); background: color-mix(in oklab, var(--card) 50%, transparent); border-radius: 12px; padding: 0 16px; }
    .search input { height: 48px; width: 100%; border: 0; background: transparent; color: var(--fg); outline: none; font: inherit; }
    .filters { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 24px; }
    .filters button[aria-pressed="true"] { background: #fff; color: #0d0d0d; border-color: #fff; }
    .cards { display: grid; grid-template-columns: 1fr; gap: 24px; }
    @media (min-width: 768px) { .cards, .help { grid-template-columns: 1fr 1fr; } .nav-links { display: flex; } }
    @media (max-width: 767px) { .nav-links { display: none; } }
    .card, .help article { border: 1px solid color-mix(in oklab, var(--border) 50%, transparent); background: color-mix(in oklab, var(--card) 50%, transparent); border-radius: 12px; padding: 24px; }
    .card h3 { margin: 0; font-size: 18px; }
    .meta { margin: 4px 0 0; color: var(--muted); font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 14px; overflow: hidden; text-overflow: ellipsis; }
    .top { display: flex; justify-content: space-between; gap: 12px; }
    .tag { border: 1px solid color-mix(in oklab, var(--border) 50%, transparent); border-radius: 8px; padding: 4px 8px; color: var(--accent); font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; }
    .note { color: var(--muted); font-size: 14px; }
    .actions { display: flex; gap: 8px; margin-top: 16px; }
    .empty { text-align: center; color: var(--muted); padding: 40px 16px; border: 1px solid color-mix(in oklab, var(--border) 50%, transparent); border-radius: 12px; }
    .help { display: grid; gap: 24px; }
    .kicker { color: var(--accent); font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; margin: 0; }
    footer { border-top: 1px solid color-mix(in oklab, var(--border) 50%, transparent); text-align: center; color: var(--muted); padding: 48px 16px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="grid" aria-hidden="true"></div>
  <nav>
    <a class="brand" href="#files"><img src="vertex-logo.png" alt="" />Vertex Hub</a>
    <div class="nav-links"><a href="#files">Files</a><a href="#open">How to open</a></div>
    <a class="btn solid" href="#files">Download</a>
  </nav>
  <main>
    <section class="hero">
      <img src="vertex-logo.png" alt="" />
      <h1>Vertex Hub</h1>
      <p class="lede">Not an app. Roblox place and model files. Download, then open in Studio.</p>
      <p class="count">${FILES.length} files · ${formatBytes(total)}</p>
      <a class="btn solid" href="#files" style="height:48px;padding:0 32px;font-size:18px">Browse files</a>
    </section>
    <section class="wrap" id="files">
      <h2>Files</h2>
      <p class="sub">Each file lives at files/name.rbxl or files/name.rbxm.</p>
      <div class="search"><input id="q" type="search" placeholder="Search by name" /></div>
      <div class="filters" role="group" aria-label="File type">
        <button class="btn" type="button" data-filter="all" aria-pressed="true">All <span class="count" id="c-all"></span></button>
        <button class="btn" type="button" data-filter="rbxl" aria-pressed="false">Place .rbxl <span class="count" id="c-rbxl"></span></button>
        <button class="btn" type="button" data-filter="rbxm" aria-pressed="false">Model .rbxm <span class="count" id="c-rbxm"></span></button>
      </div>
      <div class="cards" id="cards"></div>
    </section>
    <section class="wrap" id="open">
      <h2>How to open</h2>
      <p class="sub">Two file types in Studio.</p>
      <div class="help">
        <article><p class="kicker">.RBXL</p><h3>Place</h3><p class="note">Roblox Studio → File → Open from File.</p></article>
        <article><p class="kicker">.RBXM</p><h3>Model</h3><p class="note">With a place open, drag the file into the Explorer.</p></article>
      </div>
    </section>
  </main>
  <footer>© ${new Date().getFullYear()} Vertex Hub. Place files.</footer>
  <script>
    const FILES = ${JSON.stringify(catalog)};
    const cards = document.querySelector("#cards");
    const q = document.querySelector("#q");
    let filter = "all";
    const counts = { all: FILES.length, rbxl: FILES.filter(f => f.ext === "rbxl").length, rbxm: FILES.filter(f => f.ext === "rbxm").length };
    for (const key of Object.keys(counts)) document.querySelector("#c-" + key).textContent = counts[key];
    function note(file) {
      return file.ext === "rbxl" ? "Place. Studio → File → Open from File." : "Model. Drag it into the Explorer.";
    }
    function draw() {
      const query = q.value.trim().toLowerCase();
      const rows = FILES.filter(file => (filter === "all" || file.ext === filter) && (!query || file.name.toLowerCase().includes(query) || file.file.includes(query)));
      cards.innerHTML = rows.length ? rows.map(file => \`
        <article class="card">
          <div class="top"><div><h3>\${file.name}</h3><p class="meta">files/\${file.file} · \${file.size}</p></div><span class="tag">\${file.ext.toUpperCase()}</span></div>
          <p class="note">\${note(file)}</p>
          <div class="actions"><a class="btn solid" href="files/\${file.file}" download="\${file.file}">Download</a></div>
        </article>\`).join("") : '<p class="empty">No files match this search.</p>';
    }
    q.addEventListener("input", draw);
    for (const button of document.querySelectorAll("[data-filter]")) {
      button.addEventListener("click", () => {
        filter = button.dataset.filter;
        for (const item of document.querySelectorAll("[data-filter]")) item.setAttribute("aria-pressed", String(item === button));
        draw();
      });
    }
    draw();
  </script>
</body>
</html>
`;

writeFileSync(`${out}/index.html`, html);
console.log(`built ${out} with ${FILES.length} files`);
