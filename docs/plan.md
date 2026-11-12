# Sidequest plan

The [approved prototype](../.scratch/sidequest-prototype/README.md) defines the interface and behaviour. This plan covers the remaining implementation work.

## Implementation

Use the applicable structure from [the main site](https://github.com/alexkutkin/alexkutkin.github.io): static Astro, npm, strict TypeScript, a shared layout, small components, separate styles and typed UI dictionaries. Keep catalogue data and browser interactions separate from page markup.

Use a small set of CSS layout primitives following [Every Layout's composition approach](https://every-layout.dev/rudiments/composition/), alongside CSS Grid and Flexbox where useful. Separate design tokens from layout rules and include only primitives the catalogue uses.

Keep one English Markdown source per prompt, with catalogue metadata and EN/RU descriptions stored separately. Use [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) to validate the catalogue. Generate the page, `llms.txt` and direct `.md` endpoints from that content. Preserve imported prompt text unchanged.

Keep EN/RU on the same URL. Store the UI language in `localStorage` under `sidequest-language`; English is the default. Full prompt text remains English.

## Source copies

Accept self-contained text. Check each external skill's folder and required references for scripts or supporting-file dependencies before accepting an update.

Store each copy in Git with its license, source revision and snapshot date. Add a small repository script for manual checks and updates. Review diffs and descriptions before publishing; the site serves saved copies.

If a source is unavailable or deleted, retain the saved version. If it gains scripts or supporting-file dependencies, retain the last suitable text-only version and stop updates. Show the snapshot date and reason for stopped updates. Remove an entry manually if it is no longer useful.

## Verification and publication

Run typechecking and the static build. Inspect the generated catalogue and verify the approved prototype's behaviour directly in the browser, including mobile and keyboard access, under `/sidequest/`. Do not write automated tests, fixtures or verification harnesses. Keep CI limited to typechecking and building.

Create the public `alexkutkin/sidequest` repository. Publish through GitHub Actions and GitHub Pages using [Astro's deployment guide](https://docs.astro.build/en/guides/deploy/github/), with checks before deployment.

Target `https://alexkutkin.com/sidequest/`. Set `site: "https://alexkutkin.com"` and `base: "/sidequest"`. Use [Astro's base-path handling](https://docs.astro.build/en/reference/configuration-reference/#base) for asset URLs, prompt links and the agent instruction. The project uses the [main site's domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages#using-a-custom-domain-across-multiple-repositories); configure Pages accordingly. Add the catalogue link to the main site.

Before release, try the initial prompts on real projects. Check the published HTTPS endpoints and give an agent the deployed `llms.txt` URL to verify task selection and execution.
