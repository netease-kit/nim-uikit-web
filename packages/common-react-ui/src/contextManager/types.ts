import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { Team } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'

export type ContactType = 'blackList' | 'groupList' | 'friendList'

export type ConnectState = 'connecting' | 'connected' | 'disconnected' | 'idle'

export type IDispatch = <T extends keyof ActionTypeMap>(
  params: ActionProps<T>
) => void

export interface Store {
  connectState: ConnectState
  sessions: NimKitCoreTypes.ISession[]
  selectedSession: NimKitCoreTypes.ISession | undefined
  blackList: NimKitCoreTypes.IBlackInfo[]
  groupList: Team[]
  friendList: NimKitCoreTypes.IFriendInfo[]
  selectedContactType: ContactType | undefined
  myUserInfo: UserNameCard
}

export interface ActionTypeMap {
  changeConnectState: ConnectState
  clearSessions: void
  updateSessions: Partial<NimKitCoreTypes.ISession>[]
  deleteSessions: string[]
  selectSession: NimKitCoreTypes.ISession | undefined
  updateBlacks: Partial<NimKitCoreTypes.IBlackInfo>[]
  deleteBlacks: string[]
  updateGroups: Partial<Team>[]
  deleteGroups: string[]
  setFriends: NimKitCoreTypes.IFriendInfo[]
  updateFriends: Partial<NimKitCoreTypes.IFriendInfo>[]
  deleteFriends: string[]
  selectContactType: ContactType | undefined
  insertTempSession: { isSelected: boolean; session: NimKitCoreTypes.ISession }
  updateMyUserInfo: UserNameCard
}

export interface ActionProps<T extends keyof ActionTypeMap> {
  type: T
  payload: ActionTypeMap[T]
}
