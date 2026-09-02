import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'

/** Props of a `conversation.input.right` occupant. */
type ActiveTaskIndicatorProps = PropsRuntime<'conversation.input.right'> & PropsLocale<typeof NS>

/** Compact active-task indicator rendered in the input right area. */
export function ActiveTaskIndicator({ useSession, useInput, t }: ActiveTaskIndicatorProps) {
  const running = useSession(s => s.running)
  const pendingCount = useInput(s => s.queue.length)
  const hasPending = pendingCount > 0
  const phase = useInput(s => s.phase)
  const state = running ? 'running' : hasPending ? 'queued' : 'idle'
  const label = state === 'running' ? t('active.running') : state === 'queued' ? t('active.queued') : t('active.idle')

  return (
    <aside
      data-dsh-developer-workbench="true"
      data-dsh-workbench-active-task="true"
      data-phase={state}
      data-input-phase={phase}
      role="status"
      aria-live="polite"
    >
      <span data-dsh-workbench-task-indicator="true" aria-hidden="true" />
      <div data-dsh-workbench-active-copy="true">
        <strong>{label}</strong>
        {hasPending && <span>{t('active.pending', { count: pendingCount })}</span>}
      </div>
      <span
        data-dsh-workbench-status-track="true"
        aria-hidden="true"
      />
    </aside>
  )
}
