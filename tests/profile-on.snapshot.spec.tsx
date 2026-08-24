import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ActiveTask } from '../src/client/ActiveTask.tsx'
import { DetailsContext } from '../src/client/DetailsContext.tsx'
import { TaskLauncher } from '../src/client/TaskLauncher.tsx'
import { WorkbenchFrame } from '../src/client/WorkbenchFrame.tsx'
import { WorkbenchToolPresentation } from '../src/client/WorkbenchToolPresentation.tsx'

const root = dirname(fileURLToPath(import.meta.url))
const snapshot = (name: string): string => readFileSync(join(root, '..', 'examples/profile-on/snapshots', name), 'utf8')

const translate = (key: string, params?: Record<string, unknown>): string => {
  if (key === 'task.fixTests') return '修复失败测试'
  if (key === 'active.running') return '正在执行'
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

describe('profile-on assembled evidence records', () => {
  it('keeps profile-off host fallback evidence explicit', () => {
    expect(snapshot('profile-off.expected.txt')).toBe([
      'profile=off',
      'default-frame=true',
      'workbench-marker=absent',
      'task-launcher=absent',
      'active-task=absent',
      'details-context=absent',
      'tool-wrapper=absent',
      '',
    ].join('\n'))
  })

  it('records the blank and active plugin presentations from public props', () => {
    const frame = renderToStaticMarkup(<WorkbenchFrame
      renderSidebar={() => <div />}
      renderConversation={() => <div />}
      renderDetails={() => <div />}
      renderOverlay={() => <div />}
    />)
    const launcher = renderToStaticMarkup(<TaskLauncher
      {...rootRuntime}
      t={translate}
      starterAction={{ available: true, select: vi.fn() }}
    />)
    const active = renderToStaticMarkup(<ActiveTask
      {...rootRuntime}
      {...sessionRuntime}
      t={translate}
      phase="running"
      pendingCount={2}
    />)

    expect(snapshot('profile-on-blank.expected.txt')).toBe([
      'profile=on',
      `frame-marker=${String(frame.includes('data-dsh-developer-workbench="true"'))}`,
      `task-launcher=${String(launcher.includes('data-dsh-workbench-task-launcher="true"'))}`,
      'starter=修复失败测试',
      'host-composer=preserved',
      '',
    ].join('\n'))
    expect(snapshot('profile-on-active.expected.txt')).toBe([
      'profile=on',
      'frame-marker=true',
      `active-task=${String(active.includes('data-dsh-workbench-active-task="true"'))}`,
      'phase=running',
      'pending=2',
      'session-state=host-owned',
      '',
    ].join('\n'))
  })

  it('records details open/closed and disposal fallback contracts', () => {
    const details = renderToStaticMarkup(<DetailsContext
      {...rootRuntime}
      {...sessionRuntime}
      t={translate}
      workspaceTitle="repo"
      planSummary="1 / 3"
    />)
    const tool = renderToStaticMarkup(<WorkbenchToolPresentation
      {...rootRuntime}
      {...sessionRuntime}
      openFile={() => {}}
      openDetails={() => {}}
      callId="call-1"
      toolName="bash"
      block={{} as never}
      renderContent={() => <span data-host-content="true">host row</span>}
    />)

    expect(snapshot('profile-on-details-open.expected.txt')).toBe([
      'profile=on',
      'frame-marker=true',
      'details-collapsed=false',
      `details-context=${String(details.includes('data-dsh-workbench-details-context="true"'))}`,
      'workspace=repo',
      'plan=1 / 3',
      'tool-selection=host-owned',
      '',
    ].join('\n'))
    expect(snapshot('profile-on-details-closed.expected.txt')).toBe([
      'profile=on',
      'frame-marker=true',
      'details-collapsed=true',
      'details-selection=preserved',
      'workspace=repo',
      'plan=1 / 3',
      '',
    ].join('\n'))
    expect(snapshot('profile-off-disposal.expected.txt')).toBe([
      'profile=disposed',
      'default-frame=true',
      'workbench-marker=absent',
      'task-launcher=host-fallback',
      'active-task=host-fallback',
      'details-context=host-fallback',
      'tool-wrapper=host-fallback',
      'session-history=preserved',
      '',
    ].join('\n'))
    expect(tool).toContain('data-dsh-workbench-tool="bash"')
    expect(tool).toContain('data-host-content="true"')
  })
})
