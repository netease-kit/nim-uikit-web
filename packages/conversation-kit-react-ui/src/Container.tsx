import React, {
  FC,
  useContext,
  useMemo,
  useEffect,
  useCallback,
  useState,
} from 'react'
import { Spin } from 'antd'
import { ConversationList, ISeessionProps } from './components/ConversationList'
import { logger } from './logger'
import { Context, useTranslation, useEventTracking } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import packageJson from '../package.json'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { message } from 'antd'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'

export interface ConversationContainerProps {
  /**
   样式前缀
   */
  prefix?: string
  /**
   公共样式前缀
   */
  commonPrefix?: string
  /**
   会话点击事件
   */
  onSessionItemClick?: (id: string) => void
  /**
   会话删除事件
   */
  onSessionItemDeleteClick?: (id: string) => void
  /**
   会话免打扰状态改变事件
   */
  onSessionItemMuteChange?: (id: string, mute: boolean) => void
  /**
   自定义渲染会话列表为空时内容
   */
  renderSessionListEmpty?: () => JSX.Element
  /**
   自定义渲染会话类型是单聊的内容
   */
  renderCustomP2pSession?: (
    options: {
      session: NimKitCoreTypes.ISession
    } & ISeessionProps
  ) => JSX.Element
  /**
   自定义渲染会话类型是群聊的内容
   */
  renderCustomTeamSession?: (
    options: {
      session: NimKitCoreTypes.ISession
    } & Omit<ISeessionProps, 'onSessionItemMuteChange'>
  ) => JSX.Element
}

