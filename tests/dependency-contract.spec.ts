import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as {
  peerDependencies: Record<string, string>
  devDependencies: Record<string, string>
}

describe('published host dependency contract', () => {
  it('typechecks every DSH client package against its declared peer range', () => {
    for (const [name, peerRange] of Object.entries(manifest.peerDependencies)) {
      if (!name.startsWith('@deepseek-ai/dsh-client-')) continue
      expect(manifest.devDependencies[name], name).toBe(peerRange)
    }
  })
})
