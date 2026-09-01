import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'

/**
 * Props of a `conversation.input.dock` occupant: the host injects the
 * session-standard hooks and actions (no `session` object — session facts
 * arrive through `useSession` selectors).
 */
type TaskLauncherDockProps = PropsRuntime<'conversation.input.dock'> & PropsLocale<typeof NS>

const STARTERS = [
  ['task.fixTests', '修复当前工作区中的失败测试，并说明根因。'],
  ['task.refactorModule', '重构当前工作区中的一个模块，并保持现有行为。'],
  ['task.explainCodebase', '解释当前工作区的主要模块、入口和依赖关系。'],
] as const

/** Workbench task starter strip rendered in the input dock area. */
export function TaskLauncherDock({ useSession, inputActions, t }: TaskLauncherDockProps) {
  // Only show on blank sessions (no durable turn yet) and not running.
  const blank = useSession(s => s.blank)
  const running = useSession(s => s.running)
  if (!blank || running) {
    return null
  }

  return (
    <section
      data-dsh-developer-workbench="true"
      data-dsh-workbench-task-launcher="true"
      aria-labelledby="dsh-workbench-task-launcher-title"
    >
      <div data-dsh-workbench-task-launcher-copy="true">
        <span data-dsh-workbench-eyebrow="true">{t('task.launcherEyebrow')}</span>
        <h2 id="dsh-workbench-task-launcher-title">{t('task.launcherTitle')}</h2>
        <p>{t('task.launcherDescription')}</p>
      </div>
      <div role="list" aria-label={t('task.launcherTitle')}>
        {STARTERS.map(([label, prompt]) => (
          <button
            key={label}
            type="button"
            data-interactive="true"
            data-dsh-workbench-starter="true"
            onClick={() => {
              // Insert the prompt into the draft using the input actions
              inputActions.setDraft(prompt)
            }}
          >
            {t(label as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>
    </section>
  )
}
