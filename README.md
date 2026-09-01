# @deepseek-ai/dsh-developer-workbench

English | [中文](README.zh.md)

`@deepseek-ai/dsh-developer-workbench` is an optional DeepSeek Harness browser presentation plugin. It is developed and published outside the main `deepseek-harness` workspace, and its dependencies must come from the npm registry; the package must not use `workspace:` specifiers or private host source imports.

## Installation

Install the package into the profile project that assembles the web app:

```sh
pnpm add @deepseek-ai/dsh-developer-workbench
```

Enable it by adding this exact row after the `dsh-web-app` row in the profile's `cordis.patch.yml`:

```yaml
- insert:
    - id: developer-workbench
      name: '@deepseek-ai/dsh-developer-workbench'
```

The host must provide the published `@deepseek-ai/dsh-client-*` contract set at `^0.1.1-rc.2` (or a later release that preserves the same public slots). The package declares those host-facing packages as peer dependencies so the profile owns the exact host version. Older hosts without the `conversation.input.dock` / `conversation.input.right` list slots or locale-injected slot props are not supported.

## Runtime Contract

The plugin's browser entry exports `apply(ctx)`. For the plugin lifetime it registers two purely additive contributions through `ctx.effect()` and `ctx.slots.inject()` — it never declares or replaces host-owned slots. A blank-session task launcher registers as `id: 'workbench', order: 10` in the `conversation.input.dock` list slot, and an active-task indicator registers as `id: 'workbench', order: 0` in the `conversation.input.right` list slot. Both coexist beside the shipped occupants (todo, queue, …) and are removed together when the plugin is disabled or uninstalled.

The host frame and its input zone remain fully host-owned. Session data, workspace selection, drafts, and tool history are never touched; the plugin only reads session state through the injected `useSession` selector hook and writes drafts through the host's `inputActions.setDraft`.

The task launcher appears only on blank, idle sessions and fills the composer draft through `inputActions.setDraft` when a starter is chosen. The active-task indicator renders the running/queued state and a small progress track. Both components scope their tokens and styles under the `data-dsh-developer-workbench="true"` marker.

The build emits `lib/client.js` as the browser entry. It is a CommonJS ModuleLoader bundle registered under this package id, which is the artifact expected by the host Web client; `./client` points to that file in the published package.

## Limitations

This package only changes browser presentation. It does not add a backend service, RPC namespace, persistence format, model prompt, tool schema, session event, or host UI dependency. Future workbench components must compose public slots, services, locale dictionaries, and React contracts exported by the published host packages.

## Development

Run the standalone checks from this directory:

```sh
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
pnpm pack --dry-run
```

`tests/registration.client.spec.tsx` pins the two additive registrations (dock + right, with `id`/`order`) and their disposal, and asserts the plugin never declares host-owned seats (`root`, `details`, `tool.call.toolview`). `tests/presentation.client.spec.tsx` renders both contributions through the injected `useSession` selector hook; `tests/browser.workbench.spec.tsx` mounts them in a DOM and drives a starter click into `inputActions.setDraft`. The suite also checks focus-visible and reduced-motion rules through the scoped CSS contract test.

The [release checklist](RELEASE.md) records the registry prerelease gate, profile installation row, uninstall verification, and the boundary that publishing remains a release-owner action.

The package is intentionally not a member of the `deepseek-harness` pnpm workspace. A valid lockfile contains no `workspace:` specifier.
