import React, { FC, useContext, useEffect } from 'react'
import { FriendSelectUI, FriendSelectUIProps } from './FriendSelectUI'
import { logger } from '../../utils'
import { Context } from '../../contextManager/Provider'

export type FriendSelectContainerProps = Omit<FriendSelectUIProps, 'list'>

export const FriendSelectContainer: FC<FriendSelectContainerProps> = (
  props
) => {
  const { nim, state, dispatch } = useContext(Context)

  if (!nim || !state || !dispatch) {
    throw new Error('Please use Provider to wrap FriendSelectContainer.')
  }

  useEffect(() => {
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
  }, [nim, dispatch])

  return (
    <FriendSelectUI
      list={state.friendList.filter((friend) =>
        state.blackList.every((item) => item.account !== friend.account)
      )}
      {...props}
    />
  )
}
