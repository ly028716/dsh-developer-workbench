import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ActiveTask } from '../src/client/ActiveTask.tsx'
import { DetailsContext } from '../src/client/DetailsContext.tsx'
import { TaskLauncher } from '../src/client/TaskLauncher.tsx'
import { WorkbenchToolPresentation } from '../src/client/WorkbenchToolPresentation.tsx'
import { apply } from '../src/client/index.ts'

function translate(key: string, params?: Record<string, unknown>): string {
  if (key === 'task.fixTests') return '修复失败测试'
  if (key === 'active.running') return '正在执行'
  if (key === 'active.idle') return '任务上下文'
  if (key === 'active.pending') return `待处理 ${String(params?.count ?? '')} 条`
  if (key === 'details.workspace') return '工作区'
  if (key === 'details.plan') return '计划'
  return key
}

const rootRuntime = {
  useSessions: (() => undefined) as never,
  useWorkspaces: (() => undefined) as never,
}

const sessionRuntime = {
  useSession: (() => undefined) as never,
  sessionId: 'session-1' as never,
  useProjection: (() => undefined) as never,
  useInput: (() => undefined) as never,
  inputActions: { setDraft: () => {}, addImages: () => true, removeImage: () => {}, pruneImages: () => {}, submit: () => {} },
}

describe('developer workbench child presentation', () => {
  it('renders the task launcher through the public owner action', () => {
    const select = vi.fn()
    const html = renderToStaticMarkup(
      <TaskLauncher
        {...rootRuntime}
        t={translate}
        starterAction={{ available: true, select }}
      />,
    )

    expect(html).toContain('data-dsh-workbench-task-launcher="true"')
    expect(html).toContain('修复失败测试')
  })

  it('renders active task and details context from host-owned props', () => {
    const active = renderToStaticMarkup(
      <ActiveTask {...rootRuntime} {...sessionRuntime} t={translate} phase="running" pendingCount={2} />,
    )
    const details = renderToStaticMarkup(
      <DetailsContext {...rootRuntime} {...sessionRuntime} t={translate} workspaceTitle="repo" planSummary="1 / 3" />,
    )

    expect(active).toContain('data-dsh-workbench-active-task="true"')
    expect(active).toContain('2')
    expect(details).toContain('data-dsh-workbench-details-context="true"')
    expect(details).toContain('repo')
  })

  it('wraps the host tool presentation without replacing its content callback', () => {
    const html = renderToStaticMarkup(
      <WorkbenchToolPresentation
        {...rootRuntime}
        {...sessionRuntime}
        openFile={() => {}}
        openDetails={() => {}}
        callId="call-1"
        toolName="bash"
        block={{} as never}
        renderContent={() => <span data-host-content="true">host row</span>}
      />,
    )

    expect(html).toContain('data-dsh-workbench-tool="bash"')
    expect(html).toContain('data-host-content="true"')
  })

  it('registers the four child contributions with the plugin lifetime', () => {
    const registrations: string[] = []
    const disposers: Array<() => void> = []
    const ctx = {
      locale: { register: vi.fn(() => () => {}) },
      slots: {
        inject: vi.fn((_key: string, callback: () => () => void) => {
          const dispose = callback()
          disposers.push(dispose)
          return () => {}
        }),
        register: vi.fn((options: { name: string }) => {
          registrations.push(options.name)
          return () => {}
        }),
      },
      effect: vi.fn((callback: () => () => void) => callback()),
    }

    apply(ctx as never)

    expect(registrations).toEqual([
      'shell.frame',
      'conversation.hero.taskLauncher',
      'conversation.active.task',
      'conversation.details.context',
      'tool.call.presentation',
    ])
    expect(disposers).toHaveLength(5)
  })
})
