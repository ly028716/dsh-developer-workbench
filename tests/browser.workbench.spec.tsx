// @ts-nocheck
// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ActiveTaskIndicator } from '../src/client/ActiveTaskIndicator.tsx'
import { TaskLauncherDock } from '../src/client/TaskLauncherDock.tsx'

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const translate = (key: string, params?: Record<string, unknown>): string => {
  const copy: Record<string, string> = {
    'task.fixTests': 'Fix failing tests',
    'task.refactorModule': 'Refactor a module',
    'task.explainCodebase': 'Explain the codebase',
    'task.launcherEyebrow': 'Start from a focused prompt',
    'task.launcherTitle': 'What should we work on?',
    'task.launcherDescription': 'Choose a starter.',
    'active.running': 'Active task',
    'active.idle': 'Idle',
  }
  if (key === 'active.pending') return `queued ${String(params?.count ?? '')}`
  return copy[key] ?? key
}

interface SessionShape {
  running: boolean
  blank: boolean
  queue: unknown[]
}

/** Injects a session-backed selector hook the way the host slot registry does. */
function useSessionFrom(session: SessionShape) {
  return (selector: (s: SessionShape) => unknown) => selector(session)
}

function mount(element: React.ReactNode, container: HTMLElement): Root {
  const root = createRoot(container)
  act(() => { root.render(element) })
  return root
}

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('Workbench dock contributions in a real DOM', () => {
  it('applies the launcher layout to its marker-bearing root', () => {
    const stylesheet = document.createElement('style')
    stylesheet.textContent = readFileSync('src/client/workbench.css', 'utf8')
    document.head.append(stylesheet)
    const container = document.createElement('div')
    document.body.append(container)
    const root = mount(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: false, blank: true, queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
      container,
    )

    const launcher = container.querySelector<HTMLElement>('[data-dsh-workbench-task-launcher="true"]')!
    const starters = launcher.querySelector<HTMLElement>('[role="list"]')!
    expect(getComputedStyle(launcher).display).toBe('grid')
    expect(getComputedStyle(starters).display).toBe('grid')

    act(() => { root.unmount() })
    stylesheet.remove()
  })

  it('renders both additive contributions in the input zone', () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = mount(
      <>
        <TaskLauncherDock
          useSession={useSessionFrom({ running: false, blank: true, queue: [] })}
          inputActions={{ setDraft: () => {} }}
          t={translate}
        />
        <ActiveTaskIndicator
          useSession={useSessionFrom({ running: true, blank: false, queue: [{}, {}] })}
          t={translate}
        />
      </>,
      container,
    )

    expect(container.querySelector('[data-dsh-developer-workbench="true"]')).not.toBeNull()
    expect(container.querySelector('[data-dsh-workbench-task-launcher="true"]')).not.toBeNull()
    expect(container.querySelector('[data-dsh-workbench-active-task="true"]')).not.toBeNull()
    expect(container.querySelector('[data-dsh-workbench-active-task="true"]')?.getAttribute('data-phase')).toBe('running')
    expect(container.textContent).toContain('Active task')
    expect(container.textContent).toContain('queued 2')

    act(() => { root.unmount() })
  })

  it('routes starter clicks into the draft through the input actions', () => {
    const setDraft = vi.fn()
    const container = document.createElement('div')
    document.body.append(container)
    const root = mount(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: false, blank: true, queue: [] })}
        inputActions={{ setDraft }}
        t={translate}
      />,
      container,
    )

    act(() => { (container.querySelector('[data-dsh-workbench-starter="true"]') as HTMLButtonElement).click() })

    expect(setDraft).toHaveBeenCalledWith('修复当前工作区中的失败测试，并说明根因。')
    act(() => { root.unmount() })
  })

  it('collapses to nothing on a running session', () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = mount(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: true, blank: true, queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
      container,
    )

    expect(container.querySelector('[data-dsh-workbench-task-launcher="true"]')).toBeNull()
    act(() => { root.unmount() })
  })
})
