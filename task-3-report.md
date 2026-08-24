# Task 3 Report

## Summary

Created the standalone `@deepseek-ai/dsh-developer-workbench` plugin scaffold in `E:\IDEWorkplaces\DeepSeekHarness\dsh-developer-workbench`. The project is intentionally separate from the main `deepseek-harness` pnpm workspace and has its own git repository, package manifest, TypeScript and Vitest configuration, bilingual README pair with `README.i18n.yaml`, pnpm lockfile, and minimal host/browser entry placeholders.

The package declares the required host client packages as peer dependencies with registry-style ranges and contains no `workspace:` specifier in `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`, `src`, or `README.i18n.yaml`. `apply(ctx)` is currently a no-op; Task 4 owns the `shell.frame` registration through `ctx.effect()` and `ctx.slots.register()`.

## Commit

- `8152d4c7ca59cab792c926f0338495e4d05c0e73` (`chore: scaffold developer workbench package`)

## Verification

- `pnpm install --lockfile-only`: PASS after setting project-level `autoInstallPeers: false`.
- `pnpm install`: PASS after approving only `esbuild` builds in `pnpm-workspace.yaml`.
- `pnpm run typecheck`: PASS (`tsc --noEmit`).
- `pnpm run test`: PASS; no test files yet, Vitest exits 0 via `passWithNoTests`.
- `pnpm run build`: PASS (`tsc -p tsconfig.json`).
- `pnpm run pack`: PASS; dry-run tarball contains runtime JS, declarations, declaration maps, `package.json`, `README.md`, `README.zh.md`, and `README.i18n.yaml`.
- `git diff --cached --check`: PASS before commit.
- `rg "workspace:" package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc src README.i18n.yaml -n`: PASS with no matches.

## Open Questions

- The registry currently publishes the host client packages at `0.0.1-rc.1`, while the source tree for this task uses `0.1.0-rc.7` and contains the new `shell.frame`/`FrameOwnerProps` contract. The scaffold therefore keeps host client packages as peers in the `^0.1.0-rc.7` range and does not install them as dev dependencies until that compatible host set is published.
- Installing `@deepseek-ai/dsh-client-runtime@0.0.1-rc.1` from the registry currently fails because it depends on unpublished `@deepseek-ai/dsh-compact`; this is why `autoInstallPeers: false` is recorded for standalone validation.
- `pnpm approve-builds esbuild` wrote an `allowBuilds` placeholder under pnpm v11; it was set explicitly to `esbuild: true` so installs remain non-interactive and narrow.
