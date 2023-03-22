import React, { forwardRef } from 'react'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import MessageListItem, { MessageItemProps } from '../ChatMessageItem'
import { Alert, Spin } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { useTranslation, ReadPercent } from '../../../common'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { storeUtils } from '@xkit-yx/im-store'

export interface RenderP2pCustomMessageOptions
  extends Omit<MessageItemProps, 'myAccount'> {
  member: NimKitCoreTypes.IFriendInfo
}

export interface ChatP2pMessageListProps
  extends Omit<MessageItemProps, 'msg' | 'alias'> {
  msgs: IMMessage[]
  member: NimKitCoreTypes.IFriendInfo
  p2pMsgReceiptVisible?: boolean
  renderP2pCustomMessage?: (
    options: RenderP2pCustomMessageOptions
  ) => JSX.Element | null | undefined
  loadingMore: boolean
  noMore: boolean
  receiveMsgBtnVisible?: boolean
  strangerNotiVisible?: boolean
  strangerNotiText?: string
  msgReceiptTime?: number
  onReceiveMsgBtnClick?: () => void
  onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void
}

const ChatP2pMessageList = forwardRef<HTMLDivElement, ChatP2pMessageListProps>(
  (
    {
      prefix = 'chat',
      commonPrefix = 'common',
      msgs,
      member,
      p2pMsgReceiptVisible,
      receiveMsgBtnVisible = false,
      strangerNotiVisible = false,
      strangerNotiText = '',
      msgReceiptTime = 0,
      onReceiveMsgBtnClick,
      loadingMore,
      noMore,
      myAccount,
      onResend,
      onMessageAction,
      onReeditClick,
      onScroll,
      renderP2pCustomMessage,
      renderMessageAvatar,
      renderMessageName,
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
            const msgItem = renderP2pCustomMessage?.({
              msg,
              msgs,
              member,
              onResend,
              onReeditClick,
              onMessageAction,
            }) ?? (
              <MessageListItem
                key={msg.idClient}
                prefix={prefix}
                commonPrefix={commonPrefix}
                msgs={renderMsgs}
                msg={msg}
                normalStatusRenderer={
                  p2pMsgReceiptVisible ? (
                    <ReadPercent
                      unread={msg.time <= msgReceiptTime ? 0 : 1}
                      read={msg.time <= msgReceiptTime ? 1 : 0}
                      prefix={commonPrefix}
                    />
                  ) : null
                }
                myAccount={myAccount}
                onResend={onResend}
                onMessageAction={onMessageAction}
                onReeditClick={onReeditClick}
                renderMessageAvatar={renderMessageAvatar}
                renderMessageName={renderMessageName}
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

export default ChatP2pMessageList
