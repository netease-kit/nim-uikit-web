import React from 'react'
import ReactDOM from 'react-dom'
import {
  Utils,
  CrudeAvatar,
  SearchInput,
  SelectModal,
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
  FriendSelect,
  CreateTeamModal,
  Welcome,
  ReadPercent,
  RichText,
  ParseSession,
  useStateContext,
  useTranslation,
  useEventTracking,
  UseEventTrackingProps,
} from './common'

import { ConversationContainer } from './conversation'
import {
  ContactListContainer,
  BlackListContainer,
  FriendListContainer,
  GroupListContainer,
  ContactInfoContainer,
  AIListContainer,
  MsgListContainer,
} from './contact'
import { ChatContainer, ChatMessageItem, ChatCollectionList } from './chat'
import { AddContainer, SearchContainer } from './search'
import RootStore from '@xkit-yx/im-store-v2'
import V2NIM from 'nim-web-sdk-ng'
import { LocalOptions } from '@xkit-yx/im-store-v2/dist/types/types'

export class IMUIKit {
  get context(): {
    nim: V2NIM
    store: RootStore
    localOptions: LocalOptions
  } | void {
    // @ts-ignore
    return window.__xkit_store__
  }
  constructor(private providerProps: Omit<ProviderProps, 'children'>) {}

  render<
    T extends
      | typeof ComplexAvatarContainer
      | typeof MyAvatarContainer
      | typeof FriendSelect
      | typeof CreateTeamModal
      | typeof ConversationContainer
      | typeof ContactListContainer
      | typeof BlackListContainer
      | typeof AIListContainer
      | typeof MsgListContainer
      | typeof FriendListContainer
      | typeof GroupListContainer
      | typeof ContactInfoContainer
      | typeof ChatContainer
      | typeof ChatCollectionList
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
    nim: V2NIM
    store: RootStore
    localOptions: LocalOptions
  } | void {
    return this.context
  }

  destroy(): void {
    this.context?.store.destroy()

    // @ts-ignore
    RootStore.ins = void 0
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
  FriendSelect,
  CreateTeamModal,
  Welcome,
  ReadPercent,
  ParseSession,
  RichText,
  SelectModal,
  useStateContext,
  useTranslation,
  useEventTracking,
  ConversationContainer,
  ContactListContainer,
  BlackListContainer,
  AIListContainer,
  MsgListContainer,
  FriendListContainer,
  GroupListContainer,
  ContactInfoContainer,
  ChatContainer,
  ChatMessageItem,
  ChatCollectionList,
  AddContainer,
  SearchContainer,
}

export type { ProviderProps, ContextProps, UseEventTrackingProps }
