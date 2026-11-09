export type PlaceExt = "rbxl" | "rbxm";

/** Drop the file in public/files/, then add one line: name, path, bytes. */
export const FILES: { name: string; file: string; bytes: number }[] = [
  { name: "Realistic ACS", file: "realistic-acs.rbxl", bytes: 31343808 },
  { name: "Untitled Shooter", file: "untitled-shooter.rbxl", bytes: 18262050 },
  { name: "som ACS", file: "som-acs.rbxl", bytes: 14902584 },
  { name: "nuycs ACS", file: "nuycs-acs.rbxm", bytes: 12731872 },
  { name: "Blackout", file: "blackout.rbxl", bytes: 10580801 },
  { name: "Parkour", file: "parkour.rbxl", bytes: 10131377 },
  { name: "ACF Neptune", file: "acf-neptune.rbxl", bytes: 10025785 },
  { name: "ACS Modern", file: "acs-modern.rbxl", bytes: 9206253 },
  { name: "Solo Showdown", file: "solo-showdown.rbxl", bytes: 9151927 },
  { name: "V.A. ACS", file: "va-acs.rbxl", bytes: 8719022 },
  { name: "ACS Gore", file: "acs-gore.rbxl", bytes: 7565584 },
  { name: "Rat Labs", file: "rat-labs.rbxl", bytes: 4637851 },
  { name: "OTS ACS", file: "ots-acs.rbxl", bytes: 3973813 },
  { name: "BMW M3 E92", file: "bmw-m3-e92.rbxm", bytes: 3502443 },
  { name: "A Core Game", file: "a-core-game.rbxl", bytes: 3420095 },
  { name: "Bite by Night", file: "bite-by-night.rbxl", bytes: 3009618 },
  { name: "BMW M2", file: "bmw-m2.rbxm", bytes: 2975387 },
  { name: "BMW M3 G81", file: "bmw-m3-g81.rbxm", bytes: 2640341 },
  { name: "BMW M3 Touring", file: "bmw-m3-touring.rbxm", bytes: 2311519 },
  { name: "Alpha Engine", file: "alpha-engine.rbxm", bytes: 1577361 },
  { name: "Shattered Aether", file: "shattered-aether.rbxl", bytes: 954581 },
  { name: "Training Facility", file: "training.rbxl", bytes: 706259 },
  { name: "Retro Studio", file: "retro-studio.rbxl", bytes: 245332 },
  { name: "FiveM Loading", file: "fivem-loading.rbxl", bytes: 88601 },
  { name: "Persona UI", file: "persona-ui.rbxm", bytes: 22904 },
  { name: "Solo UI", file: "solo-ui.rbxm", bytes: 16537 },
];

export function extOf(file: string): PlaceExt {
  return file.endsWith(".rbxm") ? "rbxm" : "rbxl";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? mb.toFixed(1) : mb.toFixed(2)} MB`;
}

export const ARCHIVE_BYTES = FILES.reduce((sum, file) => sum + file.bytes, 0);
