import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  Provider, // 全局上下文
  ConversationContainer, // 会话列表组件
  ChatContainer, // 聊天（会话消息）组件
  AddContainer, // 搜索——添加按钮组件
  SearchContainer, // 搜索——搜索组件
  ContactListContainer, // 通讯录——通讯录导航组件
  ContactInfoContainer, // 通讯录——通讯录详情组件，包含好友列表、群组列表以及黑名单列表
  MyAvatarContainer,
  useStateContext,
  ComplexAvatarContainer,
} from '@xkit-yx/im-kit-ui'
import { ConfigProvider, Badge, Button, Popover, message } from 'antd'
//antd 国际化
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
//UIKit 国际化
import en from './locales/en'
import zh from './locales/zh'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import '@xkit-yx/im-kit-ui/es/style'
import 'antd/es/badge/style'
import './iconfont.css'
import './index.less'
// 左下角菜单组件
import SettingModal from './components/Setting'
import Menu from './components/Menus'
// 呼叫组件
import {
  CallViewProvider,
  CallViewProviderRef,
} from '@xkit-yx/call-kit-react-ui'
import '@xkit-yx/call-kit-react-ui/es/style'
import Calling from './components/call'
//demo国际化函数
import { convertSecondsToTime, g2StatusMap, renderMsgDate, t } from './util'
import { parseSessionId } from './util'
import { LocalOptions } from '@xkit-yx/im-store'
interface IMContainerProps {
  appkey: string //传入您的App Key
  account: string // 传入您的云信IM账号
  token: string // 传入您的Token
  onLogout?: () => void
  changeLanguage?: (value: 'zh' | 'en') => void
}

interface IMAppProps {
  appkey: string //传入您的App Key
  account: string // 传入您的云信IM账号
  onLogout?: () => void
  locale: 'zh' | 'en'
  changeLanguage?: (value: 'zh' | 'en') => void
  sdkVersion: 1 | 2
  addFriendNeedVerify: boolean
  p2pMsgReceiptVisible: boolean
  teamMsgReceiptVisible: boolean
  needMention: boolean
}
// @ts-ignore: Unreachable code error

