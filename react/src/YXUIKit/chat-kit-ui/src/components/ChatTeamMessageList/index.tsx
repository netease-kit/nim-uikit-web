import React, { forwardRef } from 'react'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import MessageListItem, { MessageItemProps } from '../ChatMessageItem'
import { Alert, Spin } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { ReadPercent, useTranslation } from '../../../../common-ui/src'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'

export interface RenderTeamCustomMessageOptions
  extends Omit<MessageItemProps, 'myAccount'> {
  members: (TeamMember & Partial<FriendProfile>)[]
}

export interface ChatTeamMessageListProps
  extends Omit<MessageItemProps, 'msg' | 'alias'> {
  msgs: IMMessage[]
  teamId: string
  members: (TeamMember & Partial<FriendProfile>)[]
  teamMsgReceiptVisible?: boolean
  renderTeamCustomMessage?: (
    options: RenderTeamCustomMessageOptions
  ) => JSX.Element | null | undefined
  loadingMore: boolean
  noMore: boolean
  receiveMsgBtnVisible?: boolean
  strangerNotiVisible?: boolean
  strangerNotiText?: string
  onReceiveMsgBtnClick?: () => void
  onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void
}

const ChatTeamMessageList = forwardRef<
  HTMLDivElement,
  ChatTeamMessageListProps
>(
  (
    {
      prefix = 'chat',
      commonPrefix = 'common',
      msgs,
      teamId,
      members,
      teamMsgReceiptVisible,
      receiveMsgBtnVisible = false,
      strangerNotiVisible = false,
      strangerNotiText = '',
      onReceiveMsgBtnClick,
      loadingMore,
      noMore,
      myAccount,
      onResend,
      onMessageAction,
      onReeditClick,
      onScroll,
      renderTeamCustomMessage,
    },
    ref
  ) => {
    const _prefix = `${prefix}-message-list`

    const { t } = useTranslation()

    return (
      <div className={_prefix} ref={ref} onScroll={onScroll}>
        <div className={`${_prefix}-tip`}>
          {noMore ? t('noMoreText') : loadingMore ? <Spin /> : null}
        </div>
        <div className={`${_prefix}-content`}>
          {msgs.map((msg) => {
            const msgItem = renderTeamCustomMessage?.({
              msg,
              msgs,
              members,
              teamId,
              onResend,
              onReeditClick,
              onMessageAction,
            }) ?? (
              <MessageListItem
                key={msg.idClient}
                prefix={prefix}
                commonPrefix={commonPrefix}
                msg={msg}
                msgs={msgs}
                teamId={teamId}
                normalStatusRenderer={
                  teamMsgReceiptVisible ? (
                    <ReadPercent
                      unread={msg.attach?.yxUnread || 0}
                      read={msg.attach?.yxRead || 0}
                      hoverable
                      prefix={commonPrefix}
                    />
                  ) : null
                }
                myAccount={myAccount}
                onResend={onResend}
                onMessageAction={onMessageAction}
                onReeditClick={onReeditClick}
              />
            )
            return (
              <div id={msg.idClient} key={msg.idClient}>
                {msgItem}
              </div>
            )
          })}
        </div>
        {receiveMsgBtnVisible ? (
          <div className={`${_prefix}-tobottom`} onClick={onReceiveMsgBtnClick}>
            <span>{t('receiveText')}</span>
            <ArrowDownOutlined />
          </div>
        ) : null}
        {strangerNotiVisible ? (
          <Alert
            className={`${_prefix}-stranger-noti`}
            banner
            closable
            message={strangerNotiText}
          />
        ) : null}
      </div>
    )
  }
)

export default ChatTeamMessageList
