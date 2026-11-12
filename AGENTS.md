# Working Agreement

## Stable Rules

### Communication

- Communicate with the owner in Russian.
- Use English for all repository content (code, comments, commits, tests, docs, configuration), except localized product strings.
- Keep all prose concise and clear. Apply `unslop` or a similar skill when available.

### Git

- Work on `main`. Create branches or pull requests only when requested.
- Use focused Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- Do not credit AI or tools in commits or pull requests.
- Commit autonomously at meaningful milestones. Push only when requested, to `origin/main` by default.
- Never force-push or rewrite published history without explicit approval.

### Files

- Keep temporary files in `.scratch/` at the repository root. Create and gitignore the directory if needed.
- Never edit `AGENTS.md` or `README.md` without explicit owner approval. Propose changes first.

### Architecture Decisions

- Store Architecture Decision Records (ADRs) in `docs/adr/`.
- Use sequential, zero-padded numbers (`0001-title.md`, `0002-title.md`). Never reuse numbers.
- Record exactly one decision per file.

## Project-Specific Rules

<!-- Add project-specific instructions here. -->