export const ConversationContainer: FC<ConversationContainerProps> = ({
  prefix = 'conversation',
  commonPrefix = 'common',
  onSessionItemClick,
  onSessionItemDeleteClick,
  onSessionItemMuteChange,
  renderSessionListEmpty,
  renderCustomP2pSession,
  renderCustomTeamSession,
}) => {
  // 在这里汇聚所有需要用到的 Context，并完成数据的操作传递给纯渲染组件
  const { nim, state, dispatch, initOptions } = useContext(Context)
  // 这里需要对用到的 Context 中的值判空并做好提示
  if (!nim || !state || !dispatch || !initOptions) {
    throw new Error('Please use Provider to wrap ConversationContainer.')
  }

  const [sessionListLoading, setSessionListLoading] = useState<boolean>(false)

  const { t } = useTranslation()

  useEventTracking({
    appkey: initOptions.appkey,
    version: packageJson.version,
    component: 'conversation-kit',
    imVersion: nim.version,
  })

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

  useEffect(() => {
    setSessionListLoading(true)
    nim
      .getSessionList({
        limit: 100,
      })
      .then((sessions) => {
        logger.log('getSessions 成功', sessions)
        dispatch({
          type: 'updateSessions',
          payload: sessions,
        })
      })
      .catch((err) => {
        logger.error('getSessions 失败', err)
      })
      .finally(() => {
        setSessionListLoading(false)
      })
  }, [nim, dispatch])

  useEffect(() => {
    // 监听会话更新事件
    const onSessions = (_sessions) => {
      logger.log('同步时收到了会话', _sessions)

      const promises = _sessions.map((item) => {
        return nim.getSession({
          id: item.id,
        })
      })

      Promise.allSettled(promises)
        .then((res) => {
          const successRes: NimKitCoreTypes.ISession[] = res
            .filter((item) => item.status === 'fulfilled')
            // @ts-ignore
            .map((item) => item.value)

          dispatch({
            type: 'updateSessions',
            payload: successRes,
          })
        })
        .catch((err) => {
          logger.error('批量 getSession error', err)
        })
    }

    const onUpdateSession = async (session: Session) => {
      logger.log('收到了会话更新事件', session)

      try {
        const newSession = await nim.getSession({
          id: session.id,
        })
        if (state.selectedSession?.id === newSession.id) {
          await resetSession(newSession)
        } else {
          dispatch({
            type: 'updateSessions',
            payload: [newSession],
          })
        }
        logger.log('更新会话成功: ', newSession)
      } catch (error) {
        logger.error('更新会话失败：', error)
      }
    }

    const onDismissTeam = async ({ teamId }: { teamId: string }) => {
      const sessionId = `team-${teamId}`

      try {
        if (await nim.isSessionExist(sessionId)) {
          await nim.deleteSession({
            id: sessionId,
            isSyncToServer: true,
          })
        }
        if (state.selectedSession?.id === sessionId) {
          message.warning(t('onDismissTeamText'))
        }
        dispatch({
          type: 'deleteSessions',
          payload: [sessionId],
        })
        dispatch({
          type: 'deleteGroups',
          payload: [teamId],
        })
        logger.log('收到群解散事件，并成功删除缓存')
      } catch (error) {
        logger.error('收到群解散事件，处理失败：', error)
      }
    }

    const onRemoveTeamMembers = async ({
      team,
      accounts,
    }: {
      team: Team
      accounts: string[]
    }) => {
      // 如果自己被移除
      if (!accounts.includes(initOptions.account)) {
        return
      }

      const { teamId } = team
      const sessionId = `team-${teamId}`
      try {
        if (await nim.isSessionExist(sessionId)) {
          await nim.deleteSession({
            id: sessionId,
            isSyncToServer: true,
          })
        }
        if (state.selectedSession?.id === sessionId) {
          message.warning(t('onRemoveTeamText'))
        }
        dispatch({
          type: 'deleteSessions',
          payload: [sessionId],
        })
        dispatch({
          type: 'deleteGroups',
          payload: [teamId],
        })
        logger.log('收到群移出事件，并成功删除缓存')
      } catch (error) {
        logger.error('收到群移出事件，处理失败：', error)
      }
    }

    nim.on('sessions', onSessions)
    nim.on('updateSession', onUpdateSession)
    nim.on('dismissTeam', onDismissTeam)
    nim.on('removeTeamMembers', onRemoveTeamMembers)

    return () => {
      nim.off('sessions', onSessions)
      nim.off('updateSession', onUpdateSession)
      nim.off('dismissTeam', onDismissTeam)
      nim.off('removeTeamMembers', onRemoveTeamMembers)
    }
  }, [
    dispatch,
    nim,
    state.selectedSession?.id,
    initOptions.account,
    resetSession,
    t,
  ])

  const handleSessionItemClick = useCallback(
    async (session: NimKitCoreTypes.ISession) => {
      dispatch({
        type: 'selectSession',
        payload: session,
      })
      logger.log('选中会话：', session)
      await resetSession(session)
      onSessionItemClick?.(session.id)
    },
    [dispatch, onSessionItemClick, resetSession]
  )

  const handleSessionItemDeleteClick = useCallback(
    (session: NimKitCoreTypes.ISession) => {
      logger.log('删除会话：', session)
      nim
        .deleteSession({
          id: session.id,
          isSyncToServer: true,
        })
        .then(() => {
          logger.log('删除会话成功')
          dispatch({
            type: 'deleteSessions',
            payload: [session.id],
          })
          onSessionItemDeleteClick?.(session.id)
        })
        .catch((err) => {
          logger.error('删除会话失败：', err)
        })
    },
    [dispatch, nim, onSessionItemDeleteClick]
  )

  const handleSessionItemMuteChange = useCallback(
    (session: NimKitCoreTypes.ISession, mute: boolean) => {
      logger.log('设置免打扰：', session, mute)
      nim
        .setMute({ account: session.to, isAdd: mute })
        .then(() => {
          logger.log('设置免打扰成功')
          dispatch({
            type: 'updateSessions',
            payload: [{ ...session, isMute: mute }],
          })
          onSessionItemMuteChange?.(session.id, mute)
        })
        .catch((err) => {
          logger.error('设置免打扰失败：', err)
        })
    },
    [dispatch, nim, onSessionItemMuteChange]
  )

  const conversationListRenderer = useMemo(() => {
    if (sessionListLoading) {
      return (
        <div className={`${prefix}-list-loading`}>
          <Spin />
        </div>
      )
    }

    if (!state.sessions.length) {
      return renderSessionListEmpty ? renderSessionListEmpty() : null
    }

    return (
      <ConversationList
        sessions={state.sessions}
        selectedSession={state.selectedSession}
        onSessionItemClick={handleSessionItemClick}
        onSessionItemDeleteClick={handleSessionItemDeleteClick}
        onSessionItemMuteChange={handleSessionItemMuteChange}
        renderCustomP2pSession={renderCustomP2pSession}
        renderCustomTeamSession={renderCustomTeamSession}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
    )
  }, [
    state.sessions,
    state.selectedSession,
    sessionListLoading,
    prefix,
    commonPrefix,
    handleSessionItemClick,
    handleSessionItemDeleteClick,
    handleSessionItemMuteChange,
    renderSessionListEmpty,
    renderCustomP2pSession,
    renderCustomTeamSession,
  ])

  return conversationListRenderer
}
