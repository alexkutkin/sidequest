# Sidequest

A catalogue of self-contained prompts and skills for coding agents. Each task is plain text, with no installation or supporting files.

Choose a prompt yourself or copy the catalogue's instruction into your agent. It reads `llms.txt`, suggests suitable tasks and waits for approval before running them one at a time.

## Development

Use Node.js 24 or newer and npm:

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open [the local catalogue](http://127.0.0.1:4321/sidequest/).

Run `npm run typecheck` and `npm run build` to check the project. Inspect interactions directly in the browser. Do not add automated tests, fixtures or verification harnesses.

## Content

Save prompts in [src/content/prompts/](src/content/prompts/) and add their metadata to [catalogue.json](src/content/catalogue.json). Follow the existing entries and [schema](src/catalogue.ts). Imported skills keep their original text, exact source revision and [license](src/content/licenses/).

Astro generates the site, `llms.txt` and direct Markdown links from these files.

## Source updates

```sh
npm run sources:check   # Report changes without writing files
npm run sources:update  # Save eligible updates and source status
```

Append `-- <id>` to limit either command to one imported prompt. `GITHUB_TOKEN` is optional.

If a source disappears or gains scripts or supporting-file dependencies, the catalogue keeps the last suitable copy. Review the diff and descriptions after updating. Builds and page visits never fetch upstream sources.

[Untangle a codebase](src/content/prompts/untangle-codebase.md) by caldoai / Maze is included under its [MIT license](src/content/licenses/untangle-codebase.LICENSE.txt).

License: [MIT](LICENSE).
