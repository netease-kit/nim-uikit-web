import React, { FC, useState } from 'react'
import { MsgList } from './components/MsgList'
import { useEventTracking, useStateContext, useTranslation } from '../../common'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'
import { message } from 'antd'
import { logger } from '../../utils'

export interface MsgListContainerProps {
  /**
   自定义渲染消息中心为空时内容
   */
  renderMsgListEmpty?: () => JSX.Element
  /**
   自定义渲染消息中心头部内容
   */
  renderMsgListHeader?: () => JSX.Element
  /**
   点击发送消息后的事件
   */
  afterSendMsgClick?: () => void
  /**
   通过入群申请后的事件
   */
  afterAcceptApplyTeam?: () => void
  /**
   拒绝入群申请后的事件
   */
  afterRejectApplyTeam?: () => void
  /**
   通过入群邀请后的事件
   */
  afterAcceptTeamInvite?: () => void
  /**
   拒绝入群邀请后的事件
   */
  afterRejectTeamInvite?: () => void
  /**
   通过好友申请后的事件
   */
  afterAcceptApplyFriend?: () => void
  /**
   拒绝好友申请后的事件
   */
  afterRejectApplyFriend?: () => void
  /**
   样式前缀
   */
  prefix?: string
  /**
   公共样式前缀
   */
  commonPrefix?: string
}

export const MsgListContainer: FC<MsgListContainerProps> = observer(
  ({
    renderMsgListHeader,
    renderMsgListEmpty,
    afterSendMsgClick,
    afterAcceptApplyTeam,
    afterRejectApplyTeam,
    afterAcceptTeamInvite,
    afterRejectTeamInvite,
    afterAcceptApplyFriend,
    afterRejectApplyFriend,
    prefix = 'contact',
    commonPrefix = 'common',
  }) => {
    const { nim, store, initOptions } = useStateContext()

    const { t } = useTranslation()

    useEventTracking({
      appkey: initOptions.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: nim.version,
    })

    const [applyTeamLoaidng, setApplyTeamLoaidng] = useState(false)
    const [teamInviteLoading, setTeamInviteLoading] = useState(false)
    const [applyFriendLoading, setApplyFriendLoading] = useState(false)

    const onAcceptApplyTeamClick = (options: {
      teamId: string
      from: string
    }) => {
      setApplyTeamLoaidng(true)
      store.teamStore
        .passTeamApplyActive(options)
        .then(() => {
          message.success(t('acceptedText'))
          afterAcceptApplyTeam?.()
        })
        .catch((err) => {
          message.error(t('acceptFailedText'))
          logger.error('同意该申请失败: ', err)
        })
        .finally(() => {
          setApplyTeamLoaidng(false)
        })
    }

    const onRejectApplyTeamClick = (options: {
      teamId: string
      from: string
    }) => {
      setApplyTeamLoaidng(true)
      store.teamStore
        .rejectTeamApplyActive(options)
        .then(() => {
          message.success(t('rejectedText'))
          afterRejectApplyTeam?.()
        })
        .catch((err) => {
          message.error(t('rejectFailedText'))
          logger.error('拒绝该申请失败: ', err)
        })
        .finally(() => {
          setApplyTeamLoaidng(false)
        })
    }

    const onAcceptTeamInviteClick = (options: {
      teamId: string
      from: string
    }) => {
      setTeamInviteLoading(true)
      store.teamStore
        .acceptTeamInviteActive(options)
        .then(() => {
          message.success(t('acceptedText'))
          afterAcceptTeamInvite?.()
        })
        .catch((err) => {
          message.error(t('acceptFailedText'))
          logger.error('同意该申请失败: ', err)
        })
        .finally(() => {
          setTeamInviteLoading(false)
        })
    }

    const onRejectTeamInviteClick = (options: {
      teamId: string
      from: string
    }) => {
      setTeamInviteLoading(true)
      store.teamStore
        .rejectTeamInviteActive(options)
        .then(() => {
          message.success(t('rejectedText'))
          afterRejectTeamInvite?.()
        })
        .catch((err) => {
          message.error(t('rejectFailedText'))
          logger.error('拒绝该申请失败: ', err)
        })
        .finally(() => {
          setTeamInviteLoading(false)
        })
    }

    const onAcceptApplyFriendClick = async (account: string) => {
      try {
        setApplyFriendLoading(true)
        await store.friendStore.passFriendApplyActive(account)
        message.success(t('acceptedText'))
        await store.msgStore.sendTextMsgActive({
          scene: 'p2p',
          to: account,
          body: t('passFriendAskText'),
        })
        afterAcceptApplyFriend?.()
      } catch (error) {
        message.error(t('acceptFailedText'))
        logger.error('同意该申请失败: ', error)
      } finally {
        setApplyFriendLoading(false)
      }
    }

    const onRejectApplyFriendClick = (account: string) => {
      setApplyFriendLoading(true)
      store.friendStore
        .rejectFriendApplyActive(account)
        .then(() => {
          message.success(t('rejectedText'))
          afterRejectApplyFriend?.()
        })
        .catch((err) => {
          message.error(t('rejectFailedText'))
          logger.error('拒绝该申请失败: ', err)
        })
        .finally(() => {
          setApplyFriendLoading(false)
        })
    }

    return (
      <MsgList
        msgs={store.uiStore.applyMsgList}
        applyTeamLoaidng={applyTeamLoaidng}
        teamInviteLoading={teamInviteLoading}
        applyFriendLoading={applyFriendLoading}
        onAcceptApplyTeamClick={onAcceptApplyTeamClick}
        onRejectApplyTeamClick={onRejectApplyTeamClick}
        onAcceptTeamInviteClick={onAcceptTeamInviteClick}
        onRejectTeamInviteClick={onRejectTeamInviteClick}
        onAcceptApplyFriendClick={onAcceptApplyFriendClick}
        onRejectApplyFriendClick={onRejectApplyFriendClick}
        afterSendMsgClick={afterSendMsgClick}
        renderMsgListHeader={renderMsgListHeader}
        renderMsgListEmpty={renderMsgListEmpty}
        prefix={prefix}
        commonPrefix={commonPrefix}
      />
    )
  }
)
