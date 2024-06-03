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
import GroupCreate from '../components/ChatCreateTeam'
import { ChatAction } from '../types'
import {
  useStateContext,
  useTranslation,
  ComplexAvatarContainer,
} from '../../common'
import { Action, ChatSettingActionItem, MsgOperMenuItem } from '../Container'
import ChatP2pSetting from '../components/ChatP2pSetting'
import { debounce, VisibilityObserver } from '@xkit-yx/utils'
import { MenuItemKey } from '../components/ChatMessageItem'
import { message } from 'antd'
import { storeConstants } from '@xkit-yx/im-store-v2'
import { observer } from 'mobx-react'
import ChatForwardModal from '../components/ChatForwardModal'
import { getImgDataUrl, getVideoFirstFrameDataUrl } from '../../utils'
import {
  V2NIMConversationType,
  V2NIMConversation,
} from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMConversationService'
import { V2NIMMessage } from 'nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK/V2NIMMessageService'
import { V2NIMMessageForUI } from '@xkit-yx/im-store-v2/dist/types/types'
import { V2NIMConst } from 'nim-web-sdk-ng'

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

    const user = store.uiStore.getFriendWithUserNameCard(receiverId)

    const myUser = store.userStore.myUserInfo

    const userNickOrAccount = store.uiStore.getAppellation({
      account: user.accountId,
    })

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
      setAction(undefined)
      setSettingDrawerVisible(false)
    }, [])

    const onReeditClick = useCallback(
      (msg: V2NIMMessageForUI) => {
        setInputValue(msg.oldText || '')
        const replyMsg = replyMsgsMap[msg.messageClientId]
        replyMsg && store.msgStore.replyMsgActive(replyMsg)
        chatMessageInputRef.current?.input?.focus()
      },
      [replyMsgsMap, store.msgStore]
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
      async (value: string) => {
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
      [msgOperMenu, store.msgStore]
    )

    const onGroupCreate = useCallback(
      async ({
        name,
        avatar,
        selectedAccounts,
      }: {
        name: string
        avatar: string
        selectedAccounts: string[]
      }) => {
        try {
          await store.teamStore.createTeamActive({
            name,
            avatar,
            accounts: selectedAccounts,
          })
          resetSettingState()
          message.success(t('createTeamSuccessText'))
        } catch (error: any) {
          message.error(t('createTeamFailedText'))
        }
      },
      [store.teamStore, t]
    )

    const resetSettingState = () => {
      setAction(undefined)
      setGroupCreateVisible(false)
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
            store.msgStore.sendMsgReceiptActive(msg).finally(() => {
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
    }, [store.msgStore, conversationId, getHistory, scrollToBottom])

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
        const messageClientIds: Record<string, string> = {}
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
                    messageClientIds[idServer] = msg.messageClientId
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
              conversationId: nim.V2NIMConversationIdUtil.p2pConversationId(
                item.to
              ),
            }))
          ).then((res) => {
            res.forEach((item) => {
              if (item.messageServerId) {
                replyMsgsMap[messageClientIds[item.messageServerId]] = item
              }
            })
            setReplyMsgsMap({ ...replyMsgsMap })
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

          <MessageInput
            ref={chatMessageInputRef}
            prefix={prefix}
            placeholder={
              renderP2pInputPlaceHolder
                ? renderP2pInputPlaceHolder(conversation)
                : `${t('sendToText')} ${userNickOrAccount}${t('sendUsageText')}`
            }
            replyMsg={replyMsg}
            conversationType={conversationType}
            receiverId={receiverId}
            actions={actions}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendText={onSendText}
            onSendFile={onSendFile}
            onSendImg={onSendImg}
            onSendVideo={onSendVideo}
            onRemoveReplyMsg={onRemoveReplyMsg}
          />
          <ChatSettingDrawer
            prefix={prefix}
            visible={settingDrawerVisible}
            drawerContainer={settingDrawDomRef}
            onClose={onSettingDrawerClose}
            title={t('setText')}
          >
            <ChatP2pSetting
              alias={user.alias || ''}
              account={user.accountId || ''}
              nick={user.name || ''}
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
        <GroupCreate
          defaultAccounts={createDefaultAccounts}
          visible={groupCreateVisible}
          onGroupCreate={onGroupCreate}
          onCancel={() => {
            setGroupCreateVisible(false)
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
      </div>
    ) : null
  }
)

export default P2pChatContainer
