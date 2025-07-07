import React, { FC, useState, useEffect } from 'react'
import {
  ComplexAvatarContainer,
  useStateContext,
  useTranslation,
} from '../../../common'
import { observer } from 'mobx-react'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

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

    const [isOnline, setIsOnline] = useState<boolean>(false)

    useEffect(() => {
      if (
        store.subscriptionStore.stateMap.get(account) &&
        localOptions.loginStateVisible
      ) {
        setIsOnline(
          store.subscriptionStore.stateMap.get(account)?.statusType ===
            V2NIMConst.V2NIMUserStatusType.V2NIM_USER_STATUS_TYPE_LOGIN
        )
      }
    }, [
      store.subscriptionStore.stateMap,
      store.subscriptionStore.stateMap.get(account),
      account,
      localOptions.loginStateVisible,
    ])

    return (
      <div
        className={_prefix}
        onClick={(e) => {
          e.stopPropagation()
          onItemClick?.(account)
        }}
      >
        <div>
          <ComplexAvatarContainer
            account={account}
            prefix={commonPrefix}
            afterSendMsgClick={afterSendMsgClick}
          />
        </div>
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
