import React from 'react'
import ReactDOM from 'react-dom'
import {
  Utils,
  CrudeAvatar,
  SearchInput,
  CommonIcon,
  ComplexAvatarUI,
  ComplexAvatarContainer,
  MyAvatarContainer,
  Context,
  Provider,
  ProviderProps,
  ContextProps,
  UserCard,
  MyUserCard,
  GroupAvatarSelect,
  urls,
  FriendSelectContainer,
  Welcome,
  ReadPercent,
  ParseSession,
  useStateContext,
  useTranslation,
  useEventTracking,
  UseEventTrackingProps,
} from './common'

import { NimKitCoreTypes, NimKitCoreFactory } from '@xkit-yx/core-kit'

import { ConversationContainer } from './conversation'
import {
  ContactListContainer,
  BlackListContainer,
  FriendListContainer,
  GroupListContainer,
  ContactInfoContainer,
} from './contact'
import { ChatContainer, ChatMessageItem } from './chat'
import { AddContainer, SearchContainer } from './search'
import RootStore from '@xkit-yx/im-store'
import { NIMInitializeOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'

export class IMUIKit {
  get context(): {
    nim: NimKitCoreTypes.INimKitCore
    store: RootStore
    initOptions: NIMInitializeOptions
  } | void {
    // @ts-ignore
    return window.__xkit_store__
  }
  constructor(private providerProps: Omit<ProviderProps, 'children'>) {}

  render<
    T extends
      | typeof ComplexAvatarContainer
      | typeof MyAvatarContainer
      | typeof FriendSelectContainer
      | typeof ConversationContainer
      | typeof ContactListContainer
      | typeof BlackListContainer
      | typeof FriendListContainer
      | typeof GroupListContainer
      | typeof ContactInfoContainer
      | typeof ChatContainer
      | typeof AddContainer
      | typeof SearchContainer
  >(item: T, props: React.ComponentProps<T> | null, view: HTMLElement): void {
    ReactDOM.render(
      React.createElement(
        Provider,
        Object.assign({}, this.providerProps as ProviderProps),
        // @ts-ignore
        React.createElement(item, Object.assign({}, props))
      ),
      view
    )
  }

  unmount(view: HTMLElement): void {
    ReactDOM.unmountComponentAtNode(view)
  }

  getStateContext(): {
    nim: NimKitCoreTypes.INimKitCore
    store: RootStore
    initOptions: NIMInitializeOptions
  } | void {
    return this.context
  }

  destroy(): void {
    this.context?.store.destroy()
    this.context?.nim.destroy()

    const NIM = NimKitCoreFactory(this.providerProps.sdkVersion || 1)
    // @ts-ignore
    RootStore.ins = void 0
    //@ts-ignore
    NIM.ins = void 0
  }
}

export {
  Utils,
  CrudeAvatar,
  SearchInput,
  CommonIcon,
  ComplexAvatarUI,
  ComplexAvatarContainer,
  MyAvatarContainer,
  Context,
  RootStore,
  Provider,
  UserCard,
  MyUserCard,
  GroupAvatarSelect,
  urls,
  FriendSelectContainer,
  Welcome,
  ReadPercent,
  ParseSession,
  useStateContext,
  useTranslation,
  useEventTracking,
  NimKitCoreTypes,
  NimKitCoreFactory,
  ConversationContainer,
  ContactListContainer,
  BlackListContainer,
  FriendListContainer,
  GroupListContainer,
  ContactInfoContainer,
  ChatContainer,
  ChatMessageItem,
  AddContainer,
  SearchContainer,
}

export type { ProviderProps, ContextProps, UseEventTrackingProps }
