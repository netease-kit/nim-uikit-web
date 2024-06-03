import React, { FC } from 'react'
import { FriendSelectUI, FriendSelectUIProps } from './FriendSelectUI'
import { useStateContext } from '../../hooks/useStateContext'
import { observer } from 'mobx-react'

export type FriendSelectContainerProps = Omit<FriendSelectUIProps, 'list'>

export const FriendSelectContainer: FC<FriendSelectContainerProps> = observer(
  (props) => {
    const { store } = useStateContext()

    const friendsWithoutBlacklist = store.uiStore.friends
      .filter((item) => !store.relationStore.blacklist.includes(item.accountId))
      .map((item) => item.accountId)

    return <FriendSelectUI accounts={friendsWithoutBlacklist} {...props} />
  }
)
