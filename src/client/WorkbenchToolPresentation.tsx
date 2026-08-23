import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ToolPresentationOwnerProps } from '@deepseek-ai/dsh-client-ui-tool/client'

type WorkbenchToolPresentationProps = PropsRuntime<'tool.call.presentation'>

/** Workbench wrapper around the host-selected tool renderer. */
export function WorkbenchToolPresentation({ toolName, renderContent }: WorkbenchToolPresentationProps) {
  return (
    <section data-dsh-workbench-tool={toolName}>
      {renderContent()}
    </section>
  )
}

export type { ToolPresentationOwnerProps }
