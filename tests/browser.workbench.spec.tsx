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
    'task.flowEyebrow': 'Developer task flow',
    'task.blankTitle': 'Ready for a task',
    'task.activeTitle': 'Continue the current task',
    'task.runningTitle': 'Task is running',
    'task.blankDescription': 'Describe the goal, then use @ to add code context.',
    'task.draftDescription': 'Current draft',
    'task.insertScaffold': 'Insert task scaffold',
    'task.clearDraft': 'Clear draft',
    'task.scaffold': 'Goal:\n\nContext:\n\nAcceptance criteria:',
    'task.phase.plain': 'Waiting for task',
    'task.phase.submitting': 'Submitting',
    'task.contextCount': '{count} context',
    'task.queueCount': '{count} queued',
    'active.running': 'Running',
    'active.queued': 'Queued',
    'active.idle': 'Idle',
  }
  if (key === 'task.contextCount') return `${String(params?.count ?? '')} context`
  if (key === 'task.queueCount') return `${String(params?.count ?? '')} queued`
  if (key === 'active.pending') return `queued ${String(params?.count ?? '')}`
  return copy[key] ?? key
}

interface SessionShape {
  running: boolean
  blank: boolean
  queue: unknown[]
}

interface InputShape {
  draft: string
  phase: 'plain' | 'adjudicating' | 'claimed' | 'submitting'
  occurrences: unknown[]
  queue: unknown[]
}

/** Injects a session-backed selector hook the way the host slot registry does. */
function useSessionFrom(session: SessionShape) {
  return (selector: (s: SessionShape) => unknown) => selector(session)
}

function useInputFrom(input: InputShape) {
  return (selector: (s: InputShape) => unknown) => selector(input)
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
        useInput={useInputFrom({ draft: '', phase: 'plain', occurrences: [], queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
      container,
    )

    const launcher = container.querySelector<HTMLElement>('[data-dsh-workbench-task-launcher="true"]')!
    const actions = launcher.querySelector<HTMLElement>('[data-dsh-workbench-task-actions="true"]')!
    expect(getComputedStyle(launcher).display).toBe('grid')
    expect(getComputedStyle(actions).display).toBe('flex')

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
          useInput={useInputFrom({ draft: '', phase: 'plain', occurrences: [], queue: [] })}
          inputActions={{ setDraft: () => {} }}
          t={translate}
        />
        <ActiveTaskIndicator
          useSession={useSessionFrom({ running: true, blank: false, queue: [{}, {}] })}
          useInput={useInputFrom({ draft: '', phase: 'submitting', occurrences: [], queue: [{}, {}] })}
          t={translate}
        />
      </>,
      container,
    )

    expect(container.querySelector('[data-dsh-developer-workbench="true"]')).not.toBeNull()
    expect(container.querySelector('[data-dsh-workbench-task-launcher="true"]')).not.toBeNull()
    expect(container.querySelector('[data-dsh-workbench-active-task="true"]')).not.toBeNull()
    expect(container.querySelector('[data-dsh-workbench-active-task="true"]')?.getAttribute('data-phase')).toBe('running')
    expect(container.textContent).toContain('Running')
    expect(container.textContent).toContain('queued 2')

    act(() => { root.unmount() })
  })

  it('routes the scaffold action into the draft through the input actions', () => {
    const setDraft = vi.fn()
    const container = document.createElement('div')
    document.body.append(container)
    const root = mount(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: false, blank: true, queue: [] })}
        useInput={useInputFrom({ draft: '', phase: 'plain', occurrences: [], queue: [] })}
        inputActions={{ setDraft }}
        t={translate}
      />,
      container,
    )

    act(() => { (container.querySelector('[data-dsh-workbench-action="scaffold"]') as HTMLButtonElement).click() })

    expect(setDraft).toHaveBeenCalledWith('Goal:\n\nContext:\n\nAcceptance criteria:')
    act(() => { root.unmount() })
  })

  it('keeps a compact task console visible on a running session', () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = mount(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: true, blank: true, queue: [] })}
        useInput={useInputFrom({ draft: '', phase: 'submitting', occurrences: [], queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
      container,
    )

    expect(container.querySelector('[data-dsh-workbench-task-launcher="true"]')).not.toBeNull()
    expect(container.querySelector('[data-dsh-workbench-task-launcher="true"]')?.getAttribute('data-phase')).toBe('running')
    act(() => { root.unmount() })
  })
})
