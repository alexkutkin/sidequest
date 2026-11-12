<div align="center">

<img src="public/sidequest-mark.svg" alt="" width="64" height="64">

# Sidequest

Standalone prompts for useful work on your codebase.

[Use the catalogue](#use-the-catalogue) · [Run locally](#run-locally) · [Add content](#add-content) · [Update sources](#update-sources)

</div>

Sidequest is a small catalogue of English prompts and skills for coding agents. Each entry is a complete task in plain text, with no installation or supporting files. Pick one task and stop there, or let your agent help you choose.

> [!NOTE]
> The site is not published yet. Run it locally with the instructions below. The [release plan](docs/plan.md) tracks what remains.

## Use the catalogue

1. **Choose a task yourself.** Filter by tag and open a card for its summary and expected result. Read the full prompt, copy its text or give your agent its Markdown link. Cards open independently.
2. **Let your agent choose.** Copy the instruction from the top of the page into your coding agent. It reads `llms.txt`, suggests up to three tasks for your project and waits for approval. It then runs the selected tasks one at a time.

The interface and descriptions switch between English and Russian on the same URL. The browser remembers your choice separately from the main site's language. Full prompts always stay in English.

The initial collection includes:

- **[Find hidden state machines](src/content/prompts/state-machines.md).** Trace flags and asynchronous flows, then propose a simpler state model. This task stops before implementation. Alex Kutkin supplied the original prompt, which was translated into English.
- **[Untangle a codebase](src/content/prompts/untangle-codebase.md).** Bring related code together and remove unnecessary dependencies and abstractions. This task includes implementation. The [original skill](https://github.com/caldoai/skills/blob/main/skills/untangle-codebase/SKILL.md) by caldoai / Maze is included unchanged under its [MIT license](src/content/licenses/untangle-codebase.LICENSE.txt).

## Run locally

Use Node.js 24 or newer and npm. From the repository root:

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open [the local catalogue](http://127.0.0.1:4321/sidequest/). The `/sidequest/` prefix applies locally and on GitHub Pages.

Check types and build the static site:

```sh
npm run typecheck
npm run build
```

To inspect the build, run `npm run preview -- --host 127.0.0.1` and open the same local address. Preview the build after stopping the development server so the port is available.

The typecheck command uses [Astro's checker](https://docs.astro.build/en/guides/typescript/) for `.astro` templates and TypeScript. Verify interactions directly in the browser. Do not add automated tests, fixtures or verification harnesses.

## Add content

1. Save a self-contained English prompt as `src/content/prompts/<id>.md`. Review its instructions and source folder for dependencies on scripts or supporting files.
2. Add an entry to [catalogue.json](src/content/catalogue.json) with a unique ID and order, author, tags, and English and Russian titles, descriptions, summaries and outcomes. Use the existing entries and [metadata schema](src/catalogue.ts) as references.
3. For an original prompt, set `source` to `null`. For an imported skill, record its GitHub path, ref, exact commit revision, snapshot date, update status and license metadata. Keep the original text, including frontmatter, and save its license in [src/content/licenses/](src/content/licenses/).
4. Run the typecheck and build commands, then inspect the card and generated Markdown in the browser.

Astro generates the catalogue, `/sidequest/llms.txt`, `/sidequest/prompts/<id>.md` and license endpoints from the saved files. Neither builds nor page visits fetch upstream sources.

## Update sources

Source checks are manual. These commands report changes without writing files:

```sh
npm run sources:check
npm run sources:check -- untangle-codebase
```

Save eligible updates and source status with:

```sh
npm run sources:update
```

Both commands accept an optional imported prompt ID. Set `GITHUB_TOKEN` if you need a higher GitHub API rate limit.

The updater resolves the configured ref to a fixed commit, inspects the skill folder and checks relative Markdown references with a CommonMark parser. It retrieves the license before replacing the saved text.

If the source disappears, the catalogue keeps its saved copy. If a skill gains scripts or supporting-file dependencies, or its license cannot be confirmed, updates stop and the last suitable copy stays available with a reason. Detection is conservative and still needs human review. Read the diff and update both language descriptions when the prompt changes.

## Project structure

The site uses Astro, TypeScript and plain CSS. It follows the applicable conventions of [the main site](https://github.com/alexkutkin/alexkutkin.github.io).

| Location | Responsibility |
| --- | --- |
| [src/pages/](src/pages/) | Static page, agent index, raw prompts and license endpoints |
| [src/components/](src/components/), [src/layouts/](src/layouts/), [src/styles/](src/styles/) | Markup, shared layout and styling |
| [src/browser/](src/browser/), [src/i18n/](src/i18n/) | Browser interactions and typed language dictionaries |
| [src/content/](src/content/) | Catalogue metadata, English prompts and imported licenses |
| [src/catalogue.ts](src/catalogue.ts), [src/lib/](src/lib/) | Shared schema, content loading and file storage |
| [scripts/](scripts/) | Manual source inspection and updates |

<details>
<summary>Design and interaction notes</summary>

The [approved prototype](.scratch/sidequest-prototype/README.md) is the design reference. The warm graphite and peach palette is inspired by [Vesper](https://github.com/raunofreiberg/vesper). Layout and typography follow [Every Layout's units guidance](https://every-layout.dev/rudiments/units/) and the main site's font-relative sizing. Thin borders and focus outlines keep pixel widths.

Each card owns its reading state. Browser elements bind once; language and filter changes have separate updates. Opening a card does not retranslate the page or update other cards.

Summary and full-text panels share a [CSS Grid transition](https://web.dev/articles/css-animated-grid-layouts) with no height measurements or animation timers. Collapsed panels are inert. Controls use `aria-expanded` and `aria-controls` following the [WAI accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/), and transitions respect reduced-motion preferences.

</details>

## Publication

The planned address is `https://alexkutkin.com/sidequest/`, under the main site's domain. The [deployment workflow](.github/workflows/deploy.yml) typechecks, builds and deploys pushes to `main` once the repository is connected to GitHub and Pages uses GitHub Actions. See the [release plan](docs/plan.md) before publishing.
