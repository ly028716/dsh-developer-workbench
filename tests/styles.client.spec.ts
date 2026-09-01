import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const cssPath = `${process.cwd()}/src/client/workbench.css`

describe('developer workbench styles', () => {
  it('scopes palette, interaction, plan, focus, and motion rules to the marker', async () => {
    const css = await readFile(cssPath, 'utf8')

    expect(css).toContain('[data-dsh-developer-workbench="true"]')
    expect(css).toContain('--dsw-alias-workbench-surface')
    expect(css).toContain('--dsw-alias-workbench-focus')
    expect(css).toContain('--dsw-alias-workbench-plan-track')
    expect(css).toContain('--dsw-alias-workbench-plan-progress')
    expect(css).toContain(':focus-visible')
    expect(css).toContain('prefers-reduced-motion: reduce')
    expect(css).not.toMatch(/(^|[,{\s])body\s*\{/m)
  })

  it('does not carry styles for the removed frame, details, or tool wrappers', async () => {
    const css = await readFile(cssPath, 'utf8')

    expect(css).not.toContain('data-dsh-workbench-details-context')
    expect(css).not.toContain('data-dsh-workbench-tool')
    expect(css).not.toContain('data-dsh-workbench-overlay')
  })
})
