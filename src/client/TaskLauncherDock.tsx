import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'

/** Props of a `conversation.input.dock` occupant. */
type TaskLauncherDockProps = PropsRuntime<'conversation.input.dock'> & PropsLocale<typeof NS>

/** Focused task console rendered above the host-owned composer. */
export function TaskLauncherDock({ useSession, useInput, inputActions, t }: TaskLauncherDockProps) {
  const blank = useSession(s => s.blank)
  const running = useSession(s => s.running)
  const draft = useInput(s => s.draft)
  const phase = useInput(s => s.phase)
  const contextCount = useInput(s => s.occurrences.length)
  const queueCount = useInput(s => s.queue.length)
  const title = running ? t('task.runningTitle') : blank ? t('task.blankTitle') : t('task.activeTitle')
  const description = draft.trim() === '' ? t('task.blankDescription') : t('task.draftDescription')
  const phaseLabel = running ? t('active.running') : t(
    phase === 'submitting'
      ? 'task.phase.submitting'
      : phase === 'adjudicating'
        ? 'task.phase.adjudicating'
        : phase === 'claimed'
          ? 'task.phase.claimed'
          : 'task.phase.plain',
  )

  return (
    <section
      data-dsh-developer-workbench="true"
      data-dsh-workbench-task-launcher="true"
      data-phase={running ? 'running' : blank ? 'blank' : 'active'}
      aria-labelledby="dsh-workbench-task-launcher-title"
    >
      <div data-dsh-workbench-task-launcher-copy="true">
        <span data-dsh-workbench-eyebrow="true">{t('task.flowEyebrow')}</span>
        <h2 id="dsh-workbench-task-launcher-title">{title}</h2>
        <p>{description}</p>
      </div>
      <div data-dsh-workbench-task-summary="true">
        <div data-dsh-workbench-task-status="true" data-status={running ? 'running' : phase}>
          <span data-dsh-workbench-status-dot="true" aria-hidden="true" />
          <strong>{phaseLabel}</strong>
          {draft.trim() !== '' && <code data-dsh-workbench-draft="true">{draft}</code>}
        </div>
        <div data-dsh-workbench-task-metrics="true" aria-label={t('task.flowEyebrow')}>
          <span>{t('task.contextCount', { count: contextCount })}</span>
          {queueCount > 0 && <span>{t('task.queueCount', { count: queueCount })}</span>}
        </div>
      </div>
      <div data-dsh-workbench-task-actions="true">
        {blank && !running && draft.trim() === '' && (
          <button
            type="button"
            data-interactive="true"
            data-dsh-workbench-action="scaffold"
            onClick={() => { inputActions.setDraft(t('task.scaffold')) }}
          >
            {t('task.insertScaffold')}
          </button>
        )}
        {!running && draft.trim() !== '' && (
          <button
            type="button"
            data-interactive="true"
            data-dsh-workbench-action="clear"
            onClick={() => { inputActions.setDraft('') }}
          >
            {t('task.clearDraft')}
          </button>
        )}
      </div>
    </section>
  )
}
