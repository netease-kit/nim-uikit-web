import React, { FC } from 'react'
import {
  ComplexAvatarContainer,
  CrudeAvatar,
  useTranslation,
  useStateContext,
} from '../../../common'
import { Button } from 'antd'
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import { SystemMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SystemMessageServiceInterface'
import { observer } from 'mobx-react'

export interface MsgItemProps {
  msg: SystemMessage
  applyTeamLoaidng?: boolean
  teamInviteLoading?: boolean
  applyFriendLoading?: boolean
  onAcceptApplyTeamClick?: (options: { teamId: string; from: string }) => void
  onRejectApplyTeamClick?: (options: { teamId: string; from: string }) => void
  onAcceptTeamInviteClick?: (options: { teamId: string; from: string }) => void
  onRejectTeamInviteClick?: (options: { teamId: string; from: string }) => void
  onAcceptApplyFriendClick?: (account: string) => void
  onRejectApplyFriendClick?: (account: string) => void
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
      onRejectApplyTeamClick?.({
        teamId: msg.attach?.toTeam?.teamId,
        from: msg.attach?.fromUser?.account,
      })
    }

    const handleAcceptApplyTeamClick = () => {
      onAcceptApplyTeamClick?.({
        teamId: msg.attach?.toTeam?.teamId,
        from: msg.attach?.fromUser?.account,
      })
    }

    const handleRejectTeamInviteClick = () => {
      onRejectTeamInviteClick?.({
        teamId: msg.attach?.toTeam?.teamId,
        from: msg.attach?.fromUser?.account,
      })
    }

    const handleAcceptTeamInviteClick = () => {
      onAcceptTeamInviteClick?.({
        teamId: msg.attach?.toTeam?.teamId,
        from: msg.attach?.fromUser?.account,
      })
    }

    const handleRejectApplyFriendClick = () => {
      onRejectApplyFriendClick?.(msg.attach?.fromUser?.account)
    }

    const handleAcceptApplyFriendClick = () => {
      onAcceptApplyFriendClick?.(msg.attach?.fromUser?.account)
    }

    const renderMsg = () => {
      switch (msg.type) {
        case 'applyTeam':
          // 某人申请加入群聊
          return (
            <>
              <div className={`${_prefix}-flex`}>
                <CrudeAvatar
                  account={msg.attach?.toTeam?.teamId}
                  nick={msg.attach?.toTeam?.name}
                  avatar={msg.attach?.toTeam?.avatar}
                />
                <span className={`${_prefix}-label`}>
                  {store.uiStore.getAppellation({
                    account: msg.attach?.fromUser?.account,
                  })}{' '}
                  {t('applyTeamText')} “
                  {msg.attach?.toTeam?.name || msg.attach?.toTeam?.teamId}”
                </span>
              </div>
              {msg.state === 'pass' ? (
                <div className={`${_prefix}-state`}>
                  <CheckCircleFilled className={`${_prefix}-state-icon`} />
                  <span>{t('acceptResultText')}</span>
                </div>
              ) : msg.state === 'decline' ? (
                <div className={`${_prefix}-state`}>
                  <CloseCircleFilled className={`${_prefix}-state-icon`} />
                  <span>{t('rejectResultText')}</span>
                </div>
              ) : (
                <div className={`${_prefix}-flex`}>
                  <Button
                    className={`${_prefix}-reject-btn`}
                    onClick={handleRejectApplyTeamClick}
                    loading={applyTeamLoaidng}
                  >
                    {t('rejectText')}
                  </Button>
                  <Button
                    onClick={handleAcceptApplyTeamClick}
                    loading={applyTeamLoaidng}
                    type="primary"
                  >
                    {t('acceptText')}
                  </Button>
                </div>
              )}
            </>
          )
        case 'teamInvite':
          // 某人邀请你进群
          return (
            <>
              <div className={`${_prefix}-flex`}>
                <CrudeAvatar
                  account={msg.attach?.toTeam?.teamId}
                  nick={msg.attach?.toTeam?.name}
                  avatar={msg.attach?.toTeam?.avatar}
                />
                <span className={`${_prefix}-label`}>
                  {store.uiStore.getAppellation({
                    account: msg.attach?.fromUser?.account,
                  })}{' '}
                  {t('inviteTeamText')} “
                  {msg.attach?.toTeam?.name || msg.attach?.toTeam?.teamId}”
                </span>
              </div>
              {msg.state === 'pass' ? (
                <div className={`${_prefix}-state`}>
                  <CheckCircleFilled className={`${_prefix}-state-icon`} />
                  <span>{t('acceptResultText')}</span>
                </div>
              ) : msg.state === 'decline' ? (
                <div className={`${_prefix}-state`}>
                  <CloseCircleFilled className={`${_prefix}-state-icon`} />
                  <span>{t('rejectResultText')}</span>
                </div>
              ) : (
                <div className={`${_prefix}-flex`}>
                  <Button
                    className={`${_prefix}-reject-btn`}
                    onClick={handleRejectTeamInviteClick}
                    loading={teamInviteLoading}
                  >
                    {t('rejectText')}
                  </Button>
                  <Button
                    onClick={handleAcceptTeamInviteClick}
                    loading={teamInviteLoading}
                    type="primary"
                  >
                    {t('acceptText')}
                  </Button>
                </div>
              )}
            </>
          )
        case 'rejectTeamApply':
          // 管理员拒绝你的入群申请
          return (
            <>
              <div className={`${_prefix}-flex`}>
                <CrudeAvatar
                  account={msg.attach?.fromTeam?.teamId}
                  nick={msg.attach?.fromTeam?.name}
                  avatar={msg.attach?.fromTeam?.avatar}
                />
                <span className={`${_prefix}-name`}>
                  {msg.attach?.fromTeam?.name || msg.attach?.fromTeam?.teamId}
                </span>
              </div>
              <div className={`${_prefix}-state`}>
                <CloseCircleFilled className={`${_prefix}-state-icon`} />
                <span>{t('rejectResultText')}</span>
              </div>
            </>
          )
        case 'rejectTeamInvite':
          // 对方拒绝你的群邀请
          return (
            <>
              <div className={`${_prefix}-flex`}>
                <ComplexAvatarContainer
                  account={msg.attach?.fromUser?.account}
                  prefix={commonPrefix}
                  afterSendMsgClick={afterSendMsgClick}
                />
                <span className={`${_prefix}-name`}>
                  {store.uiStore.getAppellation({
                    account: msg.attach?.fromUser?.account,
                  })}{' '}
                  {t('rejectTeamInviteText')}
                </span>
              </div>
              {/* <div className={`${_prefix}-state`}>
              <CloseCircleFilled className={`${_prefix}-state-icon`} />
              <span>{t('rejectResultText')}</span>
            </div> */}
            </>
          )
        case 'friendRequest': {
          switch (msg.attach?.type) {
            case 'applyFriend':
              // 某人请求添加你为好友
              return (
                <>
                  <div className={`${_prefix}-flex`}>
                    <ComplexAvatarContainer
                      account={msg.attach?.fromUser?.account}
                      prefix={commonPrefix}
                      afterSendMsgClick={afterSendMsgClick}
                    />
                    <span className={`${_prefix}-name`}>
                      {store.uiStore.getAppellation({
                        account: msg.attach?.fromUser?.account,
                      })}
                    </span>
                    <span className={`${_prefix}-label`}>
                      {t('applyFriendText')}
                    </span>
                  </div>
                  {msg.state === 'pass' ? (
                    <div className={`${_prefix}-state`}>
                      <CheckCircleFilled className={`${_prefix}-state-icon`} />
                      <span>{t('acceptResultText')}</span>
                    </div>
                  ) : msg.state === 'decline' ? (
                    <div className={`${_prefix}-state`}>
                      <CloseCircleFilled className={`${_prefix}-state-icon`} />
                      <span>{t('rejectResultText')}</span>
                    </div>
                  ) : (
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
                  )}
                </>
              )
            case 'rejectFriendApply':
              // 对方拒绝了好友申请
              return (
                <>
                  <div className={`${_prefix}-flex`}>
                    <ComplexAvatarContainer
                      account={msg.attach?.fromUser?.account}
                      prefix={commonPrefix}
                      afterSendMsgClick={afterSendMsgClick}
                    />
                    <span className={`${_prefix}-name`}>
                      {store.uiStore.getAppellation({
                        account: msg.attach?.fromUser?.account,
                      })}{' '}
                      {t('beRejectResultText')}
                    </span>
                  </div>
                  {/* <div className={`${_prefix}-state`}>
                  <CloseCircleFilled className={`${_prefix}-state-icon`} />
                  <span>{t('beRejectResultText')}</span>
                </div> */}
                </>
              )
            case 'passFriendApply':
              // 对方同意了好友申请
              return (
                <>
                  <div className={`${_prefix}-flex`}>
                    <ComplexAvatarContainer
                      account={msg.attach?.fromUser?.account}
                      prefix={commonPrefix}
                      afterSendMsgClick={afterSendMsgClick}
                    />
                    <span className={`${_prefix}-name`}>
                      {store.uiStore.getAppellation({
                        account: msg.attach?.fromUser?.account,
                      })}{' '}
                      {t('passResultText')}
                    </span>
                  </div>
                </>
              )
            default:
              return null
          }
        }
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
        {renderMsg()}
      </div>
    )
  }
)
