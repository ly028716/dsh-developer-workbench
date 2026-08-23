import type { LocaleDictOf } from '@deepseek-ai/dsh-client-ui-slots'

export const NS = 'developer-workbench' as const

export type DeveloperWorkbenchKey =
  | 'task.fixTests'
  | 'task.refactorModule'
  | 'task.explainCodebase'
  | 'task.unavailable'
  | 'active.running'
  | 'active.idle'
  | 'active.pending'
  | 'details.workspace'
  | 'details.plan'
  | 'tool.details'

export const en: LocaleDictOf<typeof NS> = {
  'task.fixTests': 'Fix failing tests',
  'task.refactorModule': 'Refactor a module',
  'task.explainCodebase': 'Explain the codebase',
  'task.unavailable': 'Choose a workspace before starting a task.',
  'active.running': 'Active task',
  'active.idle': 'Task context',
  'active.pending': '{count} queued',
  'details.workspace': 'Workspace',
  'details.plan': 'Plan',
  'tool.details': 'Open details',
}

export const zh: LocaleDictOf<typeof NS> = {
  'task.fixTests': '修复失败测试',
  'task.refactorModule': '重构一个模块',
  'task.explainCodebase': '解释代码库',
  'task.unavailable': '请先选择工作区再开始任务。',
  'active.running': '正在执行',
  'active.idle': '任务上下文',
  'active.pending': '待处理 {count} 条',
  'details.workspace': '工作区',
  'details.plan': '计划',
  'tool.details': '查看详情',
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'developer-workbench': DeveloperWorkbenchKey
  }
}
