import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { promptMetadataSchema } from "./catalogue";
import { cataloguePath } from "./lib/catalogue-storage";

const catalogue = defineCollection({
  loader: file(cataloguePath),
  schema: promptMetadataSchema,
});

export const collections = { catalogue };
