import React, { FC } from 'react'
import {
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
} from '../../../common'
import { observer } from 'mobx-react'

export interface FriendItemProps {
  account: string
  onItemClick?: (account: string) => void
  afterSendMsgClick?: () => void
  prefix?: string
  commonPrefix?: string
}

export const FriendItem: FC<FriendItemProps> = observer(
  ({
    account,
    onItemClick,
    afterSendMsgClick,
    prefix = 'contact',
    commonPrefix = 'common',
  }) => {
    const _prefix = `${prefix}-friend-item`

    const { store, localOptions } = useStateContext()

    const { t } = useTranslation()

    // TODO sdk 暂不支持在线状态
    // const isOnline = store.eventStore.stateMap.get(account) === 'online'
    const isOnline = 'online'

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
        {localOptions.loginStateVisible ? (
          <span
            className={`${_prefix}-state-${isOnline ? 'online' : 'offline'}`}
          >
            {t(isOnline ? 'onlineText' : 'offlineText')}
          </span>
        ) : null}
      </div>
    )
  }
)
