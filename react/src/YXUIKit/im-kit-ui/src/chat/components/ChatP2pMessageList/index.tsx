import React, { forwardRef } from 'react'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import MessageListItem, { MessageItemProps } from '../ChatMessageItem'
import { Alert, Spin } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { useTranslation, ReadPercent, useStateContext } from '../../../common'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { storeUtils } from '@xkit-yx/im-store'
import { MsgOperMenuItem } from '../../Container'
import { observer } from 'mobx-react'

export interface RenderP2pCustomMessageOptions
  extends Omit<MessageItemProps, 'myAccount'> {
  member: NimKitCoreTypes.IFriendInfo
}

export interface ChatP2pMessageListProps
  extends Omit<MessageItemProps, 'msg' | 'alias'> {
  msgs: IMMessage[]
  replyMsgsMap: Record<string, IMMessage>
  member: NimKitCoreTypes.IFriendInfo
  renderP2pCustomMessage?: (
    options: RenderP2pCustomMessageOptions
  ) => JSX.Element | null | undefined
  loadingMore: boolean
  noMore: boolean
  receiveMsgBtnVisible?: boolean
  msgOperMenu?: MsgOperMenuItem[]
  msgReceiptTime?: number
  onReceiveMsgBtnClick?: () => void
  onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void
}

const ChatP2pMessageList = observer(
  forwardRef<HTMLDivElement, ChatP2pMessageListProps>(
    (
      {
        prefix = 'chat',
        commonPrefix = 'common',
        msgs,
        replyMsgsMap,
        member,
        receiveMsgBtnVisible = false,
        msgReceiptTime = 0,
        msgOperMenu,
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
        renderMessageOuterContent,
        renderMessageInnerContent,
      },
      ref
    ) => {
      const _prefix = `${prefix}-message-list`

      const { t } = useTranslation()

      const { store, localOptions } = useStateContext()

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
                replyMsg: replyMsgsMap[msg.idClient],
                member,
                onResend,
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
                    localOptions.p2pMsgReceiptVisible ? (
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
            <div
              className={`${_prefix}-tobottom`}
              onClick={onReceiveMsgBtnClick}
            >
              <span>{t('receiveText')}</span>
              <ArrowDownOutlined />
            </div>
          ) : null}
          {store.uiStore.getRelation(member.account).relation === 'stranger' ? (
            <Alert
              className={`${_prefix}-stranger-noti`}
              banner
              closable
              message={`${store.uiStore.getAppellation({
                account: member.account,
              })} ${t('strangerNotiText')}`}
            />
          ) : null}
        </div>
      )
    }
  )
)

export default ChatP2pMessageList
