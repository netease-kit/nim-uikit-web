import React from 'react'
import classNames from 'classnames'
import { CrudeAvatar } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'

export interface ChatHeaderProps {
  prefix?: string
  title: string
  subTitle?: string
  selectedSession: NimKitCoreTypes.ISession
  className?: string
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  prefix = 'chat',
  title,
  subTitle,
  className,
  selectedSession,
}) => {
  const _prefix = `${prefix}-header`

  return (
    <div className={classNames(className, `${_prefix}-wrap`)}>
      <div className={`${_prefix}-avatar`}>
        <CrudeAvatar
          size={36}
          avatar={selectedSession.avatar}
          key={selectedSession.id}
          nick={title}
          account={title}
        />
      </div>
      <div className={`${_prefix}-title`}>{title}</div>
      <div className={`${_prefix}-sub-title`}>{subTitle}</div>
    </div>
  )
}

export default ChatHeader
