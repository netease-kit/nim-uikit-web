import React, { FC, useState } from 'react'
import { MsgList } from './components/MsgList'
import { useEventTracking, useStateContext, useTranslation } from '../../common'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'
import { message } from 'antd'
import { logger } from '../../utils'
import sdkPkg from 'nim-web-sdk-ng/package.json'
import {
  V2NIMFriendAddApplicationForUI,
  V2NIMTeamJoinActionInfoForUI,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { TMsgItem, TMsgItemType } from './components/MsgItem'

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
  afterAcceptApplyTeam?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  /**
   拒绝入群申请后的事件
   */
  afterRejectApplyTeam?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  /**
   通过入群邀请后的事件
   */
  afterAcceptTeamInvite?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  /**
   拒绝入群邀请后的事件
   */
  afterRejectTeamInvite?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  /**
   通过好友申请后的事件
   */
  afterAcceptApplyFriend?: (application: V2NIMFriendAddApplicationForUI) => void
  /**
   拒绝好友申请后的事件
   */
  afterRejectApplyFriend?: (application: V2NIMFriendAddApplicationForUI) => void
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
    const { nim, store } = useStateContext()

    const { t } = useTranslation()

    useEventTracking({
      appkey: nim.options.appkey,
      version: packageJson.version,
      component: 'ContactUIKit',
      imVersion: sdkPkg.version,
    })

    const msgs: TMsgItem[] = [
      ...store.sysMsgStore.friendApplyMsgs.map((item) => ({
        ...item,
        messageType: TMsgItemType.FRIEND,
      })),
      ...store.sysMsgStore.teamJoinActionMsgs.map((item) => ({
        ...item,
        messageType: TMsgItemType.TEAM,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp)

    const [applyTeamLoaidng, setApplyTeamLoaidng] = useState(false)
    const [teamInviteLoading, setTeamInviteLoading] = useState(false)
    const [applyFriendLoading, setApplyFriendLoading] = useState(false)

    const onAcceptApplyTeamClick = (
      actionInfo: V2NIMTeamJoinActionInfoForUI
    ) => {
      setApplyTeamLoaidng(true)
      store.teamStore
        .passTeamApplyActive(actionInfo)
        .then(() => {
          message.success(t('acceptedText'))
          afterAcceptApplyTeam?.(actionInfo)
        })
        .catch((err) => {
          message.error(t('acceptFailedText'))
          logger.error('同意该申请失败: ', err)
        })
        .finally(() => {
          setApplyTeamLoaidng(false)
        })
    }

    const onRejectApplyTeamClick = (
      actionInfo: V2NIMTeamJoinActionInfoForUI
    ) => {
      setApplyTeamLoaidng(true)
      store.teamStore
        .rejectTeamApplyActive(actionInfo)
        .then(() => {
          message.success(t('rejectedText'))
          afterRejectApplyTeam?.(actionInfo)
        })
        .catch((err) => {
          message.error(t('rejectFailedText'))
          logger.error('拒绝该申请失败: ', err)
        })
        .finally(() => {
          setApplyTeamLoaidng(false)
        })
    }

    const onAcceptTeamInviteClick = (
      actionInfo: V2NIMTeamJoinActionInfoForUI
    ) => {
      setTeamInviteLoading(true)
      store.teamStore
        .acceptTeamInviteActive(actionInfo)
        .then(() => {
          message.success(t('acceptedText'))
          afterAcceptTeamInvite?.(actionInfo)
        })
        .catch((err) => {
          message.error(t('acceptFailedText'))
          logger.error('同意该申请失败: ', err)
        })
        .finally(() => {
          setTeamInviteLoading(false)
        })
    }

    const onRejectTeamInviteClick = (
      actionInfo: V2NIMTeamJoinActionInfoForUI
    ) => {
      setTeamInviteLoading(true)
      store.teamStore
        .rejectTeamInviteActive(actionInfo)
        .then(() => {
          message.success(t('rejectedText'))
          afterRejectTeamInvite?.(actionInfo)
        })
        .catch((err) => {
          message.error(t('rejectFailedText'))
          logger.error('拒绝该申请失败: ', err)
        })
        .finally(() => {
          setTeamInviteLoading(false)
        })
    }

    const onAcceptApplyFriendClick = async (
      application: V2NIMFriendAddApplicationForUI
    ) => {
      try {
        setApplyFriendLoading(true)
        await store.friendStore.acceptAddApplicationActive(application)
        message.success(t('acceptedText'))
        afterAcceptApplyFriend?.(application)
      } catch (error) {
        message.error(t('acceptFailedText'))
        logger.error('同意该申请失败: ', error)
      } finally {
        setApplyFriendLoading(false)
      }
    }

    const onRejectApplyFriendClick = (
      application: V2NIMFriendAddApplicationForUI
    ) => {
      setApplyFriendLoading(true)
      store.friendStore
        .rejectAddApplicationActive(application)
        .then(() => {
          message.success(t('rejectedText'))
          afterRejectApplyFriend?.(application)
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
        msgs={msgs}
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
