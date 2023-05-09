import React, { forwardRef } from 'react'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import MessageListItem, { MessageItemProps } from '../ChatMessageItem'
import { Alert, Spin } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { ReadPercent, useTranslation } from '../../../common'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { storeUtils } from '@xkit-yx/im-store'

export interface RenderTeamCustomMessageOptions
  extends Omit<MessageItemProps, 'myAccount'> {
  members: (TeamMember & Partial<FriendProfile>)[]
}

export interface ChatTeamMessageListProps
  extends Omit<MessageItemProps, 'msg' | 'alias'> {
  msgs: IMMessage[]
  replyMsgsMap: Record<string, IMMessage>
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
      replyMsgsMap,
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
      onMessageAvatarAction,
      onReeditClick,
      onScroll,
      renderTeamCustomMessage,
      renderMessageAvatar,
      renderMessageName,
      renderMessageInnerContent,
      renderMessageOuterContent,
    },
    ref
  ) => {
    const _prefix = `${prefix}-message-list`

    const { t } = useTranslation()

    const renderMsgs = storeUtils.getFilterMsgs(msgs)

    return (
      <div className={_prefix} ref={ref} onScroll={onScroll}>
        <div className={`${_prefix}-tip`}>
          {noMore ? t('noMoreText') : loadingMore ? <Spin /> : null}
        </div>
        <div className={`${_prefix}-content`}>
          {renderMsgs.map((msg) => {
            const msgItem = renderTeamCustomMessage?.({
              msg,
              replyMsg: replyMsgsMap[msg.idClient],
              members,
              onResend,
              onReeditClick,
              onMessageAction,
            }) ?? (
              <MessageListItem
                key={msg.idClient}
                prefix={prefix}
                commonPrefix={commonPrefix}
                msg={msg}
                replyMsg={replyMsgsMap[msg.idClient]}
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
                onMessageAvatarAction={onMessageAvatarAction}
                onReeditClick={onReeditClick}
                renderMessageAvatar={renderMessageAvatar}
                renderMessageName={renderMessageName}
                renderMessageInnerContent={renderMessageInnerContent}
                renderMessageOuterContent={renderMessageOuterContent}
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
