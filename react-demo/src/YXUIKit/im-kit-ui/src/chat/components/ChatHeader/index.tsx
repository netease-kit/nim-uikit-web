import React from 'react'

export interface ChatHeaderProps {
  avatar: React.ReactNode
  title: string
  subTitle?: string

  prefix?: string
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  avatar,
  title,
  subTitle = '',

  prefix = 'chat',
}) => {
  const _prefix = `${prefix}-header`

  return (
    <div className={`${_prefix}-wrap`}>
      <div className={`${_prefix}-avatar`}>{avatar}</div>
      <div className={`${_prefix}-title`}>{title}</div>
      {subTitle ? (
        <div className={`${_prefix}-sub-title`}>{subTitle}</div>
      ) : null}
    </div>
  )
}

export default ChatHeader
