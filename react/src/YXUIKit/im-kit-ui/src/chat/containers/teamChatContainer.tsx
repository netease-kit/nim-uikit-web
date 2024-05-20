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
import { debounce, VisibilityObserver } from '@xkit-yx/utils'
import { MenuItemKey, AvatarMenuItem } from '../components/ChatMessageItem'
import { message } from 'antd'
import { ALLOW_AT, TAllowAt } from '../../constant'
import { storeConstants } from '@xkit-yx/im-store-v2'
import { observer } from 'mobx-react'
import { GroupItemProps } from '../components/ChatTeamSetting/GroupItem'
import ChatForwardModal from '../components/ChatForwardModal'
import { MentionedMember } from '../components/ChatMessageInput/ChatMentionMemberList'
import GroupTransferModal from '../components/ChatGroupTransferModal'
import { getImgDataUrl, getVideoFirstFrameDataUrl } from '../../utils'
import {
  V2NIMTeam,
  V2NIMTeamMember,
  V2NIMUpdatedTeamInfo,
  V2NIMUpdateSelfMemberInfoParams,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMTeamService'
import {
  V2NIMConversationType,
  V2NIMConversation,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMConversationService'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng'
import { V2NIMMessageNotificationAttachment } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMMessageService'

export interface TeamChatContainerProps {
  conversationType: V2NIMConversationType
  receiverId: string
  settingActions?: ChatSettingActionItem[]
  actions?: Action[]
  msgOperMenu?: MsgOperMenuItem[]
  onSendText?: (data: {
    value: string
    conversationType: V2NIMConversationType
    receiverId: string
  }) => Promise<void>
  afterTransferTeam?: (teamId: string) => Promise<void>
  renderTeamCustomMessage?: (
    options: RenderTeamCustomMessageOptions
  ) => JSX.Element | null | undefined
  renderHeader?: (conversation: V2NIMConversation) => JSX.Element
  renderTeamInputPlaceHolder?: (params: {
    conversation: V2NIMConversation
    mute: boolean
  }) => string
  renderTeamMemberItem?: (
    params: GroupItemProps
  ) => JSX.Element | null | undefined
  renderMessageAvatar?: (
    msg: V2NIMMessageForUI
  ) => JSX.Element | null | undefined
  renderMessageName?: (msg: V2NIMMessageForUI) => JSX.Element | null | undefined
  renderMessageOuterContent?: (
    msg: V2NIMMessageForUI
  ) => JSX.Element | null | undefined
  renderMessageInnerContent?: (
    msg: V2NIMMessageForUI
  ) => JSX.Element | null | undefined

  prefix?: string
  commonPrefix?: string
}

const TeamChatContainer: React.FC<TeamChatContainerProps> = observer(
  ({
    conversationType,
    receiverId,
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

    const conversationId =
      nim.V2NIMConversationIdUtil.teamConversationId(receiverId)

    const conversation =
      store.conversationStore.conversations.get(conversationId)

    const msgs = store.msgStore.getMsg(conversationId)

    const replyMsg = store.msgStore.replyMsgs.get(conversationId)

    const team: V2NIMTeam = store.teamStore.teams.get(receiverId) || {
      teamId: receiverId,
      teamType: V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
      name: '',
      avatar: '',
      intro: '',
      announcement: '',
      joinMode: V2NIMConst.V2NIMTeamJoinMode.V2NIM_TEAM_JOIN_MODE_FREE,
      agreeMode: V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
      inviteMode: V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER,
      updateInfoMode:
        V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER,
      updateExtensionMode:
        V2NIMConst.V2NIMTeamUpdateExtensionMode
          .V2NIM_TEAM_UPDATE_EXTENSION_MODE_MANAGER,
      ownerAccountId: '',
      memberCount: 0,
      createTime: Date.now(),
      updateTime: Date.now(),
      serverExtension: '',
      isValidTeam: false,
      chatBannedMode:
        V2NIMConst.V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN,
      memberLimit: 200,
      messageNotifyMode:
        V2NIMConst.V2NIMTeamMessageNotifyMode
          .V2NIM_TEAM_MESSAGE_NOTIFY_MODE_ALL,
    }

    const teamMembers = store.teamMemberStore.getTeamMember(receiverId)

    const myUser = store.userStore.myUserInfo

    const teamNameOrTeamId = team?.name || team?.teamId || ''

    const isGroupOwner = myUser?.accountId === team.ownerAccountId

    const isGroupManager = teamMembers
      .filter(
        (item) =>
          item.memberRole ===
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
      )
      .some((item) => item.accountId === myUser?.accountId)

    const sortedMembers = useMemo(() => {
      const owner = teamMembers.filter(
        (item) =>
          item.memberRole ===
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
      )
      const manager = teamMembers
        .filter(
          (item) =>
            item.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
        )
        .sort((a, b) => a.joinTime - b.joinTime)
      const other = teamMembers
        .filter(
          (item) =>
            item.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_NORMAL
        )
        .sort((a, b) => a.joinTime - b.joinTime)
      const _sortedMembers = [...owner, ...manager, ...other]
      return _sortedMembers
    }, [teamMembers])

    const mentionMembers = useMemo(() => {
      return sortedMembers.filter(
        (member) => member.accountId !== myUser?.accountId
      )
    }, [sortedMembers, myUser?.accountId])

    const teamMute = useMemo(() => {
      if (
        team.chatBannedMode ===
        V2NIMConst.V2NIMTeamChatBannedMode
          .V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL
      ) {
        return !isGroupOwner && !isGroupManager
      }
      return false
    }, [team.chatBannedMode, isGroupOwner, isGroupManager])

    const allowAtAll = useMemo(() => {
      let ext: TAllowAt = {}
      try {
        ext = JSON.parse(team.serverExtension || '{}')
      } catch (error) {
        //
      }
      if (ext[ALLOW_AT] === 'manager') {
        return isGroupOwner || isGroupManager
      }
      return true
    }, [team.serverExtension, isGroupOwner, isGroupManager])

    const teamDefaultAddMembers = useMemo(() => {
      return teamMembers
        .filter((item) => item.accountId !== myUser?.accountId)
        .map((item) => item.accountId)
    }, [teamMembers, myUser?.accountId])

    const messageListContainerDomRef = useRef<HTMLDivElement>(null)
    const settingDrawDomRef = useRef<HTMLDivElement>(null)
    const chatMessageInputRef = useRef<ChatMessageInputRef>(null)

    const visibilityObserver = useMemo(() => {
      return new VisibilityObserver({
        root: messageListContainerDomRef.current,
      })
    }, [receiverId])

    const [groupTransferModalVisible, setGroupTransferModalVisible] =
      useState<boolean>(false)

    // 以下是 UI 相关的 state，需要在切换会话时重置
    const [replyMsgsMap, setReplyMsgsMap] = useState<
      Record<string, V2NIMMessageForUI>
    >({}) // 回复消息的 map
    const [inputValue, setInputValue] = useState('')
    const [navHistoryStack, setNavHistoryStack] = useState<HistoryStack[]>([])
    const [action, setAction] = useState<ChatAction | undefined>(undefined)
    const [loadingMore, setLoadingMore] = useState(false)
    const [noMore, setNoMore] = useState(false)
    const [groupAddMembersVisible, setGroupAddMembersVisible] = useState(false)
    const [receiveMsgBtnVisible, setReceiveMsgBtnVisible] = useState(false)
    const [settingDrawerVisible, setSettingDrawerVisible] = useState(false)
    const [forwardMessage, setForwardMessage] = useState<
      V2NIMMessageForUI | undefined
    >(undefined)

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
            conversationId,
            endTime,
            lastMsgId,
            limit: storeConstants.HISTORY_LIMIT,
          })
          setLoadingMore(false)
          if (historyMsgs.length < storeConstants.HISTORY_LIMIT) {
            setNoMore(true)
          }
          return historyMsgs
        } catch (error: any) {
          setLoadingMore(false)
          switch (error.code) {
            case 109404:
              message.error(t('teamMemberNotExist'))
              break
            default:
              message.error(t('getHistoryMsgFailedText'))
              break
          }
        }
      },
      [conversationId, store.msgStore, t]
    )

    // 收消息，发消息时需要调用
    const scrollToBottom = useCallback(
      debounce(() => {
        if (messageListContainerDomRef.current) {
          messageListContainerDomRef.current.scrollTop =
            messageListContainerDomRef.current.scrollHeight
        }
        setReceiveMsgBtnVisible(false)
      }, 300),
      []
    )

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
                  item.messageType ===
                    V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
                  ['beReCallMsg', 'reCallMsg'].includes(item.recallType || '')
                )
            )[0]
            if (_msg) {
              await getHistory(_msg.createTime, _msg.messageServerId)
              // 滚动到加载的那条消息
              document.getElementById(_msg.messageClientId)?.scrollIntoView()
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
      (msg: V2NIMMessageForUI) => {
        const replyMsg = replyMsgsMap[msg.messageClientId]
        replyMsg && store.msgStore.replyMsgActive(replyMsg)
        // 处理 @ 消息
        const { serverExtension } = msg
        if (serverExtension) {
          try {
            const extObj = JSON.parse(serverExtension)
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
                    (item) => item.accountId === key
                  )
                  member &&
                    mentionedMembers.push({
                      account: member.accountId,
                      appellation: store.uiStore.getAppellation({
                        account: member.accountId,
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
        setInputValue(msg.oldText || '')
        chatMessageInputRef.current?.input?.focus()
      },
      [replyMsgsMap, store.msgStore, teamMembers, store.uiStore, t]
    )

    const onResend = useCallback(
      async (msg: V2NIMMessageForUI) => {
        try {
          switch (msg.messageType) {
            case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
            case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
              await store.msgStore.sendMessageActive({
                msg,
                conversationId,
                progress: () => true,
                sendBefore: () => {
                  scrollToBottom()
                },
              })
              break
            default:
              await store.msgStore.sendMessageActive({
                msg,
                conversationId,
                sendBefore: () => {
                  scrollToBottom()
                },
              })
              break
          }
          scrollToBottom()
        } catch (error) {
          //
        }
      },
      [store.msgStore, conversationId, scrollToBottom]
    )

    const onSendText = useCallback(
      async (value: string, ext?: Record<string, unknown>) => {
        try {
          if (onSendTextFromProps) {
            await onSendTextFromProps({
              value,
              conversationType,
              receiverId,
            })
          } else {
            const textMsg = nim.V2NIMMessageCreator.createTextMessage(value)
            await store.msgStore.sendMessageActive({
              msg: textMsg,
              conversationId,
              serverExtension: ext,
              sendBefore: () => {
                scrollToBottom()
              },
            })
          }
        } catch (error) {
          // message.error(t('sendMsgFailedText'))
        } finally {
          scrollToBottom()
        }
      },
      [
        onSendTextFromProps,
        conversationType,
        store.msgStore,
        receiverId,
        conversationId,
        scrollToBottom,
        nim.V2NIMMessageCreator,
      ]
    )

    const onSendFile = useCallback(
      async (file: File) => {
        try {
          const fileMsg = nim.V2NIMMessageCreator.createFileMessage(
            file,
            file.name
          )
          await store.msgStore.sendMessageActive({
            msg: fileMsg,
            conversationId,
            sendBefore: () => {
              scrollToBottom()
            },
          })
        } catch (error) {
          // message.error(t('sendMsgFailedText'))
        } finally {
          scrollToBottom()
        }
      },
      [store.msgStore, conversationId, scrollToBottom, nim.V2NIMMessageCreator]
    )

    const onSendImg = useCallback(
      async (file: File) => {
        try {
          const previewImg = await getImgDataUrl(file)
          const imgMsg = nim.V2NIMMessageCreator.createImageMessage(file)
          await store.msgStore.sendMessageActive({
            msg: imgMsg,
            conversationId,
            previewImg,
            progress: () => true,
            sendBefore: () => {
              scrollToBottom()
            },
          })
        } catch (error) {
          // message.error(t('sendMsgFailedText'))
        } finally {
          scrollToBottom()
        }
      },
      [store.msgStore, conversationId, scrollToBottom, nim.V2NIMMessageCreator]
    )

    const onSendVideo = useCallback(
      async (file: File) => {
        try {
          const previewImg = await getVideoFirstFrameDataUrl(file)
          const videoMsg = nim.V2NIMMessageCreator.createVideoMessage(file)
          await store.msgStore.sendMessageActive({
            msg: videoMsg,
            conversationId,
            previewImg,
            progress: () => true,
            sendBefore: () => {
              scrollToBottom()
            },
          })
        } catch (error) {
          // message.error(t('sendMsgFailedText'))
        } finally {
          scrollToBottom()
        }
      },
      [store.msgStore, conversationId, scrollToBottom, nim.V2NIMMessageCreator]
    )

    const onRemoveReplyMsg = useCallback(() => {
      replyMsg && store.msgStore.removeReplyMsgActive(replyMsg.conversationId)
    }, [replyMsg, store.msgStore])

    const onMessageAction = useCallback(
      async (key: MenuItemKey, msg: V2NIMMessageForUI) => {
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
              (item) => item.accountId === msg.senderId
            )
            member &&
              chatMessageInputRef.current?.onAtMemberSelectHandler({
                account: member.accountId,
                appellation: store.uiStore.getAppellation({
                  account: member.accountId,
                  teamId: member.teamId,
                  ignoreAlias: true,
                }),
              })
            store.msgStore.replyMsgActive(msg)
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
      async (key: AvatarMenuItem, msg: V2NIMMessageForUI) => {
        switch (key) {
          case 'mention':
            const member = mentionMembers.find(
              (item) => item.accountId === msg.senderId
            )
            member &&
              chatMessageInputRef.current?.onAtMemberSelectHandler({
                account: member.accountId,
                appellation: store.uiStore.getAppellation({
                  account: member.accountId,
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
          case 109427:
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
        message.error(t('leaveTeamFailedText'))
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
      if (
        team.inviteMode ===
          V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER &&
        !isGroupOwner &&
        !isGroupManager
      ) {
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
            case 109306:
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
      async (member: V2NIMTeamMember) => {
        try {
          await store.teamMemberStore.removeTeamMemberActive({
            teamId: team.teamId,
            accounts: [member.accountId],
          })
          message.success(t('removeTeamMemberSuccessText'))
        } catch (error: any) {
          switch (error?.code) {
            // 无权限
            case 109306:
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
      async (params: V2NIMUpdatedTeamInfo) => {
        try {
          await store.teamStore.updateTeamActive({
            teamId: team.teamId,
            info: params,
          })
          message.success(t('updateTeamSuccessText'))
        } catch (error: any) {
          switch (error?.code) {
            // 无权限
            case 109432:
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
      async (params: V2NIMUpdateSelfMemberInfoParams) => {
        const nickTipVisible = params.teamNick !== void 0
        try {
          await store.teamMemberStore.updateMyMemberInfoActive({
            teamId: team.teamId,
            memberInfo: params,
          })
          if (nickTipVisible) {
            message.success(t('updateMyMemberNickSuccess'))
          }
        } catch (error: any) {
          if (nickTipVisible) {
            message.error(t('updateMyMemberNickFailed'))
          }
        }
      },
      [store.teamMemberStore, team.teamId, t]
    )

    const onTeamMuteChange = useCallback(
      async (mute: boolean) => {
        try {
          await store.teamStore.setTeamChatBannedActive({
            teamId: team.teamId,
            chatBannedMode: mute
              ? V2NIMConst.V2NIMTeamChatBannedMode
                  .V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL
              : V2NIMConst.V2NIMTeamChatBannedMode
                  .V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN,
          })
          message.success(
            mute ? t('muteAllTeamSuccessText') : t('unmuteAllTeamSuccessText')
          )
        } catch (error: any) {
          switch (error?.code) {
            // 无权限
            case 109432:
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
        .filter((item) => item.senderId !== myUser.accountId)
        .filter((item) => !!item.messageServerId)
        .filter((item) =>
          // 以下这些类型的消息不需要发送已读未读
          [
            V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION,
            V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS,
            V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_ROBOT,
            V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL,
          ].every((j) => j !== item.messageType)
        )

      const visibleChangeHandler = (params: {
        visible: boolean
        target: HTMLElement
      }) => {
        if (params.visible) {
          // 发送已读
          const msg = notMyMsgs.find(
            (item) => item.messageClientId === params.target.id
          )
          if (msg) {
            store.msgStore
              .sendTeamMsgReceiptActive([msg])
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
          const target = document.getElementById(item.messageClientId)
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
    }, [
      store.msgStore,
      msgs,
      visibilityObserver,
      team.teamId,
      myUser.accountId,
    ])

    useEffect(() => {
      return () => {
        visibilityObserver.destroy()
      }
    }, [visibilityObserver])

    // 切换会话时需要重新初始化
    useEffect(() => {
      resetState()
      scrollToBottom()
      store.teamStore.getTeamActive(receiverId).catch((err) => {
        console.warn('获取群组失败：', err.toString())
      })
      store.teamMemberStore
        .getTeamMemberActive({
          teamId: receiverId,
          type: 1,
          queryOption: {
            limit: Math.max(team.memberLimit, 200),
            roleQueryType: 0,
          },
        })
        .catch((err) => {
          console.warn('获取群组成员失败：', err.toString())
        })
    }, [
      team.memberLimit,
      store.teamStore,
      store.teamMemberStore,
      receiverId,
      resetState,
      scrollToBottom,
    ])

    // 切换会话时，如果内存中除了撤回消息的其他消息小于10条（差不多一屏幕），需要拉取历史消息
    useEffect(() => {
      const memoryMsgs = conversationId
        ? store.msgStore
            .getMsg(conversationId)
            .filter(
              (item) =>
                !['beReCallMsg', 'reCallMsg'].includes(item.recallType || '')
            )
        : []

      if (memoryMsgs.length < 10) {
        getHistory(Date.now()).then((res) => {
          scrollToBottom()
          // TODO 考虑以下这段代码是否还需要
          // if (conversation && !conversation.lastMessage && res && res[0]) {
          //   store.conversationStore.addConversation([
          //     { ...conversation, lastMessage: res[0] },
          //   ])
          // }
        })
      } else {
        // 获取自己发出去的消息
        const myMsgs = memoryMsgs.filter(
          (item) => item.senderId === myUser.accountId
        )
        // 获取群组已读未读数
        store.msgStore.getTeamMsgReadsActive(myMsgs, conversationId)
        scrollToBottom()
      }
    }, [
      store.msgStore,
      conversationId,
      getHistory,
      scrollToBottom,
      myUser.accountId,
    ])

    // 处理消息
    useEffect(() => {
      if (msgs.length !== 0) {
        const replyMsgsMap = {}
        const reqMsgs: Array<{
          scene: 'p2p' | 'team'
          from: string
          to: string
          idServer: string
          idClient: string
          time: number
        }> = []
        const messageClientIds: string[] = []
        msgs.forEach((msg) => {
          if (msg.serverExtension) {
            try {
              const { yxReplyMsg } = JSON.parse(msg.serverExtension)
              if (yxReplyMsg) {
                const replyMsg = msgs.find(
                  (item) => item.messageClientId === yxReplyMsg.idClient
                )
                if (replyMsg) {
                  replyMsgsMap[msg.messageClientId] = replyMsg
                } else {
                  replyMsgsMap[msg.messageClientId] = 'noFind'
                  const { scene, from, to, idServer, idClient, time } =
                    yxReplyMsg
                  if (scene && from && to && idServer && idClient && time) {
                    reqMsgs.push({ scene, from, to, idServer, idClient, time })
                    messageClientIds.push(msg.messageClientId)
                  }
                }
              }
            } catch {}
          }
        })
        if (reqMsgs.length > 0) {
          nim.V2NIMMessageService.getMessageListByRefers(
            reqMsgs.map((item) => ({
              senderId: item.from,
              receiverId: item.to,
              messageClientId: item.idClient,
              messageServerId: item.idServer,
              createTime: item.time,
              conversationType:
                item.scene === 'p2p'
                  ? V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
                  : V2NIMConst.V2NIMConversationType
                      .V2NIM_CONVERSATION_TYPE_TEAM,
              conversationId: nim.V2NIMConversationIdUtil.teamConversationId(
                item.to
              ),
            }))
          ).then((res) => {
            res.forEach((item, index) => {
              replyMsgsMap[messageClientIds[index]] = item
            })
            setReplyMsgsMap({ ...replyMsgsMap })
          })
        } else {
          setReplyMsgsMap({ ...replyMsgsMap })
        }
      }
    }, [
      msgs,
      store,
      team.teamId,
      nim.V2NIMMessageService,
      nim.V2NIMConversationIdUtil,
    ])

    useLayoutEffect(() => {
      const onMsg = (msg: V2NIMMessageForUI[]) => {
        if (
          messageListContainerDomRef.current &&
          msg[0].conversationId === conversationId
        ) {
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

      nim.V2NIMMessageService.on('onReceiveMessages', onMsg)

      return () => {
        nim.V2NIMMessageService.off('onReceiveMessages', onMsg)
      }
    }, [nim, conversationId, scrollToBottom])

    useEffect(() => {
      // 根据 onMsg 处理提示
      const onMsgToast = (msgs: V2NIMMessageForUI[]) => {
        const msg = msgs[0]
        if (
          msg.conversationId === conversationId &&
          msg.messageType ===
            V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION
        ) {
          const attachment =
            msg.attachment as V2NIMMessageNotificationAttachment
          switch (attachment?.type) {
            // 主动离开群聊
            case V2NIMConst.V2NIMMessageNotificationType
              .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_LEAVE: {
              if (msg.senderId === myUser.accountId) {
                message.success(t('leaveTeamSuccessText'))
              } else {
                message.info(
                  `${store.uiStore.getAppellation({
                    account: msg.senderId,
                    teamId: msg.receiverId,
                  })}${t('leaveTeamText')}`
                )
              }
              break
            }
            // 踢出群聊
            case V2NIMConst.V2NIMMessageNotificationType
              .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_KICK: {
              if ((attachment?.targetIds || []).includes(myUser.accountId)) {
                message.warning(t('onRemoveTeamText'))
              } else {
                const nicks = (attachment?.targetIds || []).map((item) =>
                  store.uiStore.getAppellation({
                    account: item,
                    teamId: msg.receiverId,
                  })
                )
                message.info(`${nicks.join('，')}${t('leaveTeamText')}`)
              }
              break
            }
            // 解散群聊
            case V2NIMConst.V2NIMMessageNotificationType
              .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_DISMISS:
              message.warning(t('onDismissTeamText'))
              break
            // 有人主动加入群聊
            case V2NIMConst.V2NIMMessageNotificationType
              .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_APPLY_PASS:
            // 邀请加入群聊对方同意
            case V2NIMConst.V2NIMMessageNotificationType
              .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE_ACCEPT:
              {
                if (msg.senderId === myUser.accountId) {
                  message.info(
                    `${store.uiStore.getAppellation({
                      account: msg.senderId,
                      teamId: msg.receiverId,
                    })}${t('enterTeamText')}`
                  )
                }
              }
              break
            // 邀请加入群聊无需验证
            case V2NIMConst.V2NIMMessageNotificationType
              .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE: {
              const nicks = (attachment?.targetIds || []).map((item) =>
                store.uiStore.getAppellation({
                  account: item,
                  teamId: msg.receiverId,
                })
              )
              message.info(`${nicks.join('，')}${t('enterTeamText')}`)
              break
            }
          }
        }
      }

      nim.V2NIMMessageService.on('onReceiveMessages', onMsgToast)

      return () => {
        nim.V2NIMMessageService.off('onReceiveMessages', onMsgToast)
      }
    }, [nim, conversationId, myUser.accountId, store.uiStore, t])

    return conversation ? (
      <div className={`${prefix}-wrap`}>
        <div ref={settingDrawDomRef} className={`${prefix}-content`}>
          {renderHeader ? (
            renderHeader(conversation)
          ) : (
            <ChatHeader
              prefix={prefix}
              title={teamNameOrTeamId}
              subTitle={`(${teamMembers.length} ${t('personUnit')})`}
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
                    conversation,
                    mute: teamMute,
                  })
                : teamMute
                ? t('teamMutePlaceholder')
                : `${t('sendToText')} ${teamNameOrTeamId}${t('sendUsageText')}`
            }
            replyMsg={replyMsg}
            mentionMembers={mentionMembers}
            conversationType={conversationType}
            receiverId={receiverId}
            actions={actions}
            inputValue={inputValue}
            mute={teamMute}
            allowAtAll={allowAtAll}
            setInputValue={setInputValue}
            onRemoveReplyMsg={onRemoveReplyMsg}
            onSendText={onSendText}
            onSendFile={onSendFile}
            onSendImg={onSendImg}
            onSendVideo={onSendVideo}
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
              myAccount={myUser?.accountId || ''}
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
          msg={forwardMessage}
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
          teamId={receiverId}
        />
      </div>
    ) : null
  }
)

export default TeamChatContainer
