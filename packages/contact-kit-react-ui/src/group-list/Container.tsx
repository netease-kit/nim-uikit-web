import React, {
  FC,
  useContext,
  useMemo,
  useEffect,
  useCallback,
  useState,
} from 'react'
import { Spin } from 'antd'
import { GroupList } from './components/GroupList'
import { Context, useEventTracking } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { logger } from '../logger'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import packageJson from '../../package.json'

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

export const GroupListContainer: FC<GroupListContainerProps> = ({
  onItemClick,
  renderGroupListEmpty,
  renderGroupListHeader,
  prefix = 'contact',
}) => {
  // 在这里汇聚所有需要用到的 Context，并完成数据的操作传递给纯渲染组件
  const { nim, state, dispatch, initOptions } = useContext(Context)

  // 这里需要对用到的 Context 中的值判空并做好提示
  if (!nim || !state || !dispatch || !initOptions) {
    throw new Error('Please use Provider to wrap GroupListContainer.')
  }

  const [groupListLoading, setGroupListLoading] = useState<boolean>(false)

  useEventTracking({
    appkey: initOptions.appkey,
    version: packageJson.version,
    component: 'contact-kit',
    imVersion: nim.version,
  })

  useEffect(() => {
    setGroupListLoading(true)
    nim
      .getTeams()
      .then((list) => {
        logger.log('获取群组列表成功：', list)
        dispatch({
          type: 'updateGroups',
          payload: list,
        })
      })
      .catch((err) => {
        logger.error('获取群组列表失败：', err)
      })
      .finally(() => {
        setGroupListLoading(false)
      })
  }, [nim, dispatch])

  const handleItemClick = useCallback(
    async (team: Team) => {
      const scene = 'team'
      const sessionId = `${scene}-${team.teamId}`
      if (await nim.isSessionExist(sessionId)) {
        const session = await nim.getSession({ id: sessionId })
        dispatch({
          type: 'selectSession',
          payload: session,
        })
        logger.log('选中会话: ', session)
        resetSession(session)
      } else {
        const tempSession: NimKitCoreTypes.TeamSession = {
          ...team,
          id: sessionId,
          scene,
          to: team.teamId,
          unread: 0,
          updateTime: Date.now(),
          createTime: Date.now(),
        }
        dispatch({
          type: 'insertTempSession',
          payload: {
            isSelected: true,
            session: tempSession,
          },
        })
        logger.log('插入并选中临时会话: ', tempSession)
      }
      onItemClick?.(team)
    },
    [onItemClick, nim, dispatch]
  )

  const resetSession = useCallback(
    async (session: NimKitCoreTypes.ISession) => {
      let newSession = { ...session }
      try {
        if (session.unread) {
          await nim.resetSessionUnreadCount({
            id: session.id,
          })
          newSession = { ...session, unread: 0, unreadMsgs: [] }
        }
        dispatch({
          type: 'updateSessions',
          payload: [newSession],
        })
        logger.log('重置会话未读数成功')
      } catch (error) {
        logger.error('重置会话未读数失败：', error)
      }
    },
    [dispatch, nim]
  )

  const groupListRenderer = useMemo(() => {
    if (groupListLoading) {
      return <Spin />
    }
    if (!state.groupList.length) {
      return renderGroupListEmpty ? renderGroupListEmpty() : null
    }

    return (
      <GroupList
        list={state.groupList}
        onItemClick={handleItemClick}
        renderGroupListHeader={renderGroupListHeader}
        prefix={prefix}
      />
    )
  }, [
    state.groupList,
    prefix,
    handleItemClick,
    groupListLoading,
    renderGroupListEmpty,
    renderGroupListHeader,
  ])

  return groupListRenderer
}
