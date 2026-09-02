// @ts-nocheck
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ActiveTaskIndicator } from '../src/client/ActiveTaskIndicator.tsx'
import { TaskLauncherDock } from '../src/client/TaskLauncherDock.tsx'

function translate(key: string, params?: Record<string, unknown>): string {
  if (key === 'task.flowEyebrow') return '开发者任务流'
  if (key === 'task.blankTitle') return '准备开始任务'
  if (key === 'task.activeTitle') return '继续当前任务'
  if (key === 'task.runningTitle') return '任务正在执行'
  if (key === 'task.blankDescription') return '描述目标，并使用 @ 添加代码上下文。'
  if (key === 'task.draftDescription') return '当前草稿'
  if (key === 'task.insertScaffold') return '插入任务骨架'
  if (key === 'task.clearDraft') return '清空草稿'
  if (key === 'task.confirmClear') return '确认清空'
  if (key === 'task.cancelClear') return '保留草稿'
  if (key === 'task.expandDraft') return '展开草稿'
  if (key === 'task.collapseDraft') return '收起草稿'
  if (key === 'task.phase.plain') return '等待任务'
  if (key === 'task.phase.submitting') return '提交中'
  if (key === 'task.contextCount') return `上下文 ${String(params?.count ?? '')}`
  if (key === 'task.queueCount') return `排队 ${String(params?.count ?? '')}`
  if (key === 'active.running') return '执行中'
  if (key === 'active.queued') return '排队中'
  if (key === 'active.idle') return '空闲'
  if (key === 'active.pending') return `待处理 ${String(params?.count ?? '')} 条`
  return key
}

interface SessionShape { running: boolean; blank: boolean; queue: unknown[] }
interface InputShape { draft: string; phase: 'plain' | 'adjudicating' | 'claimed' | 'submitting'; occurrences: unknown[]; queue: unknown[] }

function useSessionFrom(session: SessionShape) {
  return (selector: (s: SessionShape) => unknown) => selector(session)
}

function useInputFrom(input: InputShape) {
  return (selector: (s: InputShape) => unknown) => selector(input)
}

describe('developer workbench presentations', () => {
  it('loads the workbench stylesheet from the browser entry', () => {
    const entry = readFileSync('src/client/index.ts', 'utf8')
    expect(entry).toContain("import './workbench.css'")
  })

  it('renders a task focus console with draft and context status', () => {
    const html = renderToStaticMarkup(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: false, blank: true, queue: [] })}
        useInput={useInputFrom({ draft: '修复回调测试', phase: 'plain', occurrences: [{}], queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
    )

    expect(html).toContain('data-dsh-workbench-task-launcher="true"')
    expect(html).toContain('开发者任务流')
    expect(html).toContain('当前草稿')
    expect(html).toContain('上下文 1')
    expect(html).not.toContain('修复失败测试')
  })

  it('shows the task lifecycle title after a session has started', () => {
    const started = renderToStaticMarkup(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: false, blank: false, queue: [] })}
        useInput={useInputFrom({ draft: '', phase: 'plain', occurrences: [], queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
    )
    const busy = renderToStaticMarkup(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: true, blank: true, queue: [] })}
        useInput={useInputFrom({ draft: '', phase: 'submitting', occurrences: [], queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
    )

    expect(started).toContain('继续当前任务')
    expect(busy).toContain('任务正在执行')
  })

  it('exposes one scaffold action instead of starter buttons', () => {
    const html = renderToStaticMarkup(
      <TaskLauncherDock
        useSession={useSessionFrom({ running: false, blank: true, queue: [] })}
        useInput={useInputFrom({ draft: '', phase: 'plain', occurrences: [], queue: [] })}
        inputActions={{ setDraft: () => {} }}
        t={translate}
      />,
    )

    expect(html).toContain('data-dsh-workbench-action="scaffold"')
    expect(html).not.toContain('data-dsh-workbench-starter')
  })

  it('renders the active-task status without fabricated percentage progress', () => {
    const running = renderToStaticMarkup(
      <ActiveTaskIndicator
        useSession={useSessionFrom({ running: true, blank: false, queue: [{}, {}] })}
        useInput={useInputFrom({ draft: '', phase: 'submitting', occurrences: [], queue: [{}, {}] })}
        t={translate}
      />,
    )
    const idle = renderToStaticMarkup(
      <ActiveTaskIndicator
        useSession={useSessionFrom({ running: false, blank: true, queue: [] })}
        useInput={useInputFrom({ draft: '', phase: 'plain', occurrences: [], queue: [] })}
        t={translate}
      />,
    )

    expect(running).toContain('data-phase="running"')
    expect(running).toContain('执行中')
    expect(running).toContain('待处理 2 条')
    expect(running).not.toContain('70%')
    expect(idle).toContain('空闲')
  })
})
