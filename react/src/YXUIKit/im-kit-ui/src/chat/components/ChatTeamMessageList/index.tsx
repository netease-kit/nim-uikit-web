import React, { forwardRef } from 'react'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { TeamMember } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import MessageListItem, { MessageItemProps } from '../ChatMessageItem'
import { Alert, Spin } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { ReadPercent, useStateContext, useTranslation } from '../../../common'
import { storeUtils } from '@xkit-yx/im-store'
import { MsgOperMenuItem } from '../../Container'

export interface RenderTeamCustomMessageOptions
  extends Omit<MessageItemProps, 'myAccount'> {
  members: TeamMember[]
}

export interface ChatTeamMessageListProps
  extends Omit<MessageItemProps, 'msg' | 'alias'> {
  msgs: IMMessage[]
  msgOperMenu?: MsgOperMenuItem[]
  replyMsgsMap: Record<string, IMMessage>
  members: TeamMember[]
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
      msgOperMenu,
      replyMsgsMap,
      members,
      receiveMsgBtnVisible = false,
      strangerNotiVisible = false,
      strangerNotiText = '',
      onReceiveMsgBtnClick,
      loadingMore,
      noMore,
      myAccount,
      onResend,
      onSendImg,
      onSendVideo,
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
              replyMsg: replyMsgsMap[msg.idClient],
              members,
              onResend,
              onSendImg,
              onSendVideo,
              onReeditClick,
              onMessageAction,
            }) ?? (
              <MessageListItem
                key={msg.idClient}
                prefix={prefix}
                commonPrefix={commonPrefix}
                msg={msg}
                msgOperMenu={msgOperMenu}
                replyMsg={replyMsgsMap[msg.idClient]}
                normalStatusRenderer={
                  localOptions.teamMsgReceiptVisible ? (
                    <ReadPercent
                      unread={msg.attach?.yxUnread ?? members.length - 1}
                      read={msg.attach?.yxRead ?? 0}
                      hoverable
                      prefix={commonPrefix}
                    />
                  ) : null
                }
                myAccount={myAccount}
                onResend={onResend}
                onSendImg={onSendImg}
                onSendVideo={onSendVideo}
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
