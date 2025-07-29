import React, {
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
  useMemo,
  useCallback,
} from 'react'
import ChatActionBar from '../components/ChatActionBar'
import ChatHeader from '../components/ChatHeader'
import ChatP2pMessageList, {
  RenderP2pCustomMessageOptions,
} from '../components/ChatP2pMessageList'
import MessageInput, {
  ChatMessageInputRef,
} from '../components/ChatMessageInput'
import ChatSettingDrawer from '../components/ChatSettingDrawer'
import { ChatAction } from '../types'
import {
  useStateContext,
  useTranslation,
  ComplexAvatarContainer,
  CreateTeamModal,
} from '../../common'
import { Action, ChatSettingActionItem, MsgOperMenuItem } from '../Container'
import ChatP2pSetting from '../components/ChatP2pSetting'
import { debounce, VisibilityObserver } from '@xkit-yx/utils'
import { MenuItemKey } from '../components/ChatMessageItem'
import { message } from 'antd'
import { storeConstants } from '@xkit-yx/im-store-v2'
import { observer } from 'mobx-react'
import ChatForwardModal from '../components/ChatForwardModal'
import {
  getImgDataUrl,
  getVideoFirstFrameDataUrl,
  logger,
  replaceEmoji,
} from '../../utils'
import {
  V2NIMConversationType,
  V2NIMConversation,
} from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMConversationService'
import { V2NIMMessage } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService'
import {
  V2NIMMessageForUI,
  YxReplyMsg,
  YxServerExt,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import { V2NIMError } from 'nim-web-sdk-ng/dist/esm/nim/src/types'
import { ChatAISearch } from '../components/ChatAISearch'
import { V2NIMFriend } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMFriendService'
import { ChatAITranslate } from '../components/ChatAITranslate'
import { MentionedMember } from '../components/ChatMessageInput/ChatMentionMemberList'
import { V2NIMLocalConversation } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMLocalConversationService'
import { V2NIMUser } from 'nim-web-sdk-ng/dist/esm/nim/src/V2NIMUserService'

export interface P2pChatContainerProps {
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
  renderP2pCustomMessage?: (
    options: RenderP2pCustomMessageOptions
  ) => JSX.Element | null | undefined
  renderHeader?: (
    conversation: V2NIMConversation | V2NIMLocalConversation
  ) => JSX.Element
  renderP2pInputPlaceHolder?: (
    conversation: V2NIMConversation | V2NIMLocalConversation
  ) => string
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
  /**
    是否展示陌生人提示
  */
  strangerTipVisible?: boolean
  scrollIntoMode?: 'nearest'
  maxUploadFileSize: number
  /**
   * 是否允许发送视频
   */
  enableSendVideo?: boolean
}

const P2pChatContainer: React.FC<P2pChatContainerProps> = observer(
  ({
    conversationType,
    receiverId,
    settingActions,
    actions,
    msgOperMenu,
    onSendText: onSendTextFromProps,
    onMessageItemAvatarClick,
    renderP2pCustomMessage,
    renderHeader,
    renderP2pInputPlaceHolder,
    renderMessageAvatar,
    renderMessageName,
    renderMessageInnerContent,
    renderMessageOuterContent,
    maxUploadFileSize,
    msgRecallTime = 2 * 60 * 1000,
    prefix = 'chat',
    commonPrefix = 'common',
    strangerTipVisible = true,
    scrollIntoMode,
    enableSendVideo = true,
  }) => {
    const { store, nim, localOptions, locale } = useStateContext()

    const { t } = useTranslation()

    const conversationId =
      nim.V2NIMConversationIdUtil.p2pConversationId(receiverId)

    const conversation = store.sdkOptions?.enableV2CloudConversation
      ? store.conversationStore?.conversations.get(conversationId)
      : store.localConversationStore?.conversations.get(conversationId)

    const msgs = store.msgStore.getMsg(conversationId)

    // 当前输入框的回复消息
    const replyMsg = store.msgStore.replyMsgs.get(conversationId)

    const { relation } = store.uiStore.getRelation(receiverId)

    const user =
      relation === 'ai'
        ? store.aiUserStore.aiUsers.get(receiverId)
        : store.uiStore.getFriendWithUserNameCard(receiverId)

    const myUser = store.userStore.myUserInfo

    const userNickOrAccount = store.uiStore.getAppellation({
      account: user?.accountId || '',
    })

    const placeholder = useMemo(() => {
      if (userNickOrAccount.length > 15) {
        return userNickOrAccount.slice(0, 15) + '...'
      }

      return userNickOrAccount
    }, [userNickOrAccount])

    const mentionMembers = useMemo(() => {
      if (relation === 'ai' || !localOptions.aiVisible) {
        return []
      }

      return store.aiUserStore.getAIChatUser()
    }, [store.aiUserStore, relation, localOptions.aiVisible])

    const isAiUser = store.aiUserStore.isAIUser(receiverId)

    const createDefaultAccounts = useMemo(() => [receiverId], [receiverId])

    const messageListContainerDomRef = useRef<HTMLDivElement>(null)
    const settingDrawDomRef = useRef<HTMLDivElement>(null)
    const chatMessageInputRef = useRef<ChatMessageInputRef>(null)

    const [isOnline, setIsOnline] = useState<boolean>(false)

    useEffect(() => {
      if (localOptions.loginStateVisible) {
        setIsOnline(
          store.subscriptionStore.stateMap.get(receiverId)?.statusType ===
            V2NIMConst.V2NIMUserStatusType.V2NIM_USER_STATUS_TYPE_LOGIN
        )
      }
    }, [
      store.subscriptionStore.stateMap,
      localOptions.loginStateVisible,
      receiverId,
      store.subscriptionStore.stateMap.get(receiverId),
    ])

    const visibilityObserver = useMemo(() => {
      return new VisibilityObserver({
        root: messageListContainerDomRef.current,
      })
    }, [receiverId])

    // 以下是 UI 相关的 state，需要在切换会话时重置
    const [replyMsgsMap, setReplyMsgsMap] = useState<
      Record<string, V2NIMMessageForUI>
    >({}) // 回复消息的 map
    const [action, setAction] = useState<ChatAction | undefined>(undefined)
    const [inputValue, setInputValue] = useState('')
    const [groupCreateVisible, setGroupCreateVisible] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [noMore, setNoMore] = useState(false)
    const [receiveMsgBtnVisible, setReceiveMsgBtnVisible] = useState(false)
    const [settingDrawerVisible, setSettingDrawerVisible] = useState(false)
    const [forwardMessage, setForwardMessage] = useState<
      V2NIMMessageForUI | undefined
    >(undefined)
    const [translateOpen, setTranslateOpen] = useState(false)

    const resetSettingState = useCallback(() => {
      setAction(undefined)
      setGroupCreateVisible(false)
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
          message.error(t('getHistoryMsgFailedText'))
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
      setAction(undefined)
      setSettingDrawerVisible(false)
    }, [])

    const onReeditClick = useCallback(
      (msg: V2NIMMessageForUI) => {
        setInputValue(msg.oldText || '')

        // 为了解决 1.撤回回复消息A 2.再撤回普通文本消息B 3.重新编辑消息A 4.再重新编辑消息B后 输入框显示A的引用内容，发送后显示A的引用内容的问题

        if (msg.conversationId) {
          store.msgStore.removeReplyMsgActive(msg.conversationId)
        }

        const { serverExtension } = msg

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

        chatMessageInputRef.current?.input?.focus()
      },
      [replyMsgsMap, mentionMembers, store.msgStore, store.uiStore, t]
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
            case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
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
        scrollToBottom,
        onAISendHandler,
        conversationType,
      ]
    )

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
        msg?.aiConfig?.aiStreamStatus ==
        V2NIMConst.V2NIMMessageAIStreamStatus.NIM_MESSAGE_AI_STREAM_STATUS_NONE
      ) {
        message.success(t('aiSendingText'))
      }

      store.msgStore
        .regenAIMessageActive(msg, {
          operationType:
            V2NIMConst.V2NIMMessageAIRegenOpType.V2NIM_MESSAGE_AI_REGEN_OP_NEW,
        })
        .catch(() => {
          message.error(t('regenAIMsgFailedText'))
        })
    }

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
        scrollToBottom,
        nim.V2NIMMessageCreator,
        onAISendHandler,
        conversationType,
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
            conversationType,
            previewImg,
            progress: () => true,
            sendBefore: () => {
              scrollToBottom()
            },
            onAISend: onAISendHandler,
          })
          scrollToBottom()
        } catch (error) {
          scrollToBottom()
          // message.error(t('sendMsgFailedText'))
        }
      },
      [
        store.msgStore,
        conversationId,
        scrollToBottom,
        nim.V2NIMMessageCreator,
        onAISendHandler,
        conversationType,
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
            conversationType,
            previewImg,
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
        scrollToBottom,
        nim.V2NIMMessageCreator,
        onAISendHandler,
        conversationType,
      ]
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
              // const member = mentionMembers.find(
              //   (item) => item.accountId === msg.senderId
              // )

              // member &&
              //   chatMessageInputRef.current?.onAtMemberSelectHandler({
              //     account: member.accountId,
              //     appellation: store.uiStore.getAppellation({
              //       account: member.accountId,
              //       ignoreAlias: true,
              //     }),
              //   })
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
        msgOperMenu,
        store.msgStore,
        store.userStore.users,
        store.uiStore,
        conversation?.name,
        nim.V2NIMMessageConverter,
        nim.V2NIMMessageService,
        msgRecallTime,
        t,
      ]
    )

    const createAIWelcomeMsg = useCallback(() => {
      const aiExt = store.aiUserStore.getAIUserServerExt(receiverId)

      if (aiExt.welcomeText) {
        const welcomeMsg = nim.V2NIMMessageCreator.createTextMessage(
          aiExt.welcomeText || 'hello'
        )

        welcomeMsg.senderId = receiverId
        welcomeMsg.receiverId = store.userStore.myUserInfo.accountId
        welcomeMsg.conversationId = conversationId
        welcomeMsg.sendingState =
          V2NIMConst.V2NIMMessageSendingState.V2NIM_MESSAGE_SENDING_STATE_SUCCEEDED
        welcomeMsg.isSelf = false
        //@ts-ignore
        welcomeMsg.aiConfig = {
          accountId: receiverId,
          aiStatus: 2,
        }

        store.msgStore.addMsg(conversationId, [welcomeMsg])
      }
    }, [
      conversationId,
      nim.V2NIMMessageCreator,
      receiverId,
      store.aiUserStore,
      store.msgStore,
      store.userStore.myUserInfo.accountId,
    ])

    const handleForwardModalSend = () => {
      scrollToBottom()
      setForwardMessage(undefined)
    }

    const handleForwardModalClose = () => {
      setForwardMessage(undefined)
    }

    const handleCreateModalClose = () => {
      setGroupCreateVisible(false)
    }

    useEffect(() => {
      if (localOptions.loginStateVisible) {
        store.subscriptionStore.subscribeUserStatusActive([receiverId])
      }
    }, [receiverId, store.subscriptionStore, localOptions.loginStateVisible])

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
              .sendMsgReceiptActive(msg)
              .catch(() => {
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
    }, [store.msgStore, msgs, visibilityObserver, myUser.accountId])

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

      return () => {
        clearTimeout(timer)
      }
    }, [receiverId, resetState, scrollToBottom])

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
          if (!res?.length && !memoryMsgs.length && relation === 'ai') {
            createAIWelcomeMsg()
          }

          scrollToBottom()
          // TODO 考虑以下这段代码是否还需要
          // if (conversation && !conversation.lastMessage && res && res[0]) {
          //   store.conversationStore.addConversation([
          //     { ...conversation, lastMessage: res[0] },
          //   ])
          // }
        })
      } else {
        scrollToBottom()
      }
    }, [
      store.msgStore,
      conversationId,
      relation,
      getHistory,
      scrollToBottom,
      createAIWelcomeMsg,
    ])

    // 处理消息
    useEffect(() => {
      if (msgs.length !== 0) {
        const replyMsgsMap = {}
        const reqMsgs: YxReplyMsg[] = []
        const messageClientIds: Record<string, string> = {}

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
                    messageClientIds[idServer] = msg.messageClientId
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
              res.forEach((item) => {
                if (item.messageServerId) {
                  replyMsgsMap[messageClientIds[item.messageServerId]] =
                    store.msgStore.handleReceiveAIMsg(item)
                }
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
    }, [msgs, store, nim.V2NIMMessageService, nim.V2NIMConversationIdUtil])

    useLayoutEffect(() => {
      const onMsg = (msg: V2NIMMessage[]) => {
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

    // useLayoutEffect(() => {
    //   const onReceiveMessagesModified = (msg: V2NIMMessage[]) => {
    //     if (
    //       messageListContainerDomRef.current &&
    //       msg[0].conversationId === conversationId &&
    //       isAtBottomRef.current
    //     ) {
    //       scrollToBottom()
    //     }
    //   }

    //   nim.V2NIMMessageService.on(
    //     'onReceiveMessagesModified',
    //     onReceiveMessagesModified
    //   )

    //   return () => {
    //     nim.V2NIMMessageService.off(
    //       'onReceiveMessagesModified',
    //       onReceiveMessagesModified
    //     )
    //   }
    // }, [nim, conversationId, scrollToBottom])

    return conversation ? (
      <div className={`${prefix}-wrap`}>
        <div ref={settingDrawDomRef} className={`${prefix}-content`}>
          {renderHeader ? (
            renderHeader(conversation)
          ) : (
            <ChatHeader
              prefix={prefix}
              title={
                userNickOrAccount +
                (isOnline && localOptions.loginStateVisible
                  ? t('onlineText')
                  : '')
              }
              subTitle={
                !isOnline && localOptions.loginStateVisible && !isAiUser
                  ? t('offlineText')
                  : undefined
              }
              avatar={
                <ComplexAvatarContainer
                  onMessageItemAvatarClick={onMessageItemAvatarClick}
                  account={receiverId}
                  canClick={receiverId !== myUser.accountId}
                  prefix={commonPrefix}
                />
              }
            />
          )}
          <ChatP2pMessageList
            prefix={prefix}
            commonPrefix={commonPrefix}
            ref={messageListContainerDomRef}
            msgs={msgs}
            msgOperMenu={msgOperMenu}
            replyMsgsMap={replyMsgsMap}
            receiverId={receiverId}
            noMore={noMore}
            loadingMore={loadingMore}
            receiveMsgBtnVisible={receiveMsgBtnVisible}
            msgReceiptTime={conversation?.msgReceiptTime}
            strangerTipVisible={strangerTipVisible}
            myAccountId={myUser.accountId}
            onMessageItemAvatarClick={onMessageItemAvatarClick}
            onReceiveMsgBtnClick={scrollToBottom}
            onMessageAction={onMessageAction}
            onReeditClick={onReeditClick}
            onResend={onResend}
            onScroll={onMsgListScrollHandler}
            stopAIStreamMessage={stopAIStreamMessage}
            regenAIMessage={regenAIMessage}
            renderP2pCustomMessage={renderP2pCustomMessage}
            renderMessageAvatar={renderMessageAvatar}
            renderMessageName={renderMessageName}
            renderMessageInnerContent={renderMessageInnerContent}
            renderMessageOuterContent={renderMessageOuterContent}
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
          <MessageInput
            ref={chatMessageInputRef}
            prefix={prefix}
            placeholder={
              renderP2pInputPlaceHolder
                ? renderP2pInputPlaceHolder(conversation)
                : `${t('sendToText')} ${placeholder}${t('sendUsageText')}`
            }
            enableSendVideo={enableSendVideo}
            translateOpen={translateOpen}
            maxUploadFileSize={maxUploadFileSize}
            onTranslate={setTranslateOpen}
            replyMsg={replyMsg}
            mentionMembers={mentionMembers}
            conversationType={conversationType}
            receiverId={receiverId}
            actions={actions}
            inputValue={inputValue}
            setInputValue={setInputValue}
            allowAtAll={false}
            onSendText={onSendText}
            onSendFile={onSendFile}
            onSendImg={onSendImg}
            onSendVideo={onSendVideo}
            onRemoveReplyMsg={onRemoveReplyMsg}
          />
          <ChatAISearch key={conversationId} prefix={prefix} />
          <ChatSettingDrawer
            prefix={prefix}
            visible={settingDrawerVisible}
            drawerContainer={settingDrawDomRef}
            onClose={onSettingDrawerClose}
            title={t('setText')}
          >
            <ChatP2pSetting
              alias={(user as V2NIMFriend)?.alias || ''}
              account={user?.accountId || ''}
              nick={user?.name || ''}
              onCreateGroupClick={() => {
                setGroupCreateVisible(true)
              }}
            />
          </ChatSettingDrawer>
        </div>
        <ChatActionBar
          prefix={prefix}
          action={action}
          settingActions={settingActions}
          onActionClick={onActionClick}
        />
        <CreateTeamModal
          defaultAccounts={createDefaultAccounts}
          visible={groupCreateVisible}
          // onAfterCreate={resetSettingState}
          onChat={handleCreateModalClose}
          onCancel={handleCreateModalClose}
          prefix={commonPrefix}
        />
        <ChatForwardModal
          visible={!!forwardMessage}
          msg={forwardMessage}
          onSend={handleForwardModalSend}
          onCancel={handleForwardModalClose}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
      </div>
    ) : null
  }
)

export default P2pChatContainer
