import { describe, expect, it, vi } from 'vitest'
import { ActiveTaskIndicator } from '../src/client/ActiveTaskIndicator.tsx'
import { TaskLauncherDock } from '../src/client/TaskLauncherDock.tsx'
import { en, NS, zh } from '../src/client/locales.ts'
import { apply } from '../src/client/index.ts'

interface RegisteredEntry {
  options: { name: string; id: string; order: number; locale: string }
  component: unknown
}

/** Minimal stub of the host slot registry that records injections and registrations. */
function harness() {
  const entries: RegisteredEntry[] = []
  const disposers: Array<() => void> = []
  const ctx = {
    locale: { register: vi.fn(() => () => {}) },
    slots: {
      inject: vi.fn((_key: string, callback: () => () => void) => {
        const dispose = callback()
        disposers.push(dispose)
        return () => { dispose() }
      }),
      register: vi.fn((options: RegisteredEntry['options'], component: unknown) => {
        const entry = { options, component }
        entries.push(entry)
        return () => {
          const index = entries.indexOf(entry)
          if (index >= 0) entries.splice(index, 1)
        }
      }),
    },
    effect: vi.fn((callback: () => () => void) => callback()),
  }
  return {
    ctx,
    entries,
    dispose: () => { for (const dispose of disposers) dispose() },
  }
}

describe('developer workbench plugin registration', () => {
  it('registers locale dictionaries for the plugin namespace', () => {
    const { ctx } = harness()
    apply(ctx as never)

    expect(ctx.locale.register).toHaveBeenCalledWith(NS, { en, zh })
  })

  it('injects two additive dock contributions beside the shipped occupants', () => {
    const { ctx, entries } = harness()
    apply(ctx as never)

    expect(ctx.slots.inject).toHaveBeenCalledWith('conversation.input.dock', expect.any(Function))
    expect(ctx.slots.inject).toHaveBeenCalledWith('conversation.input.right', expect.any(Function))
    expect(entries).toHaveLength(2)

    expect(entries[0]).toMatchObject({
      options: { name: 'conversation.input.dock', id: 'workbench', order: 10, locale: NS },
      component: TaskLauncherDock,
    })
    expect(entries[1]).toMatchObject({
      options: { name: 'conversation.input.right', id: 'workbench', order: 0, locale: NS },
      component: ActiveTaskIndicator,
    })
  })

  it('stays purely additive: it never declares or shadows host-owned seats', () => {
    const { ctx } = harness()
    apply(ctx as never)

    // Declaring any of these would either throw at load time (root's children)
    // or replace a shipped occupant (details / tool.call.toolview).
    expect(ctx.slots.inject).not.toHaveBeenCalledWith('root', expect.any(Function))
    expect(ctx.slots.inject).not.toHaveBeenCalledWith('details', expect.any(Function))
    expect(ctx.slots.inject).not.toHaveBeenCalledWith('tool.call.toolview', expect.any(Function))
  })

  it('disposes both injections when the plugin fiber is torn down', () => {
    const { ctx, entries, dispose } = harness()
    apply(ctx as never)
    expect(entries).toHaveLength(2)

    dispose()

    expect(entries).toHaveLength(0)
  })
})
