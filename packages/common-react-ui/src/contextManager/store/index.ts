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

class RootStore {
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
    t: (str: keyof typeof zh) => string
  ) {
    makeAutoObservable(this)

    this.nim = nim
    this.connectStore = new ConnectStore(this, nim)
    this.friendStore = new FriendStore(this, nim)
    this.msgStore = new MsgStore(this, nim, t)
    this.sysMsgStore = new SysMsgStore(this, nim, t)
    this.relationStore = new RelationStore(this, nim)
    this.sessionStore = new SessionStore(this, nim)
    this.teamStore = new TeamStore(this, nim, t)
    this.teamMemberStore = new TeamMemberStore(this, nim, t)
    this.superTeamStore = new SuperTeamStore(this, nim, t)
    this.superTeamMemberStore = new SuperTeamMemberStore(this, nim, t)
    this.userStore = new UserStore(this, nim)
    this.uiStore = new UiStore(this)
  }

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
}

export default RootStore
