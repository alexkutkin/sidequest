import type { APIRoute } from "astro";
import { getCatalogue } from "../lib/catalogue";
import { en } from "../i18n/en";

export const GET: APIRoute = async ({ site }) => {
  const prompts = await getCatalogue();
  const lines = [
    "# Sidequest",
    "",
    "> A small collection of self-contained English prompts and skills for useful work on a codebase.",
    "",
    "Briefly inspect the user's project and the descriptions below. Propose up to three applicable tasks, recommend one and explain its scope, usefulness and expected result. Wait for the user to choose and approve before starting. If none fits, say so. After approval, read the selected prompts' full instructions and carry out their tasks one at a time, following each prompt's completion criteria.",
    "",
    "## Prompts",
    "",
    ...prompts.map(prompt => {
      const { title, description, outcome } = prompt.content.en;
      const source = prompt.source;
      const attribution = source ? ` Original: ${prompt.sourceUrl}. Saved: ${source.savedAt}; revision: ${source.revision}.` : "";
      const status = source && source.update.state !== "current" ? ` ${en[source.update.state]} ${en[source.update.reason]} Checked: ${source.update.checkedAt}.` : "";
      return `- [${title}](${new URL(prompt.rawPath, site)}): ${prompt.author}. ${description} ${outcome}${attribution}${status}`;
    }),
    "",
    "## Optional",
    "",
    ...prompts.filter(prompt => prompt.licensePath).map(prompt => `- [${prompt.content.en.title}: license](${new URL(prompt.licensePath!, site)}): license for the saved third-party skill.`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
