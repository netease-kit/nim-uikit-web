import React, { useRef, useEffect } from 'react'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import ChatActionBar from './components/ChatActionBar'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/ChatMessageList'
import MessageInput from './components/ChatMessageInput'
import ChatSetting from './components/ChatSetting'
import GroupAddMemebers from './components/ChatAddMembers'
import GroupCreate from './components/ChatCreateTeam'
import classNames from 'classnames'
import { Spin } from 'antd'
import { SCROLL_MSG_TYPE } from './constant'
import { debounce } from '@xkit-yx/utils'
import { NIMInitializeOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import { ISendProps, ITeamInfo, IMessage, IMMessageInfo } from './types'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { IMessageCbProps } from './components/ChatMessageList'

export type ChatKitProps = {
  prefix?: string
  commonPrefix?: string
  messages: IMessage[]
  scrollMsgType: string
  memberList: NimKitCoreTypes.ITeamMemberInfo[]
  selectedSession: NimKitCoreTypes.ISession
  teamInfo: ITeamInfo
  myUserInfo: UserNameCard
  msgLoading: boolean
  uploadImageLoading: boolean
  uploadFileLoading: boolean
  msgNoData: boolean
  initOptions: NIMInitializeOptions
  inputValue: string
  isGroupOwner: boolean
  isGroupManager: boolean
  headerTitle: string
  headerSubTitle: string
  placeholder: string
  className?: string
  selectedAddMembersList: string[]
  setSelectedAddMembersList: React.Dispatch<
    React.SetStateAction<NimKitCoreTypes.IFriendInfo[]>
  >
  selectedCreateTeamMembersList: string[]
  setSelectedCreateTeamMembersList: React.Dispatch<
    React.SetStateAction<NimKitCoreTypes.IFriendInfo[]>
  >
  onChange?: (val: string) => void
  onSend: (props: ISendProps) => void
  groupCreateVisible: boolean
  setGroupCreateVisible: React.Dispatch<React.SetStateAction<boolean>>
  groupAddMembersVisible: boolean
  setGroupAddMembersVisible: React.Dispatch<React.SetStateAction<boolean>>
  resetSettingAction: () => void
  settingBarVisible: boolean
  setSettingBarVisible: React.Dispatch<React.SetStateAction<boolean>>
  currentActionIndex: number
  setCurrentActionIndex: React.Dispatch<React.SetStateAction<number>>
  action: string
  setAction: React.Dispatch<React.SetStateAction<string>>
  onGroupCreate: (formValues) => void
  onDismissTeam: () => void
  onLeaveTeam: () => void
  onGroupAddMembers: () => void
  onRemoveTeamMemberClick: (memberInfo: NimKitCoreTypes.ITeamMemberInfo) => void
  onUpdateTeamInfoSubmit: (formValues) => void
  onUpdateTeamPowerInfo: (type: string, checked: boolean) => void
  getHistoryMsgs: (msg: IMMessageInfo) => void
  chatMsgPos: number
  setChatMsgPos: React.Dispatch<React.SetStateAction<number>>
  renderHeader?: (selectedSession: NimKitCoreTypes.ISession) => JSX.Element
  renderPlaceHolder?: () => string
  // renderUserProfile?: () => JSX.Element
  renderCustomMessage?: (
    options: { msg: IMessage } & IMessageCbProps
  ) => JSX.Element
} & IMessageCbProps

const ChatKit: React.FC<ChatKitProps> = ({
  prefix = 'chat',
  commonPrefix = 'common',
  className,
  onSend,
  onChange,
  selectedSession,
  teamInfo,
  myUserInfo,
  msgLoading,
  uploadImageLoading,
  uploadFileLoading,
  msgNoData,
  initOptions,
  inputValue,
  isGroupOwner,
  isGroupManager,
  headerTitle,
  headerSubTitle,
  placeholder,
  selectedAddMembersList,
  setSelectedAddMembersList,
  selectedCreateTeamMembersList,
  setSelectedCreateTeamMembersList,
  groupCreateVisible,
  setGroupCreateVisible,
  groupAddMembersVisible,
  setGroupAddMembersVisible,
  resetSettingAction,
  settingBarVisible,
  setSettingBarVisible,
  currentActionIndex,
  setCurrentActionIndex,
  onMessageAction,
  onGroupCreate,
  onGroupAddMembers,
  onRemoveTeamMemberClick,
  onUpdateTeamInfoSubmit,
  onUpdateTeamPowerInfo,
  getHistoryMsgs,
  action,
  setAction,
  onDismissTeam,
  onLeaveTeam,
  onResend,
  onReeditClick,
  messages = [],
  scrollMsgType,
  memberList,
  chatMsgPos,
  setChatMsgPos,
  renderHeader,
  renderPlaceHolder,
  renderCustomMessage,
}) => {
  const messageListContainerDomRef = useRef<HTMLDivElement>(null)
  const messageListDomRef = useRef<HTMLDivElement>(null)
  const settingDrawDomRef = useRef<HTMLDivElement>(null)

  const onMsgListScrollHandler = () => {
    const dom = messageListContainerDomRef.current
    if ((dom?.scrollTop as number) < 10 && !msgLoading && !msgNoData) {
      const finMsg = messages[0]
      finMsg && getHistoryMsgs(finMsg as IMMessageInfo)
    }
  }

  useEffect(() => {
    if (msgLoading) {
      return
    }
    if (!messages.length) {
      setChatMsgPos(0)
      return
    }
    switch (scrollMsgType) {
      case SCROLL_MSG_TYPE.send:
      case SCROLL_MSG_TYPE.receive:
        messageListContainerDomRef.current?.scrollTo(
          0,
          messageListContainerDomRef.current?.scrollHeight
        )
        break
      case SCROLL_MSG_TYPE.history:
        messageListContainerDomRef.current?.scrollTo(
          0,
          messageListContainerDomRef.current?.scrollHeight - chatMsgPos
        )
        break
      case SCROLL_MSG_TYPE.resend:
      case SCROLL_MSG_TYPE.recall:
      case SCROLL_MSG_TYPE.delete:
        break
    }
    setChatMsgPos(messageListContainerDomRef.current?.scrollHeight || 0)
    // chatMsgPos存储的是上一次内容的高度，来进行历史及记录滚动位置计算，因此不能填入依赖项
  }, [messages.length, scrollMsgType, msgLoading])

  return (
    <div className={classNames(className, `${prefix}-wrap`)}>
      <div ref={settingDrawDomRef} className={`${prefix}-content`}>
        {renderHeader ? (
          renderHeader(selectedSession)
        ) : (
          <ChatHeader
            prefix={prefix}
            title={headerTitle}
            subTitle={headerSubTitle}
            selectedSession={selectedSession}
          />
        )}

        <div
          className={`${prefix}-message-list`}
          ref={messageListContainerDomRef}
          onScroll={debounce(onMsgListScrollHandler, 100)}
        >
          <div className={`${prefix}-message-tip`}>
            {msgLoading && <Spin />}
            {msgNoData && <>没有更多数据了</>}
          </div>
          {
            <MessageList
              prefix={prefix}
              commonPrefix={commonPrefix}
              ref={messageListDomRef}
              messages={messages}
              selectedSession={selectedSession}
              account={initOptions.account}
              onMessageAction={onMessageAction}
              onResend={onResend}
              onReeditClick={onReeditClick}
              renderCustomMessage={renderCustomMessage}
            />
          }
        </div>
        <div className={`${prefix}-message-input`}>
          <MessageInput
            prefix={prefix}
            onSend={onSend}
            onChange={onChange}
            isGroupOwner={isGroupOwner}
            isGroupManager={isGroupManager}
            inputValue={inputValue}
            selectedSession={selectedSession}
            teamInfo={teamInfo}
            uploadImageLoading={uploadImageLoading}
            uploadFileLoading={uploadFileLoading}
            initOptions={initOptions}
            placeholder={renderPlaceHolder ? renderPlaceHolder() : placeholder}
          />
        </div>
        <ChatSetting
          prefix={prefix}
          commonPrefix={commonPrefix}
          action={action}
          setAction={setAction}
          visible={settingBarVisible}
          isGroupOwner={isGroupOwner}
          isGroupManager={isGroupManager}
          selectedSession={selectedSession}
          teamInfo={teamInfo}
          myUserInfo={myUserInfo}
          memberList={memberList}
          initOptions={initOptions}
          drawerContainer={settingDrawDomRef}
          onClose={resetSettingAction}
          onCreateGroupClick={() => {
            // 单聊创建群添加选中的人
            setSelectedCreateTeamMembersList([memberList[0]])
            setGroupCreateVisible(true)
          }}
          onAddMembersClick={() => {
            setGroupAddMembersVisible(true)
          }}
          afterSendMsgClick={resetSettingAction}
          onRemoveTeamMemberClick={onRemoveTeamMemberClick}
          onUpdateTeamInfoSubmit={onUpdateTeamInfoSubmit}
          onUpdateTeamPowerInfo={onUpdateTeamPowerInfo}
          onDismissTeam={onDismissTeam}
          onLeaveTeam={onLeaveTeam}
        />
      </div>
      <ChatActionBar
        prefix={prefix}
        currentActionIndex={currentActionIndex}
        setCurrentActionIndex={setCurrentActionIndex}
        onSettingBtnClick={(action) => {
          setAction(action)
          setSettingBarVisible(true)
        }}
      />
      <GroupAddMemebers
        prefix={prefix}
        commonPrefix={commonPrefix}
        visible={groupAddMembersVisible}
        selectedSession={selectedSession}
        selectedAccounts={selectedAddMembersList}
        setSelectedAccounts={setSelectedAddMembersList}
        onGroupAddMembers={onGroupAddMembers}
        onCancel={() => {
          setGroupAddMembersVisible(false)
        }}
      />
      <GroupCreate
        prefix={prefix}
        commonPrefix={commonPrefix}
        visible={groupCreateVisible}
        selectedAccounts={selectedCreateTeamMembersList}
        setSelectedAccounts={setSelectedCreateTeamMembersList}
        onGroupCreate={onGroupCreate}
        onCancel={() => {
          setGroupCreateVisible(false)
        }}
      />
    </div>
  )
}

export default ChatKit
