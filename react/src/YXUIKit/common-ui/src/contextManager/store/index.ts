import { makeAutoObservable, runInAction } from 'mobx'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { ConnectStore } from './connect'
import { FriendStore } from './friends'
import { MsgStore } from './msgs'
import { SysMsgStore } from './sysMsgs'
import { RelationStore } from './relations'
import { SessionStore } from './sessions'
import { TeamStore } from './teams'
import { TeamMemberStore } from './teamMembers'
import { SuperTeamStore } from './superTeams'
import { SuperTeamMemberStore } from './superTeamMembers'
import { UserStore } from './users'
import { UiStore } from './ui'
import zh from '../../locales/zh'
import {
  UpdateMyInfoOptions,
  UserNameCard,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { LocalOptions } from '../Provider'
import { TTransferTeamResult } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import {
  AcceptTeamInviteOptions,
  MuteTeamOptions,
  PassTeamApplyOptions,
  RejectTeamApplyOptions,
  RejectTeamInviteOptions,
  Team,
  TeamMember,
  UpdateTeamInfoOptions,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { GetHistoryMsgsOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgLogServiceInterface'
import {
  DeleteSelfMsgsResult,
  IMMessage,
  TMsgScene,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import {
  Relations,
  UpdateRelationsOptions,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { ConnectState } from '../types'
import { ContactType, Relation } from '../types'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { SystemMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SystemMessageServiceInterface'
import { IUploadFileOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/types'
import { IMEventSyncFriendResult } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'

class RootStore {
  static ins: RootStore
  nim: NimKitCoreTypes.INimKitCore
  connectStore: ConnectStore
  friendStore: FriendStore
  msgStore: MsgStore
  sysMsgStore: SysMsgStore
  relationStore: RelationStore
  sessionStore: SessionStore
  teamStore: TeamStore
  teamMemberStore: TeamMemberStore
  superTeamStore: SuperTeamStore
  superTeamMemberStore: SuperTeamMemberStore
  userStore: UserStore
  uiStore: UiStore

  constructor(
    nim: NimKitCoreTypes.INimKitCore,
    /** @ignore */
    t: (str: keyof typeof zh) => string,
    localOptions: Required<LocalOptions>
  ) {
    makeAutoObservable(this)

    this.nim = nim
    this.connectStore = new ConnectStore(this, nim)
    this.friendStore = new FriendStore(this, nim)
    this.msgStore = new MsgStore(this, nim, t)
    this.sysMsgStore = new SysMsgStore(this, nim, t)
    this.relationStore = new RelationStore(this, nim)
    this.sessionStore = new SessionStore(this, nim)
    this.teamStore = new TeamStore(this, nim, t, localOptions)
    this.teamMemberStore = new TeamMemberStore(this, nim, t)
    this.superTeamStore = new SuperTeamStore(this, nim, t)
    this.superTeamMemberStore = new SuperTeamMemberStore(this, nim, t)
    this.userStore = new UserStore(this, nim)
    this.uiStore = new UiStore(this)
  }
  /**
   * 销毁根store实例
   */
  destroy(): void {
    this.connectStore.destroy()
    this.friendStore.destroy()
    this.msgStore.destroy()
    this.sysMsgStore.destroy()
    this.relationStore.destroy()
    this.sessionStore.destroy()
    this.teamStore.destroy()
    this.teamMemberStore.destroy()
    this.superTeamStore.destroy()
    this.superTeamMemberStore.destroy()
    this.userStore.destroy()
    this.uiStore.destroy()
  }
  /**
   * 获取根store实例
   * @param nim NIM SDK 实例
   * @param t 国际化函数
   */
  static getInstance(
    nim: NimKitCoreTypes.INimKitCore,
    /** @ignore */
    t: (str: keyof typeof zh) => string,
    localOptions: Required<LocalOptions>
  ): RootStore {
    if (!this.ins) {
      this.ins = new RootStore(nim, t, localOptions)
    }
    return this.ins
  }
}

export default RootStore
export {
  Team,
  TeamMember,
  NimKitCoreTypes,
  ContactType,
  Relation,
  FriendProfile,
  UserNameCard,
  UpdateMyInfoOptions,
  AcceptTeamInviteOptions,
  MuteTeamOptions,
  PassTeamApplyOptions,
  RejectTeamApplyOptions,
  RejectTeamInviteOptions,
  UpdateTeamInfoOptions,
  ConnectState,
  Relations,
  UpdateRelationsOptions,
}
export type {
  Session,
  SystemMessage,
  IUploadFileOptions,
  IMEventSyncFriendResult,
  TTransferTeamResult,
  DeleteSelfMsgsResult,
  IMMessage,
  TMsgScene,
  GetHistoryMsgsOptions,
}
export {
  RootStore,
  ConnectStore,
  FriendStore,
  MsgStore,
  SysMsgStore,
  RelationStore,
  SessionStore,
  TeamStore,
  TeamMemberStore,
  UserStore,
  UiStore,
}
