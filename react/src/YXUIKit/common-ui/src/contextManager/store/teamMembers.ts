import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import {
  TUpdateTeamManagersResult,
  TUpdateTeamMembersMute,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import {
  AddTeamMembersOptions,
  RemoveTeamMembersOptions,
  Team,
  TeamMember,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import zh from '../../locales/zh'
import RootStore from '.'
import { message } from 'antd'
import { logger } from '../../utils'
/**Mobx 可观察对象，负责管理群组成员的子 store*/
export class TeamMemberStore {
  teamMembers: Map<string, Map<string, TeamMember>> = new Map()

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore,
    /** @ignore */
    private t: (str: keyof typeof zh) => string
  ) {
    makeAutoObservable(this)

    this._onAddTeamMembers = this._onAddTeamMembers.bind(this)
    this._onRemoveTeamMembers = this._onRemoveTeamMembers.bind(this)
    this._onUpdateTeamManagers = this._onUpdateTeamManagers.bind(this)
    this._onUpdateTeamMember = this._onUpdateTeamMember.bind(this)
    this._onUpdateTeamMembersMute = this._onUpdateTeamMembersMute.bind(this)

    // 群成员添加
    nim.on('addTeamMembers', this._onAddTeamMembers)
    // 群成员离开
    nim.on('removeTeamMembers', this._onRemoveTeamMembers)
    // 群管理员更新
    nim.on('updateTeamManagers', this._onUpdateTeamManagers)
    // 群成员多端同步
    nim.on('updateTeamMember', this._onUpdateTeamMember)
    // 群成员静音
    nim.on('updateTeamMembersMute', this._onUpdateTeamMembersMute)
  }
  /**
   * 销毁TeamMemberStore，会取消相关事件监听
   */
  destroy(): void {
    this.nim.off('addTeamMembers', this._onAddTeamMembers)
    this.nim.off('removeTeamMembers', this._onRemoveTeamMembers)
    this.nim.off('updateTeamManagers', this._onUpdateTeamManagers)
    this.nim.off('updateTeamMember', this._onUpdateTeamMember)
    this.nim.off('updateTeamMembersMute', this._onUpdateTeamMembersMute)
  }
  /**
   * 拉人入群
   * @param options
   * options.teamId - 群id <br>
   * options.accounts - 要拉进群的成员的帐号列表 <br>
   * options.ps - 附言, 选填, 开发者也可以使用JSON格式的字符串来扩展此内容 <br>
   * options.ext - 附言, 自定义扩展字段 <br>
   */
  async addTeamMemberActive(options: AddTeamMembersOptions): Promise<void> {
    try {
      await this.nim.addTeamMembers(options)
      // 事件中处理
      logger.log('addTeamMemberActive success', options)
    } catch (error) {
      logger.error('addTeamMemberActive failed: ', options, error)
      throw error
    }
  }
  /**
   * 踢人出群
   * @param options
   * options.teamId - 群id <br>
   * options.accounts - 要拉进群的成员的帐号列表 <br>
   */
  async removeTeamMemberActive(
    options: RemoveTeamMembersOptions
  ): Promise<void> {
    try {
      await this.nim.removeTeamMembers(options)
      // 事件中处理
      logger.log('removeTeamMemberActive success', options)
    } catch (error) {
      logger.error('removeTeamMemberActive failed: ', options, error)
      throw error
    }
  }
  /**
   * 获取群成员
   * @param teamId - 群id
   */
  async getTeamMemberActive(teamId: string): Promise<TeamMember[]> {
    try {
      logger.log('getTeamMemberActive', teamId)
      const res = await this.nim.getTeamMembers({
        teamId,
      })
      logger.log('getTeamMemberActive success: ', teamId, res)
      this.addTeamMember(teamId, res)
      return res
    } catch (error) {
      logger.error('getTeamMemberActive failed: ', teamId, error)
      throw error
    }
  }
  /**
   * 群消息免打扰
   * @param teamId - 群id
   * @param bitConfigMask -  * 提醒策略  0 开启提醒  1 关闭消息提醒   2 只接受管理员的消息的提醒
   */
  // 群消息免打扰
  async muteTeamNotiActive(
    teamId: string,
    bitConfigMask: number
  ): Promise<void> {
    try {
      logger.log('muteTeamNotiActive', teamId, bitConfigMask)
      await this.nim.updateMyMemberInfo({
        teamId,
        bitConfigMask,
      })
      logger.log('muteTeamNotiActive success: ', teamId, bitConfigMask)
    } catch (error) {
      logger.error('muteTeamNotiActive failed: ', teamId, error)
      throw error
    }
  }
  /**
   * TeamMemberStore添加群成员处理函数（TeamMemberStore内部使用，外层不太推荐直接使用）
   * @param teamId - 群id
   * @param members - 群成员
   */
  addTeamMember(teamId: string, members: TeamMember[]): void {
    let teamMembers = this.teamMembers.get(teamId)
    if (!teamMembers) {
      teamMembers = new Map<string, TeamMember>()
    }
    members
      .filter((item) => !!item.valid)
      .filter((item) => !!item.account)
      .forEach((item) => {
        teamMembers!.set(item.account, item)
      })
    this.teamMembers.set(teamId, teamMembers)
  }
  /**
   * TeamMemberStore移除群成员处理函数（TeamMemberStore内部使用，外层不太推荐直接使用）
   * @param teamId - 群id
   * @param accounts - 群成员数组
   */
  removeTeamMember(teamId: string, accounts?: string[]): void {
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
  /**
   * TeamMemberStore移除群成员处理函数（TeamMemberStore内部使用，外层不太推荐直接使用）
   * @param teamId - 群id
   * @param members - 群成员
   */
  updateTeamMember(teamId: string, members: Partial<TeamMember>[]): void {
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

  private _onAddTeamMembers(data: {
    team: Team
    accounts: string[]
    members: TeamMember[]
  }) {
    logger.log('_onAddTeamMembers: ', data)
    this.rootStore.teamStore.addTeam([data.team])
    this.addTeamMember(data.team.teamId, data.members)
    // 如果是选中的会话，就给个提示
    const sessionId = `team-${data.team.teamId}`
    if (this.rootStore.uiStore.selectedSession === sessionId) {
      const nicks = data.members.map((item) => item.nickInTeam || item.account)
      message.info(`${nicks.join('，')}${this.t('enterTeamText')}`)
    }
  }

  private async _onRemoveTeamMembers(data: { team: Team; accounts: string[] }) {
    // 如果自己被移除
    // TODO 如果是自己主动退群，则提示退群成功
    //   删除会话，如果是选中的会话，给提示 message.warning(t('onRemoveTeamText'))
    //   删除群组
    // 如果是其他人被移除
    //   删除群成员
    //   如果是选中的会话，给提示 message.info(`${rmNames.join('，')}${t('leaveTeamText')}`)
    logger.log('_onRemoveTeamMembers: ', data)
    this.rootStore.teamStore.updateTeam([data.team])
    const myAccount = this.rootStore.userStore.myUserInfo?.account || ''
    const sessionId = `team-${data.team.teamId}`
    if (data.accounts.includes(myAccount)) {
      this.rootStore.teamStore.removeTeam([data.team.teamId])
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
      this.removeTeamMember(data.team.teamId, data.accounts)
      if (this.rootStore.uiStore.selectedSession === sessionId) {
        message.info(`${nicks.join('，')}${this.t('leaveTeamText')}`)
      }
    }
  }

  private _onUpdateTeamManagers(data: TUpdateTeamManagersResult) {
    logger.log('_onUpdateTeamManagers: ', data)
    const members = data.members.map((item) => ({
      ...item,
      // 这里 SDK 返回的内容中没有 account，先自行处理一下
      account: item.id.split('-')[1],
    }))
    // @ts-ignore SDK 问题，先忽略
    this.updateTeamMember(data.team.teamId, members)
  }

  private _onUpdateTeamMember(data: TeamMember) {
    logger.log('_onUpdateTeamMember: ', data)
    this.updateTeamMember(data.teamId, [data])
  }

  private _onUpdateTeamMembersMute(data: TUpdateTeamMembersMute) {
    logger.log('_onUpdateTeamMembersMute: ', data)
    this.updateTeamMember(data.team.teamId, data.members)
  }
}
