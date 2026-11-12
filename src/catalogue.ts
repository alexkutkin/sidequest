import type { CollectionEntry } from "astro:content";

export type PromptMetadata = CollectionEntry<"catalogue">["data"];
export type Tag = PromptMetadata["tags"][number];
export type PromptView = PromptMetadata & {
  rawPath: string;
  sourceUrl: string | null;
  licensePath: string | null;
};
