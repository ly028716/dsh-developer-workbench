# Release checklist

This package is ready for a registry prerelease after the host provides the matching `@deepseek-ai/dsh-client-*` peer ranges: `^0.1.1-rc.2` for public UI packages and `^0.1.2-alpha.2` for `@deepseek-ai/dsh-client-ui-session`, or compatible later releases. The host must expose the `conversation.input.dock` / `conversation.input.right` list slots with locale-injected slot props.

## Local verification

Run from this repository:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify:bundle
pnpm pack --dry-run
```

`pnpm run test` covers the additive contract. `tests/registration.client.spec.tsx` pins the two dock registrations (names, `id`, `order`, locale) and their disposal, and asserts the plugin never declares host-owned seats (`root`, `details`, `tool.call.toolview`). `tests/presentation.client.spec.tsx` and `tests/browser.workbench.spec.tsx` render the task focus console and active-task indicator through the injected `useSession` / `useInput` hooks and verify the scaffold action writes to `inputActions.setDraft`.

`pnpm run verify:bundle` executes the generated `lib/client.js` through a ModuleLoader-compatible harness and verifies its package id, `apply` export, and `slots,locale` injection contract. A real profile reload is still required before publication.

When a prepared Harness checkout is available, run `DSH_HARNESS_DIR=/path/to/deepseek-harness pnpm run verify:host-profile`. It proves the local package appears in an enabled real-host profile and disappears when its overlay is omitted.

The packed file must contain `lib/client.js`, declarations, scoped CSS, and both README files. `package.json` must keep `./client` pointed at `./lib/client.js` and must not contain a `workspace:` dependency.

## Profile installation

Install the published package in the profile project and insert this row after `dsh-web-app` in `cordis.patch.yml`:

```yaml
- insert:
    - id: developer-workbench
      name: '@deepseek-ai/dsh-developer-workbench'
```

The profile patch must be inserted after `dsh-web-app`; installing the package alone does not enable the browser contribution. On an enabled reload the task focus console and active-task indicator appear inside the host input zone; after removing both the dependency and patch row they disappear while the host frame keeps its own markup. The plugin never writes session data, workspace selection, or tool history, and only uses the public input action to write task drafts.

## Required real-host verification record

The additive design is covered by the automated suite above (registration, disposal, render, and scaffold interaction); it involves no model request and writes no host state beyond the explicit draft action. Before publishing, the release owner must attach the following completed record to the release PR or GitHub Release. A passing local run is not a substitute for recording the exact candidate and host used for publication.

```text
Plugin version / commit:
Harness version / commit:
Verification date and operator:
Command: DSH_HARNESS_DIR=<checkout> pnpm run verify:host-profile
Enabled profile: PASS — one task launcher and one active-task indicator rendered; no browser errors.
Disabled profile: PASS — neither workbench marker rendered; host input zone remained usable.
Evidence: command log, CI run URL, or attached screenshot/trace.
```

The release is blocked if either profile state fails, the host input zone is not usable, or the record/evidence is missing.

## Publication boundary

Creating or connecting the public Git repository and running `pnpm publish --tag next --access public` are release-owner actions. This workspace only prepares and verifies the package; it does not push commits or publish to npm.
