import React, { FC, useEffect } from 'react'
import { FriendList } from './components/FriendList'
import { useEventTracking, useStateContext } from '../../common'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'
import sdkPkg from 'nim-web-sdk-ng/package.json'

export interface FriendListContainerProps {
  /**
   好友点击事件
   */
  onItemClick?: (account: string) => void
  /**
   点击发送消息后的事件
   */
  afterSendMsgClick?: () => void
  /**
   自定义渲染好友列表为空时内容
   */
  renderFriendListEmpty?: () => JSX.Element
  /**
   自定义渲染好友列表头部内容
   */
  renderFriendListHeader?: () => JSX.Element
  /**
   样式前缀
   */
  prefix?: string
  /**
   公共样式前缀
   */
  commonPrefix?: string
}

export const FriendListContainer: FC<FriendListContainerProps> = observer(
  ({
    onItemClick,
    afterSendMsgClick,
    renderFriendListEmpty,
    renderFriendListHeader,
    prefix = 'contact',
    commonPrefix = 'common',
  }) => {
    const { nim, store, localOptions } = useStateContext()

    useEventTracking({
      appkey: nim.options.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: sdkPkg.version,
    })

    const friendsWithoutBlacklist = store.uiStore.friends
      .filter((item) => !store.relationStore.blacklist.includes(item.accountId))
      .map((item) => item.accountId)

    useEffect(() => {
      if (localOptions.loginStateVisible) {
        // 将 friendsWithoutBlacklist 拆分成多个长度不超过 100 的子数组
        const chunkSize = 100

        const length =
          friendsWithoutBlacklist.length >= 3000
            ? 3000
            : friendsWithoutBlacklist.length

        for (let i = 0; i < length; i += chunkSize) {
          const chunk = friendsWithoutBlacklist.slice(i, i + chunkSize)

          if (chunk.length > 0) {
            store.subscriptionStore.subscribeUserStatusActive(chunk)
          }
        }
      }
    }, [
      store.subscriptionStore,
      friendsWithoutBlacklist,
      localOptions.loginStateVisible,
    ])

    return (
      <FriendList
        accounts={friendsWithoutBlacklist}
        onItemClick={onItemClick}
        afterSendMsgClick={afterSendMsgClick}
        renderFriendListHeader={renderFriendListHeader}
        renderFriendListEmpty={renderFriendListEmpty}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
    )
  }
)
