import React from 'react'
import ReactDOM from 'react-dom'
import {
  Utils,
  Constant,
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
  ContextManagerTypes,
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
} from '../../common-ui/src'

import { NimKitCoreTypes, NimKitCoreFactory } from '@xkit-yx/core-kit'

import { ConversationContainer } from '../../conversation-kit-ui/src'
import {
  ContactListContainer,
  BlackListContainer,
  FriendListContainer,
  GroupListContainer,
  ContactInfoContainer,
} from '../../contact-kit-ui/src'
import { ChatContainer, ChatMessageItem } from '../../chat-kit-ui/src'
import { AddContainer, SearchContainer } from '../../search-kit-ui/src'
import RootStore from '../../common-ui/src/contextManager/store'
import { NIMInitializeOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'

export class IMUIKit {
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
    // @ts-ignore
    return window.__xkit_store__
  }
}

export {
  Utils,
  Constant,
  CrudeAvatar,
  SearchInput,
  CommonIcon,
  ComplexAvatarUI,
  ComplexAvatarContainer,
  MyAvatarContainer,
  Context,
  Provider,
  ContextManagerTypes,
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
