import { readFile } from "node:fs/promises";
import { promptMetadataSchema } from "../src/catalogue.ts";
import { licenseFile, promptFile, readCatalogue, saveCatalogue, type SavedPrompt } from "../src/lib/catalogue-storage.ts";
import { inspectSource } from "./source-inspection.ts";

const args = process.argv.slice(2);
const write = args.includes("--write");
const ids = args.filter(arg => arg !== "--write");
if (ids.length > 1 || ids.some(id => !promptMetadataSchema.shape.id.safeParse(id).success)) {
  throw new Error("Usage: node scripts/update-sources.ts [prompt-id] [--write]");
}

const catalogue = await readCatalogue();
const originalCatalogue = JSON.stringify(catalogue);
const selected = catalogue.flatMap(entry => entry.source && (!ids.length || ids.includes(entry.id)) ? [{ entry, source: entry.source }] : []);
if (!selected.length) throw new Error("No matching imported prompts.");
const today = new Date().toISOString().slice(0, 10);
const updates: SavedPrompt[] = [];

for (const { entry, source } of selected) {
  const result = await inspectSource(source, today, process.env.GITHUB_TOKEN);
  if (result.state === "stopped") {
    source.update = result.update;
    console.log(`${entry.id}: ${result.update.state}; keeping saved text. ${result.detail}`);
    process.exitCode = 1;
    continue;
  }
  const saved = await readFile(promptFile(entry.id));
  const savedLicense = await readFile(licenseFile(source.license.file));
  const changed = !saved.equals(result.bytes) || !savedLicense.equals(result.licenseBytes);
  if (changed) {
    console.log(`${entry.id}: ${write ? "updating" : "update available"} at ${result.revision}`);
    if (write) {
      updates.push({ id: entry.id, bytes: result.bytes, license: { file: source.license.file, bytes: result.licenseBytes } });
      source.revision = result.revision;
      source.savedAt = today;
    }
  } else {
    console.log(`${entry.id}: saved text and license match ${result.revision}`);
  }
  source.update = { state: "current" };
}

if (write) {
  if (JSON.stringify(catalogue) !== originalCatalogue || updates.length) await saveCatalogue(catalogue, updates);
  console.log("Review git diff, including EN/RU descriptions, before publishing.");
} else {
  console.log("No files changed. Run with --write to save eligible updates and source status.");
}
