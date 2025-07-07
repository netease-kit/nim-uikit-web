import React, { forwardRef } from 'react'
import MessageListItem, { MessageItemProps } from '../ChatMessageItem'
import { Alert, Spin } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { useTranslation, ReadPercent, useStateContext } from '../../../common'
import { storeUtils } from '@xkit-yx/im-store-v2'
import { MsgOperMenuItem } from '../../Container'
import { observer } from 'mobx-react'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMMessage } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService'
import { V2NIMUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService'

export interface RenderP2pCustomMessageOptions extends MessageItemProps {
  receiverId: string
}

export interface ChatP2pMessageListProps
  extends Omit<MessageItemProps, 'msg' | 'alias'> {
  msgs: V2NIMMessageForUI[]
  replyMsgsMap: Record<string, V2NIMMessageForUI>
  receiverId: string
  renderP2pCustomMessage?: (
    options: RenderP2pCustomMessageOptions
  ) => JSX.Element | null | undefined
  loadingMore: boolean
  noMore: boolean
  receiveMsgBtnVisible?: boolean
  msgOperMenu?: MsgOperMenuItem[]
  msgReceiptTime?: number
  myAccountId?: string
  onMessageItemAvatarClick?: (user: V2NIMUser) => void

  onReceiveMsgBtnClick?: () => void
  stopAIStreamMessage?: (msg: V2NIMMessage) => void
  regenAIMessage?: (msg: V2NIMMessage) => void
  onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void
  /**
    是否展示陌生人提示
  */
  strangerTipVisible?: boolean
}

const ChatP2pMessageList = observer(
  forwardRef<HTMLDivElement, ChatP2pMessageListProps>(
    function ChatP2pMessageListContent(
      {
        prefix = 'chat',
        commonPrefix = 'common',
        msgs,
        replyMsgsMap,
        receiverId,
        receiveMsgBtnVisible = false,
        msgReceiptTime = 0,
        msgOperMenu,
        myAccountId,
        onMessageItemAvatarClick,
        onReceiveMsgBtnClick,
        loadingMore,
        noMore,
        strangerTipVisible = true,
        stopAIStreamMessage,
        regenAIMessage,
        onResend,
        onMessageAction,
        onReeditClick,
        onScroll,
        renderP2pCustomMessage,
        renderMessageAvatar,
        renderMessageName,
        renderMessageOuterContent,
        renderMessageInnerContent,
      },
      ref
    ) {
      const _prefix = `${prefix}-message-list`

      const { t } = useTranslation()

      const { store, localOptions } = useStateContext()

      const { relation } = store.uiStore.getRelation(receiverId)

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
                replyMsg: replyMsgsMap[msg.messageClientId],
                receiverId,
                onResend,
                onReeditClick,
                onMessageAction,
              }) ?? (
                <MessageListItem
                  key={msg.messageClientId}
                  prefix={prefix}
                  commonPrefix={commonPrefix}
                  myAccountId={myAccountId}
                  msg={msg}
                  msgOperMenu={msgOperMenu}
                  replyMsg={replyMsgsMap[msg.messageClientId]}
                  normalStatusRenderer={
                    localOptions.p2pMsgReceiptVisible ? (
                      <ReadPercent
                        unread={msg.createTime <= msgReceiptTime ? 0 : 1}
                        read={msg.createTime <= msgReceiptTime ? 1 : 0}
                        prefix={commonPrefix}
                        size={14}
                      />
                    ) : null
                  }
                  onMessageItemAvatarClick={onMessageItemAvatarClick}
                  onResend={onResend}
                  onMessageAction={onMessageAction}
                  onReeditClick={onReeditClick}
                  stopAIStreamMessage={stopAIStreamMessage}
                  regenAIMessage={regenAIMessage}
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
            <div
              className={`${_prefix}-tobottom`}
              onClick={onReceiveMsgBtnClick}
            >
              <span>{t('receiveText')}</span>
              <ArrowDownOutlined />
            </div>
          ) : null}
          {relation === 'stranger' && strangerTipVisible ? (
            <Alert
              className={`${_prefix}-stranger-noti`}
              banner
              closable
              message={`${store.uiStore.getAppellation({
                account: receiverId,
              })} ${t('strangerNotiText')}`}
            />
          ) : null}
        </div>
      )
    }
  )
)

export default ChatP2pMessageList
