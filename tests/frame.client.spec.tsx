import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { WorkbenchFrame } from '../src/client/WorkbenchFrame.tsx'
import { apply } from '../src/client/index.ts'

interface FrameOwner {
  renderSidebar: (owner: { collapsed: boolean; width: number }) => ReactNode
  renderConversation: (owner: object) => ReactNode
  renderDetails: (owner: object) => ReactNode
  renderOverlay: (owner: object) => ReactNode
}

interface RegisteredFrame {
  options: { name: string; priority?: number; select: (owner: FrameOwner) => boolean }
  component: typeof WorkbenchFrame
}

function owner(): FrameOwner {
  return {
    renderSidebar: ({ width }) => <aside data-region="sidebar">{width}</aside>,
    renderConversation: () => <main data-region="conversation">conversation</main>,
    renderDetails: () => <section data-region="details">details</section>,
    renderOverlay: () => <div data-region="overlay">overlay</div>,
  }
}

function harness() {
  const entries: RegisteredFrame[] = []
  const disposeEffects: Array<() => void> = []
  const ctx = {
    locale: { register: vi.fn(() => () => {}) },
    slots: {
      inject: vi.fn((_key: string, callback: () => () => void) => {
        const dispose = callback()
        return () => { dispose() }
      }),
      register: vi.fn((options: RegisteredFrame['options'], component: typeof WorkbenchFrame) => {
        const entry = { options, component }
        entries.push(entry)
        const disposeRegistration = () => {
          const index = entries.indexOf(entry)
          if (index >= 0) entries.splice(index, 1)
        }
        return disposeRegistration
      }),
    },
    effect: vi.fn((callback: () => () => void) => {
      const dispose = callback()
      disposeEffects.push(() => { dispose?.() })
      return async () => { dispose?.() }
    }),
  }
  return { ctx, entries, owner: owner(), dispose: () => { for (const dispose of disposeEffects) dispose() } }
}

describe('developer workbench frame', () => {
  it('registers one high-priority shell.frame entry and marks the frame', () => {
    const { ctx, entries, owner: frameOwner } = harness()
    apply(ctx as never)

    expect(ctx.slots.inject).toHaveBeenCalledWith('shell.frame', expect.any(Function))
    expect(entries).toHaveLength(5)
    expect(entries[0]?.options.name).toBe('shell.frame')
    expect(entries[0]?.options.priority).toBeLessThan(0)
    expect(entries[0]?.options.select(frameOwner)).toBe(true)

    const html = renderToStaticMarkup(<WorkbenchFrame {...frameOwner} />)
    expect(html).toContain('data-dsh-developer-workbench="true"')
    expect(html).toContain('data-region="sidebar"')
    expect(html).toContain('data-region="conversation"')
    expect(html).toContain('data-region="details"')
    expect(html).toContain('data-region="overlay"')
  })

  it('disposes the registration and leaves the host fallback eligible', async () => {
    const { ctx, entries, dispose } = harness()
    apply(ctx as never)
    expect(entries).toHaveLength(5)

    dispose()

    expect(entries).toHaveLength(0)
  })
})
