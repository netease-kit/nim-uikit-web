import React, { FC, useCallback } from 'react'
import { GroupList } from './components/GroupList'
import { useEventTracking, useStateContext } from '../../common'
import { V2NIMTeam } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import sdkPkg from 'nim-web-sdk-ng/package.json'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

export interface GroupListContainerProps {
  /**
   群组点击事件
   */
  onItemClick?: (team: V2NIMTeam) => void
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
    const { nim, store } = useStateContext()

    useEventTracking({
      appkey: nim.options.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: sdkPkg.version,
    })

    const handleItemClick = useCallback(
      async (team: V2NIMTeam) => {
        await store.conversationStore.insertConversationActive(
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
          team.teamId
        )
        onItemClick?.(team)
      },
      [onItemClick, store.conversationStore]
    )

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
