import {
  makeAutoObservable,
  runInAction,
  reaction,
  IReactionDisposer,
} from 'mobx'
import { ContactType, Relation } from '../types'
import RootStore from '.'
import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { parseSessionId, logger } from '../../utils'
import { debounce } from '@xkit-yx/utils'
import {
  Team,
  TeamMember,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { SystemMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SystemMessageServiceInterface'
/** Mobx 可观察对象，负责 UI 会用到的属性的子 store */
export class UiStore {
  // TODO 这边使用 undefined 会导致无法被注册成 observable，但是 demo 上没问题，不知道是为什么，很懵逼，但是先把这边附上默认值就可以解决
  selectedContactType: ContactType | '' = ''
  selectedSession = ''
  selectedP2PSessionRelation: Relation = 'stranger'
  p2pSessionList: NimKitCoreTypes.P2PSession[] = []
  teamSessionList: NimKitCoreTypes.TeamSession[] = []
  applyMsgList: SystemMessage[] = []
  // sessionList: NimKitCoreTypes.ISession[] = []

  uploadFileLoading = false
  uploadImageLoading = false

  // private friendsAndBlacklistHandler: IReactionDisposer
  // private sessionListHandler: IReactionDisposer
  private p2pSessionListHandler: IReactionDisposer
  private teamSessionListHandler: IReactionDisposer
  private applyMsgListHandler: IReactionDisposer
  private p2pRelationHandler: IReactionDisposer

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this)
    // this.friendsAndBlacklistHandler = reaction(
    //   () => ({
    //     friends: this.friends,
    //     blacklist: this.rootStore.relationStore.blacklist,
    //   }),
    //   this.watchFriendsAndBlacklist.bind(this)
    // )

    this.p2pSessionListHandler = reaction(
      () => ({
        sessions: this.sessions,
        users: this.users,
        mutes: this.rootStore.relationStore.mutes,
        friends: this.friends,
      }),
      debounce(this.getP2pSessionList.bind(this), 300)
    )

    this.teamSessionListHandler = reaction(
      () => ({
        sessions: this.sessions,
        teams: this.teamList,
        // myTeamMemberInfos: this.myTeamMemberInfos,
      }),
      debounce(this.getTeamSessionList.bind(this), 300)
    )

    this.applyMsgListHandler = reaction(
      () => ({
        applyMsgs: this.applyMsgs,
      }),
      this.getApplyMsgWithInfo.bind(this)
    )

    this.p2pRelationHandler = reaction(
      () => ({
        sessionId: this.selectedSession,
        myAccount: this.rootStore.userStore.myUserInfo.account,
        blacklist: this.rootStore.relationStore.blacklist,
        friends: this.friends,
        needUpdate: true,
      }),
      this.getRelation.bind(this)
    )

    // this.sessionListHandler = reaction(
    //   () => ({
    //     sessions: this.sessions,
    //     users: this.users,
    //     teams: this.teamList,
    //     mutes: this.rootStore.relationStore.mutes,
    //     friends: this.friends,
    //   }),
    //   debounce(this.getSessionList.bind(this), 300)
    // )
  }
  /**
   * 销毁UiStore，使UI重置
   */
  destroy(): void {
    // this.friendsAndBlacklistHandler()
    // this.sessionListHandler()
    this.p2pSessionListHandler()
    this.teamSessionListHandler()
    this.applyMsgListHandler()
    this.p2pRelationHandler()
  }
  /**
   * 通讯录选中类型
   * @param contactType - 导航类型
   */
  selectContactType(contactType: ContactType): void {
    logger.log('selectContactType: ', contactType)
    this.selectedContactType = contactType
  }
  /**
   * 取消通讯录选中
   */
  unselectContactType(): void {
    logger.log('unselectContactType')
    this.selectedContactType = ''
  }
  /**
   * 切换会话
   * @param sessionId - 会话ID
   */
  async selectSession(sessionId: string): Promise<void> {
    logger.log('selectSession: ', sessionId)
    this.selectedSession = sessionId

    // 切换会话时需要做一些重置 UI 的事情
    this.setUploadFileLoading(false)
    this.setUploadImageLoading(false)

    // 重置会话未读数
    if (sessionId) {
      await this.rootStore.sessionStore.resetSession(sessionId)
    }
  }
  /**
   * 取消选中会话
   */
  unselectSession(): void {
    logger.log('unselectSession')
    this.selectedSession = ''
  }
  /**
   * 文件上传时的loading状态
   * @param loading - 是否loading
   */
  setUploadFileLoading(loading: boolean): void {
    this.uploadFileLoading = loading
  }
  /**
   * 图片上传时的loading状态
   * @param loading - 是否loading
   */
  setUploadImageLoading(loading: boolean): void {
    this.uploadImageLoading = loading
  }

  /**
   * 获取群信息以及群关系
   * @param loading - 是否loading
   */
  async getTeamAndRelation(
    teamId: string
  ): Promise<{ team: Team; inTeam: boolean }> {
    try {
      logger.log('getTeamAndRelation', teamId)
      let inTeam = false
      let team = this.rootStore.teamStore.teams.get(teamId)
      if (!team) {
        // 说明不在群里
        inTeam = false
        team = await this.rootStore.teamStore.getTeamForceActive(teamId)
      } else {
        inTeam = true
      }
      logger.log('getTeamAndRelation success', { team, inTeam })
      return { team, inTeam }
    } catch (error) {
      logger.error('getTeamAndRelation failed: ', teamId, error)
      throw error
    }
  }
  /**
   * 获取用户信息以及用户关系
   * @param account - 账号
   */
  async getUserAndRelation(
    account: string
  ): Promise<{ user: UserNameCard; relation: Relation }> {
    try {
      logger.log('getUserAndRelation', account)
      const user = await this.rootStore.userStore.getUserActive(account)
      const relation = this.getRelationByAccount(account)
      logger.log('getUserAndRelation success', { user, relation })
      return { user, relation }
    } catch (error) {
      logger.error('getUserAndRelation failed: ', account, error)
      throw error
    }
  }
  /**
   * 获取用户关系
   * @param account - 账号
   */
  getRelationByAccount(account: string): Relation {
    return this.getRelation({
      sessionId: `p2p-${account}`,
      myAccount: this.rootStore.userStore.myUserInfo.account,
      friends: this.friends,
      blacklist: this.rootStore.relationStore.blacklist,
      needUpdate: false,
    })!
  }
  /**
   * 获取群成员和备注
   * @param teamId - 群ID
   */
  getTeamMembersWithAlias(
    teamId: string
  ): (TeamMember & Partial<FriendProfile>)[] {
    const teamMembers = [
      ...(this.rootStore.teamMemberStore.teamMembers.get(teamId)?.values() ||
        []),
    ]

    return teamMembers.map((item) => {
      const friend = this.rootStore.friendStore.friends.get(item.account)
      return {
        ...friend,
        ...item,
      }
    })
  }

  /**
   * 获取好友名片
   * * @param account - 账号
   */
  getFriendWithUserNameCard(account: string): NimKitCoreTypes.IFriendInfo {
    const friend: FriendProfile = this.rootStore.friendStore.friends.get(
      account
    ) || {
      account: '',
      updateTime: Date.now(),
      createTime: Date.now(),
      valid: false,
    }
    const userCard: UserNameCard = this.rootStore.userStore.users.get(
      account
    ) || {
      account: '',
      updateTime: Date.now(),
      createTime: Date.now(),
    }
    return { ...friend, ...userCard }
  }

  // TODO 该方法对于消息上的称谓，会不再取 msg.fromNick，这会与目前的表现不一致，原因是 SDK 还没有提供昵称变更的回调。
  /**
   * 查询用户称谓
   * 优先级按照 备注 > 群昵称 > 好友昵称 > 好友账号 返回
   * * @param account - 账号
   * * @param teamId - 群号
   */
  getAppellation({
    account,
    teamId = '',
  }: {
    account: string
    teamId?: string
  }): string {
    const friend = this.rootStore.friendStore.friends.get(account)
    const user = this.rootStore.userStore.users.get(account)
    const teamMember = this.rootStore.teamMemberStore.teamMembers
      .get(teamId)
      ?.get(account)

    return friend?.alias || teamMember?.nickInTeam || user?.nick || account
  }

  get friends(): FriendProfile[] {
    return [...this.rootStore.friendStore.friends.values()]
  }

  get sessions(): Session[] {
    return [...this.rootStore.sessionStore.sessions.values()]
  }

  get users(): UserNameCard[] {
    return [...this.rootStore.userStore.users.values()]
  }

  get teamList(): Team[] {
    return [...this.rootStore.teamStore.teams.values()]
  }

  get applyMsgs(): SystemMessage[] {
    return [...this.rootStore.sysMsgStore.applyMsgs.values()]
  }

  get systemMsgUnread(): number {
    return this.rootStore.sysMsgStore.getUnReadsysMsgsCount()
  }
  get myTeamMemberInfos(): TeamMember[] {
    const myAccount = this.rootStore.userStore.myUserInfo.account
    const teamMembers: TeamMember[] = []
    const _ = [...this.rootStore.teamMemberStore.teamMembers.values()]
    _.forEach((item) => {
      if (item.has(myAccount)) {
        teamMembers.push(item.get(myAccount)!)
      }
    })
    return teamMembers
  }

  get sessionList(): NimKitCoreTypes.ISession[] {
    const sessions = [...this.p2pSessionList, ...this.teamSessionList].sort(
      (a, b) =>
        (b.lastMsg?.time || b.updateTime) - (a.lastMsg?.time || a.updateTime)
    )
    // 根据置顶与否重新排序
    const filterIsTop = sessions.filter(
      (item) => !!item.stickTopInfo?.isStickOnTop
    )
    const other = sessions.filter((item) => !item.stickTopInfo?.isStickOnTop)
    return [...filterIsTop, ...other]
  }

  /**
   * 获取好友名片列表
   */
  get friendsWithoutBlacklist(): NimKitCoreTypes.IFriendInfo[] {
    return this.friends
      .map((item) => this.getFriendWithUserNameCard(item.account))
      .filter((item) => {
        return !this.rootStore.relationStore.blacklist.includes(item.account)
      })
  }

  /**
   * 获取黑名单名片列表
   */
  get blacklistWithUserCard(): NimKitCoreTypes.IFriendInfo[] {
    return this.rootStore.relationStore.blacklist.map((item) =>
      this.getFriendWithUserNameCard(item)
    )
  }

  // TODO reaction 确实一般是用不到的，普通的 mobx get 方法就可以实时变更。之前没有实时变更可能是一些奇怪的 bug 导致的
  // private async watchFriendsAndBlacklist({
  //   friends,
  //   blacklist,
  // }: {
  //   friends: FriendProfile[]
  //   blacklist: string[]
  // }): Promise<void> {
  //   try {
  //     logger.log('watchFriendsAndBlacklist', friends, blacklist)
  //     const userCards = await Promise.all(
  //       friends.map((item) => {
  //         return this.rootStore.userStore.getUserActive(item.account)
  //       })
  //     )
  //     const friendsWithUserCard = friends.map((item) => {
  //       const userCard = userCards.find((j) => item.account === j.account)!
  //       return {
  //         ...item,
  //         ...userCard,
  //       }
  //     })
  //     const friendsWithoutBlacklist = friendsWithUserCard.filter((i) =>
  //       blacklist.every((j) => i.account !== j)
  //     )
  //     const blacklistWithUserCard = friendsWithUserCard.filter((i) =>
  //       blacklist.includes(i.account)
  //     )
  //     runInAction(() => {
  //       this.friendsWithoutBlacklist = friendsWithoutBlacklist
  //       this.blacklistWithUserCard = blacklistWithUserCard
  //     })
  //     logger.log(
  //       'watchFriendsAndBlacklist success: ',
  //       friendsWithoutBlacklist,
  //       blacklistWithUserCard
  //     )
  //   } catch (error) {
  //     logger.error(
  //       'watchFriendsAndBlacklist failed: ',
  //       friends,
  //       blacklist,
  //       error
  //     )
  //     throw error
  //   }
  // }

  private async getP2pSessionList(params: {
    sessions: Session[]
    users: UserNameCard[]
    mutes: string[]
    friends: FriendProfile[]
  }): Promise<NimKitCoreTypes.P2PSession[]> {
    try {
      logger.log('getP2pSessionList', params)
      const { sessions, mutes, friends } = params
      // 这里陌生人和陌生群组也需要展示相关资料，因此还是从 store 重新获取一次
      const finalUsers = await Promise.all(
        sessions
          .filter((item) => item.scene === 'p2p')
          .map((item) => {
            return this.rootStore.userStore.getUserActive(item.to)
          })
      )

      const res = sessions
        .filter((item) => item.scene === 'p2p')
        .map((item) => {
          const userCard = finalUsers.find((j) => j.account === item.to)!
          const isMute = mutes.some((j) => j === item.to)
          const friend = friends.find((j) => j.account === item.to)!
          return {
            ...item,
            ...friend,
            ...userCard,
            updateTime: item.updateTime,
            isMute,
          }
        })

      runInAction(() => {
        this.p2pSessionList = res
      })
      logger.log('getP2pSessionList success', params, res)
      return res
    } catch (error) {
      logger.error('getP2pSessionList failed: ', params, error)
      throw error
    }
  }

  private async getTeamSessionList(params: {
    sessions: Session[]
    teams: Team[]
    // myTeamMemberInfos: TeamMember[]
  }): Promise<NimKitCoreTypes.TeamSession[]> {
    try {
      logger.log('getTeamSessionList', params)
      const { sessions } = params
      const finalTeams = await Promise.all(
        sessions
          .filter((item) => item.scene === 'team')
          .map((item) => {
            return this.rootStore.teamStore.getTeamActive(item.to)
          })
      )

      const res = sessions
        .filter((item) => item.scene === 'team')
        .map((item) => {
          const team = finalTeams.find((j) => j.teamId === item.to)!
          return {
            ...item,
            ...team,
            updateTime: item.updateTime,
          }
        })

      runInAction(() => {
        this.teamSessionList = res
      })
      logger.log('getTeamSessionList success', params, res)
      return res
    } catch (error) {
      logger.error('getTeamSessionList failed: ', params, error)
      throw error
    }
  }

  private async getApplyMsgWithInfo({
    applyMsgs,
  }: {
    applyMsgs: SystemMessage[]
  }): Promise<SystemMessage[]> {
    // 存进 store 的时候已经是按 from 和 type 存的了，以下代码用不到了
    // const map = new Map<string, SystemMessage>()
    // // 按 from 和 type 去重，并且取最新的
    // applyMsgs.forEach((item) => {
    //   const key = `${item.from}_${item.type}`
    //   const _ = map.get(key)
    //   if (_) {
    //     if (item.time > _.time) {
    //       map.set(key, item)
    //     }
    //   } else {
    //     map.set(key, item)
    //   }
    // })

    // 分情况获取群组和个人的详情，统一放入 attach 中
    const res: SystemMessage[] = []
    for (const item of applyMsgs) {
      switch (item.type) {
        case 'applyTeam': {
          const fromUser = await this.rootStore.userStore.getUserActive(
            item.from
          )
          const toTeam = await this.rootStore.teamStore.getTeamActive(item.to)
          res.push({
            ...item,
            attach: {
              ...item.attach,
              fromUser,
              toTeam,
            },
          })
          break
        }
        case 'teamInvite': {
          const fromUser = await this.rootStore.userStore.getUserActive(
            item.from
          )
          // 这里 sdk 自带了 Team
          const toTeam = item.attach?.team as Team
          res.push({
            ...item,
            attach: {
              ...item.attach,
              fromUser,
              toTeam,
            },
          })
          break
        }
        case 'rejectTeamApply': {
          const fromTeam = item.attach?.team as Team
          res.push({
            ...item,
            attach: {
              ...item.attach,
              fromTeam,
            },
          })
          break
        }
        case 'rejectTeamInvite': {
          const fromUser = await this.rootStore.userStore.getUserActive(
            item.from
          )
          res.push({
            ...item,
            attach: {
              ...item.attach,
              fromUser,
            },
          })
          break
        }
        case 'friendRequest': {
          if (
            ['applyFriend', 'rejectFriendApply', 'passFriendApply'].includes(
              item.attach?.type
            )
          ) {
            const fromUser = await this.rootStore.userStore.getUserActive(
              item.from
            )
            res.push({
              ...item,
              attach: {
                ...item.attach,
                fromUser,
              },
            })
          } else {
            res.push(item)
          }
          break
        }
        default:
          res.push(item)
          break
      }
    }

    // 按时间倒叙排序
    res.sort((a, b) => b.time - a.time)

    runInAction(() => {
      this.applyMsgList = res
    })

    logger.log('getApplyMsgWithInfo success', applyMsgs, res)
    return res
  }

  private getRelation({
    sessionId,
    myAccount,
    blacklist,
    friends,
    needUpdate = false,
  }: {
    sessionId: string
    myAccount: string
    blacklist: string[]
    friends: FriendProfile[]
    needUpdate?: boolean
  }): Relation | undefined {
    logger.log('getRelation', { sessionId, myAccount, blacklist, friends })
    const { scene, to } = parseSessionId(sessionId)
    if (scene !== 'p2p') {
      return
    }
    let res: Relation = 'stranger'
    if (myAccount === to) {
      res = 'myself'
    } else if (blacklist.some((item) => item === to)) {
      res = 'blacklist'
    } else if (friends.some((item) => item.account === to)) {
      res = 'friend'
    } else {
      res = 'stranger'
    }
    logger.log('getRelation success', res)
    if (needUpdate) {
      this.selectedP2PSessionRelation = res
    }
    return res
  }
}
