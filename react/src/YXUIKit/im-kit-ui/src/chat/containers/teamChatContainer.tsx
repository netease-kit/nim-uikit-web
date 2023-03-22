import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
} from 'react'
import ChatActionBar from '../components/ChatActionBar'
import ChatHeader from '../components/ChatHeader'
import ChatTeamMessageList, {
  RenderTeamCustomMessageOptions,
} from '../components/ChatTeamMessageList'
import MessageInput from '../components/ChatMessageInput'
import ChatSettingDrawer from '../components/ChatSettingDrawer'
import GroupAddMemebers from '../components/ChatAddMembers'
import { ChatAction } from '../types'
import { useStateContext, useTranslation, CrudeAvatar } from '../../common'
import { LeftOutlined } from '@ant-design/icons'
import { Action } from '../Container'
import ChatTeamSetting, { HistoryStack } from '../components/ChatTeamSetting'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { debounce, VisibilityObserver } from '@xkit-yx/utils'
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
  UpdateMyMemberInfoOptions,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { observer } from 'mobx-react'
import { GroupItemProps } from '../components/ChatTeamSetting/GroupItem'

export interface TeamChatContainerProps {
  scene: TMsgScene
  to: string
  actions?: Action[]
  teamMsgReceiptVisible?: boolean
  onSendText?: (data: {
    value: string
    scene: TMsgScene
    to: string
  }) => Promise<void>
  renderTeamCustomMessage?: (
    options: RenderTeamCustomMessageOptions
  ) => JSX.Element | null | undefined
  renderHeader?: (session: Session) => JSX.Element
  renderTeamInputPlaceHolder?: (params: {
    session: Session
    mute: boolean
  }) => string
  renderTeamMemberItem?: (
    params: GroupItemProps
  ) => JSX.Element | null | undefined
  renderMessageAvatar?: (msg: IMMessage) => JSX.Element | null | undefined
  renderMessageName?: (msg: IMMessage) => JSX.Element | null | undefined

  prefix?: string
  commonPrefix?: string
}

