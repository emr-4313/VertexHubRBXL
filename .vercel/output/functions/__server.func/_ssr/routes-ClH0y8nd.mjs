import { o as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Download, i as Search, o as Copy, r as Trash2, t as Upload } from "../_libs/lucide-react.mjs";
import { n as OWNER_CODE } from "./router-CUKCE-uO.mjs";
import { t as UPLOAD_CHUNK_BYTES } from "./upload-limits-Cnszi2p5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-ClH0y8nd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Drop the file in public/files/, then add one line: name, path, bytes. */
var FILES = [
	{
		name: "Realistic ACS",
		file: "realistic-acs.rbxl",
		bytes: 31343808
	},
	{
		name: "Untitled Shooter",
		file: "untitled-shooter.rbxl",
		bytes: 18262050
	},
	{
		name: "som ACS",
		file: "som-acs.rbxl",
		bytes: 14902584
	},
	{
		name: "nuycs ACS",
		file: "nuycs-acs.rbxm",
		bytes: 12731872
	},
	{
		name: "Blackout",
		file: "blackout.rbxl",
		bytes: 10580801
	},
	{
		name: "Parkour",
		file: "parkour.rbxl",
		bytes: 10131377
	},
	{
		name: "ACF Neptune",
		file: "acf-neptune.rbxl",
		bytes: 10025785
	},
	{
		name: "ACS Modern",
		file: "acs-modern.rbxl",
		bytes: 9206253
	},
	{
		name: "Solo Showdown",
		file: "solo-showdown.rbxl",
		bytes: 9151927
	},
	{
		name: "V.A. ACS",
		file: "va-acs.rbxl",
		bytes: 8719022
	},
	{
		name: "ACS Gore",
		file: "acs-gore.rbxl",
		bytes: 7565584
	},
	{
		name: "Rat Labs",
		file: "rat-labs.rbxl",
		bytes: 4637851
	},
	{
		name: "OTS ACS",
		file: "ots-acs.rbxl",
		bytes: 3973813
	},
	{
		name: "BMW M3 E92",
		file: "bmw-m3-e92.rbxm",
		bytes: 3502443
	},
	{
		name: "A Core Game",
		file: "a-core-game.rbxl",
		bytes: 3420095
	},
	{
		name: "Bite by Night",
		file: "bite-by-night.rbxl",
		bytes: 3009618
	},
	{
		name: "BMW M2",
		file: "bmw-m2.rbxm",
		bytes: 2975387
	},
	{
		name: "BMW M3 G81",
		file: "bmw-m3-g81.rbxm",
		bytes: 2640341
	},
	{
		name: "BMW M3 Touring",
		file: "bmw-m3-touring.rbxm",
		bytes: 2311519
	},
	{
		name: "Alpha Engine",
		file: "alpha-engine.rbxm",
		bytes: 1577361
	},
	{
		name: "Shattered Aether",
		file: "shattered-aether.rbxl",
		bytes: 954581
	},
	{
		name: "Training Facility",
		file: "training.rbxl",
		bytes: 706259
	},
	{
		name: "Retro Studio",
		file: "retro-studio.rbxl",
		bytes: 245332
	},
	{
		name: "FiveM Loading",
		file: "fivem-loading.rbxl",
		bytes: 88601
	},
	{
		name: "Persona UI",
		file: "persona-ui.rbxm",
		bytes: 22904
	},
	{
		name: "Solo UI",
		file: "solo-ui.rbxm",
		bytes: 16537
	}
];
function extOf(file) {
	return file.endsWith(".rbxm") ? "rbxm" : "rbxl";
}
function formatBytes(bytes) {
	if (bytes < 1048576) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	const mb = bytes / 1048576;
	return `${mb >= 10 ? mb.toFixed(1) : mb.toFixed(2)} MB`;
}
var ARCHIVE_BYTES = FILES.reduce((sum, file) => sum + file.bytes, 0);
var OWNER_FLAG = "vertex-owner";
var FILTERS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "rbxl",
		label: "Place .rbxl"
	},
	{
		id: "rbxm",
		label: "Model .rbxm"
	}
];
function apiUrl(path) {
	return path;
}
function Home() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [copiedId, setCopiedId] = (0, import_react.useState)(null);
	const [owner, setOwner] = (0, import_react.useState)(false);
	const [ownerOpen, setOwnerOpen] = (0, import_react.useState)(false);
	const [code, setCode] = (0, import_react.useState)("");
	const [codeError, setCodeError] = (0, import_react.useState)(false);
	const [shared, setShared] = (0, import_react.useState)([]);
	const [addError, setAddError] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const picker = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (localStorage.getItem(OWNER_FLAG) === "1") setOwner(true);
		fetch(apiUrl("/api/uploads")).then((response) => response.json()).then((payload) => setShared(payload.files ?? [])).catch(() => {});
	}, []);
	const catalog = (0, import_react.useMemo)(() => {
		const uploaded = shared.map((file) => ({
			key: file.id,
			name: file.name,
			file: file.file,
			bytes: file.bytes,
			href: apiUrl(`/api/uploads/${file.id}`),
			sharedId: file.id
		}));
		const bundled = FILES.map((file) => ({
			key: file.file,
			name: file.name,
			file: file.file,
			bytes: file.bytes,
			href: apiUrl(`/files/${file.file}`)
		}));
		return [...uploaded, ...bundled];
	}, [shared]);
	const files = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return catalog.filter((file) => {
			const ext = extOf(file.file);
			if (filter !== "all" && ext !== filter) return false;
			if (!q) return true;
			return file.name.toLowerCase().includes(q) || file.file.toLowerCase().includes(q);
		});
	}, [
		catalog,
		query,
		filter
	]);
	async function copyLink(id, href) {
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
			setCopiedId((current) => current === id ? null : current);
		}, 1600);
	}
	function unlock() {
		if (code.trim().toLowerCase() !== "eclipse") {
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
	async function onPick(list) {
		if (!list?.length) return;
		setAddError("");
		setUploading(true);
		try {
			for (const file of Array.from(list)) {
				const started = await fetch(apiUrl("/api/uploads"), {
					method: "POST",
					headers: {
						"content-type": "application/json",
						"x-owner-code": OWNER_CODE
					},
					body: JSON.stringify({
						name: file.name,
						bytes: file.size
					})
				});
				const created = await started.json();
				if (!started.ok || !created.id) throw new Error(created.error || "Upload failed.");
				const total = Math.ceil(file.size / UPLOAD_CHUNK_BYTES);
				for (let index = 0; index < total; index += 1) {
					const slice = file.slice(index * UPLOAD_CHUNK_BYTES, (index + 1) * UPLOAD_CHUNK_BYTES);
					const chunk = await fetch(apiUrl(`/api/uploads/${created.id}`), {
						method: "PUT",
						headers: {
							"content-type": "application/octet-stream",
							"x-owner-code": OWNER_CODE,
							"x-chunk-index": String(index)
						},
						body: slice
					});
					if (!chunk.ok) {
						const payload = await chunk.json().catch(() => ({}));
						throw new Error(payload.error || "Upload failed.");
					}
				}
				const finished = await fetch(apiUrl(`/api/uploads/${created.id}`), {
					method: "POST",
					headers: { "x-owner-code": OWNER_CODE }
				});
				const saved = await finished.json();
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
	async function removeShared(id) {
		if ((await fetch(apiUrl(`/api/uploads/${id}`), {
			method: "DELETE",
			headers: { "x-owner-code": "eclipse" }
		})).ok) setShared((current) => current.filter((file) => file.id !== id));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen w-full bg-background font-sans text-foreground selection:bg-primary/30",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "vertex-grid",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-md",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#files",
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/vertex-logo.png",
							alt: "",
							className: "size-8 object-contain mix-blend-screen"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xl font-bold tracking-tight",
							children: "Vertex Hub"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hidden items-center gap-8 md:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#files",
							className: "text-sm font-medium text-muted transition-colors hover:text-foreground",
							children: "Files"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#open",
							className: "text-sm font-medium text-muted transition-colors hover:text-foreground",
							children: "How to open"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#files",
						className: "rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-on-primary",
						children: "Download"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pt-32 pb-24 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-16 flex max-w-3xl flex-col items-center text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/vertex-logo.png",
								alt: "",
								className: "mb-8 size-32 object-contain mix-blend-screen"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl",
								children: "Vertex Hub"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-4 max-w-2xl text-lg text-muted sm:text-xl",
								children: "Not an app. Roblox place and model files. Download, then open in Studio."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-10 font-mono text-sm text-foreground",
								children: [
									FILES.length + shared.length,
									" files · ",
									formatBytes(ARCHIVE_BYTES + shared.reduce((sum, file) => sum + file.bytes, 0))
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#files",
								className: "inline-flex h-12 items-center rounded-lg bg-primary px-8 text-lg font-semibold text-on-primary",
								children: "Browse files"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "files",
						className: "mb-20 w-full max-w-5xl scroll-mt-24",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-8 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mb-2 text-3xl font-bold tracking-tight sm:text-4xl",
									children: "Files"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted",
									children: "Each file lives at files/name.rbxl or files/name.rbxm."
								})]
							}),
							owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mx-auto mb-6 flex max-w-xl flex-col items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: picker,
										type: "file",
										accept: ".rbxl,.rbxm,application/octet-stream",
										multiple: true,
										className: "sr-only",
										onChange: (event) => onPick(event.target.files)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: uploading,
										onClick: () => picker.current?.click(),
										className: "inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold disabled:opacity-60",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
											className: "size-4",
											"aria-hidden": "true"
										}), uploading ? "Uploading…" : "Upload a file"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-center text-sm text-muted",
										children: "Goes on the site. Anyone can see it and download it. Only you can upload."
									}),
									addError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-foreground",
										children: addError
									}) : null
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mx-auto mb-4 flex max-w-xl items-center gap-2 rounded-xl border border-border/50 bg-card/50 px-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
										className: "size-4 shrink-0 text-muted",
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "sr-only",
										htmlFor: "file-search",
										children: "Search files"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "file-search",
										value: query,
										onChange: (event) => setQuery(event.target.value),
										placeholder: "Search by name",
										suppressHydrationWarning: true,
										className: "h-12 w-full bg-transparent text-foreground outline-none placeholder:text-muted"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-6 flex flex-wrap justify-center gap-2",
								role: "group",
								"aria-label": "File type",
								children: FILTERS.map((item) => {
									const active = filter === item.id;
									const count = item.id === "all" ? catalog.length : catalog.filter((file) => extOf(file.file) === item.id).length;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										"aria-pressed": active,
										onClick: () => setFilter(item.id),
										className: active ? "h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary" : "h-11 rounded-lg border border-border/50 bg-card/50 px-4 text-sm font-medium text-foreground",
										children: [item.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-2 font-mono",
											children: count
										})]
									}, item.id);
								})
							}),
							files.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "rounded-xl border border-border/50 bg-card/50 px-4 py-10 text-center text-muted",
								children: "No files match this search."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "grid grid-cols-1 gap-6 md:grid-cols-2",
								children: files.map((file) => {
									const ext = extOf(file.file);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex flex-col gap-4 rounded-xl border border-border/50 bg-card/50 p-6 transition-colors hover:border-border hover:bg-card",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
														className: "truncate text-lg font-semibold",
														children: file.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "mt-1 truncate font-mono text-sm text-muted",
														children: [
															file.sharedId ? "on the site" : `files/${file.file}`,
															" · ",
															formatBytes(file.bytes)
														]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "rounded-lg border border-border/50 bg-background px-2 py-1 font-mono text-xs text-accent",
													children: ext.toUpperCase()
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm leading-relaxed text-muted",
												children: ext === "rbxl" ? "Place. Studio → File → Open from File." : "Model. Drag it into the Explorer."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-auto flex flex-wrap gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
													href: file.href,
													download: file.file,
													className: "inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
														className: "size-4",
														"aria-hidden": "true"
													}), "Download"]
												}), owner && file.sharedId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => removeShared(file.sharedId),
													className: "inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-transparent px-4 text-sm font-semibold text-foreground hover:bg-card",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
														className: "size-4",
														"aria-hidden": "true"
													}), "Remove"]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => copyLink(file.key, file.href),
													className: "inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-transparent px-4 text-sm font-semibold text-foreground hover:bg-card",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
														className: "size-4",
														"aria-hidden": "true"
													}), copiedId === file.key ? "Copied" : "Copy link"]
												})]
											})
										]
									}, file.key);
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						id: "open",
						className: "w-full max-w-5xl scroll-mt-24",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-8 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-2 text-3xl font-bold tracking-tight sm:text-4xl",
								children: "How to open"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "Two file types in Studio."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-6 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-xl border border-border/50 bg-card/50 p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs text-accent",
										children: ".RBXL"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-3 text-lg font-semibold",
										children: "Place"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-relaxed text-muted",
										children: "Roblox Studio → File → Open from File."
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-xl border border-border/50 bg-card/50 p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs text-accent",
										children: ".RBXM"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-3 text-lg font-semibold",
										children: "Model"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm leading-relaxed text-muted",
										children: "With a place open, drag the file into the Explorer."
									})
								]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "relative z-10 border-t border-border/50 py-12 text-center text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" Vertex Hub. Place files."
				] }), owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: lock,
					className: "mt-3 text-xs hover:text-foreground",
					children: "Lock this browser"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setOwnerOpen((open) => !open);
								setCodeError(false);
							},
							className: "text-xs hover:text-foreground",
							children: "Owner"
						}),
						ownerOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mx-auto mt-3 flex max-w-xs gap-2",
							onSubmit: (event) => {
								event.preventDefault();
								unlock();
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "sr-only",
									htmlFor: "owner-code",
									children: "Owner code"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "owner-code",
									type: "password",
									value: code,
									onChange: (event) => {
										setCode(event.target.value);
										setCodeError(false);
									},
									placeholder: "Code",
									autoComplete: "off",
									className: "h-11 min-w-0 flex-1 rounded-lg border border-border/50 bg-card px-3 text-foreground outline-none"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary",
									children: "Unlock"
								})
							]
						}) : null,
						codeError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs",
							children: "Wrong code."
						}) : null
					]
				})]
			})
		]
	});
}
//#endregion
export { Home as component };
