import React, { FC, useMemo, useEffect, useCallback, useState } from 'react'
import { Spin } from 'antd'
import { GroupList } from './components/GroupList'
import { useEventTracking, useStateContext } from '../../../common-ui/src'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { logger } from '../logger'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import packageJson from '../../package.json'
import { observer } from 'mobx-react'

export interface GroupListContainerProps {
  /**
   群组点击事件
   */
  onItemClick?: (team: Team) => void
  /**
   自定义渲染群组列表为空时内容
   */
  renderGroupListEmpty?: () => JSX.Element
  /**
   自定义渲染群组列表头部内容
   */
  renderGroupListHeader?: () => JSX.Element
  /**
   样式前缀
   */
  prefix?: string
}

export const GroupListContainer: FC<GroupListContainerProps> = observer(
  ({
    onItemClick,
    renderGroupListEmpty,
    renderGroupListHeader,
    prefix = 'contact',
  }) => {
    const { nim, store, initOptions } = useStateContext()

    useEventTracking({
      appkey: initOptions.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: nim.version,
    })

    const handleItemClick = async (team: Team) => {
      await store.sessionStore.insertSessionActive('team', team.teamId)
      onItemClick?.(team)
    }

    return (
      <GroupList
        list={store.uiStore.teamList}
        onItemClick={handleItemClick}
        renderGroupListHeader={renderGroupListHeader}
        renderGroupListEmpty={renderGroupListEmpty}
        prefix={prefix}
      />
    )
  }
)
