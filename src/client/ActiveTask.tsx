import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ActiveTaskOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { NS } from './locales.ts'

type ActiveTaskProps = PropsRuntime<'conversation.active.task'> & PropsLocale<typeof NS>

/** Compact active-task strip driven by the host session phase and queue count. */
export function ActiveTask({ phase, pendingCount, t }: ActiveTaskProps) {
  return (
    <aside data-dsh-workbench-active-task="true" data-phase={phase}>
      <strong>{t(phase === 'running' ? 'active.running' : 'active.idle')}</strong>
      {pendingCount > 0 && <span>{t('active.pending', { count: pendingCount })}</span>}
    </aside>
  )
}

export type { ActiveTaskOwnerProps }
