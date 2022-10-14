import React, { forwardRef } from 'react'
import { IMMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import MessageListItem, { MessageItemProps } from '../ChatMessageItem'
import { Alert, Spin } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { useTranslation } from '@xkit-yx/common-ui'

export interface RenderCustomMessageOptions
  extends Omit<MessageItemProps, 'msg' | 'myAccount'> {
  msg: IMMessage
}

export interface MessageListProps extends Omit<MessageItemProps, 'msg'> {
  msgs: IMMessage[]
  renderCustomMessage?: (
    options: RenderCustomMessageOptions
  ) => JSX.Element | false | void | null
  loadingMore: boolean
  noMore: boolean
  receiveMsgBtnVisible?: boolean
  strangerNotiVisible?: boolean
  strangerNotiText?: string
  onReceiveMsgBtnClick?: () => void
  onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void
}

const ChatMessageList = forwardRef<HTMLDivElement, MessageListProps>(
  (
    {
      prefix = 'chat',
      commonPrefix = 'common',
      msgs,
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
      renderCustomMessage,
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
            const defaultRenderer = (
              <MessageListItem
                key={msg.idClient}
                prefix={prefix}
                commonPrefix={commonPrefix}
                msg={msg}
                myAccount={myAccount}
                onResend={onResend}
                onMessageAction={onMessageAction}
                onReeditClick={onReeditClick}
              />
            )

            if (renderCustomMessage) {
              const renderRes = renderCustomMessage({
                msg,
                onResend,
                onReeditClick,
                onMessageAction,
              })
              if (renderRes === void 0 || renderRes === false) {
                return defaultRenderer
              }
              return renderRes
            }
            return defaultRenderer
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

export default ChatMessageList
