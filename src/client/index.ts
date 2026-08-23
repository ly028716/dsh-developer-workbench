/** Browser entry for the optional Developer Workbench presentation plugin. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { FrameOwnerProps } from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-tool/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { ActiveTask } from './ActiveTask.tsx'
import { WorkbenchFrame } from './WorkbenchFrame.tsx'
import { DetailsContext } from './DetailsContext.tsx'
import { en, NS, zh } from './locales.ts'
import { TaskLauncher } from './TaskLauncher.tsx'
import { WorkbenchToolPresentation } from './WorkbenchToolPresentation.tsx'

export const inject = ['slots', 'locale', 'layout', 'sessions', 'workspaces'] as const

/**
 * Register the optional workbench frame for the lifetime of the plugin fiber.
 * @param ctx - client root context with the host slot registry.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'dsh-developer-workbench: dictionaries')
  ctx.effect(() => ctx.slots.inject('shell.frame', () => ctx.slots.register({
    name: 'shell.frame',
    priority: -100,
    select: (_owner: FrameOwnerProps) => true,
  }, WorkbenchFrame)), 'dsh-developer-workbench: shell.frame')
  ctx.effect(() => {
    const disposers = [
      ctx.slots.inject('conversation.hero.taskLauncher', () => ctx.slots.register({
        name: 'conversation.hero.taskLauncher', priority: -100, locale: NS,
      }, TaskLauncher)),
      ctx.slots.inject('conversation.active.task', () => ctx.slots.register({
        name: 'conversation.active.task', priority: -100, locale: NS,
      }, ActiveTask)),
      ctx.slots.inject('conversation.details.context', () => ctx.slots.register({
        name: 'conversation.details.context', priority: -100, locale: NS,
      }, DetailsContext)),
      ctx.slots.inject('tool.call.presentation', () => ctx.slots.register({
        name: 'tool.call.presentation', priority: -100, select: () => true,
      }, WorkbenchToolPresentation)),
    ]
    return () => { for (const dispose of disposers) dispose() }
  }, 'dsh-developer-workbench: child presentation')
}
