import React, { useRef, useEffect, useState, useLayoutEffect } from 'react'
import ChatActionBar from '../components/ChatActionBar'
import ChatHeader from '../components/ChatHeader'
import MessageList, {
  RenderCustomMessageOptions,
} from '../components/ChatMessageList'
import MessageInput from '../components/ChatMessageInput'
import ChatSettingDrawer from '../components/ChatSettingDrawer'
import GroupCreate from '../components/ChatCreateTeam'
import { ChatAction } from '../types'
import {
  useStateContext,
  useTranslation,
  ComplexAvatarContainer,
} from '@xkit-yx/common-ui'
import { Action } from '../Container'
import ChatP2pSetting from '../components/ChatP2pSetting'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { debounce } from '@xkit-yx/utils'
import {
  IMMessage,
  TMsgScene,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { MenuItemKey } from '../components/ChatMessageItem'
import { message } from 'antd'
import { HISTORY_LIMIT } from '../constant'
import { observer } from 'mobx-react'

export interface P2pChatContainerProps {
  scene: TMsgScene
  to: string
  actions?: Action[]
  onSendText?: (data: {
    value: string
    scene: TMsgScene
    to: string
  }) => Promise<void>
  renderCustomMessage?: (
    options: RenderCustomMessageOptions
  ) => JSX.Element | false | void | null
  renderHeader?: (session: Session) => JSX.Element
  renderP2pInputPlaceHolder?: (session: Session) => string

  prefix?: string
  commonPrefix?: string
}

const P2pChatContainer: React.FC<P2pChatContainerProps> = observer(
  ({
    scene,
    to,
    actions,
    onSendText: onSendTextFromProps,
    renderCustomMessage,
    renderHeader,
    renderP2pInputPlaceHolder,

    prefix = 'chat',
    commonPrefix = 'common',
  }) => {
    const { store, nim } = useStateContext()

    const { t } = useTranslation()

    const sessionId = `${scene}-${to}`

    const session = store.sessionStore.sessions.get(sessionId)

    const msgs = store.msgStore.getMsg(sessionId)

    const user = store.userStore.users.get(to) || {
      account: to,
      createTime: Date.now(),
      updateTime: Date.now(),
    }

    const myUser = store.userStore.myUserInfo

    const userNickOrAccount = user?.nick || user?.account || ''

    const messageListContainerDomRef = useRef<HTMLDivElement>(null)
    const settingDrawDomRef = useRef<HTMLDivElement>(null)

    // 以下是 UI 相关的 state，需要在切换会话时重置
    const [action, setAction] = useState<ChatAction | undefined>(undefined)
    const [inputValue, setInputValue] = useState('')
    const [groupCreateVisible, setGroupCreateVisible] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [noMore, setNoMore] = useState(false)
    const [receiveMsgBtnVisible, setReceiveMsgBtnVisible] = useState(false)
    const [strangerNotiVisible, setStrangerNotiVisible] = useState(false)
    const [settingDrawerVisible, setSettingDrawerVisible] = useState(false)

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

    const onGroupCreate = async ({
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
      } catch (error) {
        message.error(t('createTeamFailedText'))
      }
    }

    const resetSettingState = () => {
      setAction(undefined)
      setGroupCreateVisible(false)
      setSettingDrawerVisible(false)
    }

    const resetState = () => {
      resetSettingState()
      setInputValue('')
      setLoadingMore(false)
      setNoMore(false)
      setReceiveMsgBtnVisible(false)
      setStrangerNotiVisible(false)
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
      store.userStore.getUserActive(to).then((user) => {
        const relation = store.uiStore.getRelation(to)
        if (relation === 'stranger') {
          setStrangerNotiVisible(true)
        } else {
          setStrangerNotiVisible(false)
        }
      })
    }, [store.userStore, store.uiStore, to])

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
              title={userNickOrAccount}
              avatar={
                <ComplexAvatarContainer
                  account={to}
                  canClick={false}
                  prefix={commonPrefix}
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
            strangerNotiVisible={strangerNotiVisible}
            strangerNotiText={`${userNickOrAccount} ${t('strangerNotiText')}`}
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
              renderP2pInputPlaceHolder
                ? renderP2pInputPlaceHolder(session!)
                : `${t('sendToText')} ${userNickOrAccount}${t('sendUsageText')}`
            }
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
          />
          <ChatSettingDrawer
            prefix={prefix}
            visible={settingDrawerVisible}
            drawerContainer={settingDrawDomRef}
            onClose={onSettingDrawerClose}
            title="设置"
          >
            <ChatP2pSetting
              account={user?.account || ''}
              nick={user?.nick || ''}
              onCreateGroupClick={() => {
                setGroupCreateVisible(true)
              }}
            />
          </ChatSettingDrawer>
        </div>
        <ChatActionBar
          prefix={prefix}
          action={action}
          onActionClick={onActionClick}
        />
        <GroupCreate
          defaultAccounts={[to]}
          visible={groupCreateVisible}
          onGroupCreate={onGroupCreate}
          onCancel={() => {
            setGroupCreateVisible(false)
          }}
          prefix={prefix}
          commonPrefix={commonPrefix}
        />
      </div>
    )
  }
)

export default P2pChatContainer
