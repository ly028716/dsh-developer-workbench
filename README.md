# @deepseek-ai/dsh-developer-workbench

English | [中文](README.zh.md)

`@deepseek-ai/dsh-developer-workbench` is an optional DeepSeek Harness browser presentation plugin. It is developed and published outside the main `deepseek-harness` workspace, and its dependencies must come from the npm registry; the package must not use `workspace:` specifiers or private host source imports.

## Installation

Install the package into the profile project that assembles the web app:

```sh
pnpm add @deepseek-ai/dsh-developer-workbench
```

Enable it by adding the plugin row after the web app row in the profile overlay:

```yaml
plugins:
  - package: '@deepseek-ai/dsh-bundle-web-app'
  - package: '@deepseek-ai/dsh-developer-workbench'
```

The host must provide published `@deepseek-ai/dsh-client-*` packages in the `0.1.0-rc.7` compatible range. The package declares those host-facing packages as peer dependencies so the profile owns the exact host version.

## Runtime Contract

The plugin's browser entry exports `apply(ctx)`. It registers one high-priority `shell.frame` chain entry for the plugin lifetime through `ctx.effect()` and `ctx.slots.inject()`. `WorkbenchFrame` renders the public host child callbacks for the sidebar, conversation, details, and overlay regions, while its styles are scoped under the frame marker. Disabling or uninstalling the plugin disposes the registration, and the host-owned `shell.frame` fallback renders the default frame again.

The default fallback guarantee belongs to the host. When this plugin is absent, disabled, disposed, or not selected by the chain, the built-in frame remains eligible and session data, workspace selection, drafts, and tool history stay host-owned.

The plugin also contributes four higher-priority public presentation entries: a blank-session task launcher, an active-task strip, a details context surface, and a `tool.call.presentation` wrapper. These entries consume host owner props and preserve the host's input actions, session projection, tool cards, details actions, Inspect action, and file callbacks. Disposing the plugin removes all four contributions together, so every host fallback remains eligible.

The [`examples/profile-on`](examples/profile-on/README.md) fixture contains the overlay and deterministic profile-on/profile-off evidence. Install the packed tarball into that profile project, apply its overlay after `dsh-web-app`, and remove the dependency or overlay to restore the host fallback.

## Limitations

This package only changes browser presentation. It does not add a backend service, RPC namespace, persistence format, model prompt, tool schema, session event, or host UI dependency. Future workbench components must compose public slots, services, locale dictionaries, and React contracts exported by the published host packages.

## Development

Run the standalone checks from this directory:

```sh
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run pack
```

The package is intentionally not a member of the `deepseek-harness` pnpm workspace. A valid lockfile contains no `workspace:` specifier.
