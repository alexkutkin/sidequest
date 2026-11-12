import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getCollection } from "astro:content";
import type { PromptView } from "../catalogue";
import { sitePath } from "../site";

export type Prompt = PromptView & {
  bytes: Uint8Array;
  text: string;
  licenseBytes: Uint8Array | null;
};

export async function getCatalogue(): Promise<Prompt[]> {
  const entries = await getCollection("catalogue");
  return Promise.all(entries.sort((a, b) => a.data.order - b.data.order).map(async ({ id, data }) => {
    const bytes = await readFile(resolve("src/content/prompts", `${id}.md`));
    const source = data.source;
    return {
      ...data,
      id,
      rawPath: sitePath(`prompts/${id}.md`),
      sourceUrl: source ? `https://github.com/${source.owner}/${source.repo}/blob/${source.ref}/${source.path}` : null,
      licensePath: source ? sitePath(`prompts/${source.license.file}`) : null,
      bytes,
      text: bytes.toString("utf8"),
      licenseBytes: source ? await readFile(resolve("src/content/licenses", source.license.file)) : null,
    };
  }));
}
