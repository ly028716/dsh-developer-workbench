/** Browser entry for the optional Developer Workbench presentation plugin. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: pulls the input-dock / input-right SlotMap keys and the
// conversation session-standard seats (useInput, inputActions) into the type
// program; the host injects them at render time.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the session-standard `useSession` seat consumed by the
// dock components into the type program.
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
// Type-only: pulls the public `slots` and `locale` services into the Cordis
// client context contract.
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import './workbench.css'
import { ActiveTaskIndicator } from './ActiveTaskIndicator.tsx'
import { TaskLauncherDock } from './TaskLauncherDock.tsx'
import { en, NS, zh } from './locales.ts'

export const inject = ['slots', 'locale'] as const

/**
 * Register the workbench's additive dock contributions for the lifetime of
 * the plugin fiber. Each contribution sits in an existing host list slot
 * (`conversation.input.dock` / `conversation.input.right`) beside the shipped
 * entries — nothing here replaces the host frame or its declared seats.
 * @param ctx - client root context with the host slot registry.
 */
export function apply(ctx: ClientContext): void {
  // Register locale dictionaries
  ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'dsh-developer-workbench: dictionaries')

  // Child presentations: task focus console + active-task indicator.
  ctx.effect(() => {
    const disposers = [
      // Task focus console in the input dock (above composer)
      ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
        name: 'conversation.input.dock',
        id: 'workbench',
        order: 10,
        locale: NS,
      }, TaskLauncherDock)),

      // Active task indicator in the input right area
      ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
        name: 'conversation.input.right',
        id: 'workbench',
        order: 0,
        locale: NS,
      }, ActiveTaskIndicator)),
    ]
    return () => { for (const dispose of disposers) dispose() }
  }, 'dsh-developer-workbench: dock presentations')
}
