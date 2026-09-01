# Release checklist

This package is ready for a registry prerelease after the host publishes the matching `@deepseek-ai/dsh-client-*` peer packages at `^0.1.1-rc.2` or a compatible later release. The host must expose the `conversation.input.dock` / `conversation.input.right` list slots with locale-injected slot props.

## Local verification

Run from this repository:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run test
pnpm run build
pnpm pack --dry-run
```

`pnpm run test` covers the additive contract. `tests/registration.client.spec.tsx` pins the two dock registrations (names, `id`, `order`, locale) and their disposal, and asserts the plugin never declares host-owned seats (`root`, `details`, `tool.call.toolview`). `tests/presentation.client.spec.tsx` and `tests/browser.workbench.spec.tsx` render the task launcher and active-task indicator through the injected `useSession` hook and drive a starter click into `inputActions.setDraft`.

The packed file must contain `lib/client.js`, declarations, scoped CSS, and both README files. `package.json` must keep `./client` pointed at `./lib/client.js` and must not contain a `workspace:` dependency.

## Profile installation

Install the published package in the profile project and insert this row after `dsh-web-app` in `cordis.patch.yml`:

```yaml
- insert:
    - id: developer-workbench
      name: '@deepseek-ai/dsh-developer-workbench'
```

The profile patch must be inserted after `dsh-web-app`; installing the package alone does not enable the browser contribution. On an enabled reload the task launcher (blank, idle session) and the active-task indicator appear inside the host input zone; after removing both the dependency and patch row they disappear while the host frame keeps its own markup. The plugin never writes session data, workspace selection, drafts, or tool history.

## Recorded verification

The additive design is covered by the automated suite above (registration, disposal, render, and starter interaction); it involves no model request and writes no host state. A manual profile reload after enable/remove confirms the two dock markers appear and disappear while the host frame is unchanged.

## Publication boundary

Creating or connecting the public Git repository and running `pnpm publish --tag next --access public` are release-owner actions. This workspace only prepares and verifies the package; it does not push commits or publish to npm.
