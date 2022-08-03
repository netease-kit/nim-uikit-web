import React, { FC, useState, useEffect, useMemo } from 'react'
import { Modal, Button } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { RightOutlined, PlusOutlined } from '@ant-design/icons'
import { CrudeAvatar, useTranslation } from '@xkit-yx/common-ui'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { NIMInitializeOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import { ITeamInfo } from '../../types'
import GroupDetail from './GroupDetail'
import GroupList from './GroupList'
import GroupPower from './GroupPower'
import { GROUP_SETTING_TYPE } from '../../constant'

export interface GroupContainerProps {
  prefix?: string
  commonPrefix?: string
  memberList: NimKitCoreTypes.ITeamMemberInfo[]
  teamInfo: ITeamInfo
  initOptions: NIMInitializeOptions
  onDismissTeam: () => void
  onLeaveTeam: () => void
  onAddMembersClick: () => void
  onRemoveTeamMemberClick: (memberInfo: NimKitCoreTypes.ITeamMemberInfo) => void
  afterSendMsgClick?: () => void
  onUpdateTeamInfoSubmit: (formValues) => void
  onUpdateTeamPowerInfo: (type: string, checked: boolean) => void
  setNavHistoryStack: React.Dispatch<React.SetStateAction<string[]>>
  navHistoryStack: string[]
  setTitleText: (title: string) => void
  isGroupOwner: boolean
  isGroupManager: boolean
}

const { confirm } = Modal

export const GroupContainer: FC<GroupContainerProps> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  memberList,
  onDismissTeam,
  onLeaveTeam,
  onAddMembersClick,
  onRemoveTeamMemberClick,
  afterSendMsgClick,
  onUpdateTeamInfoSubmit,
  onUpdateTeamPowerInfo,
  teamInfo,
  initOptions,
  navHistoryStack,
  setNavHistoryStack,
  setTitleText,
  isGroupOwner,
  isGroupManager,
}) => {
  const { t } = useTranslation()
  const _prefix = `${prefix}-group-setting`

  const [groupType, setGroupType] = useState<string>(GROUP_SETTING_TYPE.home)
  const GROUP_SETTING_NAV_TITLE = {
    [GROUP_SETTING_TYPE.home]: t('setText'),
    [GROUP_SETTING_TYPE.list]: t('teamMemberText'),
    [GROUP_SETTING_TYPE.detail]: t('teamInfoText'),
    [GROUP_SETTING_TYPE.power]: t('teamPowerText'),
  }

  const onClickGroupItem = (scene: string) => {
    setGroupType(scene)
    setNavHistoryStack(navHistoryStack.concat(scene))
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

  const hasUpdateTeamModePower = useMemo(() => {
    if (
      teamInfo.updateTeamMode === 'manager' &&
      (isGroupOwner || isGroupManager)
    ) {
      return true
    }
    return teamInfo.updateTeamMode === 'all'
  }, [teamInfo, isGroupOwner, isGroupManager])

  const list = useMemo(() => {
    if (!memberList.length) {
      return []
    }
    const finList = [...memberList]
    const index = finList.findIndex((item) => item.type === 'owner')
    const owner = finList.splice(index, 1)[0]
    finList.sort((a, b) =>
      a.type === 'manager' || b.type === 'manager' ? 1 : -1
    )
    finList.unshift(owner)
    return finList
  }, [memberList])

  useEffect(() => {
    if (!navHistoryStack.length) {
      setNavHistoryStack(navHistoryStack.concat(GROUP_SETTING_TYPE.home))
    }
    setGroupType(
      navHistoryStack[navHistoryStack.length - 1] || GROUP_SETTING_TYPE.home
    )
  }, [navHistoryStack, setNavHistoryStack])

  return (
    <div className={`${_prefix}-wrap`}>
      {groupType === GROUP_SETTING_TYPE.home ? (
        <>
          <div
            className={`${_prefix}-head ${_prefix}-item`}
            onClick={() => {
              setTitleText(GROUP_SETTING_NAV_TITLE[GROUP_SETTING_TYPE.detail])
              onClickGroupItem(GROUP_SETTING_TYPE.detail)
            }}
          >
            <div className={`${_prefix}-head-info`}>
              <CrudeAvatar
                size={36}
                avatar={teamInfo.avatar}
                nick={teamInfo.name}
                account={''}
              />
              <span className={`${_prefix}-label`}>{teamInfo.name}</span>
            </div>
            <RightOutlined size={10} />
          </div>
          <div className={`${_prefix}-members ${_prefix}-item`}>
            <div
              className={`${_prefix}-members-info`}
              onClick={() => {
                setTitleText(GROUP_SETTING_NAV_TITLE[GROUP_SETTING_TYPE.list])
                onClickGroupItem(GROUP_SETTING_TYPE.list)
              }}
            >
              <div>
                <b>{t('teamMemberText')}</b>
                <span className={`${_prefix}-members-num`}>
                  ({list.length} ){t('personUnit')}
                </span>
              </div>
              {/* {groupList.length > 6 && <RightOutlined size={10} />} */}
              <RightOutlined size={10} />
            </div>
            <div className={`${_prefix}-members-list`}>
              <span
                className={`${_prefix}-add-icon`}
                onClick={() => onAddMembersClick()}
              >
                <PlusOutlined style={{ fontSize: 14, color: '#C1C8D1' }} />
              </span>
              <span className={`${_prefix}-members-upload`}></span>
              {list.slice(0, 6).map((item) => {
                return (
                  <CrudeAvatar
                    size={36}
                    key={item.id}
                    nick={item.nick || item.nickInTeam}
                    avatar={item.avatar}
                    account={''}
                  />
                )
              })}
            </div>
          </div>
          <div
            className={`${_prefix}-power ${_prefix}-item`}
            onClick={() => {
              setTitleText(GROUP_SETTING_NAV_TITLE[GROUP_SETTING_TYPE.power])
              onClickGroupItem(GROUP_SETTING_TYPE.power)
            }}
          >
            <b>{t('teamPowerText')}</b>
            <RightOutlined size={10} />
          </div>
        </>
      ) : (
        <>
          {groupType === GROUP_SETTING_TYPE.detail && (
            <GroupDetail
              prefix={prefix}
              commonPrefix={commonPrefix}
              teamInfo={teamInfo}
              initOptions={initOptions}
              isGroupOwner={isGroupOwner}
              isGroupManager={isGroupManager}
              hasUpdateTeamModePower={hasUpdateTeamModePower}
              onUpdateTeamInfoSubmit={onUpdateTeamInfoSubmit}
            />
          )}
          {groupType === GROUP_SETTING_TYPE.list && (
            <GroupList
              prefix={prefix}
              commonPrefix={commonPrefix}
              teamInfo={teamInfo}
              list={list}
              initOptions={initOptions}
              onRemoveTeamMemberClick={onRemoveTeamMemberClick}
              afterSendMsgClick={afterSendMsgClick}
            />
          )}
          {groupType === GROUP_SETTING_TYPE.power && (
            <GroupPower
              prefix={prefix}
              onUpdateTeamPowerInfo={onUpdateTeamPowerInfo}
              teamInfo={teamInfo}
              isGroupOwner={isGroupOwner}
              isGroupManager={isGroupManager}
            />
          )}
        </>
      )}
      {groupType === GROUP_SETTING_TYPE.home &&
        (isGroupOwner ? (
          <Button
            danger
            className={`${_prefix}-exit-btn`}
            onClick={() => showDismissConfirm()}
          >
            {t('dismissTeamText')}
          </Button>
        ) : (
          <Button
            danger
            className={`${_prefix}-exit-btn`}
            onClick={() => showLeaveConfirm()}
          >
            {t('leaveTeamButtonText')}
          </Button>
        ))}
    </div>
  )
}

export default GroupContainer
