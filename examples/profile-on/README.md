# Profile-on example

This example enables `@deepseek-ai/dsh-developer-workbench` through a profile overlay. The overlay adds one browser plugin row after the shipped `dsh-web-app` rows; it does not replace the host frame, session store, workspace service, or tool contracts.

## Install

Build the standalone package from the repository root, then install the generated tarball into this example:

```sh
pnpm run build
pnpm pack
pnpm --dir examples/profile-on add --save-dev ../../deepseek-ai-dsh-developer-workbench-0.1.0-rc.0.tgz
```

The profile project must resolve the published `@deepseek-ai/dsh-client-*` peer packages supplied by the matching dsh Web release. The lockfile must not contain `workspace:` versions.

## Enable

Apply `cordis.patch.yml` after the `dsh-web-app` profile layer. The enabled browser bundle contributes the optional frame and child presentation entries. Its marker is `data-dsh-developer-workbench="true"`.

## Disable and uninstall

Remove the overlay row or run `dsh plugin --profile <name> remove @deepseek-ai/dsh-developer-workbench`, then reload the Web profile. The host `shell.frame` and child presentation fallbacks render again; session history, workspace selection, drafts, and tool history remain owned by dsh.

## Evidence

The sibling snapshots record the deterministic blank, active, details-open, details-closed, and disposal states. They contain only DOM markers, labels, context values, and CSS token values; no model key or network request is required.
