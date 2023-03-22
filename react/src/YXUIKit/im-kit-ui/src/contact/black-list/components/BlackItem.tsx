import React, { FC } from 'react'
import { ComplexAvatarContainer } from '../../../common'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'

export interface BlackItemProps extends NimKitCoreTypes.IFriendInfo {
  onItemClick?: (account: string) => void
  afterSendMsgClick?: () => void
  prefix?: string
  commonPrefix?: string
}

export const BlackItem: FC<BlackItemProps> = ({
  alias,
  nick,
  account,
  onItemClick,
  afterSendMsgClick,
  prefix = 'contact',
  commonPrefix = 'common',
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
        account={account}
        prefix={commonPrefix}
        afterSendMsgClick={afterSendMsgClick}
      />
      <span className={`${_prefix}-label`}>
        {alias || nick || account || ''}
      </span>
    </div>
  )
}
