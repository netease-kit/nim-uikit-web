import React, { FC, useEffect } from 'react'
import { FriendList } from './components/FriendList'
import { useEventTracking, useStateContext } from '../../common'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'

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
    const { nim, store, initOptions } = useStateContext()

    useEventTracking({
      appkey: initOptions.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: nim.version,
    })

    useEffect(() => {
      // 订阅好友列表
      const accounts = store.uiStore.friendsWithoutBlacklist.map(
        (item) => item.account
      )
      store.eventStore.subscribeLoginStateActive(accounts).catch((err) => {
        // 忽略报错
      })
    }, [store.uiStore.friendsWithoutBlacklist, store.eventStore])

    return (
      <FriendList
        list={store.uiStore.friendsWithoutBlacklist}
        // loading={loading}
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
