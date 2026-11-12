# Sidequest plan

The Astro catalogue is implemented. See [README](../README.md) for content, source updates and local development. The [approved prototype](../.scratch/sidequest-prototype/README.md) remains the design reference.

## Release

1. Create the public `alexkutkin/sidequest` repository and connect `origin`. Push `main` when requested. Enable GitHub Pages with GitHub Actions as its source; the deployment workflow is ready.
2. Confirm the deployed address is `https://alexkutkin.com/sidequest/`, using the main site's domain and the configured `/sidequest/` base. Check HTTPS, assets, `llms.txt`, raw Markdown, licenses and copied URLs on that address.
3. Add Sidequest to the main site's project list with EN/RU descriptions and a link to the catalogue.
4. Try the initial prompts on real projects. Give an agent the deployed `llms.txt` URL and check task selection, approval and sequential execution.

Verification is limited to typechecking, building and direct browser inspection. Do not write automated tests, fixtures or verification harnesses.
