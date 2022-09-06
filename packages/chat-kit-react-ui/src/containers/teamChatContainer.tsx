import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
} from 'react'
import ChatActionBar from '../components/ChatActionBar'
import ChatHeader from '../components/ChatHeader'
import MessageList, {
  RenderCustomMessageOptions,
} from '../components/ChatMessageList'
import MessageInput from '../components/ChatMessageInput'
import ChatSettingDrawer from '../components/ChatSettingDrawer'
import GroupAddMemebers from '../components/ChatAddMembers'
import { ChatAction } from '../types'
import {
  useStateContext,
  useTranslation,
  CrudeAvatar,
} from '@xkit-yx/common-ui'
import { LeftOutlined } from '@ant-design/icons'
import ChatTeamSetting, { HistoryStack } from '../components/ChatTeamSetting'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { debounce } from '@xkit-yx/utils'
import {
  IMMessage,
  TMsgScene,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { MenuItemKey } from '../components/ChatMessageItem'
import { message } from 'antd'
import { HISTORY_LIMIT } from '../constant'
import {
  Team,
  TeamMember,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { observer } from 'mobx-react'

export interface TeamChatContainerProps {
  scene: TMsgScene
  to: string
  renderCustomMessage?: (options: RenderCustomMessageOptions) => JSX.Element
  renderHeader?: (session: Session) => JSX.Element
  renderTeamInputPlaceHolder?: (params: {
    session: Session
    mute: boolean
  }) => string

  prefix?: string
  commonPrefix?: string
}

const TeamChatContainer: React.FC<TeamChatContainerProps> = observer(
  ({
    scene,
    to,
    renderCustomMessage,
    renderHeader,
    renderTeamInputPlaceHolder,

    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const { store, nim } = useStateContext()

    const { t } = useTranslation()

    const sessionId = `${scene}-${to}`

    const session = store.sessionStore.sessions.get(sessionId)

    const msgs = store.msgStore.getMsg(sessionId)

    const team: Team = store.teamStore.teams.get(to) || {
      teamId: to,
      type: 'normal',
      name: '',
      avatar: '',
      intro: '',
      announcement: '',
      joinMode: 'noVerify',
      beInviteMode: 'noVerify',
      inviteMode: 'manager',
      updateTeamMode: 'manager',
      updateExtMode: 'manager',
      owner: '',
      level: 0,
      memberNum: 0,
      memberUpdateTime: Date.now(),
      createTime: Date.now(),
      updateTime: Date.now(),
      ext: '',
      serverExt: '',
      valid: false,
      validToCurrentUser: false,
      mute: false,
      muteType: 'none',
    }

    const teamMembers = store.uiStore.getTeamMembers(to)

    const myUser = store.userStore.myUserInfo

    const teamNameOrTeamId = team?.name || team?.teamId || ''

    const isGroupOwner = myUser?.account === team.owner

    const isGroupManager = teamMembers
      .filter((item) => item.type === 'manager')
      .some((item) => item.account === myUser?.account)

    const teamMute = useMemo(() => {
      if (team.mute) {
        return !isGroupOwner && !isGroupManager
      }
      return team.mute
    }, [team.mute, isGroupOwner, isGroupManager])

    const messageListContainerDomRef = useRef<HTMLDivElement>(null)
    const settingDrawDomRef = useRef<HTMLDivElement>(null)

    // 以下是 UI 相关的 state，需要在切换会话时重置
    const [inputValue, setInputValue] = useState('')
    const [navHistoryStack, setNavHistoryStack] = useState<HistoryStack[]>([])
    const [action, setAction] = useState<ChatAction | undefined>(undefined)
    const [loadingMore, setLoadingMore] = useState(false)
    const [noMore, setNoMore] = useState(false)
    const [groupAddMembersVisible, setGroupAddMembersVisible] = useState(false)
    const [receiveMsgBtnVisible, setReceiveMsgBtnVisible] = useState(false)
    const [settingDrawerVisible, setSettingDrawerVisible] = useState(false)

    const SETTING_NAV_TITLE_MAP: { [key in ChatAction]: string } = useMemo(
      () => ({
        chatSetting: t('setText'),
        chatRecord: t('chatHistoryText'),
      }),
      [t]
    )

    const title = useMemo(() => {
      const defaultTitle = SETTING_NAV_TITLE_MAP[action || 'chatSetting']
      if (navHistoryStack.length > 1) {
        return (
          <span
            onClick={() => {
              setNavHistoryStack(
                navHistoryStack.slice(0, navHistoryStack.length - 1)
              )
            }}
          >
            <LeftOutlined
              style={{ cursor: 'pointer', marginRight: 10, fontSize: 14 }}
            />
            {navHistoryStack[navHistoryStack.length - 1]?.title || defaultTitle}
          </span>
        )
      }
      return <span>{defaultTitle}</span>
    }, [navHistoryStack, SETTING_NAV_TITLE_MAP, action])

    const onMsgListScrollHandler = debounce(async () => {
      if (messageListContainerDomRef.current) {
        if (
          // 滚动到最底部了
          messageListContainerDomRef.current.scrollTop >=
          messageListContainerDomRef.current.scrollHeight -
            messageListContainerDomRef.current.clientHeight -
            200
        ) {
          setReceiveMsgBtnVisible(false)
        } else if (
          // 滚动到顶部了
          messageListContainerDomRef.current.scrollTop < 10 &&
          !loadingMore &&
          !noMore
        ) {
          const _msg = msgs[0]
          if (_msg) {
            await getHistroy(_msg.time, _msg.idServer)
          }
        }
      }
    }, 100)

    const onActionClick = (action: ChatAction) => {
      setAction(action)
      setSettingDrawerVisible(true)
    }

    const onSettingDrawerClose = () => {
      setAction(undefined)
      setSettingDrawerVisible(false)
    }

    const onReeditClick = (body: string) => {
      setInputValue(body)
    }

    const onResend = async (msg: IMMessage) => {
      try {
        await store.msgStore.resendMsgActive(msg)
      } catch (error) {
        // message.error(t('sendMsgFailedText'))
      } finally {
        scrollToBottom()
      }
    }

    const onSendText = async (value: string) => {
      try {
        await store.msgStore.sendTextMsgActive({
          scene,
          to,
          body: value,
        })
      } catch (error) {
        // message.error(t('sendMsgFailedText'))
      } finally {
        scrollToBottom()
      }
    }

    const onSendFile = async (file: File) => {
      try {
        await store.msgStore.sendFileMsgActive({
          scene,
          to,
          file,
        })
      } catch (error) {
        // message.error(t('sendMsgFailedText'))
      } finally {
        scrollToBottom()
      }
    }

    const onSendImg = async (file: File) => {
      try {
        await store.msgStore.sendImageMsgActive({
          scene,
          to,
          file,
        })
      } catch (error) {
        // message.error(t('sendMsgFailedText'))
      } finally {
        scrollToBottom()
      }
    }

    const onMessageAction = async (key: MenuItemKey, msg: IMMessage) => {
      switch (key) {
        case 'delete':
          await store.msgStore.deleteMsgActive([msg])
          break
        case 'recall':
          await store.msgStore.reCallMsgActive(msg)
          break
        default:
          break
      }
    }

    const onDismissTeam = async () => {
      try {
        await store.teamStore.dismissTeamActive(team.teamId)
        message.success(t('dismissTeamSuccessText'))
      } catch (error) {
        message.error(t('dismissTeamFailedText'))
      }
    }

    const onLeaveTeam = async () => {
      try {
        await store.teamStore.leaveTeamActive(team.teamId)
        message.success(t('leaveTeamSuccessText'))
      } catch (error) {
        message.error(t('leaveTeamFailedText'))
      }
    }

    const onAddTeamMember = async (accounts: string[]) => {
      try {
        await store.teamMemberStore.addTeamMemberActive({
          teamId: team.teamId,
          accounts,
        })
        message.success(t('addTeamMemberSuccessText'))
        resetSettingState()
      } catch (error) {
        message.error(t('addTeamMemberFailedText'))
      }
    }

    const onRemoveTeamMember = async (member: TeamMember) => {
      try {
        await store.teamMemberStore.removeTeamMemberActive({
          teamId: team.teamId,
          accounts: [member.account],
        })
        message.success(t('removeTeamMemberSuccessText'))
      } catch (error) {
        message.error(t('removeTeamMemberFailedText'))
      }
    }

    const onUpdateTeamInfo = async (params: Partial<Team>) => {
      try {
        await store.teamStore.updateTeamActive({
          ...params,
          teamId: team.teamId,
        })
        message.success(t('updateTeamSuccessText'))
      } catch (error) {
        message.error(t('updateTeamFailedText'))
      }
    }

    const onTeamMuteChange = async (mute: boolean) => {
      try {
        await store.teamStore.muteTeamActive({
          teamId: team.teamId,
          mute,
        })
        message.success(
          mute ? t('muteAllTeamSuccessText') : t('unmuteAllTeamSuccessText')
        )
      } catch (error) {
        message.error(
          mute ? t('muteAllTeamFailedText') : t('unmuteAllTeamFailedText')
        )
      }
    }

    const resetSettingState = () => {
      setNavHistoryStack([])
      setAction(undefined)
      setGroupAddMembersVisible(false)
      setSettingDrawerVisible(false)
    }

    const resetState = () => {
      resetSettingState()
      setInputValue('')
      setLoadingMore(false)
      setNoMore(false)
      setReceiveMsgBtnVisible(false)
    }

    // 收消息，发消息时需要调用
    const scrollToBottom = () => {
      if (messageListContainerDomRef.current) {
        messageListContainerDomRef.current.scrollTop =
          messageListContainerDomRef.current.scrollHeight
      }
      setReceiveMsgBtnVisible(false)
    }

    const getHistroy = async (endTime: number, lastMsgId?: string) => {
      try {
        setLoadingMore(true)
        const historyMsgs = await store.msgStore.getHistoryMsgActive({
          sessionId,
          endTime,
          lastMsgId,
          limit: HISTORY_LIMIT,
        })
        setLoadingMore(false)
        if (historyMsgs.length < HISTORY_LIMIT) {
          setNoMore(true)
        }
      } catch (error) {
        setLoadingMore(false)
        message.error(t('getHistoryMsgFailedText'))
      }
    }

    // 切换会话时需要重新初始化
    useEffect(() => {
      resetState()
      getHistroy(Date.now()).then(() => {
        scrollToBottom()
      })
      store.teamStore.getTeamActive(to)
      store.teamMemberStore.getTeamMemberActive(to)
    }, [store.teamStore, store.teamMemberStore, to])

    useLayoutEffect(() => {
      const onMsg = (msg: IMMessage) => {
        if (messageListContainerDomRef.current && msg.sessionId === sessionId) {
          // 当收到消息时，如果已经往上滚动了，是不需要滚动到最底部的
          if (
            messageListContainerDomRef.current.scrollTop <
            messageListContainerDomRef.current.scrollHeight -
              messageListContainerDomRef.current.clientHeight -
              200
          ) {
            setReceiveMsgBtnVisible(true)
          } else {
            scrollToBottom()
          }
        }
      }

      nim.on('msg', onMsg)

      return () => {
        nim.off('msg', onMsg)
      }
    }, [nim, sessionId])

    return (
      <div className={`${prefix}-wrap`}>
        <div ref={settingDrawDomRef} className={`${prefix}-content`}>
          {renderHeader ? (
            renderHeader(session!)
          ) : (
            <ChatHeader
              prefix={prefix}
              title={teamNameOrTeamId}
              subTitle={`(${teamMembers.length} 人)`}
              avatar={
                <CrudeAvatar
                  account={team.teamId}
                  nick={team.name}
                  avatar={team.avatar}
                />
              }
            />
          )}
          <MessageList
            prefix={prefix}
            commonPrefix={commonPrefix}
            ref={messageListContainerDomRef}
            msgs={msgs}
            noMore={noMore}
            loadingMore={loadingMore}
            myAccount={myUser?.account || ''}
            receiveMsgBtnVisible={receiveMsgBtnVisible}
            onReceiveMsgBtnClick={scrollToBottom}
            onResend={onResend}
            onMessageAction={onMessageAction}
            onReeditClick={onReeditClick}
            onScroll={onMsgListScrollHandler}
            renderCustomMessage={renderCustomMessage}
          />

          <MessageInput
            prefix={prefix}
            placeholder={
              renderTeamInputPlaceHolder
                ? renderTeamInputPlaceHolder({
                    session: session!,
                    mute: teamMute,
                  })
                : teamMute
                ? t('teamMutePlaceholder')
                : `${t('sendToText')} ${teamNameOrTeamId}${t('sendUsageText')}`
            }
            inputValue={inputValue}
            mute={teamMute}
            uploadImageLoading={store.uiStore.uploadImageLoading}
            uploadFileLoading={store.uiStore.uploadFileLoading}
            setInputValue={setInputValue}
            onSendText={onSendText}
            onSendFile={onSendFile}
            onSendImg={onSendImg}
          />
          <ChatSettingDrawer
            prefix={prefix}
            visible={settingDrawerVisible}
            drawerContainer={settingDrawDomRef}
            onClose={onSettingDrawerClose}
            title={title}
          >
            <ChatTeamSetting
              members={teamMembers}
              team={team}
              myAccount={myUser?.account || ''}
              isGroupManager={isGroupManager}
              isGroupOwner={isGroupOwner}
              navHistoryStack={navHistoryStack}
              setNavHistoryStack={setNavHistoryStack}
              afterSendMsgClick={resetSettingState}
              onAddMembersClick={() => {
                setGroupAddMembersVisible(true)
              }}
              onDismissTeam={onDismissTeam}
              onLeaveTeam={onLeaveTeam}
              onRemoveTeamMemberClick={onRemoveTeamMember}
              onUpdateTeamInfo={onUpdateTeamInfo}
              onTeamMuteChange={onTeamMuteChange}
              prefix={prefix}
              commonPrefix={commonPrefix}
            />
          </ChatSettingDrawer>
        </div>
        <ChatActionBar
          prefix={prefix}
          action={action}
          onActionClick={onActionClick}
        />
        <GroupAddMemebers
          defaultAccounts={teamMembers
            .filter((item) => item.account !== myUser?.account)
            .map((item) => item.account)}
          visible={groupAddMembersVisible}
          onGroupAddMembers={onAddTeamMember}
          onCancel={() => {
            setGroupAddMembersVisible(false)
          }}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
      </div>
    )
  }
)

export default TeamChatContainer
