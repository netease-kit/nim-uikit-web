import React, { useEffect, useMemo, useState } from 'react'
import {
  Provider, // 全局上下文
  ConversationContainer, // 会话列表组件
  ChatContainer, // 聊天（会话消息）组件
  AddContainer, // 搜索——添加按钮组件
  SearchContainer, // 搜索——搜索组件
  ContactListContainer, // 通讯录——通讯录导航组件
  ContactInfoContainer, // 通讯录——通讯录详情组件，包含好友列表、群组列表以及黑名单列表
  MyAvatarContainer,
  useStateContext, // 用户资料组件
} from '@xkit-yx/im-kit-ui/src'
import { ConfigProvider, Badge } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import enUS from 'antd/es/locale/en_US'
import en from './locales/en'
import zh from './locales/zh'
import { demo_en, demo_zh } from './locales/demo_locale'
import classNames from 'classnames'
import { observer } from 'mobx-react'

import '@xkit-yx/im-kit-ui/src/style'
import 'antd/es/badge/style'
import './iconfont.css'
import './index.less'

import SettingModal from './components/Setting'
import Menu from './components/Menus'

interface IMContainerProps {
  appkey: string //传入您的App Key
  account: string // 传入您的云信IM账号
  token: string // 传入您的Tokenx
  onLogout?: () => void
  changeLanguage?: (value: 'zh' | 'en') => void
}

interface IMAppProps {
  onLogout?: () => void
  locale: 'zh' | 'en'
  changeLanguage?: (value: 'zh' | 'en') => void
  sdkVersion: 1 | 2
  setSdkVersion: React.Dispatch<React.SetStateAction<1 | 2>>
  addFriendNeedVerify: boolean
  setAddFriendNeedVerify: React.Dispatch<React.SetStateAction<boolean>>
}
// @ts-ignore: Unreachable code error

const IMApp: React.FC<IMAppProps> = observer((props) => {
  const {
    onLogout,
    locale,
    changeLanguage,
    setSdkVersion,
    sdkVersion,
    addFriendNeedVerify,
    setAddFriendNeedVerify,
  } = props
  const [model, setModel] = useState<'chat' | 'contact'>('chat')
  const [isSettingModalOpen, setIsSettingModalOpen] = useState<boolean>(false)
  const [p2pMsgReceiptVisible, setP2pMsgReceiptVisible] =
    useState<boolean>(true)
  const [teamMsgReceiptVisible, setTeamMsgReceiptVisible] =
    useState<boolean>(true)
  const handleSettingCancel = () => {
    setIsSettingModalOpen(false)
  }
  const openSettingModal = () => {
    setIsSettingModalOpen(true)
  }
  const { store } = useStateContext()
  const demoLocaleMap = {
    zh: demo_zh,
    en: demo_en,
  }
  const t = (str: keyof typeof demo_zh): string => {
    return demoLocaleMap[locale][str]
  }

  useEffect(() => {
    if (sessionStorage.getItem('p2pMsgReceiptVisible')) {
      const p2pMsgReceiptVisible =
        sessionStorage.getItem('p2pMsgReceiptVisible') === 'true' ? true : false
      setP2pMsgReceiptVisible(p2pMsgReceiptVisible)
    }
    if (sessionStorage.getItem('teamMsgReceiptVisible')) {
      const teamMsgReceiptVisible =
        sessionStorage.getItem('teamMsgReceiptVisible') === 'true'
          ? true
          : false
      setTeamMsgReceiptVisible(teamMsgReceiptVisible)
    }
  }, [])

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
            t={t}
            changeLanguage={changeLanguage}
            locale={locale}
            openSettingModal={openSettingModal}
          />
        </div>
        <SettingModal
          isSettingModalOpen={isSettingModalOpen}
          handleSettingCancel={handleSettingCancel}
          p2pMsgReceiptVisible={p2pMsgReceiptVisible}
          setP2pMsgReceiptVisible={setP2pMsgReceiptVisible}
          teamMsgReceiptVisible={teamMsgReceiptVisible}
          setTeamMsgReceiptVisible={setTeamMsgReceiptVisible}
          setSdkVersion={setSdkVersion}
          sdkVersion={sdkVersion}
          addFriendNeedVerify={addFriendNeedVerify}
          setAddFriendNeedVerify={setAddFriendNeedVerify}
          t={t}
          locale={locale}
        />
        {model === 'chat' && (
          <div className="right">
            <div className="right-list">
              <ConversationContainer />
            </div>
            <div className="right-content">
              <ChatContainer
                p2pMsgReceiptVisible={p2pMsgReceiptVisible}
                teamMsgReceiptVisible={teamMsgReceiptVisible}
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
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
})

const IMAppContainer: React.FC<IMContainerProps> = (props) => {
  const { appkey, account, token, onLogout } = props
  const [curLanguage, setCurLanguage] = useState<'zh' | 'en'>('zh')
  const [sdkVersion, setSdkVersion] = useState<1 | 2>(2)
  const [addFriendNeedVerify, setAddFriendNeedVerify] = useState<boolean>(true)
  const languageMap = { zh, en }
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
  const localOptions = {
    addFriendNeedVerify,
  }
  const changeLanguage = (value: 'zh' | 'en') => {
    setCurLanguage(value)
    sessionStorage.setItem('languageType', value)
    window.location.reload()
  }
  useEffect(() => {
    const languageType = sessionStorage.getItem('languageType') as 'zh' | 'en'
    setCurLanguage(languageType || 'zh')
    const sdkVersion = Number(sessionStorage.getItem('sdkVersion')) as 1 | 2
    setSdkVersion(sdkVersion || 2)
    if (sessionStorage.getItem('addFriendNeedVerify')) {
      const addFriendNeedVerify =
        sessionStorage.getItem('addFriendNeedVerify') === 'true' ? true : false
      setAddFriendNeedVerify(addFriendNeedVerify)
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
              locale={curLanguage}
              changeLanguage={changeLanguage}
              addFriendNeedVerify={addFriendNeedVerify}
              setAddFriendNeedVerify={setAddFriendNeedVerify}
              sdkVersion={sdkVersion}
              setSdkVersion={setSdkVersion}
            />
          </Provider>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default IMAppContainer
