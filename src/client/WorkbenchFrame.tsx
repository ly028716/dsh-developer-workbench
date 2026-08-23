import type { ReactNode } from 'react'
import type { FrameOwnerProps } from '@deepseek-ai/dsh-client-ui-layout/client'
import css from './WorkbenchFrame.module.css'
import './workbench.css'

const SIDEBAR_WIDTH = 280

/**
 * Workbench-owned outer frame. Host-owned regions remain rendered through the
 * callbacks supplied by the public frame owner contract.
 * @param owner - host region callbacks supplied by the shell frame chain.
 * @returns the marked workbench frame.
 */
export function WorkbenchFrame(owner: FrameOwnerProps): ReactNode {
  return (
    <div className={css.frame} data-dsh-developer-workbench="true">
      <aside className={css.sidebar}>
        {owner.renderSidebar({ collapsed: false, width: SIDEBAR_WIDTH })}
      </aside>
      <main className={css.conversation}>{owner.renderConversation({})}</main>
      <aside className={css.details}>{owner.renderDetails({})}</aside>
      <div className={css.overlay}>{owner.renderOverlay({})}</div>
    </div>
  )
}
