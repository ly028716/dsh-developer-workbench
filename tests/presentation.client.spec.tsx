// @ts-nocheck
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ActiveTaskIndicator } from '../src/client/ActiveTaskIndicator.tsx'
import { TaskLauncherDock } from '../src/client/TaskLauncherDock.tsx'

function translate(key: string, params?: Record<string, unknown>): string {
  if (key === 'task.fixTests') return '修复失败测试'
  if (key === 'active.running') return '正在执行'
  if (key === 'active.idle') return '空闲'
  if (key === 'active.pending') return `待处理 ${String(params?.count ?? '')} 条`
  return key
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

describe('developer workbench presentations', () => {
  it('loads the workbench stylesheet from the browser entry', () => {
    const entry = readFileSync('src/client/index.ts', 'utf8')

    expect(entry).toContain("import './workbench.css'")
  })

  it('renders the task launcher on a blank, idle session', () => {
    const html = renderToStaticMarkup(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: false, blank: true, queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
    )

    expect(html).toContain('data-dsh-workbench-task-launcher="true"')
    expect(html).toContain('修复失败测试')
  })

  it('hides the task launcher once a session has begun or is running', () => {
    const started = renderToStaticMarkup(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: false, blank: false, queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
    )
    const busy = renderToStaticMarkup(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: true, blank: true, queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
    )

    expect(started).toBe('')
    expect(busy).toBe('')
  })

  it('exposes one starter control per task', () => {
    const html = renderToStaticMarkup(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: false, blank: true, queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
    )

    expect(html.match(/data-dsh-workbench-starter="true"/g)).toHaveLength(3)
  })

  it('renders the active-task indicator in running and queued states', () => {
    const running = renderToStaticMarkup(
      <ActiveTaskIndicator
        useSession={useSessionFrom({ running: true, blank: false, queue: [{}, {}] })}
        t={translate}
      />,
    )
    const idle = renderToStaticMarkup(
      <ActiveTaskIndicator
        useSession={useSessionFrom({ running: false, blank: true, queue: [] })}
        t={translate}
      />,
    )

    expect(running).toContain('data-dsh-workbench-active-task="true"')
    expect(running).toContain('data-phase="running"')
    expect(running).toContain('正在执行')
    expect(running).toContain('待处理 2 条')
    expect(idle).toContain('data-phase="idle"')
    expect(idle).toContain('空闲')
  })
})
