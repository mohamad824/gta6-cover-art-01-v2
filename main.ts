import { buildDossier } from "./vendor/makefun-app.ts";
import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const outputDir = (process.env.MAKEFUN_OUTPUT_DIR ?? "/output").replace(/\/+$/, "") || "/";

await mkdir(outputDir, { recursive: true });
await cp(join(rootDir, "app"), join(outputDir, "app"), { recursive: true });
const shotDir = join(outputDir, "screenshots");
await mkdir(shotDir, { recursive: true });
const shots = (await readdir(join(rootDir, "screenshots")).catch(() => []))
  .filter((name) => !name.startsWith("."))
  .sort();
for (const name of shots) {
  await cp(join(rootDir, "screenshots", name), join(shotDir, name));
}
const dossier = await buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots_max_count: 4,
  screenshots_max_bytes: 262144,
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_max_path_bytes: 1000,
});
await writeFile(join(outputDir, "dossier.json"), dossier);
