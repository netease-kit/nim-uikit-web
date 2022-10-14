import {
  makeAutoObservable,
  runInAction,
  reaction,
  IReactionDisposer,
} from 'mobx'
import { ContactType, Relation } from '../types'
import RootStore from '.'
import {
  IFriendInfo,
  ISession,
} from '@xkit-yx/core-kit/dist/types/nim-kit-core/types'
import { UserNameCard } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import { logger } from '../../utils'
import { debounce } from '@xkit-yx/utils'
import {
  Team,
  TeamMember,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/TeamServiceInterface'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'

export class UiStore {
  // TODO 这边使用 undefined 会导致无法被注册成 observable，但是 demo 上没问题，不知道是为什么，很懵逼，但是先把这边附上默认值就可以解决
  selectedContactType: ContactType | '' = ''
  selectedSession = ''
  friendsWithoutBlacklist: IFriendInfo[] = []
  blacklistWithUserCard: UserNameCard[] = []
  sessionList: ISession[] = []

  friendsWithoutBlacklistHandler: IReactionDisposer
  blacklistWithUserCardHandler: IReactionDisposer
  sessionListHandler: IReactionDisposer

  uploadFileLoading = false
  uploadImageLoading = false

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this)

    this.friendsWithoutBlacklistHandler = reaction(
      () => ({
        friends: this.friends,
        blacklist: this.rootStore.relationStore.blacklist,
      }),
      this.getFriendsWithoutBlacklist.bind(this)
    )

    this.blacklistWithUserCardHandler = reaction(
      () => this.rootStore.relationStore.blacklist,
      this.getBlacklistWithUserCard.bind(this)
    )

    this.sessionListHandler = reaction(
      () => ({
        sessions: this.sessions,
        users: this.users,
        teams: this.teamList,
        mutes: this.rootStore.relationStore.mutes,
      }),
      debounce(this.getSessionList.bind(this), 300)
    )
  }

  destroy(): void {
    this.friendsWithoutBlacklistHandler()
    this.blacklistWithUserCardHandler()
    this.sessionListHandler()
  }

  selectContactType(contactType: ContactType): void {
    logger.log('selectContactType: ', contactType)
    this.selectedContactType = contactType
  }

  unselectContactType(): void {
    logger.log('unselectContactType')
    this.selectedContactType = ''
  }

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

  unselectSession(): void {
    logger.log('unselectSession')
    this.selectedSession = ''
  }

  setUploadFileLoading(loading: boolean): void {
    this.uploadFileLoading = loading
  }

  setUploadImageLoading(loading: boolean): void {
    this.uploadImageLoading = loading
  }

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

  async getUserAndRelation(
    account: string
  ): Promise<{ user: UserNameCard; relation: Relation }> {
    try {
      logger.log('getUserAndRelation', account)
      const user = await this.rootStore.userStore.getUserActive(account)
      const relation = this.getRelation(account)
      logger.log('getUserAndRelation success', { user, relation })
      return { user, relation }
    } catch (error) {
      logger.error('getUserAndRelation failed: ', account, error)
      throw error
    }
  }

  getRelation(account: string): Relation {
    logger.log('getRelation', account)
    let res: Relation = 'stranger'
    if (this.rootStore.userStore.myUserInfo?.account === account) {
      res = 'myself'
    } else if (
      this.rootStore.relationStore.blacklist.some((item) => item === account)
    ) {
      res = 'blacklist'
    } else if (this.rootStore.friendStore.friends.has(account)) {
      res = 'friend'
    } else {
      res = 'stranger'
    }
    logger.log('getRelation success', res)
    return res
  }

  getTeamMembers(teamId: string): TeamMember[] {
    return [
      ...(this.rootStore.teamMemberStore.teamMembers.get(teamId)?.values() ||
        []),
    ]
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

  private async getFriendsWithoutBlacklist({
    friends,
    blacklist,
  }: {
    friends: FriendProfile[]
    blacklist: string[]
  }): Promise<IFriendInfo[]> {
    try {
      logger.log('getFriendsWithoutBlacklist', friends, blacklist)
      const friendsWithoutBlacklist = friends.filter((i) =>
        blacklist.every((j) => i.account !== j)
      )
      const userCards = await Promise.all(
        friendsWithoutBlacklist.map((item) => {
          return this.rootStore.userStore.getUserActive(item.account)
        })
      )
      const res = friendsWithoutBlacklist.map((item) => {
        const userCard = userCards.find((j) => item.account === j.account)!
        return {
          ...item,
          ...userCard,
        }
      })
      runInAction(() => {
        this.friendsWithoutBlacklist = res
      })
      logger.log(
        'getFriendsWithoutBlacklist success: ',
        friends,
        blacklist,
        res
      )
      return res
    } catch (error) {
      logger.error(
        'getFriendsWithoutBlacklist failed: ',
        friends,
        blacklist,
        error
      )
      throw error
    }
  }

  private async getBlacklistWithUserCard(
    blacklist: string[]
  ): Promise<UserNameCard[]> {
    try {
      logger.log('getBlacklistWithUserCard', blacklist)
      const userCards = await Promise.all(
        blacklist.map((item) => {
          return this.rootStore.userStore.getUserActive(item)
        })
      )
      const res = blacklist.map((account) => {
        const userCard = userCards.find((j) => account === j.account)!
        return userCard
      })
      runInAction(() => {
        this.blacklistWithUserCard = res
      })
      logger.log('getBlacklistWithUserCard success: ', blacklist, res)
      return res
    } catch (error) {
      logger.error('getBlacklistWithUserCard failed: ', blacklist, error)
      throw error
    }
  }

  private async getSessionList(params: {
    sessions: Session[]
    teams: Team[]
    users: UserNameCard[]
    mutes: string[]
  }): Promise<ISession[]> {
    try {
      logger.log('getSessionList', params)
      const { sessions, mutes } = params
      // 这里陌生人和陌生群组也需要展示相关资料，因此还是从 store 重新获取一次
      const finalUsers = await Promise.all(
        sessions
          .filter((item) => item.scene === 'p2p')
          .map((item) => {
            return this.rootStore.userStore.getUserActive(item.to)
          })
      )
      const finalTeams = await Promise.all(
        sessions
          .filter((item) => item.scene === 'team')
          .map((item) => {
            return this.rootStore.teamStore.getTeamActive(item.to)
          })
      )

      const res = sessions
        .map((item) => {
          switch (item.scene) {
            case 'p2p': {
              const userCard = finalUsers.find((j) => j.account === item.to)!
              const isMute = mutes.some((j) => j === item.to)
              return {
                ...item,
                ...userCard,
                updateTime: item.updateTime,
                isMute,
              }
            }
            case 'team': {
              const team = finalTeams.find((j) => j.teamId === item.to)!
              return {
                ...item,
                ...team,
                updateTime: item.updateTime,
              }
            }
            // case 'superTeam': {
            //   const team = this.rootStore.superTeamStore.superTeams.get(item.to)!
            //   return {
            //     ...item,
            //     ...team,
            //   }
            // }
            default:
              throw Error('unknow session scene.')
          }
        })
        .sort(
          (a, b) =>
            (b.lastMsg?.time || b.updateTime) -
            (a.lastMsg?.time || a.updateTime)
        )
      runInAction(() => {
        this.sessionList = res
      })
      logger.log('getSessionList success', params, res)
      return res
    } catch (error) {
      logger.error('getSessionList failed: ', params, error)
      throw error
    }
  }
}
