import React, { FC } from 'react'
import {
  ComplexAvatarContainer,
  CrudeAvatar,
  useTranslation,
  useStateContext,
} from '../../../common'
import { Button } from 'antd'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import { observer } from 'mobx-react'
import {
  V2NIMFriendAddApplicationForUI,
  V2NIMTeamJoinActionInfoForUI,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng'

export enum TMsgItemType {
  FRIEND = 'friend',
  TEAM = 'team',
}

export type TMsgItem = (
  | V2NIMFriendAddApplicationForUI
  | V2NIMTeamJoinActionInfoForUI
) & {
  messageType: TMsgItemType
}

export interface MsgItemProps {
  msg: TMsgItem
  applyTeamLoaidng?: boolean
  teamInviteLoading?: boolean
  applyFriendLoading?: boolean
  onAcceptApplyTeamClick?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  onRejectApplyTeamClick?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  onAcceptTeamInviteClick?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  onRejectTeamInviteClick?: (actionInfo: V2NIMTeamJoinActionInfoForUI) => void
  onAcceptApplyFriendClick?: (
    application: V2NIMFriendAddApplicationForUI
  ) => void
  onRejectApplyFriendClick?: (
    application: V2NIMFriendAddApplicationForUI
  ) => void
  afterSendMsgClick?: () => void
  prefix?: string
  commonPrefix?: string
}

export const MsgItem: FC<MsgItemProps> = observer(
  ({
    msg,
    applyTeamLoaidng = false,
    teamInviteLoading = false,
    applyFriendLoading = false,
    onAcceptApplyTeamClick,
    onRejectApplyTeamClick,
    onAcceptTeamInviteClick,
    onRejectTeamInviteClick,
    onAcceptApplyFriendClick,
    onRejectApplyFriendClick,
    afterSendMsgClick,

    prefix = 'contact',
    commonPrefix = 'common',
  }) => {
    const _prefix = `${prefix}-msg-item`

    const { t } = useTranslation()

    const { store } = useStateContext()

    const handleRejectApplyTeamClick = () => {
      onRejectApplyTeamClick?.(msg as V2NIMTeamJoinActionInfoForUI)
    }

    const handleAcceptApplyTeamClick = () => {
      onAcceptApplyTeamClick?.(msg as V2NIMTeamJoinActionInfoForUI)
    }

    const handleRejectTeamInviteClick = () => {
      onRejectTeamInviteClick?.(msg as V2NIMTeamJoinActionInfoForUI)
    }

    const handleAcceptTeamInviteClick = () => {
      onAcceptTeamInviteClick?.(msg as V2NIMTeamJoinActionInfoForUI)
    }

    const handleRejectApplyFriendClick = () => {
      onRejectApplyFriendClick?.(msg as V2NIMFriendAddApplicationForUI)
    }

    const handleAcceptApplyFriendClick = () => {
      onAcceptApplyFriendClick?.(msg as V2NIMFriendAddApplicationForUI)
    }

    const renderFriendApplyMsg = () => {
      const applyMsg = msg as V2NIMFriendAddApplicationForUI
      // 自己是否是申请者
      const isMeApplicant =
        applyMsg.applicantAccountId === store.userStore.myUserInfo.accountId
      switch (applyMsg.status) {
        case V2NIMConst.V2NIMFriendAddApplicationStatus
          .V2NIM_FRIEND_ADD_APPLICATION_STATUS_AGREED:
          return (
            <>
              <div className={`${_prefix}-flex`}>
                <ComplexAvatarContainer
                  account={applyMsg.applicantAccountId}
                  prefix={commonPrefix}
                  afterSendMsgClick={afterSendMsgClick}
                />
                <span className={`${_prefix}-name`}>
                  {store.uiStore.getAppellation({
                    account: applyMsg.applicantAccountId,
                  })}
                </span>
                <span className={`${_prefix}-label`}>
                  {t('applyFriendText')}
                </span>
              </div>
              <div className={`${_prefix}-state`}>
                <CheckCircleFilled className={`${_prefix}-state-icon`} />
                <span>{t('acceptResultText')}</span>
              </div>
            </>
          )
        case V2NIMConst.V2NIMFriendAddApplicationStatus
          .V2NIM_FRIEND_ADD_APPLICATION_STATUS_REJECTED:
          return isMeApplicant ? (
            <>
              <div className={`${_prefix}-flex`}>
                <ComplexAvatarContainer
                  account={applyMsg.recipientAccountId}
                  prefix={commonPrefix}
                  afterSendMsgClick={afterSendMsgClick}
                />
                <span className={`${_prefix}-name`}>
                  {store.uiStore.getAppellation({
                    account: applyMsg.recipientAccountId,
                  })}{' '}
                  {t('beRejectResultText')}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className={`${_prefix}-flex`}>
                <ComplexAvatarContainer
                  account={applyMsg.applicantAccountId}
                  prefix={commonPrefix}
                  afterSendMsgClick={afterSendMsgClick}
                />
                <span className={`${_prefix}-name`}>
                  {store.uiStore.getAppellation({
                    account: applyMsg.applicantAccountId,
                  })}
                </span>
              </div>
              <div className={`${_prefix}-state`}>
                <CloseCircleFilled className={`${_prefix}-state-icon`} />
                <span>{t('rejectResultText')}</span>
              </div>
            </>
          )
        case V2NIMConst.V2NIMFriendAddApplicationStatus
          .V2NIM_FRIEND_ADD_APPLICATION_STATUS_EXPIRED:
          return isMeApplicant ? null : (
            <>
              <div className={`${_prefix}-flex`}>
                <ComplexAvatarContainer
                  account={applyMsg.applicantAccountId}
                  prefix={commonPrefix}
                  afterSendMsgClick={afterSendMsgClick}
                />
                <span className={`${_prefix}-name`}>
                  {store.uiStore.getAppellation({
                    account: applyMsg.applicantAccountId,
                  })}
                </span>
                <span className={`${_prefix}-label`}>
                  {t('applyFriendText')}
                </span>
              </div>
              <div className={`${_prefix}-state`}>
                <CloseCircleFilled className={`${_prefix}-state-icon`} />
                <span>{t('expiredResultText')}</span>
              </div>
            </>
          )
        case V2NIMConst.V2NIMFriendAddApplicationStatus
          .V2NIM_FRIEND_ADD_APPLICATION_STATUS_INIT:
          return (
            <>
              <div className={`${_prefix}-flex`}>
                <ComplexAvatarContainer
                  account={applyMsg.applicantAccountId}
                  prefix={commonPrefix}
                  afterSendMsgClick={afterSendMsgClick}
                />
                <span className={`${_prefix}-name`}>
                  {store.uiStore.getAppellation({
                    account: applyMsg.applicantAccountId,
                  })}
                </span>
                <span className={`${_prefix}-label`}>
                  {t('applyFriendText')}
                </span>
              </div>
              <div className={`${_prefix}-flex`}>
                <Button
                  className={`${_prefix}-reject-btn`}
                  onClick={handleRejectApplyFriendClick}
                  loading={applyFriendLoading}
                >
                  {t('rejectText')}
                </Button>
                <Button
                  onClick={handleAcceptApplyFriendClick}
                  loading={applyFriendLoading}
                  type="primary"
                >
                  {t('acceptText')}
                </Button>
              </div>
            </>
          )
        default:
          return null
      }
    }

    const renderTeamJoinActionMsg = () => {
      // TODO 暂不支持群相关申请
      const teamJoinActionMsg = msg as V2NIMTeamJoinActionInfoForUI
      switch (teamJoinActionMsg.actionType) {
        case V2NIMConst.V2NIMTeamJoinActionType
          .V2NIM_TEAM_JOIN_ACTION_TYPE_APPLICATION:
          return null
        case V2NIMConst.V2NIMTeamJoinActionType
          .V2NIM_TEAM_JOIN_ACTION_TYPE_INVITATION:
          return null
        case V2NIMConst.V2NIMTeamJoinActionType
          .V2NIM_TEAM_JOIN_ACTION_TYPE_REJECT_APPLICATION:
          return null
        case V2NIMConst.V2NIMTeamJoinActionType
          .V2NIM_TEAM_JOIN_ACTION_TYPE_REJECT_INVITATION:
          return null
        default:
          return null
      }
    }

    return (
      <div
        className={_prefix}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {msg.messageType === TMsgItemType.FRIEND
          ? renderFriendApplyMsg()
          : renderTeamJoinActionMsg()}
      </div>
    )
  }
)