const IMApp: React.FC<IMAppProps> = observer((props) => {
  const {
    onLogout,
    locale,
    changeLanguage,
    sdkVersion,
    addFriendNeedVerify,
    account,
    appkey,
    p2pMsgReceiptVisible,
    teamMsgReceiptVisible,
    needMention,
  } = props
  const callViewProviderRef = useRef<CallViewProviderRef>(null)
  const [model, setModel] = useState<'chat' | 'contact'>('chat')
  const [isSettingModalOpen, setIsSettingModalOpen] = useState<boolean>(false)
  // 是否显示呼叫弹窗
  const [callingVisible, setCallingVisible] = useState<boolean>(false)
  // IMUIKit store实例
  const { store } = useStateContext()
  // im sdk实例
  const nim = store.nim
  // 当前选中会话场景和会话接受方 scene：p2p ｜ team, to: accid
  const { scene, to } = parseSessionId(store.uiStore.selectedSession)

  const handleSettingCancel = () => {
    setIsSettingModalOpen(false)
  }
  const openSettingModal = () => {
    setIsSettingModalOpen(true)
  }

  useEffect(() => {
    if (callViewProviderRef.current?.neCall) {
      //注册呼叫结束事件监听
      callViewProviderRef.current?.neCall?.on('onRecordSend', () => {
        //当通话因为 取消、拒绝、超时或占线 结束时，组件会主动发送一条话单消息给对端，可以在此事件中更新本端的UI
        const sessionId = store.uiStore.selectedSession
        setTimeout(() => {
          store.msgStore
            .getHistoryMsgActive({
              sessionId,
              endTime: Date.now(),
              limit: 100,
            })
            .then((msgs) => {
              setTimeout(() => {
                document.getElementById(msgs[0].idClient)?.scrollIntoView()
              })
            })
            .catch((err) => {
              console.log('err:', err)
            })
        }, 800)
      })
      // 设置呼叫超时时间
      callViewProviderRef.current?.neCall?.setTimeout(30)
    }
  }, [callViewProviderRef.current?.neCall])

  // 发起呼叫
  const handleCall = useCallback(
    async (callType) => {
      try {
        await callViewProviderRef.current?.call?.({ accId: to, callType })
        setCallingVisible(false)
      } catch (error) {
        switch (error.code) {
          // 忙线
          case '105':
            message.error(t('inCallText'))
            break
          // 无网络
          case 'Error_Internet_Disconnected':
            message.error(t('networkDisconnectText'))
            break
          default:
            // 处理其他错误
            message.error(t('callFailed'))
            break
        }
      }
    },
    [to]
  )

  // 重新渲染发送按钮，增加呼叫按钮
  const actions = useMemo(
    () => [
      {
        action: 'emoji',
        visible: true,
      },
      {
        action: 'sendImg',
        visible: true,
      },
      {
        action: 'sendFile',
        visible: true,
      },
      {
        action: 'calling',
        visible: scene === 'team' || sdkVersion === 2 ? false : true,
        render: () => {
          return (
            <Button type="text" disabled={false}>
              <Popover
                trigger="click"
                visible={callingVisible}
                content={<Calling handleCall={handleCall} />}
                onVisibleChange={(newVisible) => setCallingVisible(newVisible)}
              >
                <i className="calling-icon iconfont icon-shipinyuyin" />
              </Popover>
            </Button>
          )
        },
      },
    ],
    [handleCall, callingVisible, scene, sdkVersion]
  )

  // 根据msg.type 自定义渲染话单消息，当msg.type 为 g2 代表的是话单消息，使用renderP2pCustomMessage进行自定义渲染
  const renderP2pCustomMessage = useCallback(
    (msg) => {
      msg = msg.msg
      // msg.type 为 g2 代表的是话单消息 renderP2pCustomMessage 返回 null 就会按照组件默认的逻辑进行展示消息
      if (msg.type !== 'g2' || sdkVersion == 2) {
        return null
      }
      const { attach } = msg
      const duration = attach?.durations[0]?.duration
      const status = attach?.status
      const type = attach?.type
      const icon = type == 1 ? 'icon-yuyin8' : 'icon-shipin8'
      const myAccount = store.userStore.myUserInfo.account
      //判断当前消息是发出的消息还是接收的消息
      const isSelf = msg.from === myAccount
      const account = isSelf ? myAccount : to

      return (
        <div className={classNames('wrapper', { 'wrapper-self': isSelf })}>
          <ComplexAvatarContainer account={account} />
          <div
            className={classNames('g2-msg-wrapper', {
              'g2-msg-wrapper-self': isSelf,
            })}
          >
            <div className="appellation">
              {store.uiStore.getAppellation({ account })}
            </div>
            <div
              className={classNames('g2-msg', { 'g2-msg-self': isSelf })}
              onClick={() => handleCall(type.toString())}
            >
              <i className={classNames('iconfont', 'g2-icon', icon)}></i>
              <span>{g2StatusMap[status]}</span>
              {duration && (
                <span className="g2-time">
                  {convertSecondsToTime(duration)}
                </span>
              )}
            </div>
            <div className="time">{renderMsgDate(msg.time)}</div>
          </div>
        </div>
      )
    },
    [
      handleCall,
      sdkVersion,
      to,
      store.uiStore,
      store.userStore.myUserInfo.account,
    ]
  )

  const renderContent = useCallback(() => {
    return (
      <>
        <div className="header">
          <div className="search">
            <SearchContainer onClickChat={() => setModel('chat')} />
          </div>
          <div className="add">
            <AddContainer onClickChat={() => setModel('chat')} />
          </div>
        </div>
        <div className="content">
          <div className="left">
            <div className="avatar-icon">
              <MyAvatarContainer />
            </div>
            <Badge dot={false}>
              <div
                className={classNames('chat-icon', {
                  active: model === 'chat',
                })}
                onClick={() => setModel('chat')}
              >
                <i className="iconfont">&#xe6c9;</i>
                <div className="icon-label">{t('session')}</div>
              </div>
            </Badge>
            <Badge dot={!!store.uiStore.systemMsgUnread}>
              <div
                className={classNames('contact-icon', {
                  active: model === 'contact',
                })}
                onClick={() => setModel('contact')}
              >
                <i className="iconfont">&#xe6c4;</i>
                <div className="icon-label">{t('addressText')}</div>
              </div>
            </Badge>
            <Menu
              onLogout={onLogout}
              changeLanguage={changeLanguage}
              locale={locale}
              openSettingModal={openSettingModal}
            />
          </div>
          {/* 若您复制IMUIKit demo至您的工程，SettingModal相关代码可以删除 */}
          <SettingModal
            isSettingModalOpen={isSettingModalOpen}
            handleSettingCancel={handleSettingCancel}
            p2pMsgReceiptVisible={p2pMsgReceiptVisible}
            teamMsgReceiptVisible={teamMsgReceiptVisible}
            addFriendNeedVerify={addFriendNeedVerify}
            needMention={needMention}
            locale={locale}
          />
          {model === 'chat' && (
            <div className="right">
              <div className="right-list">
                <ConversationContainer />
              </div>
              <div className="right-content">
                <ChatContainer
                  actions={actions}
                  renderP2pCustomMessage={renderP2pCustomMessage}
                />
              </div>
            </div>
          )}
          {model === 'contact' && (
            <div className="right">
              <div className="right-list">
                <ContactListContainer />
              </div>
              <div className="right-content">
                <ContactInfoContainer
                  afterSendMsgClick={() => setModel('chat')}
                  onGroupItemClick={() => setModel('chat')}
                  afterAcceptApplyFriend={(account) => {
                    store.msgStore
                      .sendTextMsgActive({
                        scene: 'p2p',
                        to: account,
                        body: t('passFriendAskText'),
                      })
                      .then(() => {
                        setModel('chat')
                      })
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </>
    )
  }, [
    actions,
    addFriendNeedVerify,
    changeLanguage,
    isSettingModalOpen,
    locale,
    model,
    onLogout,
    p2pMsgReceiptVisible,
    teamMsgReceiptVisible,
    sdkVersion,
    renderP2pCustomMessage,
    store.uiStore.systemMsgUnread,
  ])
  // IM elite(IM 2) sdk 没有信令， 无法初始化呼叫组件
  return sdkVersion === 1 ? (
    <CallViewProvider
      ref={callViewProviderRef}
      neCallConfig={{
        // @ts-ignore
        nim: nim.nim,
        appkey,
        debug: true,
      }}
      position={{
        x: 400,
        y: 10,
      }}
    >
      {renderContent()}
    </CallViewProvider>
  ) : (
    renderContent()
  )
})

const IMAppContainer: React.FC<IMContainerProps> = (props) => {
  const { appkey, account, token, onLogout } = props
  // 国际化语言类型
  const [curLanguage, setCurLanguage] = useState<'zh' | 'en'>('zh')
  // sdk版本
  const urlParams = new URLSearchParams(window.location.search)
  const sdkVersion = (Number(urlParams.get('sdkVersion')) as 1 | 2) || 1
  // 添加好友是否需要验证
  const [addFriendNeedVerify, setAddFriendNeedVerify] = useState<boolean>(true)
  //单聊消息是否显示已读未读
  const [p2pMsgReceiptVisible, setP2pMsgReceiptVisible] =
    useState<boolean>(true)
  //群聊消息是否显示已读未读
  const [teamMsgReceiptVisible, setTeamMsgReceiptVisible] =
    useState<boolean>(true)
  // 是否需要@消息
  const [needMention, setNeedMention] = useState<boolean>(true)
  const languageMap = { zh, en }
  // 初始化参数
  const initOptions = useMemo(() => {
    return {
      appkey,
      account,
      token,
      lbsUrls: ['https://lbs.netease.im/lbs/webconf.jsp'],
      linkUrl: 'weblink.netease.im',
      needReconnect: true,
      reconnectionAttempts: 5,
    }
  }, [appkey, account, token])
  // 本地默认行为参数
  const localOptions: Partial<LocalOptions> = {
    // 添加好友模式，默认需要验证
    addFriendNeedVerify,
    // 群组被邀请模式，默认不需要验证
    teamBeInviteMode: 'noVerify',
    // 单聊消息是否显示已读未读 默认 false
    p2pMsgReceiptVisible,
    // 群聊消息是否显示已读未读 默认 false
    teamMsgReceiptVisible,
    // 是否需要@消息
    needMention,
    // 是否显示在线离线状态
    loginStateVisible: true,
    // 是否允许转让群主
    allowTransferTeamOwner: true,
  }

  const changeLanguage = useCallback((value: 'zh' | 'en') => {
    setCurLanguage(value)
    sessionStorage.setItem('languageType', value)
    window.location.reload()
  }, [])

  useEffect(() => {
    const _languageType = sessionStorage.getItem('languageType') as 'zh' | 'en'
    const _addFriendNeedVerify = sessionStorage.getItem('addFriendNeedVerify')
    const _p2pMsgReceiptVisible = sessionStorage.getItem('p2pMsgReceiptVisible')
    const _teamMsgReceiptVisible = sessionStorage.getItem(
      'teamMsgReceiptVisible'
    )
    const _needMention = sessionStorage.getItem('needMention')
    setCurLanguage(_languageType || 'zh')
    if (_p2pMsgReceiptVisible) {
      setP2pMsgReceiptVisible(_p2pMsgReceiptVisible === 'true')
    }
    if (_teamMsgReceiptVisible) {
      setTeamMsgReceiptVisible(_teamMsgReceiptVisible === 'true')
    }
    if (_addFriendNeedVerify) {
      setAddFriendNeedVerify(_addFriendNeedVerify === 'true')
    }
    if (_needMention) {
      setNeedMention(_needMention === 'true')
    }
  }, [])
  return (
    <ConfigProvider locale={curLanguage === 'zh' ? zhCN : enUS}>
      <div className="im-app-example">
        <div className="container">
          <Provider
            sdkVersion={sdkVersion}
            localeConfig={languageMap[curLanguage]}
            initOptions={initOptions}
            localOptions={localOptions}
          >
            <IMApp
              onLogout={onLogout}
              appkey={appkey}
              account={account}
              locale={curLanguage}
              changeLanguage={changeLanguage}
              addFriendNeedVerify={addFriendNeedVerify}
              sdkVersion={sdkVersion}
              p2pMsgReceiptVisible={p2pMsgReceiptVisible}
              teamMsgReceiptVisible={teamMsgReceiptVisible}
              needMention={needMention}
            />
          </Provider>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default IMAppContainer
