import React, { FC } from 'react'
import { ComplexAvatarContainer } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'

export interface FriendItemProps extends NimKitCoreTypes.IFriendInfo {
  onItemClick?: (account: string) => void
  afterSendMsgClick?: () => void
  prefix?: string
  commonPrefix?: string
}

export const FriendItem: FC<FriendItemProps> = ({
  nick,
  account,
  onItemClick,
  afterSendMsgClick,
  prefix = 'contact',
  commonPrefix = 'common',
}) => {
  const _prefix = `${prefix}-friend-item`

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
      <span className={`${_prefix}-label`}>{nick || account || ''}</span>
    </div>
  )
}
