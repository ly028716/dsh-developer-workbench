# Focused Flow Additive Plugin Plan

## Goal

Ship a community-installable DeepSeek Harness plugin that improves the
developer task flow without changing the host project or replacing any
host-owned frame, session, workspace, or tool surface.

## Public contract

- Register `TaskLauncherDock` in `conversation.input.dock` as `workbench`.
- Register `ActiveTaskIndicator` in `conversation.input.right` as `workbench`.
- Read lifecycle and input state through injected `useSession` and `useInput`.
- Write only explicit task scaffold/clear actions through `inputActions.setDraft`.
- Keep every visual rule scoped by `data-dsh-developer-workbench="true"`.

## Focused Flow UI

The dock is a task focus console rather than a starter catalog. It presents the
current lifecycle title, phase, draft preview, context count, and queue count.
Blank sessions expose one task scaffold action with goal, context, and
acceptance-criteria headings. Active sessions retain the console so the user
can see task continuity without inventing execution data.

The right indicator shows running, queued, or idle state and pending count. It
uses a neutral status track instead of a fabricated completion percentage.

## Verification

- Presentation tests cover blank, active, and running states.
- DOM tests cover scaffold-to-draft behavior and additive co-existence.
- CSS contract tests cover scoped tokens, focus-visible, and reduced motion.
- `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm pack --dry-run` must pass.
- Manual profile verification must confirm enable/remove without host-frame
  changes.
