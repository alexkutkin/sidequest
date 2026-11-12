import path from "node:path";
import { z } from "astro/zod";
import { fromMarkdown } from "mdast-util-from-markdown";
import { sourceMetadataSchema, type SourceMetadata, type StoppedUpdate } from "../src/catalogue.ts";

type SourceInspection = {
  state: "eligible";
  revision: string;
  bytes: Buffer;
  licenseBytes: Buffer;
} | { state: "stopped"; update: StoppedUpdate; detail: string };
type MarkdownNode = { type: string; url?: string; children?: MarkdownNode[] };
const treeSchema = z.object({
  truncated: z.boolean().optional(),
  tree: z.array(z.object({ path: z.string(), type: z.string(), mode: z.string(), sha: sourceMetadataSchema.shape.revision })),
});
const commitSchema = z.object({ sha: sourceMetadataSchema.shape.revision });
const optionalDocument = /^(?:readme(?:\.md|\.txt)?|licen[cs]e(?:\.md|\.txt)?|notice(?:\.md|\.txt)?)$/i;
const encodedPath = (value: string): string => value.split("/").map(encodeURIComponent).join("/");
const text = (bytes: Uint8Array): string => new TextDecoder("utf-8", { fatal: true }).decode(bytes);
const message = (error: unknown): string => error instanceof Error ? error.message : String(error);

function supportingReference(markdown: string, source: SourceMetadata): string | undefined {
  const nodes: MarkdownNode[] = [fromMarkdown(markdown)];
  while (nodes.length) {
    const node = nodes.pop()!;
    if (node.children) nodes.push(...node.children);
    if (!["link", "image", "definition"].includes(node.type) || !node.url || /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(node.url)) continue;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(source.path), node.url.split("#")[0]));
    if (target !== source.path && target !== source.license.path) return node.url;
  }
}

export async function inspectSource(source: SourceMetadata, checkedAt: string, token?: string): Promise<SourceInspection> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "sidequest-source-updater" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const api = `https://api.github.com/repos/${encodeURIComponent(source.owner)}/${encodeURIComponent(source.repo)}`;
  async function request(url: string, apiRequest = false): Promise<Response> {
    const response = await fetch(url, { headers: apiRequest ? headers : undefined, signal: AbortSignal.timeout(20_000) });
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}`);
    return response;
  }
  function stopped(reason: StoppedUpdate["reason"], detail: string): SourceInspection {
    const update: StoppedUpdate = reason === "source-unavailable"
      ? { state: "unavailable", checkedAt, reason }
      : { state: "frozen", checkedAt, reason };
    return { state: "stopped", update, detail };
  }

  try {
    const { sha: revision } = commitSchema.parse(await (await request(`${api}/commits/${encodeURIComponent(source.ref)}`, true)).json());
    const trees = new Map<string, z.infer<typeof treeSchema>["tree"]>();
    async function treeAt(directory: string): Promise<z.infer<typeof treeSchema>["tree"]> {
      const folder = directory === "." ? "" : directory;
      const cached = trees.get(folder);
      if (cached) return cached;
      const parent = folder ? await treeAt(path.posix.dirname(folder)) : null;
      const sha = parent ? parent.find(item => item.path === path.posix.basename(folder) && item.type === "tree")?.sha : revision;
      if (!sha) throw new Error(`Source directory is missing: ${folder}`);
      const listing = treeSchema.parse(await (await request(`${api}/git/trees/${sha}`, true)).json());
      if (listing.truncated) throw new Error(`Cannot inspect the complete source directory: ${folder || "/"}`);
      trees.set(folder, listing.tree);
      return listing.tree;
    }
    const folder = path.posix.dirname(source.path);
    const tree = await treeAt(folder);
    const filename = path.posix.basename(source.path);
    if (!tree.some(item => item.path === filename && item.type === "blob" && item.mode !== "120000")) throw new Error("Source prompt is missing.");
    const rawBase = `https://raw.githubusercontent.com/${encodeURIComponent(source.owner)}/${encodeURIComponent(source.repo)}/${revision}/`;
    const bytes = Buffer.from(await (await request(rawBase + encodedPath(source.path))).arrayBuffer());
    const promptText = text(bytes);
    const extra = tree.find(item => item.path !== filename && (item.type !== "blob" || item.mode === "120000" || !optionalDocument.test(item.path)));
    if (extra) return stopped("scripts-or-dependencies", `Additional skill resource: ${path.posix.join(folder, extra.path)}`);
    const reference = supportingReference(promptText, source);
    if (reference) return stopped("scripts-or-dependencies", `Relative supporting-file reference: ${reference}`);

    try {
      const licenseTree = await treeAt(path.posix.dirname(source.license.path));
      if (!licenseTree.some(item => item.path === path.posix.basename(source.license.path) && item.type === "blob" && item.mode !== "120000")) throw new Error("Source license is missing or is a symbolic link.");
      const licenseBytes = Buffer.from(await (await request(rawBase + encodedPath(source.license.path))).arrayBuffer());
      if (!text(licenseBytes).trim()) throw new Error("License is empty.");
      return { state: "eligible", revision, bytes, licenseBytes };
    } catch (error) {
      return stopped("license-unavailable", message(error));
    }
  } catch (error) {
    return stopped("source-unavailable", message(error));
  }
}
