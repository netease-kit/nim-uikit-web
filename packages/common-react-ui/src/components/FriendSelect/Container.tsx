import React, { FC, useEffect, useState } from 'react'
import { FriendSelectUI, FriendSelectUIProps } from './FriendSelectUI'
import { useStateContext } from '../../hooks/useStateContext'
import { observer } from 'mobx-react'

export type FriendSelectContainerProps = Omit<FriendSelectUIProps, 'list'>

export const FriendSelectContainer: FC<FriendSelectContainerProps> = observer(
  (props) => {
    const { store } = useStateContext()

    // const [loading, setLoading] = useState(false)

    // useEffect(() => {
    //   setLoading(true)
    //   store.uiStore
    //     .getFriendsWithoutBlacklist()
    //     .then(() => {
    //       setLoading(false)
    //     })
    //     .catch(() => {
    //       setLoading(false)
    //     })
    // }, [store.uiStore])

    return (
      <FriendSelectUI
        list={store.uiStore.friendsWithoutBlacklist}
        // loading={loading}
        {...props}
      />
    )
  }
)
