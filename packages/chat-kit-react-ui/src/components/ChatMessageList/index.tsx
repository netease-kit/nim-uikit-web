import React from 'react'
import classNames from 'classnames'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { ResendMsgOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { IMessage, IMMessageInfo } from '../../types'
import MessageListItem from '../ChatMessageItem'

export type IMessageCbProps = {
  onResend: (props: ResendMsgOptions) => void
  onReeditClick: (body: string) => void
  onMessageAction: (action: string, msg: IMMessageInfo) => void
}

export type MessageListProps = {
  prefix?: string
  commonPrefix?: string
  className?: string
  messages: IMessage[]
  selectedSession: NimKitCoreTypes.ISession
  account: string
  renderCustomMessage?: (
    options: { msg: IMessage } & IMessageCbProps
  ) => JSX.Element
} & IMessageCbProps

const ChatMessageList = React.forwardRef<HTMLDivElement, MessageListProps>(
  (
    {
      prefix = 'chat',
      commonPrefix = 'common',
      className,
      messages,
      account,
      onResend,
      onMessageAction,
      onReeditClick,
      renderCustomMessage,
    },
    ref
  ) => {
    const _prefix = `${prefix}-message-list`

    return (
      <div className={classNames(className, `${_prefix}-wrap`)} ref={ref}>
        {messages.map((msg: IMessage) => {
          if (renderCustomMessage) {
            return renderCustomMessage({
              msg,
              onResend,
              onReeditClick,
              onMessageAction,
            })
          }

          return (
            <MessageListItem
              key={msg.idClient}
              prefix={prefix}
              commonPrefix={commonPrefix}
              messageItem={msg}
              account={account}
              onResend={onResend}
              onMessageAction={onMessageAction}
              onReeditClick={onReeditClick}
            />
          )
        })}
      </div>
    )
  }
)

export default ChatMessageList
