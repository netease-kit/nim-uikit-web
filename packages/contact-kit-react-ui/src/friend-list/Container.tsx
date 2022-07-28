import React, { FC, useContext, useMemo, useEffect, useState } from 'react'
import { Spin } from 'antd'
import { FriendList } from './components/FriendList'
import { Context, useEventTracking } from '@xkit-yx/common-ui'
import { logger } from '../logger'
import packageJson from '../../package.json'

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

export const FriendListContainer: FC<FriendListContainerProps> = ({
  onItemClick,
  afterSendMsgClick,
  renderFriendListEmpty,
  renderFriendListHeader,
  prefix = 'contact',
  commonPrefix = 'common',
}) => {
  // 在这里汇聚所有需要用到的 Context，并完成数据的操作传递给纯渲染组件
  const { nim, state, dispatch, initOptions } = useContext(Context)

  // 这里需要对用到的 Context 中的值判空并做好提示
  if (!nim || !state || !dispatch || !initOptions) {
    throw new Error('Please use Provider to wrap FriendListContainer.')
  }

  const [friendListLoading, setFriendListLoading] = useState<boolean>(false)

  useEventTracking({
    appkey: initOptions.appkey,
    version: packageJson.version,
    component: 'contact-kit',
    imVersion: nim.version,
  })

  useEffect(() => {
    setFriendListLoading(true)
    Promise.all([nim.getFriendList(), nim.getBlackList()])
      .then(([friendList, blackList]) => {
        dispatch({
          type: 'setFriends',
          payload: friendList,
        })
        dispatch({
          type: 'updateBlacks',
          payload: blackList,
        })
        logger.log('获取好友列表成功：', {
          friendList,
          blackList,
        })
      })
      .catch((err) => {
        logger.error('获取好友列表失败：', err)
      })
      .finally(() => {
        setFriendListLoading(false)
      })
  }, [nim, dispatch])

  const friendListRenderer = useMemo(() => {
    if (friendListLoading) {
      return <Spin />
    }
    if (!state.friendList.length) {
      return renderFriendListEmpty ? renderFriendListEmpty() : null
    }

    return (
      <FriendList
        list={state.friendList.filter((friend) =>
          state.blackList.every((item) => item.account !== friend.account)
        )}
        onItemClick={onItemClick}
        afterSendMsgClick={afterSendMsgClick}
        renderFriendListHeader={renderFriendListHeader}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
    )
  }, [
    state.friendList,
    state.blackList,
    prefix,
    commonPrefix,
    onItemClick,
    afterSendMsgClick,
    friendListLoading,
    renderFriendListEmpty,
    renderFriendListHeader,
  ])

  return friendListRenderer
}
