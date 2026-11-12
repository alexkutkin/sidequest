# Working agreement

## Communication
- Communicate with the owner in Russian.
- Keep everything the repository stores in English: code and comments, commit
  messages, test names, README, docs, ADRs, AGENTS.md, config comments.
- Content, not documentation, keeps its own language: product strings in locale
  resource files (`Strings/ru-RU` and alike) and personal financial documents.

## Git
- Work directly on `main`. Create branches or pull requests only when requested.
- Use focused Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- Do not add AI co-authorship or tool credits to commits or pull requests.
- Add `Signed-off-by` only when required.
- Commit and push only when requested. Push to `origin/main` unless otherwise specified.
- Do not force-push or rewrite published history without explicit approval.

## Environment & Files
- Store all temporary files in .scratch/ at the root. Create it if missing. Ensure it is added to .gitignore so Git ignores it.