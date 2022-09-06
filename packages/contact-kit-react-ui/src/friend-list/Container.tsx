import React, { FC } from 'react'
import { FriendList } from './components/FriendList'
import { useEventTracking, useStateContext } from '@xkit-yx/common-ui'
import packageJson from '../../package.json'
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
      component: 'contact-kit',
      imVersion: nim.version,
    })

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
