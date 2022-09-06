import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { IUploadFileOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/types'
import {
  UpdateMyInfoOptions,
  UserNameCard,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import RootStore from '.'
import { logger } from '../../utils'

export class UserStore {
  users: Map<string, UserNameCard> = new Map()
  myUserInfo: UserNameCard = {
    account: '',
    createTime: Date.now(),
    updateTime: Date.now(),
  }

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore
  ) {
    makeAutoObservable(this)

    this._onUsers = this._onUsers.bind(this)
    this._onSyncMyNameCard = this._onSyncMyNameCard.bind(this)
    this._onUpdateMyNameCard = this._onUpdateMyNameCard.bind(this)

    // 其他用户相关资料
    nim.on('users', this._onUsers)
    // 个人信息
    nim.on('syncMyNameCard', this._onSyncMyNameCard)
    // 多端个人信息更新
    nim.on('updateMyNameCard', this._onUpdateMyNameCard)
  }

  destroy(): void {
    this.nim.off('users', this._onUsers)
    this.nim.off('syncMyNameCard', this._onSyncMyNameCard)
    this.nim.off('updateMyNameCard', this._onUpdateMyNameCard)
  }

  addUsers(users: UserNameCard[]): void {
    users
      .filter((item) => !!item.account)
      .forEach((item) => {
        this.users.set(item.account, item)
      })
  }

  removeUsers(accounts: string[]): void {
    accounts.forEach((item) => {
      this.users.delete(item)
    })
  }

  async saveMyUserInfoActive(
    params: IUploadFileOptions & UpdateMyInfoOptions
  ): Promise<UserNameCard> {
    try {
      logger.log('saveMyUserInfoActive', params)
      const res = await this.nim.saveMyUserInfo(params)
      this.myUserInfo = res
      logger.log('saveMyUserInfoActive success', params, res)
      return res
    } catch (error) {
      logger.error('saveMyUserInfoActive failed:', params, error)
      throw error
    }
  }

  // 如果内存中存在，就不去服务器取最新的了
  async getUserActive(account: string): Promise<UserNameCard> {
    logger.log('getUserActive', account)
    const user = this.users.get(account)
    if (user) {
      return user
    }
    return this.getUserForceActive(account)
  }

  // 始终从服务器取最新的，用于点开用户头像时
  async getUserForceActive(account: string): Promise<UserNameCard> {
    try {
      logger.log('getUserForceActive', account)
      const users = await this.nim.getUsersNameCardFromServer({
        accounts: [account],
      })
      this.addUsers(users)
      logger.log('getUserForceActive success', account, users)
      return users[0]
    } catch (error) {
      logger.error('getUserForceActive failed: ', account, error)
      throw error
    }
  }

  private _onUsers(data: UserNameCard[]) {
    logger.log('_onUsers: ', data)
    this.addUsers(data)
  }

  private _onSyncMyNameCard(data: UserNameCard) {
    logger.log('_onSyncMyNameCard: ', data)
    this.myUserInfo = data
  }

  private _onUpdateMyNameCard(data: UserNameCard) {
    logger.log('_onUpdateMyNameCard: ', data)
    this.myUserInfo = data
  }
}
