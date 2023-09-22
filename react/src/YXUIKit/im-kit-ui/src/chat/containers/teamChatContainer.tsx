import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useLayoutEffect,
  useCallback,
} from 'react'
import ChatActionBar from '../components/ChatActionBar'
import ChatHeader from '../components/ChatHeader'
import ChatTeamMessageList, {
  RenderTeamCustomMessageOptions,
} from '../components/ChatTeamMessageList'
import MessageInput, {
  ChatMessageInputRef,
} from '../components/ChatMessageInput'
import ChatSettingDrawer from '../components/ChatSettingDrawer'
import GroupAddMembers from '../components/ChatAddMembers'
import { ChatAction } from '../types'
import { useStateContext, useTranslation, CrudeAvatar } from '../../common'
import { LeftOutlined } from '@ant-design/icons'
import { Action, ChatSettingActionItem, MsgOperMenuItem } from '../Container'
import ChatTeamSetting, { HistoryStack } from '../components/ChatTeamSetting'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { debounce, VisibilityObserver } from '@xkit-yx/utils'
import {
  IMMessage,
  TMsgScene,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { MenuItemKey, AvatarMenuItem } from '../components/ChatMessageItem'
import { message } from 'antd'
import { ALLOW_AT, TAllowAt } from '../../constant'
import { storeConstants } from '@xkit-yx/im-store'
import {
  Team,
  TeamMember,
  UpdateMyMemberInfoOptions,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { observer } from 'mobx-react'
import { GroupItemProps } from '../components/ChatTeamSetting/GroupItem'
import ChatForwardModal from '../components/ChatForwardModal'
import { MentionedMember } from '../components/ChatMessageInput/ChatMentionMemberList'
import GroupTransferModal from '../components/ChatGroupTransferModal'

export interface TeamChatContainerProps {
  scene: TMsgScene
  to: string
  settingActions?: ChatSettingActionItem[]
  actions?: Action[]
  msgOperMenu?: MsgOperMenuItem[]
  onSendText?: (data: {
    value: string
    scene: TMsgScene
    to: string
  }) => Promise<void>
  afterTransferTeam?: (teamId: string) => Promise<void>
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
  renderMessageOuterContent?: (msg: IMMessage) => JSX.Element | null | undefined
  renderMessageInnerContent?: (msg: IMMessage) => JSX.Element | null | undefined

  prefix?: string
  commonPrefix?: string
}

const TeamChatContainer: React.FC<TeamChatContainerProps> = observer(
  ({
    scene,
    to,
    settingActions,
    actions,
    msgOperMenu,
    onSendText: onSendTextFromProps,
    afterTransferTeam,
    renderTeamCustomMessage,
    renderHeader,
    renderTeamInputPlaceHolder,
    renderTeamMemberItem,
    renderMessageAvatar,
    renderMessageName,
    renderMessageInnerContent,
    renderMessageOuterContent,

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

    const teamMembers = store.teamMemberStore.getTeamMember(to)

    const myUser = store.userStore.myUserInfo

    const teamNameOrTeamId = team?.name || team?.teamId || ''

    const isGroupOwner = myUser?.account === team.owner

    const isGroupManager = teamMembers
      .filter((item) => item.type === 'manager')
      .some((item) => item.account === myUser?.account)

    const mentionMembers = useMemo(() => {
      return teamMembers.filter(
        (member) => member.account !== myUser?.account
        // if (member.account !== myUser?.account) {
        // member.alias = store.uiStore.getAppellation({
        //   account: member.account,
        //   teamId: member.teamId,
        // })
        // member.nickInTeam = store.uiStore.getAppellation({
        //   account: member.account,
        //   teamId: member.teamId,
        //   ignoreAlias: true,
        // })
        //   return true
        // }
        // return false
      )
    }, [teamMembers, myUser?.account])

    const sortedMembers = useMemo(() => {
      const owner = teamMembers.filter((item) => item.type === 'owner')
      const manager = teamMembers
        .filter((item) => item.type === 'manager')
        .sort((a, b) => a.joinTime - b.joinTime)
      const other = teamMembers
        .filter((item) => !['owner', 'manager'].includes(item.type))
        .sort((a, b) => a.joinTime - b.joinTime)
      const _sortedMembers = [...owner, ...manager, ...other]
      return _sortedMembers
    }, [teamMembers])

    const teamMute = useMemo(() => {
      if (team.mute) {
        return !isGroupOwner && !isGroupManager
      }
      return team.mute
    }, [team.mute, isGroupOwner, isGroupManager])

    const allowAtAll = useMemo(() => {
      let ext: TAllowAt = {}
      try {
        ext = JSON.parse(team.ext || '{}')
      } catch (error) {
        //
      }
      if (ext[ALLOW_AT] === 'manager') {
        return isGroupOwner || isGroupManager
      }
      return true
    }, [team.ext, isGroupOwner, isGroupManager])

    const teamDefaultAddMembers = useMemo(() => {
      return teamMembers
        .filter((item) => item.account !== myUser?.account)
        .map((item) => item.account)
    }, [teamMembers, myUser?.account])

    const messageListContainerDomRef = useRef<HTMLDivElement>(null)
    const settingDrawDomRef = useRef<HTMLDivElement>(null)
    const chatMessageInputRef = useRef<ChatMessageInputRef>(null)

    const visibilityObserver = useMemo(() => {
      return new VisibilityObserver({
        root: messageListContainerDomRef.current,
      })
    }, [to])

    const [groupTransferModalVisible, setGroupTransferModalVisible] =
      useState<boolean>(false)

    // 以下是 UI 相关的 state，需要在切换会话时重置
    const [replyMsgsMap, setReplyMsgsMap] = useState<Record<string, IMMessage>>(
      {}
    ) // 回复消息的 map
    const [inputValue, setInputValue] = useState('')
    const [navHistoryStack, setNavHistoryStack] = useState<HistoryStack[]>([])
    const [action, setAction] = useState<ChatAction | undefined>(undefined)
    const [loadingMore, setLoadingMore] = useState(false)
    const [noMore, setNoMore] = useState(false)
    const [groupAddMembersVisible, setGroupAddMembersVisible] = useState(false)
    const [receiveMsgBtnVisible, setReceiveMsgBtnVisible] = useState(false)
    const [settingDrawerVisible, setSettingDrawerVisible] = useState(false)
    const [forwardMessage, setForwardMessage] = useState<IMMessage | undefined>(
      undefined
    )

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

    const getHistory = useCallback(
      async (endTime: number, lastMsgId?: string) => {
        try {
          setLoadingMore(true)
          const historyMsgs = await store.msgStore.getHistoryMsgActive({
            sessionId,
            endTime,
            lastMsgId,
            limit: storeConstants.HISTORY_LIMIT,
          })
          setLoadingMore(false)
          if (historyMsgs.length < storeConstants.HISTORY_LIMIT) {
            setNoMore(true)
          }
        } catch (error) {
          setLoadingMore(false)
          message.error(t('getHistoryMsgFailedText'))
        }
      },
      [sessionId, store.msgStore, t]
    )

    // 收消息，发消息时需要调用
    const scrollToBottom = useCallback(() => {
      if (messageListContainerDomRef.current) {
        messageListContainerDomRef.current.scrollTop =
          messageListContainerDomRef.current.scrollHeight
      }
      setReceiveMsgBtnVisible(false)
    }, [])

    const onMsgListScrollHandler = useCallback(
      debounce(async () => {
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
              await getHistory(_msg.time, _msg.idServer)
              // 滚动到加载的那条消息
              document.getElementById(_msg.idClient)?.scrollIntoView()
            }
          }
        }
      }, 300),
      [loadingMore, msgs, noMore, getHistory]
    )

    const onActionClick = useCallback(
      (action: ChatAction) => {
        const settingAction = settingActions?.find(
          (item) => item.action === action
        )
        if (settingAction?.onClick) {
          return settingAction?.onClick()
        }
        switch (action) {
          case 'chatSetting':
            setAction(action)
            setSettingDrawerVisible(true)
            break
          default:
            break
        }
      },
      [settingActions]
    )

    const onSettingDrawerClose = useCallback(() => {
      setNavHistoryStack([])
      setAction(undefined)
      setSettingDrawerVisible(false)
    }, [])

    const onReeditClick = useCallback(
      (msg: IMMessage) => {
        const replyMsg = replyMsgsMap[msg.idClient]
        replyMsg && store.msgStore.replyMsgActive(replyMsg)
        // 处理 @ 消息
        const { ext } = msg
        if (ext) {
          try {
            const extObj = JSON.parse(ext)
            const yxAitMsg = extObj.yxAitMsg
            if (yxAitMsg) {
              const mentionedMembers: MentionedMember[] = []
              Object.keys(yxAitMsg).forEach((key) => {
                if (key === storeConstants.AT_ALL_ACCOUNT) {
                  mentionedMembers.push({
                    account: storeConstants.AT_ALL_ACCOUNT,
                    appellation: t('teamAll'),
                  })
                } else {
                  const member = teamMembers.find(
                    (item) => item.account === key
                  )
                  member &&
                    mentionedMembers.push({
                      account: member.account,
                      appellation: store.uiStore.getAppellation({
                        account: member.account,
                        teamId: member.teamId,
                        ignoreAlias: true,
                      }),
                    })
                }
              })
              chatMessageInputRef.current?.setSelectedAtMembers(
                mentionedMembers
              )
            }
          } catch {}
        }
        setInputValue(msg.attach?.oldBody || '')
        chatMessageInputRef.current?.input?.focus()
      },
      [replyMsgsMap, store.msgStore, teamMembers, store.uiStore, t]
    )

    const onResend = useCallback(
      async (msg: IMMessage) => {
        try {
          await store.msgStore.resendMsgActive(msg)
        } catch (error) {
          // message.error(t('sendMsgFailedText'))
        } finally {
          scrollToBottom()
        }
      },
      [scrollToBottom, store.msgStore]
    )

    const onSendText = useCallback(
      async (value: string, ext?: Record<string, unknown>) => {
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
              ext,
            })
          }
        } catch (error) {
          // message.error(t('sendMsgFailedText'))
        } finally {
          scrollToBottom()
        }
      },
      [onSendTextFromProps, scene, store.msgStore, to, scrollToBottom]
    )

    const onSendFile = useCallback(
      async (file: File) => {
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
      },
      [scene, store.msgStore, to, scrollToBottom]
    )

    const onSendImg = useCallback(
      async (file: File) => {
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
      },
      [scene, store.msgStore, to, scrollToBottom]
    )

    const onRemoveReplyMsg = useCallback(() => {
      replyMsg && store.msgStore.removeReplyMsgActive(replyMsg.sessionId)
    }, [replyMsg, store.msgStore])

    const onMessageAction = useCallback(
      async (key: MenuItemKey, msg: IMMessage) => {
        const msgOperMenuItem = msgOperMenu?.find((item) => item.key === key)
        if (msgOperMenuItem?.onClick) {
          return msgOperMenuItem?.onClick(msg)
        }
        switch (key) {
          case 'delete':
            await store.msgStore.deleteMsgActive([msg])
            break
          case 'recall':
            await store.msgStore.reCallMsgActive(msg)
            break
          case 'reply':
            const member = mentionMembers.find(
              (item) => item.account === msg.from
            )
            member &&
              chatMessageInputRef.current?.onAtMemberSelectHandler({
                account: member.account,
                appellation: store.uiStore.getAppellation({
                  account: member.account,
                  teamId: member.teamId,
                  ignoreAlias: true,
                }),
              })
            await store.msgStore.replyMsgActive(msg)
            chatMessageInputRef.current?.input?.focus()
            break
          case 'forward':
            setForwardMessage(msg)
            break
          default:
            break
        }
      },
      [store.msgStore, mentionMembers, store.uiStore, msgOperMenu]
    )

    const onMessageAvatarAction = useCallback(
      async (key: AvatarMenuItem, msg: IMMessage) => {
        switch (key) {
          case 'mention':
            const member = mentionMembers.find(
              (item) => item.account === msg.from
            )
            member &&
              chatMessageInputRef.current?.onAtMemberSelectHandler({
                account: member.account,
                appellation: store.uiStore.getAppellation({
                  account: member.account,
                  teamId: member.teamId,
                  ignoreAlias: true,
                }),
              })
            break
          default:
            break
        }
      },
      [mentionMembers, store.uiStore]
    )

    const onDismissTeam = useCallback(async () => {
      try {
        await store.teamStore.dismissTeamActive(team.teamId)
        message.success(t('dismissTeamSuccessText'))
      } catch (error: any) {
        switch (error?.code) {
          // 无权限
          case 802:
            message.error(t('noPermission'))
            break
          default:
            message.error(t('dismissTeamFailedText'))
            break
        }
      }
    }, [store.teamStore, team.teamId, t])

    const onLeaveTeam = useCallback(async () => {
      try {
        await store.teamStore.leaveTeamActive(team.teamId)
        message.success(t('leaveTeamSuccessText'))
      } catch (error: any) {
        switch (error?.code) {
          // 无权限
          case 802:
            message.error(t('noPermission'))
            break
          default:
            message.error(t('leaveTeamFailedText'))
            break
        }
      }
    }, [store.teamStore, team.teamId, t])

    const onTransferMemberClick = useCallback(() => {
      setGroupTransferModalVisible(true)
    }, [])

    const handleTransferTeam = useCallback(() => {
      setGroupTransferModalVisible(false)
      afterTransferTeam?.(team.teamId)
    }, [afterTransferTeam, team.teamId])

    const onAddMembersClick = useCallback(() => {
      if (team.inviteMode === 'manager' && !isGroupOwner && !isGroupManager) {
        message.error(t('noPermission'))
      } else {
        setGroupAddMembersVisible(true)
      }
    }, [team.inviteMode, isGroupOwner, isGroupManager, t])

    const onAddTeamMember = useCallback(
      async (accounts: string[]) => {
        try {
          await store.teamMemberStore.addTeamMemberActive({
            teamId: team.teamId,
            accounts,
          })
          message.success(t('addTeamMemberSuccessText'))
          resetSettingState()
        } catch (error: any) {
          switch (error?.code) {
            // 无权限
            case 802:
              message.error(t('noPermission'))
              break
            default:
              message.error(t('addTeamMemberFailedText'))
              break
          }
        }
      },
      [store.teamMemberStore, team.teamId, t]
    )

    const onRemoveTeamMember = useCallback(
      async (member: TeamMember) => {
        try {
          await store.teamMemberStore.removeTeamMemberActive({
            teamId: team.teamId,
            accounts: [member.account],
          })
          message.success(t('removeTeamMemberSuccessText'))
        } catch (error: any) {
          switch (error?.code) {
            // 无权限
            case 802:
              message.error(t('noPermission'))
              break
            default:
              message.error(t('removeTeamMemberFailedText'))
              break
          }
        }
      },
      [store.teamMemberStore, team.teamId, t]
    )

    const onUpdateTeamInfo = useCallback(
      async (params: Partial<Team>) => {
        try {
          await store.teamStore.updateTeamActive({
            ...params,
            teamId: team.teamId,
          })
          message.success(t('updateTeamSuccessText'))
        } catch (error: any) {
          switch (error?.code) {
            // 无权限
            case 802:
              message.error(t('noPermission'))
              break
            default:
              message.error(t('updateTeamFailedText'))
              break
          }
        }
      },
      [store.teamStore, team.teamId, t]
    )

    const onUpdateMyMemberInfo = useCallback(
      async (params: UpdateMyMemberInfoOptions) => {
        const nickTipVisible = params.nickInTeam !== void 0
        const bitConfigVisible = params.bitConfigMask !== void 0
        try {
          await store.teamMemberStore.updateMyMemberInfo(params)
          if (nickTipVisible) {
            message.success(t('updateMyMemberNickSuccess'))
          }
          if (bitConfigVisible) {
            message.success(t('updateBitConfigMaskSuccess'))
          }
        } catch (error: any) {
          switch (error?.code) {
            // 无权限
            case 802:
              message.error(t('noPermission'))
              break
            default:
              {
                if (nickTipVisible) {
                  message.error(t('updateMyMemberNickFailed'))
                }
                if (bitConfigVisible) {
                  message.error(t('updateBitConfigMaskFailed'))
                }
              }
              break
          }
        }
      },
      [store.teamMemberStore, t]
    )

    const onTeamMuteChange = useCallback(
      async (mute: boolean) => {
        try {
          await store.teamStore.muteTeamActive({
            teamId: team.teamId,
            mute,
          })
          message.success(
            mute ? t('muteAllTeamSuccessText') : t('unmuteAllTeamSuccessText')
          )
        } catch (error: any) {
          switch (error?.code) {
            // 无权限
            case 802:
              message.error(t('noPermission'))
              break
            default:
              message.error(
                mute ? t('muteAllTeamFailedText') : t('unmuteAllTeamFailedText')
              )
              break
          }
        }
      },
      [store.teamStore, team.teamId, t]
    )

    const resetSettingState = () => {
      setNavHistoryStack([])
      setAction(undefined)
      setGroupAddMembersVisible(false)
      setSettingDrawerVisible(false)
    }

    const resetState = useCallback(() => {
      resetSettingState()
      setInputValue('')
      setLoadingMore(false)
      setNoMore(false)
      setReceiveMsgBtnVisible(false)
      setForwardMessage(undefined)
    }, [])

    const handleForwardModalSend = () => {
      scrollToBottom()
      setForwardMessage(undefined)
    }

    const handleForwardModalClose = () => {
      setForwardMessage(undefined)
    }

    const handleGroupActionCancel = () => {
      setGroupTransferModalVisible(false)
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
                  idServer: msg.idServer ? msg.idServer : '',
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
      scrollToBottom()
      store.teamStore.getTeamActive(to)
      store.teamMemberStore.getTeamMemberActive(to)
    }, [store.teamStore, store.teamMemberStore, to, resetState, scrollToBottom])

    // 切换会话时，如果内存中除了撤回消息的其他消息小于10条（差不多一屏幕），需要拉取历史消息
    useEffect(() => {
      if (
        store.msgStore
          .getMsg(sessionId)
          .filter(
            (item) =>
              !['beReCallMsg', 'reCallMsg'].includes(item.attach?.type || '')
          ).length < 10
      ) {
        getHistory(Date.now()).then(() => {
          scrollToBottom()
        })
      }
    }, [store.msgStore, sessionId, getHistory, scrollToBottom])

    // 处理消息
    useEffect(() => {
      if (msgs.length !== 0) {
        const replyMsgsMap = {}
        const reqMsgs: Array<{
          scene: 'p2p' | 'team'
          from: string
          to: string
          idServer: string
          time: number
        }> = []
        const idClients: string[] = []
        msgs.forEach((msg) => {
          if (msg.ext) {
            try {
              const { yxReplyMsg } = JSON.parse(msg.ext)
              if (yxReplyMsg) {
                const replyMsg = msgs.find(
                  (item) => item.idClient === yxReplyMsg.idClient
                )
                if (replyMsg) {
                  replyMsgsMap[msg.idClient] = replyMsg
                } else {
                  replyMsgsMap[msg.idClient] = 'noFind'
                  const { scene, from, to, idServer, time } = yxReplyMsg
                  if (scene && from && to && idServer && time) {
                    reqMsgs.push({ scene, from, to, idServer, time })
                    idClients.push(msg.idClient)
                  }
                }
              }
            } catch {}
          }
        })
        if (reqMsgs.length > 0) {
          store.msgStore.getMsgByIdServerActive({ reqMsgs }).then((res) => {
            res.forEach((item, index) => {
              replyMsgsMap[idClients[index]] = item
            })
            setReplyMsgsMap({ ...replyMsgsMap })
          })
        } else {
          setReplyMsgsMap({ ...replyMsgsMap })
        }
      }
    }, [msgs, store, team.teamId])

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
      // const onDismissTeam = (data: { teamId: string }) => {
      //   const _sessionId = `team-${data.teamId}`
      //   if (_sessionId === sessionId) {
      //     message.warning(t('onDismissTeamText'))
      //   }
      // }
      // const onAddTeamMembers = (data: {
      //   team: Team
      //   // 以下两个参数是增量
      //   accounts: string[]
      //   members: TeamMember[]
      // }) => {
      //   const _sessionId = `team-${data.team.teamId}`
      //   if (_sessionId === sessionId) {
      //     const nicks = data.members.map(
      //       (item) => item.nickInTeam || item.account
      //     )
      //     message.info(`${nicks.join('，')}${t('enterTeamText')}`)
      //   }
      // }
      // const onRemoveTeamMembers = (data: {
      //   team: Team
      //   accounts: string[]
      // }) => {
      //   const _sessionId = `team-${data.team.teamId}`
      //   if (_sessionId === sessionId) {
      //     if (data.accounts.includes(myUser.account)) {
      //       message.warning(t('onRemoveTeamText'))
      //     } else {
      //       const _tms = store.teamMemberStore.teamMembers.get(data.team.teamId)
      //       let nicks: string[] = []
      //       if (_tms) {
      //         nicks = data.accounts
      //           .map((item) => {
      //             const _t = _tms.get(item)
      //             if (_t) {
      //               return _t.nickInTeam || _t.account
      //             }
      //             return ''
      //           })
      //           .filter((item) => !!item)
      //       }
      //       message.info(`${nicks.join('，')}${t('leaveTeamText')}`)
      //     }
      //   }
      // }

      // 根据 onMsg 处理提示
      const onMsgToast = (msg: IMMessage) => {
        if (msg.sessionId === sessionId && msg.type === 'notification') {
          switch (msg.attach?.type) {
            // 主动离开群聊
            case 'leaveTeam': {
              if (msg.from === myUser.account) {
                message.success(t('leaveTeamSuccessText'))
              } else {
                message.info(
                  `${store.uiStore.getAppellation({
                    account: msg.from,
                    teamId: msg.to,
                  })}${t('leaveTeamText')}`
                )
              }
              break
            }
            // 踢出群聊
            case 'removeTeamMembers': {
              if (msg.attach?.accounts.includes(myUser.account)) {
                message.warning(t('onRemoveTeamText'))
              } else {
                const nicks = msg.attach?.accounts.map((item) =>
                  store.uiStore.getAppellation({
                    account: item,
                    teamId: msg.to,
                  })
                )
                message.info(`${nicks.join('，')}${t('leaveTeamText')}`)
              }
              break
            }
            // 解散群聊
            case 'dismissTeam':
              message.warning(t('onDismissTeamText'))
              break
            // 有人主动加入群聊
            case 'passTeamApply':
            // 邀请加入群聊对方同意
            case 'acceptTeamInvite':
              {
                if (msg.from === myUser.account) {
                  message.info(
                    `${store.uiStore.getAppellation({
                      account: msg.from,
                      teamId: msg.to,
                    })}${t('enterTeamText')}`
                  )
                }
              }
              break
            // 邀请加入群聊无需验证
            case 'addTeamMembers': {
              const nicks = msg.attach?.accounts.map((item) =>
                store.uiStore.getAppellation({ account: item, teamId: msg.to })
              )
              message.info(`${nicks.join('，')}${t('enterTeamText')}`)
              break
            }
          }
        }
      }

      nim.on('msg', onMsgToast)
      // nim.on('dismissTeam', onDismissTeam)
      // nim.on('addTeamMembers', onAddTeamMembers)
      // nim.on('removeTeamMembers', onRemoveTeamMembers)

      return () => {
        nim.off('msg', onMsgToast)
        // nim.off('dismissTeam', onDismissTeam)
        // nim.off('addTeamMembers', onAddTeamMembers)
        // nim.off('removeTeamMembers', onRemoveTeamMembers)
      }
    }, [nim, sessionId, myUser.account, store.uiStore, t])

    return session ? (
      <div className={`${prefix}-wrap`}>
        <div ref={settingDrawDomRef} className={`${prefix}-content`}>
          {renderHeader ? (
            renderHeader(session)
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
            msgOperMenu={msgOperMenu}
            replyMsgsMap={replyMsgsMap}
            members={teamMembers}
            noMore={noMore}
            loadingMore={loadingMore}
            myAccount={myUser?.account || ''}
            receiveMsgBtnVisible={receiveMsgBtnVisible}
            onReceiveMsgBtnClick={scrollToBottom}
            onResend={onResend}
            onMessageAction={onMessageAction}
            onMessageAvatarAction={onMessageAvatarAction}
            onReeditClick={onReeditClick}
            onScroll={onMsgListScrollHandler}
            renderTeamCustomMessage={renderTeamCustomMessage}
            renderMessageAvatar={renderMessageAvatar}
            renderMessageName={renderMessageName}
            renderMessageInnerContent={renderMessageInnerContent}
            renderMessageOuterContent={renderMessageOuterContent}
          />

          <MessageInput
            ref={chatMessageInputRef}
            prefix={prefix}
            commonPrefix={commonPrefix}
            placeholder={
              renderTeamInputPlaceHolder
                ? renderTeamInputPlaceHolder({
                    session: session,
                    mute: teamMute,
                  })
                : teamMute
                ? t('teamMutePlaceholder')
                : `${t('sendToText')} ${teamNameOrTeamId}${t('sendUsageText')}`
            }
            replyMsg={replyMsg}
            mentionMembers={mentionMembers}
            scene={scene}
            to={to}
            actions={actions}
            inputValue={inputValue}
            mute={teamMute}
            allowAtAll={allowAtAll}
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
              members={sortedMembers}
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
              onTransferTeamClick={onTransferMemberClick}
              renderTeamMemberItem={renderTeamMemberItem}
              prefix={prefix}
              commonPrefix={commonPrefix}
            />
          </ChatSettingDrawer>
        </div>
        <ChatActionBar
          prefix={prefix}
          action={action}
          settingActions={settingActions}
          onActionClick={onActionClick}
        />
        <GroupAddMembers
          defaultAccounts={teamDefaultAddMembers}
          visible={groupAddMembersVisible}
          onGroupAddMembers={onAddTeamMember}
          onCancel={() => {
            setGroupAddMembersVisible(false)
          }}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
        <ChatForwardModal
          visible={!!forwardMessage}
          msg={forwardMessage!}
          onSend={handleForwardModalSend}
          onCancel={handleForwardModalClose}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
        <GroupTransferModal
          visible={groupTransferModalVisible}
          members={sortedMembers}
          onOk={handleTransferTeam}
          onCancel={handleGroupActionCancel}
          teamId={to}
        />
      </div>
    ) : null
  }
)

export default TeamChatContainer
