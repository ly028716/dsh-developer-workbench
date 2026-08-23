import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TaskLauncherOwnerProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { NS } from './locales.ts'

type TaskLauncherProps = PropsRuntime<'conversation.hero.taskLauncher'> & PropsLocale<typeof NS>
type Translate = TranslateNS<typeof NS>

const STARTERS = [
  ['task.fixTests', '修复当前工作区中的失败测试，并说明根因。'],
  ['task.refactorModule', '重构当前工作区中的一个模块，并保持现有行为。'],
  ['task.explainCodebase', '解释当前工作区的主要模块、入口和依赖关系。'],
] as const

/** Workbench task starter strip; writes through the host input action. */
export function TaskLauncher({ starterAction, t }: TaskLauncherProps) {
  const disabled = !starterAction.available
  const hintId = 'dsh-workbench-task-launcher-hint'
  return (
    <section data-dsh-workbench-task-launcher="true" aria-label={t('task.fixTests')}>
      <div>
        {STARTERS.map(([label, prompt]) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            aria-describedby={disabled ? hintId : undefined}
            data-interactive="true"
            onClick={() => { if (starterAction.available) starterAction.select(prompt) }}
          >
            {t(label as Parameters<Translate>[0])}
          </button>
        ))}
      </div>
      {disabled && <p id={hintId}>{starterAction.reason}</p>}
    </section>
  )
}

export type { TaskLauncherOwnerProps }
