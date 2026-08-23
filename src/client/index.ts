/** Browser entry for the optional Developer Workbench presentation plugin. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { FrameOwnerProps } from '@deepseek-ai/dsh-client-ui-layout/client'
import { WorkbenchFrame } from './WorkbenchFrame.tsx'

export const inject = ['slots', 'locale', 'layout', 'sessions', 'workspaces'] as const

/**
 * Register the optional workbench frame for the lifetime of the plugin fiber.
 * @param ctx - client root context with the host slot registry.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.slots.inject('shell.frame', () => ctx.slots.register({
    name: 'shell.frame',
    priority: -100,
    select: (_owner: FrameOwnerProps) => true,
  }, WorkbenchFrame)), 'dsh-developer-workbench: shell.frame')
}
