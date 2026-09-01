import type { LocaleDictOf } from '@deepseek-ai/dsh-client-ui-slots'

export const NS = 'developer-workbench' as const

export type DeveloperWorkbenchKey =
  | 'task.flowEyebrow'
  | 'task.blankTitle'
  | 'task.activeTitle'
  | 'task.runningTitle'
  | 'task.blankDescription'
  | 'task.draftDescription'
  | 'task.insertScaffold'
  | 'task.clearDraft'
  | 'task.scaffold'
  | 'task.phase.plain'
  | 'task.phase.adjudicating'
  | 'task.phase.claimed'
  | 'task.phase.submitting'
  | 'task.contextCount'
  | 'task.queueCount'
  | 'active.running'
  | 'active.queued'
  | 'active.idle'
  | 'active.pending'

export const en: LocaleDictOf<typeof NS> = {
  'task.flowEyebrow': 'Developer task flow',
  'task.blankTitle': 'Ready for a task',
  'task.activeTitle': 'Continue the current task',
  'task.runningTitle': 'Task is running',
  'task.blankDescription': 'Describe the goal, then use @ to add code context.',
  'task.draftDescription': 'Current draft',
  'task.insertScaffold': 'Insert task scaffold',
  'task.clearDraft': 'Clear draft',
  'task.scaffold': 'Goal:\n\nContext:\n\nAcceptance criteria:',
  'task.phase.plain': 'Waiting for task',
  'task.phase.adjudicating': 'Preparing',
  'task.phase.claimed': 'Ready to submit',
  'task.phase.submitting': 'Submitting',
  'task.contextCount': '{count} context',
  'task.queueCount': '{count} queued',
  'active.running': 'Running',
  'active.queued': 'Queued',
  'active.idle': 'Idle',
  'active.pending': '{count} pending',
}

export const zh: LocaleDictOf<typeof NS> = {
  'task.flowEyebrow': '开发者任务流',
  'task.blankTitle': '准备开始任务',
  'task.activeTitle': '继续当前任务',
  'task.runningTitle': '任务正在执行',
  'task.blankDescription': '描述目标，并使用 @ 添加代码上下文。',
  'task.draftDescription': '当前草稿',
  'task.insertScaffold': '插入任务骨架',
  'task.clearDraft': '清空草稿',
  'task.scaffold': '目标：\n\n上下文：\n\n验收标准：',
  'task.phase.plain': '等待任务',
  'task.phase.adjudicating': '准备中',
  'task.phase.claimed': '待提交',
  'task.phase.submitting': '提交中',
  'task.contextCount': '上下文 {count}',
  'task.queueCount': '排队 {count}',
  'active.running': '执行中',
  'active.queued': '排队中',
  'active.idle': '空闲',
  'active.pending': '待处理 {count} 条',
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'developer-workbench': DeveloperWorkbenchKey
  }
}
