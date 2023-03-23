import {
  NIMInitializeOptions,
  NIMOtherOptions,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import React, {
  FC,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
  createContext,
  memo,
} from 'react'
import RootStore from '@xkit-yx/im-store'
import { LocalOptions } from '@xkit-yx/im-store'
import { observer } from 'mobx-react'
import { NimKitCoreFactory, NimKitCoreTypes } from '@xkit-yx/core-kit'
import { useStateContext } from '../hooks/useStateContext'
import zh from '../locales/zh'

export interface ContextProps {
  nim?: NimKitCoreTypes.INimKitCore
  store?: RootStore
  initOptions?: NIMInitializeOptions
  localOptions?: Partial<LocalOptions>
  t?: (str: keyof typeof zh) => string
}

export interface ProviderProps {
  children: ReactNode
  sdkVersion?: 1 | 2
  initOptions: NIMInitializeOptions
  otherOptions?: NIMOtherOptions
  localOptions?: Partial<LocalOptions>
  funcOptions?: { [key: string]: (...args: any) => void }
  nimKitCore?: NimKitCoreTypes.INimKitCore
  locale?: 'zh' | 'en'
  localeConfig?: { [key in keyof typeof zh]?: string }
  renderImIdle?: () => JSX.Element
  renderImDisConnected?: () => JSX.Element
  renderImConnecting?: () => JSX.Element
  singleton?: boolean
}

export const Context = createContext<ContextProps>({})

const defaultLocalOptions: LocalOptions = {
  addFriendNeedVerify: true,
  teamBeInviteMode: 'needVerify',
  teamJoinMode: 'noVerify',
  teamInviteMode: 'manager',
  teamUpdateTeamMode: 'manager',
  teamUpdateExtMode: 'manager',
  sendMsgBefore: async (options: any) => options,
}

export const Provider: FC<ProviderProps> = memo(
  ({
    children,
    initOptions,
    otherOptions,
    funcOptions,
    localOptions = defaultLocalOptions,
    nimKitCore,
    sdkVersion = 1,
    locale = 'zh',
    localeConfig = zh,
    renderImIdle,
    renderImDisConnected,
    renderImConnecting,
    singleton = false,
  }) => {
    // 对象参数的引用很容易变，会导致 nim 重新生成，因此最好将对象参数用 useMemo 包裹一下再传进来
    const nim = useMemo(() => {
      let _nim: NimKitCoreTypes.INimKitCore
      if (nimKitCore) {
        _nim = nimKitCore
      } else {
        const NIM = NimKitCoreFactory(sdkVersion)
        if (singleton) {
          _nim = NIM.getInstance({ initOptions, otherOptions, funcOptions })
        } else {
          _nim = new NIM({ initOptions, otherOptions, funcOptions })
        }
      }
      _nim.connect()
      return _nim
    }, [
      initOptions,
      otherOptions,
      funcOptions,
      sdkVersion,
      nimKitCore,
      singleton,
    ])

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
        return RootStore.getInstance(nim, finalLocalOptions)
      }
      return new RootStore(nim, finalLocalOptions)
    }, [nim, singleton, finalLocalOptions])

    // @ts-ignore
    window.__xkit_store__ = {
      nim,
      store: rootStore,
      initOptions,
      localOptions: finalLocalOptions,
    }

    useEffect(() => {
      return () => {
        if (!singleton) {
          rootStore.destroy()
        }
      }
    }, [rootStore, singleton])

    useEffect(() => {
      return () => {
        if (!singleton) {
          nim.destroy()
        }
      }
    }, [nim, singleton])
    return (
      <Context.Provider
        value={{
          store: rootStore,
          nim,
          initOptions,
          localOptions: finalLocalOptions,
          t,
        }}
      >
        <App
          renderImIdle={renderImIdle}
          renderImConnecting={renderImConnecting}
          renderImDisConnected={renderImDisConnected}
        >
          {children}
        </App>
      </Context.Provider>
    )
  }
)

export const App: FC<{
  renderImIdle?: () => JSX.Element
  renderImDisConnected?: () => JSX.Element
  renderImConnecting?: () => JSX.Element
}> = observer(
  ({ renderImIdle, renderImConnecting, renderImDisConnected, children }) => {
    const { store } = useStateContext()

    const render = () => {
      switch (store.connectStore.connectState) {
        case 'connected':
          return children
        case 'idle':
          return renderImIdle ? renderImIdle() : null
        case 'connecting':
          return renderImConnecting ? (
            renderImConnecting()
          ) : (
            <span>Loading……</span>
          )
        case 'disconnected':
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
  }
)
