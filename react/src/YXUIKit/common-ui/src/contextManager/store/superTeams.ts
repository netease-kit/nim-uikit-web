import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import {
  MuteSuperTeamOptions,
  SuperTeam,
  UpdateSuperTeamInfoOptions,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SuperTeamServiceInterface'
import zh from '../../locales/zh'
import RootStore from '.'
import { message } from 'antd'

export class SuperTeamStore {
  superTeams: Map<string, SuperTeam> = new Map()

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore,
    private t: (str: keyof typeof zh) => string
  ) {
    makeAutoObservable(this)

    this._onDismissSuperTeam = this._onDismissSuperTeam.bind(this)
    this._onTransferSuperTeam = this._onTransferSuperTeam.bind(this)
    this._onUpdateSuperTeam = this._onUpdateSuperTeam.bind(this)
    this._onSuperTeams = this._onSuperTeams.bind(this)

    // 超级群解散
    nim.on('dismissSuperTeam', this._onDismissSuperTeam)
    // 超级群转让
    nim.on('transferSuperTeam', this._onTransferSuperTeam)
    // 超级群更新
    nim.on('updateSuperTeam', this._onUpdateSuperTeam)
    // 超级群信息
    nim.on('superTeams', this._onSuperTeams)
  }

  destroy(): void {
    this.nim.off('dismissSuperTeam', this._onDismissSuperTeam)
    this.nim.off('transferSuperTeam', this._onTransferSuperTeam)
    this.nim.off('updateSuperTeam', this._onUpdateSuperTeam)
    this.nim.off('superTeams', this._onSuperTeams)
  }

  // async applySuperTeamActive(teamId: string): Promise<void> {
  //   const team = await this.nim.applySuperTeam({ teamId })
  //   // await this._handleAddTeam(team)
  // }

  // async leaveSuperTeamActive(teamId: string): Promise<void> {
  //   await this.nim.leaveSuperTeam({ teamId })
  //   // await this._handleRemoveTeam(teamId)
  // }

  // async dismissSuperTeamActive(teamId: string): Promise<void> {
  //   await this.nim.dismissSuperTeam({ teamId })
  //   // await this._handleRemoveTeam(teamId)
  // }

  // // 超级群禁言
  // async muteSuperTeamActive(options: MuteSuperTeamOptions): Promise<void> {
  //   await this.nim.muteSuperTeam(options)
  // }

  // 超级群消息免打扰
  // async quietsTeamActive(): Promise<void> {
  // }

  // async updateSuperTeamActive(options: UpdateSuperTeamInfoOptions): Promise<void> {
  //   await this.nim.updateSuperTeamInfo(options)
  //   // 后续在事件中处理
  // }

  addSuperTeam(superTeams: SuperTeam[]): void {
    superTeams
      .filter((item) => !!item.valid)
      .filter((item) => !!item.teamId)
      .forEach((item) => {
        this.superTeams.set(item.teamId, item)
      })
  }

  removeSuperTeam(teamIds: string[]): void {
    teamIds.forEach((item) => {
      this.superTeams.delete(item)
    })
  }

  private async _onDismissSuperTeam(data: { teamId: string }) {
    this.removeSuperTeam([data.teamId])
    // 这里 SDK 没有给群成员离开的事件，因此在这边手动释放内存
    this.rootStore.superTeamMemberStore.removeSuperTeamMember(data.teamId)
    // 删除会话，如果是选中的会话再给一条提示
    const sessionId = `superTeam-${data.teamId}`
    if (this.rootStore.uiStore.selectedSession === sessionId) {
      message.warning(this.t('onDismissTeamText'))
    }
    await this.rootStore.sessionStore.deleteSessionActive(sessionId)
  }

  private _onUpdateSuperTeam(data: SuperTeam) {
    this.addSuperTeam([data])
  }

  private _onSuperTeams(data: SuperTeam[]) {
    this.addSuperTeam(data)
  }

  private _onTransferSuperTeam(data: {
    team: SuperTeam
    from: {
      id: string
      type: string
      updateTime: number
    }
    to: {
      id: string
      type: string
      updateTime: number
    }
  }) {
    this.addSuperTeam([data.team])
    const members = [
      { ...data.from, account: data.from.id.split('-')[1] },
      { ...data.to, account: data.to.id.split('-')[1] },
    ]
    this.rootStore.superTeamMemberStore.updateSuperTeamMember(
      data.team.teamId,
      // @ts-ignore SDK 问题，先忽略
      members
    )
  }
}
