import { describe, expect, it } from 'vitest'
import { clientUrlFromOutput, isEntrypoint, pluginOverlay, terminationCommand } from '../scripts/host-profile-smoke.mjs'

describe('real-host profile smoke helpers', () => {
  it('extracts the tokenized web URL printed by dsh', () => {
    expect(clientUrlFromOutput('booting\ndsh web: http://127.0.0.1:43121/?token=abc_DEF-123\n')).toBe(
      'http://127.0.0.1:43121/?token=abc_DEF-123',
    )
  })

  it('creates the additive profile row for this package', () => {
    expect(pluginOverlay('@deepseek-ai/dsh-developer-workbench')).toBe(
      "- insert:\n    - id: developer-workbench\n      name: '@deepseek-ai/dsh-developer-workbench'\n",
    )
  })

  it('recognizes its Windows file URL as the invoked entrypoint', () => {
    expect(isEntrypoint('E:\\repo\\scripts\\host-profile-smoke.mjs', 'file:///E:/repo/scripts/host-profile-smoke.mjs')).toBe(true)
  })

  it('terminates the complete Windows process tree for a spawned host', () => {
    expect(terminationCommand('win32', 42)).toEqual({ executable: 'taskkill.exe', args: ['/pid', '42', '/t', '/f'] })
  })
})
