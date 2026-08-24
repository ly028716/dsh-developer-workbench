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

Verify the assembled profile through the host CLI before launching Web:

```sh
node verify-host-cli.mjs on
```

For a source checkout, set `DSH_CLI` to the host launcher, `DSH_CLI_CWD` to the host repository, and pass launcher arguments through `DSH_CLI_ARGS`; for example, the repository source CLI uses `DSH_CLI=node` and `DSH_CLI_ARGS="--import tsx/esm apps/cli/src/bin.ts"`.

## Disable and uninstall

Remove the overlay row or run `dsh plugin --profile <name> remove @deepseek-ai/dsh-developer-workbench`, then reload the Web profile. The host `shell.frame` and child presentation fallbacks render again; session history, workspace selection, drafts, and tool history remain owned by dsh.

After removing both the dependency and the overlay row, repeat the host check:

```sh
node verify-host-cli.mjs off
```

The `off` result proves that the host profile no longer asks the resolver to load the optional package; the browser fallback is then the built-in frame and child presentation.

## Evidence

The sibling snapshots record the deterministic blank, active, details-open, details-closed, and disposal states. They contain only DOM markers, labels, context values, and CSS token values; no model key or network request is required. The published `./client` export is a `lib/client.js` ModuleLoader bundle, so the profile can load it through the host CLI rather than treating raw TypeScript-compiled ESM as a browser script.
