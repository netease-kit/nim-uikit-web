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
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { debounce, VisibilityObserver } from '@xkit-yx/utils'
import {
  IMMessage,
  TMsgScene,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { MenuItemKey } from '../components/ChatMessageItem'
import { message } from 'antd'
import { storeConstants } from '@xkit-yx/im-store'
import { observer } from 'mobx-react'
import ChatForwardModal from '../components/ChatForwardModal'

export interface P2pChatContainerProps {
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
  renderP2pCustomMessage?: (
    options: RenderP2pCustomMessageOptions
  ) => JSX.Element | null | undefined
  renderHeader?: (session: Session) => JSX.Element
  renderP2pInputPlaceHolder?: (session: Session) => string
  renderMessageAvatar?: (msg: IMMessage) => JSX.Element | null | undefined
  renderMessageName?: (msg: IMMessage) => JSX.Element | null | undefined
  renderMessageOuterContent?: (msg: IMMessage) => JSX.Element | null | undefined
  renderMessageInnerContent?: (msg: IMMessage) => JSX.Element | null | undefined

  prefix?: string
  commonPrefix?: string
}

const P2pChatContainer: React.FC<P2pChatContainerProps> = observer(
  ({
    scene,
    to,
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

    const sessionId = `${scene}-${to}`

    const session = store.sessionStore.sessions.get(sessionId)

    const msgs = store.msgStore.getMsg(sessionId)

    // 当前输入框的回复消息
    const replyMsg = store.msgStore.replyMsgs.get(sessionId)

    const user = store.uiStore.getFriendWithUserNameCard(to)

    const myUser = store.userStore.myUserInfo

    const userNickOrAccount = store.uiStore.getAppellation({
      account: user.account,
    })

    const isOnline = store.eventStore.stateMap.get(to) === 'online'

    const createDefaultAccounts = useMemo(() => [to], [to])

    const messageListContainerDomRef = useRef<HTMLDivElement>(null)
    const settingDrawDomRef = useRef<HTMLDivElement>(null)
    const chatMessageInputRef = useRef<ChatMessageInputRef>(null)

    const visibilityObserver = useMemo(() => {
      return new VisibilityObserver({
        root: messageListContainerDomRef.current,
      })
    }, [to])

    // 以下是 UI 相关的 state，需要在切换会话时重置
    const [replyMsgsMap, setReplyMsgsMap] = useState<Record<string, IMMessage>>(
      {}
    ) // 回复消息的 map
    const [action, setAction] = useState<ChatAction | undefined>(undefined)
    const [inputValue, setInputValue] = useState('')
    const [groupCreateVisible, setGroupCreateVisible] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [noMore, setNoMore] = useState(false)
    const [receiveMsgBtnVisible, setReceiveMsgBtnVisible] = useState(false)
    const [settingDrawerVisible, setSettingDrawerVisible] = useState(false)
    const [forwardMessage, setForwardMessage] = useState<IMMessage | undefined>(
      undefined
    )

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
          return historyMsgs
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
      setAction(undefined)
      setSettingDrawerVisible(false)
    }, [])

    const onReeditClick = useCallback(
      (msg: IMMessage) => {
        setInputValue(msg.attach?.oldBody || '')
        const replyMsg = replyMsgsMap[msg.idClient]
        replyMsg && store.msgStore.replyMsgActive(replyMsg)
        chatMessageInputRef.current?.input?.focus()
      },
      [replyMsgsMap, store.msgStore]
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
      async (value: string) => {
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
          switch (error?.code) {
            // 无权限
            case 802:
              message.error(t('noPermission'))
              break
            default:
              message.error(t('createTeamFailedText'))
              break
          }
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
            store.msgStore.sendMsgReceiptActive(msg).finally(() => {
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
    }, [store.msgStore, msgs, visibilityObserver, myUser.account])

    useEffect(() => {
      return () => {
        visibilityObserver.destroy()
      }
    }, [visibilityObserver])

    // 切换会话时需要重新初始化
    useEffect(() => {
      resetState()
      scrollToBottom()
    }, [to, resetState, scrollToBottom])

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
        getHistory(Date.now()).then((res) => {
          scrollToBottom()
          if (session && !session.lastMsg && res && res[0]) {
            store.sessionStore.addSession([{ ...session, lastMsg: res[0] }])
          }
        })
      }
    }, [
      store.msgStore,
      store.sessionStore,
      session,
      sessionId,
      getHistory,
      scrollToBottom,
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
          time: number
        }> = []
        const idClients: Record<string, string> = {}
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
                    idClients[idServer] = msg.idClient
                  }
                }
              }
            } catch {}
          }
        })
        if (reqMsgs.length > 0) {
          store.msgStore.getMsgByIdServerActive({ reqMsgs }).then((res) => {
            res.forEach((item) => {
              if (item.idServer) {
                replyMsgsMap[idClients[item.idServer]] = item
              }
            })
            setReplyMsgsMap({ ...replyMsgsMap })
          })
        } else {
          setReplyMsgsMap({ ...replyMsgsMap })
        }
      }
    }, [msgs, store])

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

    return session ? (
      <div className={`${prefix}-wrap`}>
        <div ref={settingDrawDomRef} className={`${prefix}-content`}>
          {renderHeader ? (
            renderHeader(session)
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
                  account={to}
                  canClick={to !== myUser.account}
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
            member={user}
            noMore={noMore}
            loadingMore={loadingMore}
            myAccount={myUser?.account || ''}
            receiveMsgBtnVisible={receiveMsgBtnVisible}
            msgReceiptTime={session?.msgReceiptTime}
            onReceiveMsgBtnClick={scrollToBottom}
            onResend={onResend}
            onMessageAction={onMessageAction}
            onReeditClick={onReeditClick}
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
                ? renderP2pInputPlaceHolder(session)
                : `${t('sendToText')} ${userNickOrAccount}${t('sendUsageText')}`
            }
            replyMsg={replyMsg}
            scene={scene}
            to={to}
            actions={actions}
            inputValue={inputValue}
            uploadImageLoading={store.uiStore.uploadImageLoading}
            uploadFileLoading={store.uiStore.uploadFileLoading}
            setInputValue={setInputValue}
            onSendText={onSendText}
            onSendFile={onSendFile}
            onSendImg={onSendImg}
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
              account={user.account || ''}
              nick={user.nick || ''}
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
          msg={forwardMessage!}
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
