import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const localizedContent = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  summary: z.string().min(1),
  outcome: z.string().min(1),
});
const stoppedUpdate = z.object({
  state: z.enum(["unavailable", "frozen"]),
  checkedAt: date,
  reason: z.enum(["source-unavailable", "scripts-or-dependencies", "license-unavailable"]),
});
const catalogue = defineCollection({
  loader: file("src/content/catalogue.json"),
  schema: z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    order: z.number().int().positive(),
    author: z.string().min(1),
    tags: z.array(z.enum(["analysis", "stateMachines", "refactoring", "architecture"])).min(1),
    content: z.object({ en: localizedContent, ru: localizedContent }),
    source: z.object({
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
      update: z.union([z.object({ state: z.literal("current") }), stoppedUpdate]),
    }).nullable(),
  }),
});

export const collections = { catalogue };
