import type { LocaleDictOf } from '@deepseek-ai/dsh-client-ui-slots'

export const NS = 'developer-workbench' as const

export type DeveloperWorkbenchKey =
  | 'task.fixTests'
  | 'task.refactorModule'
  | 'task.explainCodebase'
  | 'task.launcherEyebrow'
  | 'task.launcherTitle'
  | 'task.launcherDescription'
  | 'active.running'
  | 'active.idle'
  | 'active.pending'

export const en: LocaleDictOf<typeof NS> = {
  'task.fixTests': 'Fix failing tests',
  'task.refactorModule': 'Refactor a module',
  'task.explainCodebase': 'Explain the codebase',
  'task.launcherEyebrow': 'Start from a focused prompt',
  'task.launcherTitle': 'What should we work on?',
  'task.launcherDescription': 'Choose a starter to begin.',
  'active.running': 'Running',
  'active.idle': 'Idle',
  'active.pending': '{count} pending',
}

export const zh: LocaleDictOf<typeof NS> = {
  'task.fixTests': '修复失败测试',
  'task.refactorModule': '重构模块',
  'task.explainCodebase': '解释代码库',
  'task.launcherEyebrow': '从明确的任务开始',
  'task.launcherTitle': '现在要处理什么？',
  'task.launcherDescription': '选择一个起始任务开始。',
  'active.running': '正在执行',
  'active.idle': '空闲',
  'active.pending': '待处理 {count} 条',
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'developer-workbench': DeveloperWorkbenchKey
  }
}
