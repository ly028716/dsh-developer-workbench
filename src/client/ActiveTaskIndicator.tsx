import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'

/**
 * Props of a `conversation.input.right` occupant: session facts arrive
 * through the injected `useSession` selector hook, not an owner object.
 */
type ActiveTaskIndicatorProps = PropsRuntime<'conversation.input.right'> & PropsLocale<typeof NS>

/** Compact active-task indicator rendered in the input right area. */
export function ActiveTaskIndicator({ useSession, t }: ActiveTaskIndicatorProps) {
  const running = useSession(s => s.running)
  const pendingCount = useSession(s => s.queue.length)
  const hasPending = pendingCount > 0
  const progress = running ? 70 : hasPending ? 28 : 0

  return (
    <aside
      data-dsh-developer-workbench="true"
      data-dsh-workbench-active-task="true"
      data-phase={running ? 'running' : 'idle'}
      data-plan-state={running ? 'running' : hasPending ? 'queued' : 'idle'}
      aria-live="polite"
    >
      <span data-dsh-workbench-task-indicator="true" aria-hidden="true" />
      <div data-dsh-workbench-active-copy="true">
        <strong>{t(running ? 'active.running' : 'active.idle')}</strong>
        {hasPending && <span>{t('active.pending', { count: pendingCount })}</span>}
      </div>
      <span
        data-workbench-plan="true"
        data-dsh-workbench-plan-track="true"
        aria-hidden="true"
      >
        <span data-workbench-plan-progress="true" style={{ width: `${progress}%` }} />
      </span>
    </aside>
  )
}
