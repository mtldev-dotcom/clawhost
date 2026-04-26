# Agent Pipeline

This file is the one-page execution pipeline for every AI agent and human contributor working on ClawHost.

> If you are an AI agent, read this **after** `AGENTS.md` and **before** touching any file.

---

## The pipeline (9 steps, always in this order)

```
1. READ          plan-claude.md (top to bottom)
2. READ          progress-report.md (last 3 session entries)
3. READ          docs/HANDOFF.md
4. READ          AGENTS.md
5. READ          ADHD.md
6. FIND          the first unchecked [ ] task in plan-claude.md
7. DO            only that task (follow its Steps section exactly)
8. VERIFY        run the Verification commands, paste raw output in progress-report.md
9. CLOSE         mark [x], commit, update HANDOFF.md, stop
```

Do not compress, reorder, or skip steps.
Do not "helpfully" do task N+1 after finishing task N — stop.

---

## Entry rituals (every session starts with these)

1. `git status` must be clean. If not, stop and ask.
2. `git branch --show-current` must match the branch named in `docs/HANDOFF.md`. If not, stop and ask.
3. Open `plan-claude.md`. Identify the next unchecked `[ ]`.
4. Open `progress-report.md`. Write the session header (see template in that file).
5. State out loud, in plain English: "I am about to do TASK `<ID>`. The Files-to-touch are `<list>`. The Verification will be `<command>`."

---

## Exit rituals (every session ends with these)

1. Paste the raw output of the Verification command into `progress-report.md` under the task entry.
2. If verification passed → mark the `[ ]` as `[x]` in `plan-claude.md`.
3. Run `git add -A && git commit -m "<conventional message>"`. One task = one commit, by default.
4. Run `git log -1 --oneline` and paste into the progress report.
5. Overwrite `docs/HANDOFF.md` with current state (branch, last commit, next task, blockers).
6. If `git push` is part of the task instructions, push. Otherwise do not push.

---

## Stop-work triggers (mandatory)

Stop immediately — do **not** attempt a fix — if any of the following happens:

| Trigger | Action |
|---|---|
| A Verification command fails | Log raw output in progress-report.md under `STOP EVENT`. Ask human. |
| A file in `docs/archive/**` needs to change | Stop. This directory is frozen. |
| A Prisma migration needs to run against a remote DB | Stop. Ask human. |
| A required env var is missing | Stop. Do not hardcode. |
| A destructive git op is implied (`push --force`, `reset --hard`, `rebase -i`, `commit --amend` on pushed commit) | Stop. |
| A test is failing and the "fix" is to delete or skip it | Stop. |
| A new npm dependency would need to be installed | Stop. Requires a `docs/DECISIONS.md` entry. |
| The task's Steps are ambiguous to you | Stop. Ask human. Do not guess. |
| The product direction in the task appears to contradict the workspace-first identity | Stop. Ask human. |

---

## Forbidden operations (never run these)

- `git push --force` / `git push -f`
- `git reset --hard` on any branch that has been pushed
- `git rebase -i`
- `git commit --amend` on a commit that has been pushed
- `git branch -D` without first verifying `git branch --merged` contains the branch
- `prisma migrate reset`
- `npm install <package>` without a `docs/DECISIONS.md` entry
- Editing, moving, or deleting anything under `docs/archive/**`
- Committing `.env`, `.env.local`, `tsconfig.tsbuildinfo`, `.next/`, `coverage/`, `playwright-report/`, `test-results/`

---

## Truth files

Always up-to-date or the repo is lying:

- `plan-claude.md` — the work queue
- `progress-report.md` — the history
- `docs/HANDOFF.md` — the current baton
- `docs/DECISIONS.md` — the architectural log
- `AGENTS.md` — the contract
- `ADHD.md` — the short state summary (product-level truth only)

If you change behavior and forget to update the relevant truth file, the task is not done.
