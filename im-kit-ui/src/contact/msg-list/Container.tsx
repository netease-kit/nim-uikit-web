import React, { FC, useEffect, useState } from 'react'
import { MsgList } from './components/MsgList'
import { useEventTracking, useStateContext, useTranslation } from '../../common'
import packageJson from '../../../package.json'
import { observer } from 'mobx-react'
import { message } from 'antd'
import { logger } from '../../utils'
// todo v10.6.0
import sdkPkg from 'nim-web-sdk-ng/package.json'
import {
  V2NIMFriendAddApplicationForUI,
  V2NIMTeamJoinActionInfoForUI,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { TMsgItem, TMsgItemType } from './components/MsgItem'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'

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

    const handleErrorCode = (code, defaultTip) => {
      switch (code) {
        case 109432:
          message.error(t('noPermission'))
          break
        case 109404:
          message.error(t('processedValidationMessageText'))
          break
        case 108404:
          message.error(t('teamNotExitsText'))
          break
        case 109311:
          message.error(t('aleadyInTeamText'))
          break
        case 109313:
          message.error(t('verifyMsgNotExitsText'))
          break
        case 108437:
          message.error(t('teamMemberLimitText'))
          break
        default:
          message.error(defaultTip)
      }
    }

    const onAcceptApplyTeamClick = (
      actionInfo: V2NIMTeamJoinActionInfoForUI
    ) => {
      setApplyTeamLoaidng(true)

      store.teamStore
        .acceptJoinApplicationActive(actionInfo)
        .then(() => {
          message.success(t('acceptedText'))
          store.sysMsgStore.updateTeamJoinActionMsg([
            {
              ...actionInfo,
              isRead: true,
              actionStatus:
                V2NIMConst.V2NIMTeamJoinActionStatus
                  .V2NIM_TEAM_JOIN_ACTION_STATUS_AGREED,
            },
          ])
          afterAcceptApplyTeam?.(actionInfo)
        })
        .catch((err) => {
          handleErrorCode(err.code, t('acceptFailedText'))

          store.sysMsgStore.updateTeamJoinActionMsg([
            {
              ...actionInfo,
              isRead: true,
              actionStatus:
                V2NIMConst.V2NIMTeamJoinActionStatus
                  .V2NIM_TEAM_JOIN_ACTION_STATUS_EXPIRED,
            },
          ])

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
          message.success(t('rejectedTeamText'))
          store.sysMsgStore.updateTeamJoinActionMsg([
            {
              ...actionInfo,
              isRead: true,
              actionStatus:
                V2NIMConst.V2NIMTeamJoinActionStatus
                  .V2NIM_TEAM_JOIN_ACTION_STATUS_REJECTED,
            },
          ])
          afterRejectApplyTeam?.(actionInfo)
        })
        .catch((err) => {
          handleErrorCode(err.code, t('rejectTeamFailedText'))

          store.sysMsgStore.updateTeamJoinActionMsg([
            {
              ...actionInfo,
              isRead: true,
              actionStatus:
                V2NIMConst.V2NIMTeamJoinActionStatus
                  .V2NIM_TEAM_JOIN_ACTION_STATUS_EXPIRED,
            },
          ])

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
          store.sysMsgStore.updateTeamJoinActionMsg([
            {
              ...actionInfo,
              isRead: true,
              actionStatus:
                V2NIMConst.V2NIMTeamJoinActionStatus
                  .V2NIM_TEAM_JOIN_ACTION_STATUS_AGREED,
            },
          ])
          afterAcceptTeamInvite?.(actionInfo)
        })
        .catch((err) => {
          handleErrorCode(err.code, t('acceptFailedText'))

          store.sysMsgStore.updateTeamJoinActionMsg([
            {
              ...actionInfo,
              isRead: true,
              actionStatus:
                V2NIMConst.V2NIMTeamJoinActionStatus
                  .V2NIM_TEAM_JOIN_ACTION_STATUS_EXPIRED,
            },
          ])

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
          message.success(t('rejectedTeamText'))
          store.sysMsgStore.updateTeamJoinActionMsg([
            {
              ...actionInfo,
              isRead: true,
              actionStatus:
                V2NIMConst.V2NIMTeamJoinActionStatus
                  .V2NIM_TEAM_JOIN_ACTION_STATUS_REJECTED,
            },
          ])
          afterRejectTeamInvite?.(actionInfo)
        })
        .catch((err) => {
          handleErrorCode(err.code, t('rejectTeamFailedText'))
          store.sysMsgStore.updateTeamJoinActionMsg([
            {
              ...actionInfo,
              isRead: true,
              actionStatus:
                V2NIMConst.V2NIMTeamJoinActionStatus
                  .V2NIM_TEAM_JOIN_ACTION_STATUS_EXPIRED,
            },
          ])
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
