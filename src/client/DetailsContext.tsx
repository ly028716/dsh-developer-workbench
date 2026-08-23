import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { DetailsContextOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { NS } from './locales.ts'

type DetailsContextProps = PropsRuntime<'conversation.details.context'> & PropsLocale<typeof NS>

/** Workbench context strip that keeps workspace and plan facts host-owned. */
export function DetailsContext({ workspaceTitle, planSummary, t }: DetailsContextProps) {
  if (workspaceTitle === undefined && planSummary === undefined) return null
  return (
    <section data-dsh-workbench-details-context="true">
      {workspaceTitle !== undefined && <div><span>{t('details.workspace')}</span><strong>{workspaceTitle}</strong></div>}
      {planSummary !== undefined && <div><span>{t('details.plan')}</span><strong>{planSummary}</strong></div>}
    </section>
  )
}

export type { DetailsContextOwnerProps }
