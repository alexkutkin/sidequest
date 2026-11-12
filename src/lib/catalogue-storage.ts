import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { catalogueSchema, promptMetadataSchema, sourceMetadataSchema, type PromptMetadata } from "../catalogue.ts";

export const cataloguePath = "src/content/catalogue.json";
export const promptFile = (id: string): string => resolve("src/content/prompts", `${promptMetadataSchema.shape.id.parse(id)}.md`);
export const licenseFile = (file: string): string => resolve("src/content/licenses", sourceMetadataSchema.shape.license.shape.file.parse(file));

export function parseCatalogue(contents: string): PromptMetadata[] {
  return catalogueSchema.parse(JSON.parse(contents));
}

export async function readCatalogue(): Promise<PromptMetadata[]> {
  return parseCatalogue(await readFile(cataloguePath, "utf8"));
}

export interface SavedPrompt {
  id: string;
  bytes: Uint8Array;
  license: { file: string; bytes: Uint8Array };
}

export async function saveCatalogue(entries: PromptMetadata[], prompts: SavedPrompt[]): Promise<void> {
  const files = new Map<string, Uint8Array>();
  for (const prompt of prompts) {
    files.set(promptFile(prompt.id), prompt.bytes);
    files.set(licenseFile(prompt.license.file), prompt.license.bytes);
  }
  files.set(resolve(cataloguePath), Buffer.from(JSON.stringify(catalogueSchema.parse(entries), null, 2) + "\n"));

  const originals = await Promise.all([...files.keys()].map(file => readFile(file)));
  const scratch = resolve(".scratch");
  await mkdir(scratch, { recursive: true });
  const staging = await mkdtemp(join(scratch, "source-update-"));
  if (dirname(staging) !== scratch) throw new Error("Source update staging must stay in .scratch.");
  const staged = [...files].map(([file, bytes], index) => ({
    file, bytes, original: originals[index], next: join(staging, `${index}.new`), backup: join(staging, `${index}.old`),
  }));
  const replaced: typeof staged = [];
  let retainBackups = false;
  try {
    for (const file of staged) {
      await writeFile(file.next, file.bytes);
      await writeFile(file.backup, file.original);
    }
    for (const file of staged) {
      await rename(file.next, file.file);
      replaced.push(file);
    }
  } catch (error) {
    const failures: unknown[] = [error];
    for (const file of replaced.reverse()) {
      try { await rename(file.backup, file.file); }
      catch (rollbackError) { failures.push(rollbackError); }
    }
    if (failures.length > 1) {
      retainBackups = true;
      throw new AggregateError(failures, `Source update rollback failed; original files remain in ${staging}.`);
    }
    throw error;
  } finally {
    if (!retainBackups) await rm(staging, { recursive: true, force: true });
  }
}
