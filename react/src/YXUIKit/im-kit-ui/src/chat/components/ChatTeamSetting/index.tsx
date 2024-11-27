import React, { FC, useState, useEffect, useMemo } from 'react'
import { Modal, Button, Input } from 'antd'
import {
  ExclamationCircleOutlined,
  RightOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  ComplexAvatarContainer,
  CrudeAvatar,
  useStateContext,
  useTranslation,
} from '../../../common'
import GroupDetail from './GroupDetail'
import GroupList from './GroupList'
import GroupPower from './GroupPower'
import { GroupSettingType } from '../../types'
import { GroupItemProps } from './GroupItem'
import {
  V2NIMTeam,
  V2NIMTeamMember,
  V2NIMUpdatedTeamInfo,
  V2NIMUpdateSelfMemberInfoParams,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService'
import { V2NIMConst } from 'nim-web-sdk-ng'

export interface HistoryStack {
  path: GroupSettingType
  title: string
}

export interface ChatTeamSettingProps {
  members: V2NIMTeamMember[]
  team: V2NIMTeam
  myAccount: string
  isGroupOwner: boolean
  isGroupManager: boolean
  navHistoryStack: HistoryStack[]

  onDismissTeam: () => void
  onLeaveTeam: () => void
  onAddMembersClick: () => void
  onTransferTeamClick: () => void
  onRemoveTeamMemberClick: (member: V2NIMTeamMember) => void
  onUpdateTeamInfo: (team: V2NIMUpdatedTeamInfo) => void
  onUpdateMyMemberInfo: (params: V2NIMUpdateSelfMemberInfoParams) => void
  onTeamMuteChange: (mute: boolean) => void
  afterSendMsgClick?: () => void
  setNavHistoryStack: (stack: HistoryStack[]) => void
  renderTeamMemberItem?: (
    params: GroupItemProps & {
      renderKey: string
      renderIndex: number
      renderStyle: React.CSSProperties
    }
  ) => JSX.Element | null | undefined

  prefix?: string
  commonPrefix?: string
}

const { confirm } = Modal

const ChatTeamSetting: FC<ChatTeamSettingProps> = ({
  members,
  team,
  myAccount,
  isGroupOwner,
  isGroupManager,
  navHistoryStack,
  onDismissTeam,
  onLeaveTeam,
  onAddMembersClick,
  onTransferTeamClick,
  onRemoveTeamMemberClick,
  onUpdateTeamInfo,
  onUpdateMyMemberInfo,
  onTeamMuteChange,
  afterSendMsgClick,
  setNavHistoryStack,
  renderTeamMemberItem,

  prefix = 'chat',
  commonPrefix = 'common',
}) => {
  const { localOptions } = useStateContext()
  const { t } = useTranslation()
  const _prefix = `${prefix}-group-setting`
  const [nickInTeam, setNickInTeam] = useState('')

  const path = navHistoryStack[navHistoryStack.length - 1]?.path || 'home'

  const GROUP_SETTING_NAV_TITLE: { [key in GroupSettingType]: string } =
    useMemo(
      () => ({
        home: t('setText'),
        list: t('teamMemberText'),
        detail: t('teamInfoText'),
        power: t('teamPowerText'),
      }),
      [t]
    )

  const handleStackPush = (path: GroupSettingType) => {
    setNavHistoryStack(
      navHistoryStack.concat({
        path,
        title: GROUP_SETTING_NAV_TITLE[path],
      })
    )
  }

  const handleChangeNickInTeam = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickInTeam(e.target.value.trim())
  }

  const handleUpdateMyMemberInfo = () => {
    onUpdateMyMemberInfo({
      teamNick: nickInTeam,
    })
  }

  const showDismissConfirm = () => {
    confirm({
      title: t('dismissTeamText'),
      icon: <ExclamationCircleOutlined />,
      content: t('dismissTeamConfirmText'),
      okText: t('okText'),
      cancelText: t('cancelText'),
      onOk() {
        onDismissTeam()
      },
    })
  }

  const showLeaveConfirm = () => {
    confirm({
      title: t('leaveTeamTitle'),
      icon: <ExclamationCircleOutlined />,
      content: t('leaveTeamConfirmText'),
      okText: t('okText'),
      cancelText: t('cancelText'),
      onOk() {
        onLeaveTeam()
      },
    })
  }

  const isOwnerOrManager = isGroupOwner || isGroupManager

  const hasUpdateTeamPower = useMemo(() => {
    if (
      team.updateInfoMode ===
        V2NIMConst.V2NIMTeamUpdateInfoMode
          .V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER &&
      isOwnerOrManager
    ) {
      return true
    }

    return (
      team.updateInfoMode ===
      V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
    )
  }, [team.updateInfoMode, isOwnerOrManager])

  const myMemberInfo = useMemo(() => {
    return (
      members.find((item) => item.accountId === myAccount) ||
      ({} as V2NIMTeamMember)
    )
  }, [myAccount, members])

  const teamManagers = useMemo(() => {
    return members.filter(
      (item) =>
        item.memberRole ===
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
    )
  }, [members])

  useEffect(() => {
    setNickInTeam(myMemberInfo.teamNick || '')
  }, [myMemberInfo.teamNick])

  useEffect(() => {
    if (!navHistoryStack.length) {
      handleStackPush('home')
    }
  }, [navHistoryStack])

  return (
    <div className={`${_prefix}-wrap`}>
      {path === 'home' ? (
        <>
          <div
            className={`${_prefix}-head ${_prefix}-item`}
            onClick={handleStackPush.bind(null, 'detail')}
          >
            <div className={`${_prefix}-head-info`}>
              <CrudeAvatar
                account={team.teamId}
                nick={team.name}
                avatar={team.avatar}
              />
              <span className={`${_prefix}-label`}>{team.name}</span>
            </div>
            <RightOutlined size={10} />
          </div>
          <div className={`${_prefix}-members ${_prefix}-item`}>
            <div
              className={`${_prefix}-members-info`}
              onClick={handleStackPush.bind(null, 'list')}
            >
              <div>
                <b>{t('teamMemberText')}</b>
                <span className={`${_prefix}-members-num`}>
                  ({members.length} ){t('personUnit')}
                </span>
              </div>
              {/* {groupList.length > 6 && <RightOutlined size={10} />} */}
              <RightOutlined size={10} />
            </div>
            <div className={`${_prefix}-members-list`}>
              <span
                className={`${_prefix}-add-icon`}
                onClick={onAddMembersClick}
              >
                <PlusOutlined style={{ fontSize: 14, color: '#C1C8D1' }} />
              </span>
              <span className={`${_prefix}-members-upload`}></span>
              {members.slice(0, 6).map((item) => {
                return (
                  <ComplexAvatarContainer
                    key={item.accountId}
                    prefix={commonPrefix}
                    account={item.accountId}
                    canClick={false}
                  />
                )
              })}
            </div>
          </div>
          <div className={`${_prefix}-item`}>
            <b>{t('nickInTeamText')}</b>
            <Input
              className={`${_prefix}-nickinteam`}
              value={nickInTeam}
              allowClear
              maxLength={15}
              onChange={handleChangeNickInTeam}
              onBlur={handleUpdateMyMemberInfo}
              placeholder={t('editNickInTeamText')}
            />
          </div>
          {team.teamType !== V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_INVALID &&
          isOwnerOrManager ? (
            <div
              className={`${_prefix}-power ${_prefix}-item`}
              onClick={handleStackPush.bind(null, 'power')}
            >
              <b>{t('teamPowerText')}</b>
              <RightOutlined size={10} />
            </div>
          ) : null}
        </>
      ) : (
        <>
          {path === 'detail' && (
            <GroupDetail
              team={team}
              hasPower={hasUpdateTeamPower}
              onUpdateTeamInfo={onUpdateTeamInfo}
              prefix={prefix}
              commonPrefix={commonPrefix}
            />
          )}
          {path === 'list' && (
            <GroupList
              members={members}
              myMemberInfo={myMemberInfo}
              onRemoveTeamMemberClick={onRemoveTeamMemberClick}
              afterSendMsgClick={afterSendMsgClick}
              renderTeamMemberItem={renderTeamMemberItem}
              prefix={prefix}
              commonPrefix={commonPrefix}
            />
          )}
          {path === 'power' && (
            <GroupPower
              onUpdateTeamInfo={onUpdateTeamInfo}
              onTeamMuteChange={onTeamMuteChange}
              team={team}
              managers={teamManagers}
              afterSendMsgClick={afterSendMsgClick}
              isGroupOwner={isGroupOwner}
              prefix={prefix}
            />
          )}
        </>
      )}
      {path === 'home' &&
        (isGroupOwner ? (
          <div className={`${_prefix}-group-operation`}>
            {localOptions.allowTransferTeamOwner && (
              <Button
                className={`${_prefix}-group-operation-item`}
                onClick={onTransferTeamClick}
                danger
              >
                {t('transferOwnerText')}
              </Button>
            )}
            <Button
              danger
              className={`${_prefix}-group-operation-item ${_prefix}-group-operation-dismiss`}
              onClick={showDismissConfirm}
            >
              {t('dismissTeamText')}
            </Button>
          </div>
        ) : (
          <Button
            danger
            className={`${_prefix}-exit-btn`}
            onClick={showLeaveConfirm}
          >
            {t('leaveTeamButtonText')}
          </Button>
        ))}
    </div>
  )
}

export default ChatTeamSetting
