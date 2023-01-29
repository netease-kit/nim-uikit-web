import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { IUploadFileOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/types'
import {
  UpdateMyInfoOptions,
  UserNameCard,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import RootStore from '.'
import { logger, frequencyControl } from '../../utils'
/**Mobx 可观察对象，负责管理用户信息（包含陌生人）的子 store */
export class UserStore {
  users: Map<string, UserNameCard> = new Map()
  myUserInfo: UserNameCard = {
    account: '',
    createTime: Date.now(),
    updateTime: Date.now(),
  }

  private _getUserInfo = frequencyControl(this._getUserInfos, 1000, 100)

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
  /**
   * 销毁UserStore，会取消相关事件监听
   */
  destroy(): void {
    this.nim.off('users', this._onUsers)
    this.nim.off('syncMyNameCard', this._onSyncMyNameCard)
    this.nim.off('updateMyNameCard', this._onUpdateMyNameCard)
  }
  /**
   * UserStore增加users处理函数（UserStore内部使用，外层不太推荐直接使用）
   * @param users - users数组
   */
  addUsers(users: UserNameCard[]): void {
    users
      .filter((item) => !!item.account)
      .forEach((item) => {
        this.users.set(item.account, item)
      })
  }
  /**
   * UserStore移除users处理函数（UserStore内部使用，外层不太推荐直接使用）
   * @param users - users数组
   */
  removeUsers(accounts: string[]): void {
    accounts.forEach((item) => {
      this.users.delete(item)
    })
  }
  /**
   * 保存个人信息
   * @param params
   * params.nick - 昵称 <br>
   * params.avatar - 头像 <br>
   * params.sign - 签名 <br>
   * params.gender - 性别 <br>
   * params.email - 邮箱 <br>
   * params.birth - 生日 <br>
   * params.tel - 手机号 <br>
   * params.ext - 扩展字段 <br>
   */
  async saveMyUserInfoActive(
    params: IUploadFileOptions & UpdateMyInfoOptions
  ): Promise<UserNameCard> {
    try {
      logger.log('saveMyUserInfoActive', params)
      const res = await this.nim.saveMyUserInfo(params)
      this.myUserInfo = res
      this.addUsers([res])
      logger.log('saveMyUserInfoActive success', params, res)
      return res
    } catch (error) {
      logger.error('saveMyUserInfoActive failed:', params, error)
      throw error
    }
  }

  /**
   * 获取用户最新信息（如果内存中存在，就不去服务器取最新的了）
   * @param account - 账号id
   */
  async getUserActive(account: string): Promise<UserNameCard> {
    logger.log('getUserActive', account)
    const user = this.users.get(account)
    if (user) {
      return user
    }
    return this.getUserForceActive(account)
  }

  /**
   * 获取用户最新信息（始终从服务器取最新的，用于点开用户头像时）
   * @param account - 账号id
   */

  async getUserForceActive(account: string): Promise<UserNameCard> {
    try {
      logger.log('getUserForceActive', account)
      const user = await this._getUserInfo(account)
      if (user) {
        this.addUsers([user])
      }
      logger.log('getUserForceActive success', account, user)
      return user
    } catch (error) {
      logger.error('getUserForceActive failed: ', account, error)
      throw error
    }
  }

  private _getUserInfos(accounts: string[]) {
    return this.nim.getUsersNameCardFromServer({
      accounts,
    })
  }

  private _onUsers(data: UserNameCard[]) {
    logger.log('_onUsers: ', data)
    this.addUsers(data)
  }

  private _onSyncMyNameCard(data: UserNameCard) {
    logger.log('_onSyncMyNameCard: ', data)
    this.myUserInfo = data
    this.addUsers([data])
  }

  private _onUpdateMyNameCard(data: UserNameCard) {
    logger.log('_onUpdateMyNameCard: ', data)
    this.myUserInfo = data
    this.addUsers([data])
  }
}
