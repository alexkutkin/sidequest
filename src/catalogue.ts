import { z } from "astro/zod";
import { languages } from "./i18n/languages.ts";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const localizedContent = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  summary: z.string().min(1),
  outcome: z.string().min(1),
});
const stoppedUpdateSchema = z.union([
  z.object({
    state: z.literal("unavailable"),
    checkedAt: date,
    reason: z.literal("source-unavailable"),
  }),
  z.object({
    state: z.literal("frozen"),
    checkedAt: date,
    reason: z.enum(["scripts-or-dependencies", "license-unavailable"]),
  }),
]);

export const sourceMetadataSchema = z.object({
  kind: z.literal("github"),
  owner: z.string().regex(/^[\w.-]+$/),
  repo: z.string().regex(/^[\w.-]+$/),
  path: z.string().min(1),
  ref: z.string().min(1),
  revision: z.string().regex(/^[a-f0-9]{40}$/),
  savedAt: date,
  license: z.object({
    path: z.string().min(1),
    file: z.string().regex(/^[\w.-]+\.txt$/),
  }),
  update: z.union([z.object({ state: z.literal("current") }), stoppedUpdateSchema]),
});

export const promptMetadataSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  order: z.number().int().positive(),
  author: z.string().min(1),
  tags: z.array(z.enum(["analysis", "stateMachines", "refactoring", "architecture", "testing"])).min(1),
  content: z.record(z.enum(languages), localizedContent),
  source: sourceMetadataSchema.nullable(),
});
export const catalogueSchema = z.array(promptMetadataSchema);

export type PromptMetadata = z.infer<typeof promptMetadataSchema>;
export type SourceMetadata = z.infer<typeof sourceMetadataSchema>;
export type StoppedUpdate = z.infer<typeof stoppedUpdateSchema>;
export type Tag = PromptMetadata["tags"][number];
export type ClientPrompt = Pick<PromptMetadata, "id" | "tags" | "content"> & { rawPath: string };