const TeamChatContainer: React.FC<TeamChatContainerProps> = observer(
  ({
    scene,
    to,
    actions,
    teamMsgReceiptVisible,
    onSendText: onSendTextFromProps,
    renderTeamCustomMessage,
    renderHeader,
    renderTeamInputPlaceHolder,
    renderTeamMemberItem,
    renderMessageAvatar,
    renderMessageName,

    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const { store, nim } = useStateContext()

    const { t } = useTranslation()

    const sessionId = `${scene}-${to}`

    const session = store.sessionStore.sessions.get(sessionId)

    const msgs = store.msgStore.getMsg(sessionId)

    const replyMsg = store.msgStore.replyMsgs.get(sessionId)

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

    const teamMembers = store.uiStore.getTeamMembersWithAlias(to)

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

    const teamDefaultAddMembers = useMemo(() => {
      return teamMembers
        .filter((item) => item.account !== myUser?.account)
        .map((item) => item.account)
    }, [teamMembers, myUser?.account])

    const messageListContainerDomRef = useRef<HTMLDivElement>(null)
    const settingDrawDomRef = useRef<HTMLDivElement>(null)

    const visibilityObserver = useMemo(() => {
      return new VisibilityObserver!({
        root: messageListContainerDomRef.current,
      })
    }, [to])

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
          const _msg = msgs.filter(
            (item) =>
              !(
                item.type === 'custom' &&
                ['beReCallMsg', 'reCallMsg'].includes(item.attach?.type || '')
              )
          )[0]
          if (_msg) {
            await getHistroy(_msg.time, _msg.idServer)
          }
          // 滚动到加载的那条消息
          document.getElementById(_msg.idClient)?.scrollIntoView()
        }
      }
    }, 300)

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
        if (onSendTextFromProps) {
          await onSendTextFromProps({
            value,
            scene,
            to,
          })
        } else {
          await store.msgStore.sendTextMsgActive({
            scene,
            to,
            body: value,
          })
        }
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

    const onRemoveReplyMsg = () => {
      replyMsg && store.msgStore.reomveReplyMsgActive(replyMsg.sessionId)
    }

    const onMessageAction = async (key: MenuItemKey, msg: IMMessage) => {
      switch (key) {
        case 'delete':
          await store.msgStore.deleteMsgActive([msg])
          break
        case 'recall':
          await store.msgStore.reCallMsgActive(msg)
          break
        case 'reply':
          await store.msgStore.replyMsgActive(msg)
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

    const onAddMembersClick = () => {
      if (team.inviteMode === 'manager' && !isGroupOwner && !isGroupManager) {
        message.error(t('noPermission'))
      } else {
        setGroupAddMembersVisible(true)
      }
    }

    const onAddTeamMember = async (accounts: string[]) => {
      try {
        if (team.inviteMode === 'manager' && !isGroupOwner && !isGroupManager) {
          message.error(t('noPermission'))
          return
        }
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

    const onUpdateMyMemberInfo = async (params: UpdateMyMemberInfoOptions) => {
      const nickTipVisible = params.nickInTeam !== void 0
      const bitConfigVisible =
        params.bitConfigMask !== void 0 || params.muteTeam !== void 0
      try {
        await store.teamMemberStore.updateMyMemberInfo(params)
        if (nickTipVisible) {
          message.success(t('updateMyMemberNickSuccess'))
        }
        if (bitConfigVisible) {
          message.success(t('updateBitConfigMaskSuccess'))
        }
      } catch (error) {
        if (nickTipVisible) {
          message.error(t('updateMyMemberNickFailed'))
        }
        if (bitConfigVisible) {
          message.error(t('updateBitConfigMaskFailed'))
        }
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

    useEffect(() => {
      const notMyMsgs = msgs
        .filter((item) => item.from !== myUser.account)
        .filter((item) => !!item.idServer)
        .filter((item) =>
          // 以下这些类型的消息不需要发送已读未读
          ['notification', 'tip', 'robot', 'g2'].every((j) => j !== item.type)
        )

      const visibleChangeHandler = (params: {
        visible: boolean
        target: HTMLElement
      }) => {
        if (params.visible) {
          // 发送已读
          const msg = notMyMsgs.find(
            (item) => item.idClient === params.target.id
          )
          if (msg) {
            store.msgStore
              .sendTeamMsgReceiptActive([
                {
                  teamId: team.teamId,
                  idClient: msg.idClient,
                  idServer: msg.idServer!,
                },
              ])
              .catch((err) => {
                // 忽略这个报错
              })
              .finally(() => {
                visibilityObserver.unobserve(params.target)
              })
          }
        }
      }

      const handler = (isObserve: boolean) => {
        notMyMsgs.forEach((item) => {
          const target = document.getElementById(item.idClient)
          if (target) {
            if (isObserve) {
              visibilityObserver.observe(target)
            } else {
              visibilityObserver.unobserve(target)
            }
          }
        })

        if (isObserve) {
          visibilityObserver.on('visibleChange', visibleChangeHandler)
        } else {
          visibilityObserver.off('visibleChange', visibleChangeHandler)
        }
      }

      handler(true)

      return () => {
        handler(false)
      }
    }, [store.msgStore, msgs, visibilityObserver, team.teamId, myUser.account])

    useEffect(() => {
      return () => {
        visibilityObserver.destroy()
      }
    }, [visibilityObserver])

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

    useEffect(() => {
      const onDismissTeam = (data: { teamId: string }) => {
        const _sessionId = `team-${data.teamId}`
        if (_sessionId === sessionId) {
          message.warning(t('onDismissTeamText'))
        }
      }
      const onAddTeamMembers = (data: {
        team: Team
        // 以下两个参数是增量
        accounts: string[]
        members: TeamMember[]
      }) => {
        const _sessionId = `team-${data.team.teamId}`
        if (_sessionId === sessionId) {
          const nicks = data.members.map(
            (item) => item.nickInTeam || item.account
          )
          message.info(`${nicks.join('，')}${t('enterTeamText')}`)
        }
      }
      const onRemoveTeamMembers = (data: {
        team: Team
        accounts: string[]
      }) => {
        const _sessionId = `team-${data.team.teamId}`
        if (_sessionId === sessionId) {
          if (data.accounts.includes(myUser.account)) {
            message.warning(t('onRemoveTeamText'))
          } else {
            const _tms = store.teamMemberStore.teamMembers.get(data.team.teamId)
            let nicks: string[] = []
            if (_tms) {
              nicks = data.accounts
                .map((item) => {
                  const _t = _tms.get(item)
                  if (_t) {
                    return _t.nickInTeam || _t.account
                  }
                  return ''
                })
                .filter((item) => !!item)
            }
            message.info(`${nicks.join('，')}${t('leaveTeamText')}`)
          }
        }
      }

      nim.on('dismissTeam', onDismissTeam)
      nim.on('addTeamMembers', onAddTeamMembers)
      nim.on('removeTeamMembers', onRemoveTeamMembers)

      return () => {
        nim.off('dismissTeam', onDismissTeam)
        nim.off('addTeamMembers', onAddTeamMembers)
        nim.off('removeTeamMembers', onRemoveTeamMembers)
      }
    }, [nim, sessionId, myUser.account, store.teamMemberStore.teamMembers, t])

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
          <ChatTeamMessageList
            prefix={prefix}
            commonPrefix={commonPrefix}
            ref={messageListContainerDomRef}
            msgs={msgs}
            teamId={team.teamId}
            members={teamMembers}
            teamMsgReceiptVisible={teamMsgReceiptVisible}
            noMore={noMore}
            loadingMore={loadingMore}
            myAccount={myUser?.account || ''}
            receiveMsgBtnVisible={receiveMsgBtnVisible}
            onReceiveMsgBtnClick={scrollToBottom}
            onResend={onResend}
            onMessageAction={onMessageAction}
            onReeditClick={onReeditClick}
            onScroll={onMsgListScrollHandler}
            renderTeamCustomMessage={renderTeamCustomMessage}
            renderMessageAvatar={renderMessageAvatar}
            renderMessageName={renderMessageName}
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
            replyMsg={replyMsg}
            scene={scene}
            to={to}
            actions={actions}
            inputValue={inputValue}
            mute={teamMute}
            uploadImageLoading={store.uiStore.uploadImageLoading}
            uploadFileLoading={store.uiStore.uploadFileLoading}
            setInputValue={setInputValue}
            onRemoveReplyMsg={onRemoveReplyMsg}
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
              onAddMembersClick={onAddMembersClick}
              onDismissTeam={onDismissTeam}
              onLeaveTeam={onLeaveTeam}
              onRemoveTeamMemberClick={onRemoveTeamMember}
              onUpdateTeamInfo={onUpdateTeamInfo}
              onUpdateMyMemberInfo={onUpdateMyMemberInfo}
              onTeamMuteChange={onTeamMuteChange}
              renderTeamMemberItem={renderTeamMemberItem}
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
          defaultAccounts={teamDefaultAddMembers}
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
