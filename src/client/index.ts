/** Browser entry for the optional Developer Workbench presentation plugin. */
import type { Context } from '@deepseek-ai/cordis'

export const inject = ['slots'] as const

/**
 * Register browser presentation contributions for the optional workbench.
 * @param _ctx - client root context; Task 4 adds the `shell.frame` effect here.
 */
export function apply(_ctx: Context): void {}
