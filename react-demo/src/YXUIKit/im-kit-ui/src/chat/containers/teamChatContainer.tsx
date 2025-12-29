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
import { storeConstants } from '@xkit-yx/im-store-v2'
import { observer } from 'mobx-react'
import { GroupItemProps } from '../components/ChatTeamSetting/GroupItem'
import ChatForwardModal from '../components/ChatForwardModal'
import MultiMessageOperation from '../components/MultiMessageOperation'
import { MentionedMember } from '../components/ChatMessageInput/ChatMentionMemberList'
import GroupTransferModal from '../components/ChatGroupTransferModal'
import {
  getImgDataUrl,
  getVideoFirstFrameDataUrl,
  logger,
  replaceEmoji,
  isDiscussionFunc,
} from '../../utils'
import {
  V2NIMTeam,
  V2NIMTeamMember,
  V2NIMUpdateTeamInfoParams,
  V2NIMUpdateSelfMemberInfoParams,
} from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService'
import {
  V2NIMConversationType,
  V2NIMConversation,
} from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMConversationService'
import {
  V2NIMMessageForUI,
  YxReplyMsg,
  YxServerExt,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import {
  V2NIMMessage,
  V2NIMMessageNotificationAttachment,
} from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService'
import { V2NIMError } from 'nim-web-sdk-ng/dist/esm/nim/src/types'
import ChatTopMessage from '../components/ChatTopMsg'
import { ChatAISearch } from '../components/ChatAISearch'
import { ChatAITranslate } from '../components/ChatAITranslate'
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMLocalConversationService'
import { V2NIMAIUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMAIService'
import { V2NIMUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService'

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
  onMessageItemAvatarClick?: (user: V2NIMUser) => void
  afterTransferTeam?: (teamId: string) => Promise<void>
  renderTeamCustomMessage?: (
    options: RenderTeamCustomMessageOptions
  ) => JSX.Element | null | undefined
  renderHeader?: (
    conversation: V2NIMConversation | V2NIMLocalConversation
  ) => JSX.Element
  renderTeamInputPlaceHolder?: (params: {
    conversation: V2NIMConversation | V2NIMLocalConversation
    mute: boolean
  }) => string
  renderTeamMemberItem?: (
    params: GroupItemProps & {
      renderKey: string
      renderIndex: number
      renderStyle: React.CSSProperties
    }
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

  msgRecallTime?: number
  prefix?: string
  commonPrefix?: string
  scrollIntoMode?: 'nearest'
  maxUploadFileSize: number
  /**
   * 是否允许发送视频
   */
  enableSendVideo?: boolean
}

const TeamChatContainer: React.FC<TeamChatContainerProps> = observer(
  ({
    conversationType,
    receiverId,
    settingActions,
    actions,
    msgOperMenu,
    maxUploadFileSize,
    onSendText: onSendTextFromProps,
    afterTransferTeam,
    onMessageItemAvatarClick,
    renderTeamCustomMessage,
    renderHeader,
    renderTeamInputPlaceHolder,
    renderTeamMemberItem,
    renderMessageAvatar,
    renderMessageName,
    renderMessageInnerContent,
    renderMessageOuterContent,

    msgRecallTime = 2 * 60 * 1000,
    prefix = 'chat',
    commonPrefix = 'common',
    scrollIntoMode,
    enableSendVideo = true,
  }) => {
    const { store, nim, localOptions, locale } = useStateContext()

    const { t } = useTranslation()

    const conversationId =
      nim.V2NIMConversationIdUtil.teamConversationId(receiverId)

    const conversation = store.sdkOptions?.enableV2CloudConversation
      ? store.conversationStore?.conversations.get(conversationId)
      : store.localConversationStore?.conversations.get(conversationId)

    // 群免打扰变更设置
    // 注意, 现有逻辑取名不准确, 使得设置禁言叫 mute, 设置免打扰也叫 mute
    // 为了避免歧义, 在这里回调函数起名叫 disturb 代表和免打扰有关
    // 并且之所以需要强转, 是因为 conversation.mute 只有 true/false 布尔值,
    // 而群免打扰属性是三态的枚举值, 只不过我们这里忽略了只针对普通群成员设置免打扰的情况
    const teamDoNotDisturbMode = Number(Boolean(conversation?.mute))

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
    }

    const teamMembers = store.teamMemberStore.getTeamMember(receiverId)

    const myUser = store.userStore.myUserInfo

    const teamNameOrTeamId = team?.name || team?.teamId || ''

    const placeholder = useMemo(() => {
      if (teamNameOrTeamId.length > 16) {
        return teamNameOrTeamId.slice(0, 16) + '...'
      }

      return teamNameOrTeamId
    }, [teamNameOrTeamId])

    // 是否是讨论组
    const isDiscussion = useMemo(() => {
      return isDiscussionFunc(team.serverExtension)
    }, [team.serverExtension])

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
      const aiChatUser = localOptions.aiVisible
        ? store.aiUserStore.getAIChatUser()
        : []

      const sortedMembersWithoutMeAndAI = sortedMembers
        .filter((item) => item.accountId !== myUser?.accountId)
        .filter((item) =>
          aiChatUser.every((aiUser) => aiUser.accountId !== item.accountId)
        )

      return [...aiChatUser, ...sortedMembersWithoutMeAndAI]
    }, [
      sortedMembers,
      myUser?.accountId,
      store.aiUserStore,
      localOptions.aiVisible,
    ])

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

    const serverExt = useMemo(() => {
      let ext: YxServerExt = {}

      try {
        ext = JSON.parse(team.serverExtension || '{}')
      } catch (error) {
        //
      }

      return ext
    }, [team.serverExtension])

    const allowAtAll = useMemo(() => {
      if (serverExt.yxAllowAt === 'manager') {
        return isGroupOwner || isGroupManager
      }

      return true
    }, [serverExt, isGroupOwner, isGroupManager])

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
    const [translateOpen, setTranslateOpen] = useState(false)
    const [multiSelecting, setMultiSelecting] = useState(false)
    const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([])
    const [multiForwardVisible, setMultiForwardVisible] = useState(false)

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

    const resetSettingState = useCallback(() => {
      setNavHistoryStack([])
      setAction(undefined)
      setGroupAddMembersVisible(false)
      setSettingDrawerVisible(false)
    }, [])

    const resetState = useCallback(() => {
      resetSettingState()
      setInputValue('')
      setLoadingMore(false)
      setNoMore(false)
      setReceiveMsgBtnVisible(false)
      setForwardMessage(undefined)
      setTranslateOpen(false)
      store.aiUserStore.resetAIProxy()
    }, [store.aiUserStore, resetSettingState])

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
        } catch (error) {
          setLoadingMore(false)
          switch ((error as V2NIMError)?.code) {
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
    const scrollToBottom = useCallback(() => {
      if (messageListContainerDomRef.current) {
        messageListContainerDomRef.current.scrollTop =
          messageListContainerDomRef.current.scrollHeight
      }

      setReceiveMsgBtnVisible(false)
    }, [])

    const onAISendHandler = useCallback(() => {
      if (!localOptions?.aiStream) {
        message.success(t('aiSendingText'))
      }
    }, [t])

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
              document.getElementById(_msg.messageClientId)?.scrollIntoView(
                scrollIntoMode == 'nearest'
                  ? {
                      block: 'nearest', // 滚动到目标元素的最近可见位置
                      inline: 'nearest', // 避免水平方向的滚动
                    }
                  : true
              )
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
        const { serverExtension } = msg
        // 为了解决 1.撤回回复消息A 2.再撤回普通文本消息B 3.重新编辑消息A 4.再重新编辑消息B后 输入框显示A的引用内容，发送后显示A的引用内容的问题

        if (msg.conversationId) {
          store.msgStore.removeReplyMsgActive(msg.conversationId)
        }

        if (msg.threadReply) {
          const completeMsg = store.msgStore.getMsg(
            msg.threadReply.conversationId,
            [msg.threadReply.messageClientId]
          )[0]

          store.msgStore.replyMsgActive(completeMsg)
        } else if (serverExtension) {
          const extObj: YxServerExt = JSON.parse(serverExtension)

          if (extObj?.yxReplyMsg) {
            const replyMsg = replyMsgsMap[msg.messageClientId]

            replyMsg && store.msgStore.replyMsgActive(replyMsg)
          }
        }
        // 处理 @ 消息

        if (serverExtension) {
          try {
            const extObj: YxServerExt = JSON.parse(serverExtension)
            const yxAitMsg = extObj.yxAitMsg

            if (yxAitMsg) {
              const _mentionedMembers: MentionedMember[] = []

              Object.keys(yxAitMsg).forEach((key) => {
                if (key === storeConstants.AT_ALL_ACCOUNT) {
                  _mentionedMembers.push({
                    account: storeConstants.AT_ALL_ACCOUNT,
                    appellation: t('teamAll'),
                  })
                } else {
                  const member = mentionMembers.find(
                    (item) => item.accountId === key
                  )

                  member &&
                    _mentionedMembers.push({
                      account: member.accountId,
                      appellation: store.uiStore.getAppellation({
                        account: member.accountId,
                        teamId:
                          (member as V2NIMTeamMember).teamId || team.teamId,
                        ignoreAlias: true,
                      }),
                    })
                }
              })
              chatMessageInputRef.current?.setSelectedAtMembers(
                _mentionedMembers
              )
            }
          } catch {
            //
          }
        }

        setInputValue(msg.oldText || '')
        chatMessageInputRef.current?.input?.focus()
      },
      [
        replyMsgsMap,
        store.msgStore,
        mentionMembers,
        team.teamId,
        store.uiStore,
        t,
      ]
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
                conversationType,
                progress: () => true,
                sendBefore: () => {
                  scrollToBottom()
                },
                onAISend: onAISendHandler,
              })
              break
            default:
              await store.msgStore.sendMessageActive({
                msg,
                conversationId,
                conversationType,
                sendBefore: () => {
                  scrollToBottom()
                },
                onAISend: onAISendHandler,
              })
              break
          }

          scrollToBottom()
        } catch (error) {
          //
        }
      },
      [
        store.msgStore,
        conversationId,
        conversationType,
        scrollToBottom,
        onAISendHandler,
      ]
    )

    const onSendText = useCallback(
      async (value: string, ext?: YxServerExt) => {
        if (locale !== 'zh') {
          value = replaceEmoji(value)
        }

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
              conversationType,
              serverExtension: ext as Record<string, unknown>,
              sendBefore: () => {
                scrollToBottom()
              },
              onAISend: onAISendHandler,
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
        onAISendHandler,
        locale,
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
            conversationType,
            sendBefore: () => {
              scrollToBottom()
            },
            progress: () => true,
            onAISend: onAISendHandler,
          })
        } catch (error) {
          // message.error(t('sendMsgFailedText'))
        } finally {
          scrollToBottom()
        }
      },
      [
        store.msgStore,
        conversationId,
        conversationType,
        scrollToBottom,
        nim.V2NIMMessageCreator,
        onAISendHandler,
      ]
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
            conversationType,
            progress: () => true,
            sendBefore: () => {
              scrollToBottom()
            },
            onAISend: onAISendHandler,
          })
        } catch (error) {
          // message.error(t('sendMsgFailedText'))
        } finally {
          scrollToBottom()
        }
      },
      [
        store.msgStore,
        conversationId,
        conversationType,
        scrollToBottom,
        nim.V2NIMMessageCreator,
        onAISendHandler,
      ]
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
            conversationType,
            progress: () => true,
            sendBefore: () => {
              scrollToBottom()
            },
            onAISend: onAISendHandler,
          })
        } catch (error) {
          // message.error(t('sendMsgFailedText'))
        } finally {
          scrollToBottom()
        }
      },
      [
        store.msgStore,
        conversationId,
        conversationType,
        scrollToBottom,
        nim.V2NIMMessageCreator,
        onAISendHandler,
      ]
    )

    const onRemoveReplyMsg = useCallback(() => {
      replyMsg && store.msgStore.removeReplyMsgActive(replyMsg.conversationId)
    }, [replyMsg, store.msgStore])

    // 默认群主和管理员
    const allowTop = useMemo(() => {
      if (serverExt.im_ui_kit_group) {
        return true
      }

      if (serverExt.yxAllowTop === 'all') {
        return true
      }

      return isGroupOwner || isGroupManager
    }, [serverExt, isGroupOwner, isGroupManager])

    const handleTopMessage = useCallback(
      async (msg: V2NIMMessageForUI, isTop: boolean) => {
        if (!allowTop) {
          message.error(t('noPermission'))
          return
        }

        const serverExtension = { ...serverExt }

        serverExtension.lastOpt = 'yxMessageTop'

        const _msg = store.msgStore.handleMsgForSDK(msg)

        serverExtension.yxMessageTop = {
          idClient: _msg.messageClientId,
          scene: _msg.conversationType,
          idServer: _msg.messageServerId,
          from: _msg.senderId,
          receiverId: _msg.receiverId,
          to: _msg.conversationId,
          time: _msg.createTime,
          operator: myUser.accountId,
          operation: isTop ? 0 : 1,
        }
        try {
          await store.teamStore.updateTeamActive({
            teamId: team.teamId,
            info: {
              serverExtension: JSON.stringify(serverExtension),
            },
          })
        } catch (error) {
          logger.error('top message failed: ', (error as V2NIMError).toString())
          switch ((error as V2NIMError)?.code) {
            // 无权限
            case 109432:
              message.error(t('noPermission'))
              break
            default:
              message.error(t('topFailedText'))
              break
          }
        }
      },
      [
        store.teamStore,
        store.msgStore,
        myUser.accountId,
        t,
        team.teamId,
        allowTop,
        serverExt,
      ]
    )

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
            try {
              const diffTime = Date.now() - msg.createTime

              if (diffTime > msgRecallTime) {
                message.error(t('msgRecallTimeErrorText'))
              } else {
                await store.msgStore.reCallMsgActive(msg)
              }
            } catch (error) {
              logger.error('reCallMsg error', (error as V2NIMError).toString())
            }

            break

          case 'reply':
            {
              const isAiResponseMessage =
                msg?.aiConfig?.aiStatus ===
                V2NIMConst.V2NIMMessageAIStatus.V2NIM_MESSAGE_AI_STATUS_RESPONSE

              /**renderSenderId 用于渲染头像和昵称，当这条消息是ai发的消息，会存在如下情况
               * 1.如果是单聊，此时有ai的回复消息，那么sdk返回的消息的senderId为提问者的accountId，但此时UI上需要展示为ai的昵称和头像，将renderSenderId改为ai的accountId
               * 2.如果是群聊，此时有ai的回复消息且ai数字人不在群里，那么sdk返回的消息的senderId为提问者的accountId，但此时UI上需要展示为ai的昵称和头像，将renderSenderId改为ai的accountId
               **/
              const renderSenderId = isAiResponseMessage
                ? msg?.aiConfig?.accountId
                : msg.senderId

              const member: V2NIMTeamMember | V2NIMAIUser | undefined =
                mentionMembers.find((item) => item.accountId === renderSenderId)

              member &&
                chatMessageInputRef.current?.onAtMemberSelectHandler({
                  account: member.accountId,
                  appellation: store.uiStore.getAppellation({
                    account: member.accountId,
                    teamId: (member as V2NIMTeamMember).teamId,
                    ignoreAlias: true,
                  }),
                })
              store.msgStore.replyMsgActive(msg)
              chatMessageInputRef.current?.input?.focus()
            }

            break
          case 'collection':
            try {
              await nim.V2NIMMessageService.addCollection({
                collectionType: msg.messageType + 1000,
                collectionData: JSON.stringify({
                  message: nim.V2NIMMessageConverter.messageSerialization(msg),
                  conversationName: conversation?.name,
                  senderName: store.uiStore.getAppellation({
                    account: msg.senderId,
                    teamId: team.teamId,
                  }),
                  avatar: store.userStore.users.get(msg.senderId)?.avatar,
                }),
                uniqueId: msg.messageServerId,
              })
              message.success(t('collectionSuccess'))
            } catch (error: unknown) {
              message.error(t('collectionFailed'))
              logger.error('收藏失败：', (error as V2NIMError).toString())
            }

            break
          case 'forward':
            setForwardMessage(msg)
            break
          case 'multiSelect':
            try {
              document.body.click()
            } catch {
              // 点击body失败，不处理
            }

            setTimeout(() => {
              setMultiSelecting(true)
              setSelectedMsgIds([])
            }, 150)
            break
          case 'top':
            handleTopMessage(msg, true)
            break
          case 'unTop':
            handleTopMessage(msg, false)
            break
          case 'voiceToText':
            try {
              await store.msgStore.voiceToTextActive(msg)
            } catch (err) {
              message.error(t('voiceToTextFailedText'))
            }

            break
          default:
            break
        }
      },
      [
        store.msgStore,
        conversation?.name,
        nim.V2NIMMessageConverter,
        store.userStore.users,
        team.teamId,
        t,
        mentionMembers,
        store.uiStore,
        nim.V2NIMMessageService,
        handleTopMessage,
        msgOperMenu,
        msgRecallTime,
      ]
    )

    const onMessageAvatarAction = useCallback(
      async (key: AvatarMenuItem, msg: V2NIMMessageForUI) => {
        switch (key) {
          case 'mention':
            {
              const isAiResponseMessage =
                msg?.aiConfig?.aiStatus ===
                V2NIMConst.V2NIMMessageAIStatus.V2NIM_MESSAGE_AI_STATUS_RESPONSE

              /**renderSenderId 用于渲染头像和昵称，当这条消息是ai发的消息，会存在如下情况
               * 1.如果是单聊，此时有ai的回复消息，那么sdk返回的消息的senderId为提问者的accountId，但此时UI上需要展示为ai的昵称和头像，将renderSenderId改为ai的accountId
               * 2.如果是群聊，此时有ai的回复消息且ai数字人不在群里，那么sdk返回的消息的senderId为ai的accountId，但此时UI上需要展示为ai的昵称和头像，将renderSenderId改为ai的accountId
               **/
              const renderSenderId = isAiResponseMessage
                ? msg?.aiConfig?.accountId
                : msg.senderId

              const member: V2NIMTeamMember | V2NIMAIUser | undefined =
                mentionMembers.find((item) => item.accountId === renderSenderId)

              member &&
                chatMessageInputRef.current?.onAtMemberSelectHandler({
                  account: member.accountId,
                  appellation: store.uiStore.getAppellation({
                    account: member.accountId,
                    teamId: (member as V2NIMTeamMember).teamId,
                    ignoreAlias: true,
                  }),
                })
            }

            break
          default:
            break
        }
      },
      [mentionMembers, store.uiStore]
    )

    // 解散群组
    const onDismissTeam = useCallback(async () => {
      try {
        await store.teamStore.dismissTeamActive(team.teamId)
        message.success(t('dismissTeamSuccessText'))
      } catch (error) {
        switch ((error as V2NIMError)?.code) {
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

    // 离开群组
    const onLeaveTeam = useCallback(async () => {
      try {
        await store.teamStore.leaveTeamActive(team.teamId)
      } catch (error) {
        message.error(t('leaveTeamFailedText'))
      }
    }, [store.teamStore, team.teamId, t])

    // 离开讨论组
    // 如果此时群主退出讨论组，则群主转让给非数字人的第一个群成员，如果群只剩下群主和数字人，则直接解散讨论组
    const onLeaveDiscussion = useCallback(async () => {
      try {
        if (isGroupOwner) {
          const teamMembersWithoutAiUserAndMySelf = teamMembers
            .filter((item) => !store.aiUserStore.aiUsers.has(item.accountId))
            .filter((item) => item.accountId !== myUser?.accountId)

          if (teamMembersWithoutAiUserAndMySelf.length === 0) {
            await store.teamStore.dismissTeamActive(team.teamId)
          } else {
            await store.teamStore.transferTeamActive({
              teamId: team.teamId,
              account: teamMembersWithoutAiUserAndMySelf[0].accountId,
              leave: true,
              type: V2NIMConst.V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED,
            })
          }
        } else {
          await store.teamStore.leaveTeamActive(team.teamId)
        }
      } catch (error) {
        message.error(t('leaveDiscussionFailedText'))
      }
    }, [
      store.teamStore,
      team.teamId,
      t,
      teamMembers,
      isGroupOwner,
      store.aiUserStore.aiUsers,
      myUser?.accountId,
    ])

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
          const tip =
            team.agreeMode ===
            V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH
              ? t('addTeamMemberSuccessText')
              : t('addTeamMemberVerifyText')

          message.success(tip)
          resetSettingState()
        } catch (error) {
          switch ((error as V2NIMError)?.code) {
            // 无权限
            case 109306:
              message.error(t('noPermission'))
              break
            case 108437:
              message.error(t('createTeamMemberLimitText'))
              break

            default:
              message.error(t('addTeamMemberFailedText'))
              break
          }
        }
      },
      [store.teamMemberStore, team.teamId, t, resetSettingState, team]
    )

    const onRemoveTeamMember = useCallback(
      async (member: V2NIMTeamMember) => {
        try {
          await store.teamMemberStore.removeTeamMemberActive({
            teamId: team.teamId,
            accounts: [member.accountId],
          })
          message.success(t('removeTeamMemberSuccessText'))
        } catch (error) {
          switch ((error as V2NIMError)?.code) {
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
      async (params: V2NIMUpdateTeamInfoParams) => {
        try {
          await store.teamStore.updateTeamActive({
            teamId: team.teamId,
            info: params,
          })
          message.success(t('updateTeamSuccessText'))
        } catch (error) {
          switch ((error as V2NIMError)?.code) {
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
        } catch (error) {
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
        } catch (error) {
          switch ((error as V2NIMError)?.code) {
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

    // 群免打扰的修改.
    const onTeamDisturbChange = useCallback(
      async (mute: boolean) => {
        try {
          await store.teamStore.setTeamMessageMuteModeActive(
            team.teamId,
            team.teamType,
            mute
              ? V2NIMConst.V2NIMTeamMessageMuteMode
                  .V2NIM_TEAM_MESSAGE_MUTE_MODE_ON
              : V2NIMConst.V2NIMTeamMessageMuteMode
                  .V2NIM_TEAM_MESSAGE_MUTE_MODE_OFF
          )
          message.success(t('updateTeamSuccessText'))
        } catch (error) {
          message.error(t('updateTeamFailedText'))
        }
      },
      [store.teamStore, team.teamId, team.teamType, t]
    )

    const handleForwardModalSend = () => {
      scrollToBottom()
      setForwardMessage(undefined)
      setMultiForwardVisible(false)
      setMultiSelecting(false)
      setSelectedMsgIds([])
    }

    const handleForwardModalClose = () => {
      setForwardMessage(undefined)
      setMultiForwardVisible(false)
    }

    const handleGroupActionCancel = () => {
      setGroupTransferModalVisible(false)
    }

    const stopAIStreamMessage = (msg: V2NIMMessage) => {
      store.msgStore
        .stopAIStreamMessageActive(msg, {
          operationType: 0,
        })
        .catch(() => {
          message.error(t('aiStopFailedText'))
        })
    }

    const regenAIMessage = (msg: V2NIMMessage) => {
      if (
        msg?.aiConfig?.aiStreamStatus ===
        V2NIMConst.V2NIMMessageAIStreamStatus.NIM_MESSAGE_AI_STREAM_STATUS_NONE
      ) {
        message.success(t('aiSendingText'))
      }

      store.msgStore
        .regenAIMessageActive(msg, {
          operationType:
            V2NIMConst.V2NIMMessageAIRegenOpType.V2NIM_MESSAGE_AI_REGEN_OP_NEW,
        })
        .catch((error) => {
          if (error.code === 107404) {
            message.error(t('recallReplyMessageText'))
          } else {
            message.error(t('regenAIMsgFailedText'))
          }
        })
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
              .catch(() => {
                // 忽略这个报错
              })
              .finally(() => {
                visibilityObserver.unobserve(params.target)
              })
            // 会话列表@消息判断需要，标记当前会话最后已读时间
            if (store.sdkOptions?.enableV2CloudConversation) {
              store.conversationStore?.markConversationReadActive(
                msg.conversationId
              )
            } else {
              store.localConversationStore?.markConversationReadActive(
                msg.conversationId
              )
            }
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
      // 这里给一个timeout，让微任务、回复消息、撤回消息计算等完成之后，在执行滚动到底部
      const timer = setTimeout(scrollToBottom, 0)

      store.teamStore.getTeamActive(receiverId).catch((err) => {
        logger.warn('获取群组失败：', err.toString())
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
          logger.warn('获取群组成员失败：', err.toString())
        })
      return () => {
        clearTimeout(timer)
      }
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
        getHistory(Date.now()).then(() => {
          scrollToBottom()
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
        const reqMsgs: YxReplyMsg[] = []
        const messageClientIds: string[] = []

        msgs.forEach((msg) => {
          if (msg.serverExtension) {
            try {
              const { yxReplyMsg } = JSON.parse(
                msg.serverExtension
              ) as YxServerExt

              if (yxReplyMsg) {
                const replyMsg = msgs.find(
                  (item) => item.messageClientId === yxReplyMsg.idClient
                )

                if (replyMsg) {
                  replyMsgsMap[msg.messageClientId] = replyMsg
                } else {
                  replyMsgsMap[msg.messageClientId] = 'noFind'
                  const {
                    scene,
                    from,
                    to,
                    idServer,
                    idClient,
                    time,
                    receiverId,
                  } = yxReplyMsg

                  if (
                    scene &&
                    from &&
                    to &&
                    idServer &&
                    idClient &&
                    time &&
                    receiverId
                  ) {
                    reqMsgs.push({
                      scene,
                      from,
                      to,
                      idServer,
                      idClient,
                      time,
                      receiverId,
                    })
                    messageClientIds.push(msg.messageClientId)
                  }
                }
              }
            } catch {
              //
            }
          }
        })
        if (reqMsgs.length > 0) {
          nim.V2NIMMessageService.getMessageListByRefers(
            reqMsgs.map((item) => ({
              senderId: item.from,
              receiverId: item.receiverId,
              messageClientId: item.idClient,
              messageServerId: item.idServer,
              createTime: item.time,
              conversationType: item.scene,
              conversationId: item.to,
            }))
          )
            .then((res) => {
              res.forEach((item, index) => {
                replyMsgsMap[messageClientIds[index]] =
                  store.msgStore.handleReceiveAIMsg(item)
              })
              setReplyMsgsMap({ ...replyMsgsMap })
            })
            .catch((err) => {
              logger.error('获取回复消息失败：', (err as V2NIMError).toString())
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
          const container = messageListContainerDomRef.current
          // 计算距离底部的距离
          const distanceToBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight

          /**
           * 收到ai的新消息时
           * scrollHeight 表示整个内容的高度，而 scrollTop 表示已滚动的距离。当新消息到达时， scrollHeight 会增加，但 scrollTop 并不会自动调整
           * 但问题在于，当新消息到达时：
              1. scrollHeight 会增加
              2. scrollTop 保持不变
              3. clientHeight 是固定的可视区域高度
              所以这个差值会一直变大，导致判断失效。
           */

          const isAiMessage = msg[0]?.aiConfig?.aiStatus === 2

          /** ai 消息距离底部小于 300px，则认为是在底部，因为ai消息带上被回复的内容一般高度较大 */
          const diffDistanceConst = isAiMessage ? 300 : 200

          // 如果距离底部小于 300px，则认为是在底部
          if (distanceToBottom < diffDistanceConst) {
            scrollToBottom()
          } else {
            setReceiveMsgBtnVisible(true)
          }
        }
      }

      nim.V2NIMMessageService.on('onReceiveMessages', onMsg)

      return () => {
        nim.V2NIMMessageService.off('onReceiveMessages', onMsg)
      }
    }, [nim, conversationId, scrollToBottom])

    useLayoutEffect(() => {
      const onReceiveMessagesModified = (msg: V2NIMMessage[]) => {
        if (
          messageListContainerDomRef.current &&
          msg[0].conversationId === conversationId
        ) {
          if (
            messageListContainerDomRef.current.scrollTop >=
            messageListContainerDomRef.current.scrollHeight -
              messageListContainerDomRef.current.clientHeight -
              250
          ) {
            scrollToBottom()
          }
        }
      }

      nim.V2NIMMessageService.on(
        'onReceiveMessagesModified',
        onReceiveMessagesModified
      )

      return () => {
        nim.V2NIMMessageService.off(
          'onReceiveMessagesModified',
          onReceiveMessagesModified
        )
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
                message.success(
                  isDiscussion
                    ? t('leaveDiscussionSuccessText')
                    : t('leaveTeamSuccessText')
                )
              } else {
                if (isDiscussion) {
                  message.info(
                    `${store.uiStore.getAppellation({
                      account: msg.senderId,
                      teamId: msg.receiverId,
                    })}${t('leaveDiscussionText')}`
                  )
                } else {
                  message.info(
                    `${store.uiStore.getAppellation({
                      account: msg.senderId,
                      teamId: msg.receiverId,
                    })}${t('leaveTeamText')}`
                  )
                }
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
              message.warning(
                isDiscussion
                  ? t('onDismissDiscussionText')
                  : t('onDismissTeamText')
              )
              break
            // 有人主动加入群聊
            case V2NIMConst.V2NIMMessageNotificationType
              .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_APPLY_PASS:
              {
                if (msg.senderId === myUser.accountId) {
                  const accounts: string[] = attachment?.targetIds || []
                  const nicks = accounts
                    .map((item) => {
                      if (
                        !(
                          msg.conversationType !==
                            V2NIMConst.V2NIMConversationType
                              .V2NIM_CONVERSATION_TYPE_TEAM ||
                          store.userStore.users.has(item) ||
                          store.aiUserStore.aiUsers.has(item)
                        )
                      ) {
                        store.userStore.getUserActive(item)
                      }

                      return store.uiStore.getAppellation({
                        account: item,
                        teamId: msg.receiverId,
                      })
                    })
                    .filter((item) => !!item)
                    .join('、')

                  message.info(`${nicks}${t('enterTeamText')}`)
                }
              }

              break
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
    }, [nim, conversationId, myUser.accountId, store.uiStore, isDiscussion, t])

    // 监听消息列表变化，移除已撤回的选中消息
    useEffect(() => {
      if (selectedMsgIds.length > 0) {
        const validMsgIds = selectedMsgIds.filter((msgId) => {
          const msg = msgs.find((item) => item.messageClientId === msgId)

          return (
            msg && !['reCallMsg', 'beReCallMsg'].includes(msg.recallType || '')
          )
        })

        if (validMsgIds.length !== selectedMsgIds.length) {
          setSelectedMsgIds(validMsgIds)
        }
      }
    }, [msgs, selectedMsgIds])

    useEffect(() => {
      return () => {
        if (conversationId) {
          // 获取当前会话的所有消息
          const allMsgs = store.msgStore.getMsg(conversationId)

          // 如果消息数量大于20条，则删除最旧的消息，只保留最近20条
          if (allMsgs.length > 20) {
            // 按时间排序，确保获取到最旧的消息
            const sortedMsgs = [...allMsgs].sort(
              (a, b) => a.createTime - b.createTime
            )

            // 计算需要删除的消息数量
            const deleteCount = allMsgs.length - 20

            // 获取需要删除的消息的 messageClientId
            const msgsToDelete = sortedMsgs.slice(0, deleteCount)
            const idClientsToDelete = msgsToDelete.map(
              (msg) => msg.messageClientId
            )

            // 删除指定的消息，保留最近20条
            store.msgStore.removeMsg(conversationId, idClientsToDelete)
          }
        }
      }
    }, [])

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
          {serverExt.yxMessageTop?.operation === 0 ? (
            <ChatTopMessage
              topMessage={serverExt.yxMessageTop}
              allowTop={allowTop}
              onClose={handleTopMessage}
              prefix={prefix}
              commonPrefix={commonPrefix}
            />
          ) : null}
          <ChatTeamMessageList
            prefix={prefix}
            commonPrefix={commonPrefix}
            ref={messageListContainerDomRef}
            msgs={msgs}
            msgOperMenu={msgOperMenu}
            replyMsgsMap={replyMsgsMap}
            topMessage={serverExt.yxMessageTop}
            members={teamMembers}
            noMore={noMore}
            loadingMore={loadingMore}
            receiveMsgBtnVisible={receiveMsgBtnVisible}
            stopAIStreamMessage={stopAIStreamMessage}
            myAccountId={myUser.accountId}
            regenAIMessage={regenAIMessage}
            onReceiveMsgBtnClick={scrollToBottom}
            onResend={onResend}
            onMessageItemAvatarClick={onMessageItemAvatarClick}
            onMessageAction={onMessageAction}
            onMessageAvatarAction={onMessageAvatarAction}
            onReeditClick={onReeditClick}
            onScroll={onMsgListScrollHandler}
            renderTeamCustomMessage={renderTeamCustomMessage}
            renderMessageAvatar={renderMessageAvatar}
            renderMessageName={renderMessageName}
            renderMessageInnerContent={renderMessageInnerContent}
            renderMessageOuterContent={renderMessageOuterContent}
            multiSelectMode={multiSelecting}
            selectedMsgIds={selectedMsgIds}
            onSelectChange={(m, checked) => {
              const id = m.messageClientId

              setSelectedMsgIds((prev) =>
                checked ? [...prev, id] : prev.filter((i) => i !== id)
              )
            }}
          />

          <ChatAITranslate
            key={receiverId}
            onClose={() => {
              setTranslateOpen(false)
            }}
            prefix={prefix}
            inputValue={inputValue}
            visible={translateOpen}
            setInputValue={setInputValue}
          />
          {multiSelecting ? (
            <MultiMessageOperation
              prefix={prefix}
              disabled={selectedMsgIds.length === 0}
              onConfirm={() => setMultiForwardVisible(true)}
              onCancel={() => {
                setMultiSelecting(false)
                setSelectedMsgIds([])
              }}
              selectedMsgIds={selectedMsgIds}
              msgs={msgs}
              onRemoveSelectedMsgs={(msgIds) => {
                setSelectedMsgIds((prev) =>
                  prev.filter((id) => !msgIds.includes(id))
                )
              }}
            />
          ) : (
            <MessageInput
              ref={chatMessageInputRef}
              prefix={prefix}
              commonPrefix={commonPrefix}
              maxUploadFileSize={maxUploadFileSize}
              enableSendVideo={enableSendVideo}
              placeholder={
                renderTeamInputPlaceHolder
                  ? renderTeamInputPlaceHolder({
                      conversation,
                      mute: teamMute,
                    })
                  : teamMute
                  ? t('teamMutePlaceholder')
                  : `${t('sendToText')} ${placeholder}${t('sendUsageText')}`
              }
              translateOpen={translateOpen}
              onTranslate={setTranslateOpen}
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
          )}
          <ChatAISearch key={conversationId} prefix={prefix} />
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
              teamDoNotDisturbMode={teamDoNotDisturbMode}
              myAccount={myUser?.accountId || ''}
              isGroupManager={isGroupManager}
              isGroupOwner={isGroupOwner}
              navHistoryStack={navHistoryStack}
              setNavHistoryStack={setNavHistoryStack}
              afterSendMsgClick={resetSettingState}
              onAddMembersClick={onAddMembersClick}
              onLeaveDiscussion={onLeaveDiscussion}
              onDismissTeam={onDismissTeam}
              onLeaveTeam={onLeaveTeam}
              onRemoveTeamMemberClick={onRemoveTeamMember}
              onUpdateTeamInfo={onUpdateTeamInfo}
              onUpdateMyMemberInfo={onUpdateMyMemberInfo}
              onTeamMuteChange={onTeamMuteChange}
              onTeamDisturbChange={onTeamDisturbChange}
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
          key={receiverId}
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
          visible={multiForwardVisible || !!forwardMessage}
          msg={multiForwardVisible ? undefined : forwardMessage}
          msgs={
            multiForwardVisible
              ? msgs.filter((m) => selectedMsgIds.includes(m.messageClientId))
              : undefined
          }
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
