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
import { getImgDataUrl, getVideoFirstFrameDataUrl, logger } from '../../utils'
import {
  V2NIMConversationType,
  V2NIMConversation,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMConversationService'
import { V2NIMMessage } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMMessageService'
import {
  V2NIMMessageForUI,
  YxReplyMsg,
  YxServerExt,
} from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng'
import { V2NIMError } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/types'
import { ChatAISearch } from '../components/ChatAISearch'
import { V2NIMFriend } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMFriendService'
import { ChatAITranslate } from '../components/ChatAITranslate'
import { MentionedMember } from '../components/ChatMessageInput/ChatMentionMemberList'

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
  renderP2pCustomMessage?: (
    options: RenderP2pCustomMessageOptions
  ) => JSX.Element | null | undefined
  renderHeader?: (conversation: V2NIMConversation) => JSX.Element
  renderP2pInputPlaceHolder?: (conversation: V2NIMConversation) => string
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

const P2pChatContainer: React.FC<P2pChatContainerProps> = observer(
  ({
    conversationType,
    receiverId,
    settingActions,
    actions,
    msgOperMenu,
    onSendText: onSendTextFromProps,
    renderP2pCustomMessage,
    renderHeader,
    renderP2pInputPlaceHolder,
    renderMessageAvatar,
    renderMessageName,
    renderMessageInnerContent,
    renderMessageOuterContent,

    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const { store, nim, localOptions } = useStateContext()

    const { t } = useTranslation()

    const conversationId =
      nim.V2NIMConversationIdUtil.p2pConversationId(receiverId)

    const conversation =
      store.conversationStore.conversations.get(conversationId)

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

    const mentionMembers = useMemo(() => {
      if (relation === 'ai' || !localOptions.aiVisible) {
        return []
      }

      return store.aiUserStore.getAIChatUser()
    }, [store.aiUserStore, relation, localOptions.aiVisible])

    // TODO sdk 暂不支持用户在线状态
    // const isOnline = store.eventStore.stateMap.get(receiverId) === 'online'
    const isOnline = 'online'

    const createDefaultAccounts = useMemo(() => [receiverId], [receiverId])

    const messageListContainerDomRef = useRef<HTMLDivElement>(null)
    const settingDrawDomRef = useRef<HTMLDivElement>(null)
    const chatMessageInputRef = useRef<ChatMessageInputRef>(null)

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
      message.success(t('aiSendingText'))
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
      setAction(undefined)
      setSettingDrawerVisible(false)
    }, [])

    const onReeditClick = useCallback(
      (msg: V2NIMMessageForUI) => {
        setInputValue(msg.oldText || '')
        const replyMsg = replyMsgsMap[msg.messageClientId]

        replyMsg && store.msgStore.replyMsgActive(replyMsg)
        // 处理 @ 消息
        const { serverExtension } = msg

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
      [store.msgStore, conversationId, scrollToBottom, onAISendHandler]
    )

    const onSendText = useCallback(
      async (value: string, ext?: YxServerExt) => {
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
            await store.msgStore.reCallMsgActive(msg)
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
      scrollToBottom()
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
                !isOnline && localOptions.loginStateVisible
                  ? t('offlineText')
                  : undefined
              }
              avatar={
                <ComplexAvatarContainer
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
            onReceiveMsgBtnClick={scrollToBottom}
            onMessageAction={onMessageAction}
            onReeditClick={onReeditClick}
            onResend={onResend}
            onScroll={onMsgListScrollHandler}
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
                : `${t('sendToText')} ${userNickOrAccount}${t('sendUsageText')}`
            }
            translateOpen={translateOpen}
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
