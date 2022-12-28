import React, { ReactNode } from 'react'
import { Drawer } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

export interface ChatSettingDrawerProps {
  title: ReactNode
  visible: boolean
  onClose: () => void
  drawerContainer: any

  prefix?: string
}

const ChatSettingDrawer: React.FC<ChatSettingDrawerProps> = ({
  visible,
  onClose,
  drawerContainer,
  title,
  children,
  prefix = 'chat',
}) => {
  const _prefix = `${prefix}-setting-draw`
  // const SETTING_NAV_TITLE_MAP = {
  //   [CHAT_ACTION.chatSetting]: t('setText'),
  //   [CHAT_ACTION.chatRecord]: t('chatHistoryText'),
  // }

  // const initTitle =
  //   SETTING_NAV_TITLE_MAP[action] ||
  //   SETTING_NAV_TITLE_MAP[CHAT_ACTION.chatSetting]

  // const [titleText, setTitleText] = useState<string>(initTitle)
  // const [navHistoryStack, setNavHistoryStack] = useState<string[]>([])

  // const title = useMemo(() => {
  //   if (navHistoryStack.length > 1) {
  //     return (
  //       <span
  //         onClick={() => {
  //           const arrs = [...navHistoryStack]
  //           setNavHistoryStack(arrs.slice(0, arrs.length - 1))
  //         }}
  //       >
  //         <LeftOutlined
  //           style={{ cursor: 'pointer', marginRight: 10, fontSize: 14 }}
  //         />
  //         {titleText}
  //       </span>
  //     )
  //   }
  //   return initTitle
  // }, [navHistoryStack, initTitle, titleText])

  // const scene = useMemo(() => {
  //   return selectedSession.scene === 'team'
  //     ? CHAT_SETTING_TYPE.group
  //     : CHAT_SETTING_TYPE.person
  // }, [selectedSession])

  // const renderChatSetting = () => {
  //   if (scene === CHAT_SETTING_TYPE.person) {
  //     return (
  //       <ChatP2pSetting
  //         prefix={prefix}
  //         account={}
  //         nick={}
  //         onCreateGroupClick={onCreateGroupClick}
  //       />
  //     )
  //   }

  //   if (scene === CHAT_SETTING_TYPE.group) {
  //     return (
  //       <ChatTeamSetting
  //         prefix={prefix}
  //         commonPrefix={commonPrefix}
  //         memberList={memberList}
  //         isGroupOwner={isGroupOwner}
  //         isGroupManager={isGroupManager}
  //         onDismissTeam={onDismissTeam}
  //         onLeaveTeam={onLeaveTeam}
  //         onAddMembersClick={onAddMembersClick}
  //         onRemoveTeamMemberClick={onRemoveTeamMemberClick}
  //         afterSendMsgClick={afterSendMsgClick}
  //         onUpdateTeamInfoSubmit={onUpdateTeamInfoSubmit}
  //         onUpdateTeamPowerInfo={onUpdateTeamPowerInfo}
  //         navHistoryStack={navHistoryStack}
  //         setNavHistoryStack={setNavHistoryStack}
  //         teamInfo={teamInfo}
  //         initOptions={initOptions}
  //         setTitleText={setTitleText}
  //       />
  //     )
  //   }
  //   return null
  // }

  // const renderChatRecord = () => {
  //   return <></>
  // }

  return (
    <Drawer
      width={357}
      getContainer={false}
      className={`${_prefix}-wrap`}
      title={title}
      placement="right"
      closable={false}
      maskClosable={true}
      visible={visible}
      keyboard={true}
      onClose={onClose}
      extra={<CloseOutlined onClick={onClose} type="primary" />}
    >
      {/* {(() => {
        switch (action) {
          case CHAT_ACTION.chatSetting:
            return renderChatSetting()
          case CHAT_ACTION.chatRecord:
            return renderChatRecord()
          default:
            return null
        }
      })()} */}
      {children}
    </Drawer>
  )
}

export default ChatSettingDrawer
