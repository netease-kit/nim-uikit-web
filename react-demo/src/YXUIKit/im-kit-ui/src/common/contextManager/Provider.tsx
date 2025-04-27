import React, {
  FC,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
  createContext,
  memo,
} from 'react'
import RootStore from '@xkit-yx/im-store-v2'
import { LocalOptions } from '@xkit-yx/im-store-v2/dist/types/types'
import { observer } from 'mobx-react'
import { useStateContext } from '../hooks/useStateContext'
import { NIM, V2NIMConst } from 'nim-web-sdk-ng/dist/esm/nim'
import zh from '../locales/zh'
import sdkPkg from 'nim-web-sdk-ng/package.json'

export interface ContextProps {
  nim?: NIM
  store?: RootStore
  localOptions?: Partial<LocalOptions>
  t?: (str: keyof typeof zh) => string
  locale?: 'zh' | 'en' | string
}

export interface ProviderProps {
  children: ReactNode
  localOptions?: Partial<LocalOptions>
  nim: NIM
  // 单例模式，用于 vue 带 UI 组件
  singleton?: boolean
  locale?: 'zh' | 'en'
  localeConfig?: { [key in keyof typeof zh]?: string }
  renderImDisConnected?: () => JSX.Element
  renderImConnecting?: () => JSX.Element
}

export const Context = createContext<ContextProps>({})

const defaultLocalOptions: Required<LocalOptions> = {
  addFriendNeedVerify: true,
  teamAgreeMode: V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
  teamJoinMode: V2NIMConst.V2NIMTeamJoinMode.V2NIM_TEAM_JOIN_MODE_FREE,
  teamInviteMode: V2NIMConst.V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_MANAGER,
  teamUpdateTeamMode:
    V2NIMConst.V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER,
  teamUpdateExtMode:
    V2NIMConst.V2NIMTeamUpdateExtensionMode
      .V2NIM_TEAM_UPDATE_EXTENSION_MODE_ALL,
  leaveOnTransfer: false,
  needMention: true,
  p2pMsgReceiptVisible: false,
  teamMsgReceiptVisible: false,
  loginStateVisible: false,
  allowTransferTeamOwner: false,
  teamManagerVisible: false,
  aiVisible: true,
  teamManagerLimit: 10,
  sendMsgBefore: async (options: any) => options,
  aiUserAgentProvider: {},
  conversationLimit: 100,

  debug: 'debug',
  iconfontUrl: [],
  aiStream: true,
}

export const Provider: FC<ProviderProps> = memo(function Main({
  children,
  localOptions = defaultLocalOptions,
  nim,
  locale = 'zh',
  localeConfig = zh,
  renderImDisConnected,
  renderImConnecting,
  singleton = false,
}) {
  const localeMap = useMemo(
    () => ({
      zh,
    }),
    []
  )

  const t = useCallback(
    (str: keyof typeof zh) => {
      return {
        ...(localeMap[locale] || zh),
        ...localeConfig,
      }[str]
    },
    [locale, localeConfig, localeMap]
  )

  const finalLocalOptions = useMemo(() => {
    return { ...defaultLocalOptions, ...localOptions }
  }, [localOptions])

  const rootStore = useMemo(() => {
    if (singleton) {
      // @ts-ignore
      return RootStore.getInstance(nim, finalLocalOptions)
    }

    // @ts-ignore
    return new RootStore(nim, finalLocalOptions)
  }, [nim, singleton, finalLocalOptions])

  // @ts-ignore
  window.__xkit_store__ = {
    nim,
    store: rootStore,
    localOptions: finalLocalOptions,
    sdkVersion: sdkPkg.version,
  }

  useEffect(() => {
    return () => {
      if (!singleton) {
        rootStore.destroy()
      }
    }
  }, [rootStore, singleton])

  return (
    <Context.Provider
      value={{
        store: rootStore,
        nim,
        localOptions: finalLocalOptions,
        locale,
        t,
      }}
    >
      <App
        renderImConnecting={renderImConnecting}
        renderImDisConnected={renderImDisConnected}
      >
        {children}
      </App>
    </Context.Provider>
  )
})

export const App: FC<{
  renderImDisConnected?: () => JSX.Element
  renderImConnecting?: () => JSX.Element
}> = observer(({ renderImConnecting, renderImDisConnected, children }) => {
  const { store } = useStateContext()

  const render = () => {
    switch (store.connectStore.loginStatus) {
      case V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_LOGINED:
        return children
      case V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_LOGINING:
        return renderImConnecting ? (
          renderImConnecting()
        ) : (
          <span>Loading……</span>
        )
      case V2NIMConst.V2NIMLoginStatus.V2NIM_LOGIN_STATUS_LOGOUT:
        return renderImDisConnected ? (
          renderImDisConnected()
        ) : (
          <span>当前网络不可用，请检查网络设置，刷新页面</span>
        )
      default:
        return null
    }
  }

  return <>{render()}</>
})
