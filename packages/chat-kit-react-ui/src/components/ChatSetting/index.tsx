import React, { useState, useMemo } from 'react'
import { Drawer } from 'antd'
import { CloseOutlined, LeftOutlined } from '@ant-design/icons'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { NIMInitializeOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import { ITeamInfo } from '../../types'
import { CHAT_ACTION, CHAT_SETTING_TYPE } from '../../constant'
import GroupContainer from '../ChatGroup'
import PersonContainer from '../ChatPerson'
import { useTranslation } from '@xkit-yx/common-ui'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'

export interface SettingModalProps {
  prefix?: string
  commonPrefix?: string
  visible: boolean
  onClose: () => void
  memberList: NimKitCoreTypes.ITeamMemberInfo[]
  selectedSession: NimKitCoreTypes.ISession
  teamInfo: ITeamInfo
  myUserInfo: UserNameCard
  initOptions: NIMInitializeOptions
  drawerContainer: React.RefObject<HTMLDivElement>
  onAddMembersClick: () => void
  onRemoveTeamMemberClick: (memberInfo: NimKitCoreTypes.ITeamMemberInfo) => void
  afterSendMsgClick: () => void
  onUpdateTeamInfoSubmit: (formValues) => void
  onUpdateTeamPowerInfo: (type: string, checked: boolean) => void
  onDismissTeam: () => void
  onLeaveTeam: () => void
  onCreateGroupClick: () => void
  action: string
  setAction: React.Dispatch<React.SetStateAction<string>>
  isGroupOwner: boolean
  isGroupManager: boolean
}

const ChatSetting: React.FC<SettingModalProps> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  visible = false,
  onClose,
  memberList = [],
  selectedSession,
  teamInfo,
  myUserInfo,
  initOptions,
  drawerContainer,
  onAddMembersClick,
  onRemoveTeamMemberClick,
  afterSendMsgClick,
  onDismissTeam,
  onLeaveTeam,
  onCreateGroupClick,
  onUpdateTeamInfoSubmit,
  onUpdateTeamPowerInfo,
  action,
  isGroupOwner,
  isGroupManager,
}) => {
  const { t } = useTranslation()
  const _prefix = `${prefix}-setting-draw`

  const SETTING_NAV_TITLE_MAP = {
    [CHAT_ACTION.chatSetting]: t('setText'),
    [CHAT_ACTION.chatRecord]: t('chatHistoryText'),
  }

  const initTitle =
    SETTING_NAV_TITLE_MAP[action] ||
    SETTING_NAV_TITLE_MAP[CHAT_ACTION.chatSetting]

  const [titleText, setTitleText] = useState<string>(initTitle)
  const [navHistoryStack, setNavHistoryStack] = useState<string[]>([])

  const title = useMemo(() => {
    if (navHistoryStack.length > 1) {
      return (
        <span
          onClick={() => {
            const arrs = [...navHistoryStack]
            setNavHistoryStack(arrs.slice(0, arrs.length - 1))
          }}
        >
          <LeftOutlined
            style={{ cursor: 'pointer', marginRight: 10, fontSize: 14 }}
          />
          {titleText}
        </span>
      )
    }
    return initTitle
  }, [navHistoryStack, initTitle, titleText])

  const scene = useMemo(() => {
    return selectedSession.scene === 'team'
      ? CHAT_SETTING_TYPE.group
      : CHAT_SETTING_TYPE.person
  }, [selectedSession])

  const renderChatSetting = () => {
    if (scene === CHAT_SETTING_TYPE.person) {
      return (
        <PersonContainer
          prefix={prefix}
          myUserInfo={myUserInfo}
          onCreateGroupClick={onCreateGroupClick}
        />
      )
    }

    if (scene === CHAT_SETTING_TYPE.group) {
      return (
        <GroupContainer
          prefix={prefix}
          commonPrefix={commonPrefix}
          memberList={memberList}
          isGroupOwner={isGroupOwner}
          isGroupManager={isGroupManager}
          onDismissTeam={onDismissTeam}
          onLeaveTeam={onLeaveTeam}
          onAddMembersClick={onAddMembersClick}
          onRemoveTeamMemberClick={onRemoveTeamMemberClick}
          afterSendMsgClick={afterSendMsgClick}
          onUpdateTeamInfoSubmit={onUpdateTeamInfoSubmit}
          onUpdateTeamPowerInfo={onUpdateTeamPowerInfo}
          navHistoryStack={navHistoryStack}
          setNavHistoryStack={setNavHistoryStack}
          teamInfo={teamInfo}
          initOptions={initOptions}
          setTitleText={setTitleText}
        />
      )
    }
    return null
  }

  const renderChatRecord = () => {
    return <></>
  }

  return (
    <Drawer
      width={357}
      getContainer={drawerContainer.current!}
      className={`${_prefix}-wrap`}
      title={title}
      placement="right"
      closable={false}
      maskClosable={true}
      visible={visible}
      keyboard={true}
      onClose={onClose}
      extra={<CloseOutlined onClick={() => onClose()} type="primary" />}
    >
      {(() => {
        switch (action) {
          case CHAT_ACTION.chatSetting:
            return renderChatSetting()
          case CHAT_ACTION.chatRecord:
            return renderChatRecord()
          default:
            return null
        }
      })()}
    </Drawer>
  )
}

export default ChatSetting
