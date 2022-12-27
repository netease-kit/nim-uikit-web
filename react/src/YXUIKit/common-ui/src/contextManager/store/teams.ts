import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { TTransferTeamResult } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import {
  AcceptTeamInviteOptions,
  MuteTeamOptions,
  PassTeamApplyOptions,
  RejectTeamApplyOptions,
  RejectTeamInviteOptions,
  Team,
  UpdateTeamInfoOptions,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import zh from '../../locales/zh'
import RootStore from '.'
import { message } from 'antd'
import { logger } from '../../utils'
import { LocalOptions } from '../Provider'
/**Mobx 可观察对象，负责管理群组的子 store */
export class TeamStore {
  teams: Map<string, Team> = new Map()

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore,
    /** @ignore */
    private t: (str: keyof typeof zh) => string,
    private localOptions: Required<LocalOptions>
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
  /**
   * 销毁TeamStore，会取消群组相关事件监听
   */
  destroy(): void {
    this.nim.off('createTeam', this._onCreateTeam)
    this.nim.off('dismissTeam', this._onDismissTeam)
    this.nim.off('updateTeam', this._onUpdateTeam)
    this.nim.off('teams', this._onTeams)
    this.nim.off('transferTeam', this._onTransferTeam)
  }
  /**
   * TeamStore增加群组（TeamStore内部使用，外层不太推荐直接使用）
   * @param teams - 群组
   */
  addTeam(teams: Team[]): void {
    teams
      .filter((item) => !!item.valid)
      .filter((item) => !!item.teamId)
      .forEach((item) => {
        this.teams.set(item.teamId, item)
      })
  }
  /**
   * TeamStore移除群组（TeamStore内部使用，外层不太推荐直接使用）
   * @param teamIds - 群id数组
   */
  removeTeam(teamIds: string[]): void {
    teamIds.forEach((item) => {
      this.teams.delete(item)
    })
  }
  /**
   * TeamStore更新群组（TeamStore内部使用，外层不太推荐直接使用）
   * @param data - 群组信息
   */
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
  /**
   * 创建群
   * @param __namedParameters.accounts - 要拉进群的成员的帐号列表
   * @param __namedParameters.avatar - 群头像
   * @param __namedParameters.name - 群名称
   */
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
        joinMode: this.localOptions.teamJoinMode,
        beInviteMode: this.localOptions.teamBeInviteMode,
        inviteMode: this.localOptions.teamInviteMode,
        updateTeamMode: this.localOptions.teamUpdateTeamMode,
        updateExtMode: this.localOptions.teamUpdateExtMode,
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
  /**
   * 申请入群
   * @param teamId - 群id
   */
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
  /**
   * 主动退群
   * @param teamId - 群id
   */
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
  /**
   * 解散群
   * @param teamId - 群id
   */
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

  /**
   * 群禁言
   * @param options
   * options.teamId - 群id <br>
   * options.mute - 是否禁言
   */
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
  /**
   * 更新群
   * @param options
   * options.teamId - 群id <br>
   * options.name - 群名称  <br>
   * options.avatar - 群头像 <br>
   * options.announcement  - 群公告 <br>
   * options.joinMode - 群加入方式 <br>
   * options.beInviteMode	 - 群被邀请模式 <br>
   * options.inviteMode - 群邀请模式 <br>
   * options.updateTeamMode - 群信息修改权限 <br>
   * options.updateExtMode - manager | all <br>
   */
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
  /**
   * 获取群信息
   * @param teamId - 群id
   */
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

  /**
   * 获取群信息（搜索时使用）
   * @param teamId - 群id
   */
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

  /**
   * 接受入群邀请
   * @param options
   * options.teamId - 群id <br>
   * options.from - 邀请方的帐号
   */
  async acceptTeamInviteActive(
    options: AcceptTeamInviteOptions
  ): Promise<void> {
    try {
      logger.log('acceptTeamInviteActive: ', options)
      await this.nim.acceptTeamInvite(options)
      // TODO sdk 没有给任何本端和多端的有效事件，先手动处理。
      this.rootStore.sysMsgStore.updateApplyMsg({
        from: options.from,
        type: 'teamInvite',
        state: 'pass',
      })
      logger.log('acceptTeamInviteActive success', options)
    } catch (error) {
      logger.error('acceptTeamInviteActive failed: ', options, error)
      throw error
    }
  }
  /**
   * 拒绝入群邀请
   * @param options
   * options.teamId - 群id <br>
   * options.from - 邀请方的帐号
   * options.ps - 附言, 选填, 开发者也可以使用JSON格式的字符串来扩展此内容
   */
  async rejectTeamInviteActive(
    options: RejectTeamInviteOptions
  ): Promise<void> {
    try {
      logger.log('rejectTeamInviteActive: ', options)
      await this.nim.rejectTeamInvite(options)
      // TODO sdk 没有给任何本端和多端的有效事件，先手动处理。
      this.rootStore.sysMsgStore.updateApplyMsg({
        from: options.from,
        type: 'teamInvite',
        state: 'decline',
      })
      logger.log('rejectTeamInviteActive success', options)
    } catch (error) {
      logger.error('rejectTeamInviteActive failed: ', options, error)
      throw error
    }
  }
  /**
   * 通过入群邀请
   * @param options
   * options.teamId - 群id <br>
   * options.from - 邀请方的帐号
   */
  async passTeamApplyActive(options: PassTeamApplyOptions): Promise<void> {
    try {
      logger.log('passTeamApplyActive: ', options)
      await this.nim.passTeamApply(options)
      // TODO sdk 没有给任何本端和多端的有效事件，先手动处理。
      this.rootStore.sysMsgStore.updateApplyMsg({
        from: options.from,
        type: 'applyTeam',
        state: 'pass',
      })
      logger.log('passTeamApplyActive success', options)
    } catch (error) {
      logger.error('passTeamApplyActive failed: ', options, error)
      throw error
    }
  }
  /**
   * 拒绝入群申请
   * @param options
   * options.teamId - 群id <br>
   * options.from - 邀请方的帐号
   * options.ps - 附言, 选填, 开发者也可以使用JSON格式的字符串来扩展此内容
   */
  async rejectTeamApplyActive(options: RejectTeamApplyOptions): Promise<void> {
    try {
      logger.log('rejectTeamApplyActive: ', options)
      await this.nim.rejectTeamApply(options)
      // TODO sdk 没有给任何本端和多端的有效事件，先手动处理。
      this.rootStore.sysMsgStore.updateApplyMsg({
        from: options.from,
        type: 'applyTeam',
        state: 'decline',
      })
      logger.log('rejectTeamApplyActive success', options)
    } catch (error) {
      logger.error('rejectTeamApplyActive failed: ', options, error)
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
