import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { TTransferTeamResult } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import {
  MuteTeamOptions,
  Team,
  UpdateTeamInfoOptions,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import zh from '../../locales/zh'
import RootStore from '.'
import { message } from 'antd'
import { logger } from '../../utils'

export class TeamStore {
  teams: Map<string, Team> = new Map()

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore,
    private t: (str: keyof typeof zh) => string
  ) {
    makeAutoObservable(this)

    this._onCreateTeam = this._onCreateTeam.bind(this)
    this._onDismissTeam = this._onDismissTeam.bind(this)
    this._onUpdateTeam = this._onUpdateTeam.bind(this)
    this._onTeams = this._onTeams.bind(this)
    this._onTransferTeam = this._onTransferTeam.bind(this)

    // 多端同步创建群
    nim.on('createTeam', this._onCreateTeam)
    // 群解散
    nim.on('dismissTeam', this._onDismissTeam)
    // 群更新
    nim.on('updateTeam', this._onUpdateTeam)
    // 群信息
    nim.on('teams', this._onTeams)
    // 群转让
    nim.on('transferTeam', this._onTransferTeam)
  }

  destroy(): void {
    this.nim.off('createTeam', this._onCreateTeam)
    this.nim.off('dismissTeam', this._onDismissTeam)
    this.nim.off('updateTeam', this._onUpdateTeam)
    this.nim.off('teams', this._onTeams)
    this.nim.off('transferTeam', this._onTransferTeam)
  }

  addTeam(teams: Team[]): void {
    teams
      .filter((item) => !!item.valid)
      .filter((item) => !!item.teamId)
      .forEach((item) => {
        this.teams.set(item.teamId, item)
      })
  }

  removeTeam(teamIds: string[]): void {
    teamIds.forEach((item) => {
      this.teams.delete(item)
    })
  }

  updateTeam(data: Partial<Team>[]): void {
    data
      .filter((item) => !!item.teamId)
      .forEach((item) => {
        const oldTeam = this.teams.get(item.teamId!)
        if (oldTeam) {
          const newTeam = { ...oldTeam, ...item }
          this.teams.set(item.teamId!, newTeam)
        }
      })
  }

  async createTeamActive({
    accounts,
    avatar,
    name,
  }: {
    accounts: string[]
    avatar: string
    name: string
  }): Promise<Team> {
    try {
      logger.log('createTeamActive', {
        accounts,
        avatar,
        name,
      })
      const team = await this.nim.createTeam({
        accounts,
        avatar,
        type: 'advanced',
        joinMode: 'noVerify',
        beInviteMode: 'noVerify',
        inviteMode: 'all',
        updateTeamMode: 'manager',
        updateExtMode: 'manager',
        name,
      })
      await this._handleAddTeam(team)
      // 会收到一条 onAddTeamMember 事件
      logger.log('createTeamActive success', { accounts, avatar, name })
      return team
    } catch (error) {
      logger.error(
        'createTeamActive failed: ',
        { accounts, avatar, name },
        error
      )
      throw error
    }
  }

  async applyTeamActive(teamId: string): Promise<void> {
    try {
      logger.log('applyTeamActive', teamId)
      const team = await this.nim.applyTeam({ teamId })
      await this._handleAddTeam(team)
      logger.log('applyTeamActive success', teamId)
    } catch (error) {
      logger.error('applyTeamActive failed: ', teamId, error)
      throw error
    }
  }

  async leaveTeamActive(teamId: string): Promise<void> {
    try {
      logger.log('leaveTeamActive', teamId)
      await this.nim.leaveTeam({ teamId })
      // 会收到一条 onRemoveTeamMember 事件
      // await this._handleRemoveTeam(teamId)
      logger.log('leaveTeamActive success', teamId)
    } catch (error) {
      logger.error('leaveTeamActive failed: ', teamId, error)
      throw error
    }
  }

  async dismissTeamActive(teamId: string): Promise<void> {
    try {
      logger.log('dismissTeamActive', teamId)
      await this.nim.dismissTeam({ teamId })
      // 会收到一条 onDissmiss 事件
      // await this._handleRemoveTeam(teamId)
      logger.log('dismissTeamActive success', teamId)
    } catch (error) {
      logger.error('dismissTeamActive failed: ', teamId, error)
      throw error
    }
  }

  // 群禁言
  async muteTeamActive(options: MuteTeamOptions): Promise<void> {
    try {
      logger.log('muteTeamActive', options)
      await this.nim.muteTeam(options)
      logger.log('muteTeamActive success', options)
    } catch (error) {
      logger.error('muteTeamActive failed: ', options, error)
      throw error
    }
  }

  // 群消息免打扰
  // async quietsTeamActive(): Promise<void> {
  // }

  async updateTeamActive(options: UpdateTeamInfoOptions): Promise<void> {
    try {
      logger.log('updateTeamActive', options)
      await this.nim.updateTeamInfo(options)
      // 后续在事件中处理
      logger.log('updateTeamActive success', options)
    } catch (error) {
      logger.error('updateTeamActive failed: ', options, error)
      throw error
    }
  }

  async getTeamActive(teamId: string): Promise<Team> {
    logger.log('getTeamActive: ', teamId)
    let team = this.teams.get(teamId)
    if (team) {
      return team
    }
    team = await this.getTeamForceActive(teamId)
    this.addTeam([team])
    return team
  }

  // 搜索时使用
  async getTeamForceActive(teamId: string): Promise<Team> {
    try {
      logger.log('getTeamForceActive: ', teamId)
      const res = await this.nim.getTeamInfo({ teamId })
      logger.log('getTeamForceActive success', res)
      // 这里不能存入 teamStore，因为 teamStore 只有在群中的内容
      return res
    } catch (error) {
      logger.error('getTeamForceActive failed: ', teamId, error)
      throw error
    }
  }

  private async _onCreateTeam(data: Team) {
    logger.log('_onCreateTeam: ', data)
    await this._handleAddTeam(data)
  }

  private async _onDismissTeam(data: { teamId: string }) {
    logger.log('_onDismissTeam: ', data)
    this._handleRemoveTeam(data.teamId)
  }

  private async _handleAddTeam(team: Team) {
    this.addTeam([team])
    await this.rootStore.sessionStore.insertSessionActive('team', team.teamId)
  }

  private async _handleRemoveTeam(teamId: string) {
    this.removeTeam([teamId])
    // 这里 SDK 没有给群成员离开的事件，因此在这边手动释放内存
    this.rootStore.teamMemberStore.removeTeamMember(teamId)
    // 删除会话，如果是选中的会话再给一条提示
    const sessionId = `team-${teamId}`
    if (this.rootStore.uiStore.selectedSession === sessionId) {
      message.warning(this.t('onDismissTeamText'))
      this.rootStore.uiStore.unselectSession()
    }
    await this.rootStore.sessionStore.deleteSessionActive(sessionId)
  }

  private _onUpdateTeam(data: Partial<Team>) {
    logger.log('_onUpdateTeam: ', data)
    this.updateTeam([data])
  }

  private _onTeams(data: Team[]) {
    logger.log('_onTeams: ', data)
    this.addTeam(data)
  }

  private _onTransferTeam(data: TTransferTeamResult) {
    logger.log('_onTransferTeam: ', data)
    this.addTeam([data.team])
    const members = [
      { ...data.from, account: data.from.id.split('-')[1] },
      { ...data.to, account: data.to.id.split('-')[1] },
    ]
    // @ts-ignore SDK 问题，先忽略
    this.rootStore.teamMemberStore.updateTeamMember(data.team.teamId, members)
  }
}
