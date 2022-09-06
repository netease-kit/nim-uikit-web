import React, { FC } from 'react'
import { ComplexAvatarContainer } from '@xkit-yx/common-ui'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'

export interface BlackItemProps extends UserNameCard {
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
      <span className={`${_prefix}-label`}>{nick || account || ''}</span>
    </div>
  )
}
