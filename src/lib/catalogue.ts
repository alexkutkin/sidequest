import { readFile } from "node:fs/promises";
import { getCollection } from "astro:content";
import type { PromptMetadata, SourceMetadata } from "../catalogue";
import { sitePath } from "../site";
import { licenseFile, promptFile } from "./catalogue-storage";

export type Prompt = Omit<PromptMetadata, "source"> & {
  rawPath: string;
  bytes: Uint8Array;
  text: string;
  source: (Omit<SourceMetadata, "license"> & {
    originalUrl: string;
    snapshotUrl: string;
    license: SourceMetadata["license"] & { rawPath: string; bytes: Uint8Array };
  }) | null;
};

export async function getCatalogue(): Promise<Prompt[]> {
  const entries = await getCollection("catalogue");
  return Promise.all(entries.sort((a, b) => a.data.order - b.data.order).map(async ({ id, data }) => {
    const bytes = await readFile(promptFile(id));
    const source = data.source;
    const sourceUrl = source ? `https://github.com/${source.owner}/${source.repo}/blob/` : "";
    return {
      ...data,
      id,
      rawPath: sitePath(`prompts/${id}.md`),
      bytes,
      text: bytes.toString("utf8"),
      source: source ? {
        ...source,
        originalUrl: `${sourceUrl}${source.ref}/${source.path}`,
        snapshotUrl: `${sourceUrl}${source.revision}/${source.path}`,
        license: {
          ...source.license,
          rawPath: sitePath(`prompts/${source.license.file}`),
          bytes: await readFile(licenseFile(source.license.file)),
        },
      } : null,
    };
  }));
}
