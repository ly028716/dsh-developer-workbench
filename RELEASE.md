# Release checklist

This package is ready for a registry prerelease after the host publishes the matching `@deepseek-ai/dsh-client-*` peer packages.

## Local verification

Run from this repository:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run test
pnpm run build
pnpm pack --dry-run
```

The packed file must contain `lib/client.js`, declarations, scoped CSS, and both README files. `package.json` must keep `./client` pointed at `./lib/client.js` and must not contain a `workspace:` dependency.

## Profile installation

Install the published package in the profile project and insert this row after `dsh-web-app` in `cordis.patch.yml`:

```yaml
- insert:
    - id: developer-workbench
      name: '@deepseek-ai/dsh-developer-workbench'
```

Verify the host assembly with `node examples/profile-on/verify-host-cli.mjs on`. To uninstall, run `dsh plugin --profile <name> remove @deepseek-ai/dsh-developer-workbench`, remove the overlay row, reload the profile, and run the verifier with `off`. The host frame and child presentation fallbacks must return without changing session data, workspace selection, drafts, or tool history.

## Recorded verification

On 2026-08-24, an isolated temporary `DSH_HOME` was installed through the source host CLI, loaded with the overlay, then uninstalled by removing the dependency and overlay row. The host CLI reported the plugin row while enabled and no row after removal. Browser reloads returned:

```text
enabled:  status=200 workbench=1 default=0 errors=0
disabled: status=200 workbench=0 default=1 errors=0
```

The lifecycle used no model request and did not write session, workspace, draft, or tool-history state; the host-owned fallback remained responsible for those surfaces.

## Publication boundary

Creating or connecting the public Git repository and running `pnpm publish --tag next --access public` are release-owner actions. This workspace only prepares and verifies the package; it does not push commits or publish to npm.
