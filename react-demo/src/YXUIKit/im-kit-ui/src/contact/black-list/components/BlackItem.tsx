import React, { FC } from 'react'
import { ComplexAvatarContainer, useStateContext } from '../../../common'
import { observer } from 'mobx-react'

export interface BlackItemProps {
  account: string
  onItemClick?: (account: string) => void
  afterSendMsgClick?: () => void
  prefix?: string
  commonPrefix?: string
}

export const BlackItem: FC<BlackItemProps> = observer(
  ({
    account,
    onItemClick,
    afterSendMsgClick,
    prefix = 'contact',
    commonPrefix = 'common',
  }) => {
    const _prefix = `${prefix}-black-item`

    const { store } = useStateContext()

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
          {store.uiStore.getAppellation({ account })}
        </span>
      </div>
    )
  }
)
