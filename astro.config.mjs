import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://alexkutkin.com",
  base: "/sidequest",
  output: "static",
  trailingSlash: "always",
});
