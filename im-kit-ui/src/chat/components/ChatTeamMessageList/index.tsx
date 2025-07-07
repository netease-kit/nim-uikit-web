import React, { forwardRef } from 'react'
import MessageListItem, { MessageItemProps } from '../ChatMessageItem'
import { Alert, Spin } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { ReadPercent, useStateContext, useTranslation } from '../../../common'
import { storeUtils } from '@xkit-yx/im-store-v2'
import { MsgOperMenuItem } from '../../Container'
import { V2NIMTeamMember } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMMessage } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService'
import { V2NIMUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService'

export interface RenderTeamCustomMessageOptions extends MessageItemProps {
  members: V2NIMTeamMember[]
}

export interface ChatTeamMessageListProps
  extends Omit<MessageItemProps, 'msg' | 'alias'> {
  msgs: V2NIMMessageForUI[]
  msgOperMenu?: MsgOperMenuItem[]
  replyMsgsMap: Record<string, V2NIMMessageForUI>
  members: V2NIMTeamMember[]
  onMessageItemAvatarClick?: (user: V2NIMUser) => void
  renderTeamCustomMessage?: (
    options: RenderTeamCustomMessageOptions
  ) => JSX.Element | null | undefined
  loadingMore: boolean
  noMore: boolean
  receiveMsgBtnVisible?: boolean
  strangerNotiVisible?: boolean
  strangerNotiText?: string
  myAccountId?: string
  stopAIStreamMessage?: (msg: V2NIMMessage) => void
  regenAIMessage?: (msg: V2NIMMessage) => void
  onReceiveMsgBtnClick?: () => void
  onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void
}

const ChatTeamMessageList = forwardRef<
  HTMLDivElement,
  ChatTeamMessageListProps
>(function ChatTeamMessageListContent(
  {
    prefix = 'chat',
    commonPrefix = 'common',
    msgs,
    topMessage,
    msgOperMenu,
    myAccountId,
    replyMsgsMap,
    members,
    receiveMsgBtnVisible = false,
    strangerNotiVisible = false,
    strangerNotiText = '',
    onReceiveMsgBtnClick,
    loadingMore,
    noMore,
    stopAIStreamMessage,
    regenAIMessage,
    onMessageItemAvatarClick,
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
) {
  const _prefix = `${prefix}-message-list`

  const { t } = useTranslation()

  const { localOptions } = useStateContext()

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
            replyMsg: replyMsgsMap[msg.messageClientId],
            topMessage,
            members,
            onResend,
            onReeditClick,
            onMessageAction,
          }) ?? (
            <MessageListItem
              key={msg.messageClientId}
              topMessage={topMessage}
              prefix={prefix}
              commonPrefix={commonPrefix}
              msg={msg}
              myAccountId={myAccountId}
              msgOperMenu={msgOperMenu}
              replyMsg={replyMsgsMap[msg.messageClientId]}
              normalStatusRenderer={
                localOptions.teamMsgReceiptVisible ? (
                  <ReadPercent
                    unread={msg.yxUnread ?? members.length - 1}
                    read={msg.yxRead ?? 0}
                    hoverable
                    prefix={commonPrefix}
                    size={14}
                    message={msg.isSelf ? msg : undefined}
                  />
                ) : null
              }
              stopAIStreamMessage={stopAIStreamMessage}
              regenAIMessage={regenAIMessage}
              onMessageItemAvatarClick={onMessageItemAvatarClick}
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
            <div id={msg.messageClientId} key={msg.messageClientId}>
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
})

export default ChatTeamMessageList
