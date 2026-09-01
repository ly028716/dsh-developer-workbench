# Developer Workbench Presentation Implementation Plan (Superseded)

> This historical plan described a host-owned frame shell. It is retained for
> context only; the community-safe implementation follows
> `2026-09-01-focused-flow-additive.md` and never modifies the host frame.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the optional `shell.frame` contribution into a visibly distinct, accessible, responsive Workbench presentation while keeping all session and tool state host-owned.

**Architecture:** The plugin will render a marker-scoped Workbench shell with its own header, panel chrome, responsive grid, and overlay layer, then place the host's four frame callbacks inside it. Four public child-slot contributions will render meaningful starter, active-task, details-context, and tool-wrapper DOM from their owner props; no host-private imports or state stores will be added.

**Tech Stack:** React 18, TypeScript, published DSH client contracts, CSS Modules, scoped CSS tokens, Vitest + jsdom DOM interaction tests.

**Spec:** User request in the current task.

## Global Constraints

- Use only published client runtime, layout, slots, conversation, tool, locale, primitives, and React contracts.
- Do not modify host components or import host-private source implementations.
- Keep every Workbench CSS rule under `data-dsh-developer-workbench="true"` or a Workbench CSS-module class rooted at that marker.
- Keep session, workspace, draft, and tool history ownership in the host.
- Preserve profile fallback after disposal and regenerate `lib/client.js` and CSS artifacts.

### Task 1: Public contract and frame shell

**Files:**
- Modify: `src/client/index.ts`
- Modify: `src/client/WorkbenchFrame.tsx`
- Modify: `src/client/WorkbenchFrame.module.css`
- Modify: `src/client/workbench.css`

- [ ] Add frame locale registration and render a top bar, branded sidebar/conversation/details chrome, a local details presentation toggle, and a pointer-safe overlay layer.
- [ ] Add narrow viewport detection for the sidebar owner props while leaving host content callbacks intact.
- [ ] Add marker-scoped design tokens, responsive grid rules, focus-visible, reduced-motion, and high-contrast states.

### Task 2: Public child presentations

**Files:**
- Modify: `src/client/locales.ts`
- Modify: `src/client/TaskLauncher.tsx`
- Modify: `src/client/ActiveTask.tsx`
- Modify: `src/client/DetailsContext.tsx`
- Modify: `src/client/WorkbenchToolPresentation.tsx`

- [ ] Render localized, actionable starter cards and disabled/unavailable state.
- [ ] Render live active-task status, queue count, and plan-state affordances from host props.
- [ ] Render workspace/plan context rows and keep empty context omitted.
- [ ] Wrap host tool content with tool identity and preserved details/inspect callbacks.

### Task 3: DOM/browser regression coverage and docs

**Files:**
- Create: `tests/browser.workbench.spec.tsx`
- Modify: `tests/frame.client.spec.tsx`
- Modify: `tests/presentation.client.spec.tsx`
- Modify: `README.md`
- Modify: `README.zh.md`
- Modify: `RELEASE.md`
- Modify: `RELEASE.zh.md`

- [ ] Verify enable/disable fallback, all four slot contributions, real click/focus behavior, details toggle, host content preservation, and responsive owner props in DOM tests.
- [ ] Document install, profile patch, uninstall, host version floor, and browser verification commands in English and Chinese release docs.

### Task 4: Verification and generated artifacts

**Files:**
- Regenerate: `lib/client.js`, `lib/client.js.map`, `lib/index.*`, `lib/client/*.css`

- [ ] Run `pnpm run typecheck`, `pnpm run test`, `pnpm run build`, and `pnpm pack --dry-run`.
- [ ] Inspect generated output and final git diff; do not push.
