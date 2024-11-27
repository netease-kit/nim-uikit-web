import React, { forwardRef } from 'react'
import MessageListItem, { MessageItemProps } from '../ChatMessageItem'
import { Alert, Spin } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { ReadPercent, useStateContext, useTranslation } from '../../../common'
import { storeUtils } from '@xkit-yx/im-store-v2'
import { MsgOperMenuItem } from '../../Container'
import { V2NIMTeamMember } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'

export interface RenderTeamCustomMessageOptions extends MessageItemProps {
  members: V2NIMTeamMember[]
}

export interface ChatTeamMessageListProps
  extends Omit<MessageItemProps, 'msg' | 'alias'> {
  msgs: V2NIMMessageForUI[]
  msgOperMenu?: MsgOperMenuItem[]
  replyMsgsMap: Record<string, V2NIMMessageForUI>
  members: V2NIMTeamMember[]
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
>(function ChatTeamMessageListContent(
  {
    prefix = 'chat',
    commonPrefix = 'common',
    msgs,
    topMessage,
    msgOperMenu,
    replyMsgsMap,
    members,
    receiveMsgBtnVisible = false,
    strangerNotiVisible = false,
    strangerNotiText = '',
    onReceiveMsgBtnClick,
    loadingMore,
    noMore,
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
              msgOperMenu={msgOperMenu}
              replyMsg={replyMsgsMap[msg.messageClientId]}
              normalStatusRenderer={
                localOptions.teamMsgReceiptVisible ? (
                  <ReadPercent
                    unread={msg.yxUnread ?? members.length - 1}
                    read={msg.yxRead ?? 0}
                    hoverable
                    prefix={commonPrefix}
                    size={16}
                  />
                ) : null
              }
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
