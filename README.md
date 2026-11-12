# Sidequest

A small catalogue of self-contained prompts for inspecting and improving a codebase. Browse the catalogue yourself or copy its routing instruction to a coding agent. The agent suggests suitable tasks and waits for approval before running them one at a time.

## Local development

Use Node.js 24 or newer and npm:

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:4321/sidequest/`. The same path prefix is used locally and on GitHub Pages.

```sh
npm run typecheck
npm run build
npm run preview -- --host 127.0.0.1
```

Verification uses typechecking, building and direct browser inspection. This repository does not use automated tests or a test harness.

## Content

`src/content/catalogue.json` holds the order, authors, tags, EN/RU descriptions and source metadata. Original English instructions live in `src/content/prompts/`; imported instructions keep their original text, including frontmatter. Licenses live in `src/content/licenses/`.

Astro validates catalogue metadata and generates the page, `/sidequest/llms.txt`, direct `/sidequest/prompts/<id>.md` files and license endpoints from the saved content. UI language changes on the current URL and is remembered separately from the main site's language.

To add a prompt, save its Markdown, add its metadata with a unique ID and order, and include both sets of descriptions. For an imported skill, also record its GitHub path, ref, exact commit revision, snapshot date and license. Use only self-contained text. Review the skill folder and instructions for supporting-file dependencies.

The state-machine prompt is Alex Kutkin's supplied text translated into English. [Untangle a codebase](https://github.com/caldoai/skills/blob/main/skills/untangle-codebase/SKILL.md) is included unchanged under its [MIT license](src/content/licenses/untangle-codebase.LICENSE.txt).

## Manual source updates

```sh
npm run sources:check
npm run sources:check -- untangle-codebase
npm run sources:update
```

The default command reads GitHub and reports changes without writing files. `sources:update` saves eligible updates and source status. Both commands can be limited to one imported prompt ID. An optional `GITHUB_TOKEN` environment variable raises the GitHub API rate limit.

The updater reads a fixed commit, inspects the skill folder, checks relative Markdown references and retrieves its license before replacing a copy. Additional resources or missing licenses stop updates; an unreachable source retains the saved copy. Dependency detection is conservative and still needs human review. Read the diff and update EN/RU descriptions before publishing. No upstream requests happen when visitors load the site or when Astro builds it.

## Publication

The target address is `https://alexkutkin.com/sidequest/`. GitHub Actions typechecks, builds and deploys pushes to `main` once this repository's Pages source is set to GitHub Actions. The project uses the main site's domain and its `/sidequest/` prefix.

The [plan](docs/plan.md) tracks remaining release work. Project organization follows the applicable parts of [the main site](https://github.com/alexkutkin/alexkutkin.github.io): a shared layout, small components, separate styles and typed dictionaries. The [approved prototype](.scratch/sidequest-prototype/README.md) is retained as the design reference. The warm graphite and peach palette is inspired by [Vesper](https://github.com/raunofreiberg/vesper); layout primitives follow [Every Layout](https://every-layout.dev/).
