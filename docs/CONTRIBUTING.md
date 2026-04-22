# Contributing

Keep this simple.

## Read first
- `AGENTS.md`
- `docs/WORKFLOW.md`
- `docs/ARCHITECTURE.md`
- `docs/DEVELOPMENT.md`
- `ADHD.md`

## Rules
- keep changes scoped
- prefer truth over optimism
- update docs in the same pass
- do not leave known-liar tests untouched
- if behavior changed, `README.md`, `ADHD.md`, and the relevant docs must change too
- if you create real progress, `git add`, `git commit`, and `git push`

## Pull request expectations
- clear title
- clear scope
- local verification included
- docs aligned with the code
- no debug junk or generated trash committed

## Good change shape
1. understand the real target behavior
2. read the current code/doc path first
3. implement the smallest meaningful slice
4. test it
5. update docs
6. commit and push

## Avoid
- giant mixed commits
- speculative docs written ahead of code truth
- leaving generated artifacts in the repo
- preserving old docs as live truth when they belong in archive
