import React, { FC } from 'react'
import { ComplexAvatarContainer } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'

export interface BlackItemProps extends NimKitCoreTypes.IBlackInfo {
  onItemClick?: (account: string) => void
  afterSendMsgClick?: () => void
  prefix?: string
  commonPrefix?: string
}

export const BlackItem: FC<BlackItemProps> = ({
  nick,
  account,
  onItemClick,
  afterSendMsgClick,
  prefix = 'contact',
  commonPrefix = 'common',
  ...props
}) => {
  const _prefix = `${prefix}-black-item`
  return (
    <div
      className={_prefix}
      onClick={(e) => {
        e.stopPropagation()
        onItemClick?.(account)
      }}
    >
      <ComplexAvatarContainer
        size={36}
        account={account}
        nick={nick}
        prefix={commonPrefix}
        afterSendMsgClick={afterSendMsgClick}
        {...props}
      />
      <span className={`${_prefix}-label`}>{nick || account || ''}</span>
    </div>
  )
}
