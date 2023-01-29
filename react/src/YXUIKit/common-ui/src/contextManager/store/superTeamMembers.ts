import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { TUpdateSuperTeamManagersResult } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import {
  AddSuperTeamMembersOptions,
  RemoveSuperTeamMembersOptions,
  SuperTeam,
  SuperTeamMember,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SuperTeamServiceInterface'
import zh from '../../locales/zh'
import RootStore from '.'
import { message } from 'antd'
import { parseSessionId } from '../../utils'

export class SuperTeamMemberStore {
  teamMembers: Map<string, Map<string, SuperTeamMember>> = new Map()

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore,
    private t: (str: keyof typeof zh) => string
  ) {
    makeAutoObservable(this)

    this._onAddSuperTeamMembers = this._onAddSuperTeamMembers.bind(this)
    this._onRemoveSuperTeamMembers = this._onRemoveSuperTeamMembers.bind(this)
    this._onUpdateSuperTeamManagers = this._onUpdateSuperTeamManagers.bind(this)
    this._onUpdateSuperTeamMember = this._onUpdateSuperTeamMember.bind(this)
    this._onUpdateSuperTeamMembersMute =
      this._onUpdateSuperTeamMembersMute.bind(this)

    // 超级群成员添加
    nim.on('addSuperTeamMembers', this._onAddSuperTeamMembers)
    // 超级群成员移除
    nim.on('removeSuperTeamMembers', this._onRemoveSuperTeamMembers)
    // 超级群管理员更新
    nim.on('updateSuperTeamManagers', this._onUpdateSuperTeamManagers)
    // 超级群成员更新的多端同步
    nim.on('updateSuperTeamMember', this._onUpdateSuperTeamMember)
    // 超级群成员静音
    nim.on('updateSuperTeamMembersMute', this._onUpdateSuperTeamMembersMute)
  }

  destroy(): void {
    this.nim.off('addSuperTeamMembers', this._onAddSuperTeamMembers)
    this.nim.off('removeSuperTeamMembers', this._onRemoveSuperTeamMembers)
    this.nim.off('updateSuperTeamManagers', this._onUpdateSuperTeamManagers)
    this.nim.off('updateSuperTeamMember', this._onUpdateSuperTeamMember)
    this.nim.off(
      'updateSuperTeamMembersMute',
      this._onUpdateSuperTeamMembersMute
    )
  }

  // async addSuperTeamMemberActive(options: AddSuperTeamMembersOptions): Promise<void> {
  //   await this.nim.addSuperTeamMembers(options)
  //   // 事件中处理
  // }

  // async removeSuperTeamMemberActive(
  //   options: RemoveSuperTeamMembersOptions
  // ): Promise<void> {
  //   await this.nim.removeSuperTeamMembers(options)
  //   // 事件中处理
  // }

  addSuperTeamMember(teamId: string, members: SuperTeamMember[]): void {
    let teamMembers = this.teamMembers.get(teamId)
    if (!teamMembers) {
      teamMembers = new Map<string, SuperTeamMember>()
    }
    members
      .filter((item) => item.valid)
      .filter((item) => !!item.account)
      .forEach((item) => {
        teamMembers!.set(item.account, item)
      })
    this.teamMembers.set(teamId, teamMembers)
  }

  removeSuperTeamMember(teamId: string, accounts?: string[]): void {
    if (!accounts || !accounts.length) {
      this.teamMembers.delete(teamId)
      return
    }
    const teamMembers = this.teamMembers.get(teamId)
    if (!teamMembers) {
      return
    }
    accounts.forEach((item) => {
      teamMembers.delete(item)
    })
    this.teamMembers.set(teamId, teamMembers)
  }

  updateSuperTeamMember(
    teamId: string,
    members: Partial<SuperTeamMember>[]
  ): void {
    const teamMembers = this.teamMembers.get(teamId)
    if (!teamMembers) {
      return
    }
    members.forEach((item) => {
      let m = teamMembers.get(item.account!)
      if (m) {
        m = { ...m, ...item }
        teamMembers.set(item.account!, m)
      }
    })
    this.teamMembers.set(teamId, teamMembers)
  }

  private _onAddSuperTeamMembers(data: {
    team: SuperTeam
    accounts: string[]
    members: SuperTeamMember[]
  }) {
    this.addSuperTeamMember(data.team.teamId, data.members)
    // 如果是选中的会话，就给个提示
    const sessionId = `superTeam-${data.team.teamId}`
    if (this.rootStore.uiStore.selectedSession === sessionId) {
      const nicks = data.members.map((item) => item.nickInTeam || item.account)
      message.info(`${nicks.join('，')}${this.t('enterTeamText')}`)
    }
  }

  private async _onRemoveSuperTeamMembers(data: {
    team: SuperTeam
    accounts: string[]
  }) {
    // 如果自己被移除
    //   删除会话，如果是选中的会话，给提示 message.warning(t('onRemoveTeamText'))
    //   删除群组
    // 如果是其他人被移除
    //   删除群成员
    //   如果是选中的会话，给提示 message.info(`${rmNames.join('，')}${t('leaveTeamText')}`)
    const myAccount = this.rootStore.userStore.myUserInfo?.account || ''
    const sessionId = `superTeam-${data.team.teamId}`
    if (data.accounts.includes(myAccount)) {
      this.rootStore.superTeamStore.removeSuperTeam([data.team.teamId])
      if (this.rootStore.uiStore.selectedSession === sessionId) {
        message.warning(this.t('onRemoveTeamText'))
      }
      await this.rootStore.sessionStore.deleteSessionActive(sessionId)
    } else {
      const _tms = this.teamMembers.get(data.team.teamId)
      let nicks: string[] = []
      if (_tms) {
        nicks = data.accounts
          .map((item) => {
            const _t = _tms.get(item)
            if (_t) {
              return _t.nickInTeam || _t.account
            }
            return ''
          })
          .filter((item) => !!item)
      }
      this.removeSuperTeamMember(data.team.teamId, data.accounts)
      if (this.rootStore.uiStore.selectedSession === sessionId) {
        message.info(`${nicks.join('，')}${this.t('leaveTeamText')}`)
      }
    }
  }

  private _onUpdateSuperTeamManagers(data: TUpdateSuperTeamManagersResult) {
    const members = data.members.map((item) => ({
      ...item,
      // 这里 SDK 返回的内容中没有 account，先自行处理一下
      account: parseSessionId(item.id).to,
    }))
    // @ts-ignore SDK 问题，先忽略
    this.updateSuperTeamMember(data.team.teamId, members)
  }

  private _onUpdateSuperTeamMember(data: SuperTeamMember) {
    this.updateSuperTeamMember(data.teamId, [data])
  }

  private _onUpdateSuperTeamMembersMute(data: {
    team: SuperTeam
    accounts: string[]
    members: {
      id: string
      account: string
      teamId: string
      mute: boolean
      updateTime: number
    }[]
    mute: boolean
  }) {
    this.updateSuperTeamMember(data.team.teamId, data.members)
  }
}
