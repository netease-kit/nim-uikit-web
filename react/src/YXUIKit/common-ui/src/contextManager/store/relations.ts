import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import {
  Relations,
  UpdateRelationsOptions,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import RootStore from '.'
import { logger } from '../../utils'
/**Mobx 可观察对象，负责管理黑名单和静音列表的子store */
export class RelationStore {
  blacklist: string[] = []
  mutes: string[] = []

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore
  ) {
    makeAutoObservable(this)

    this._onRelations = this._onRelations.bind(this)
    this._onUpdateBlackList = this._onUpdateBlackList.bind(this)
    this._onUpdateMuteList = this._onUpdateMuteList.bind(this)

    // 黑名单和静音列表
    nim.on('relations', this._onRelations)
    // 黑名单更新
    nim.on('updateBlackList', this._onUpdateBlackList)
    // 静音列表更新
    nim.on('updateMuteList', this._onUpdateMuteList)
  }
  /**
   * 销毁RelationStore，会取消相关事件监听
   */
  destroy(): void {
    this.nim.off('relations', this._onRelations)
    this.nim.off('updateBlackList', this._onUpdateBlackList)
    this.nim.off('updateMuteList', this._onUpdateMuteList)
  }
  /**
   * RelationStore加入黑名单列表的处理函数（RelationStore内部使用，外层不太推荐直接使用）
   * @param accounts - 账号数组
   */
  addBlacklist(accounts: string[]): void {
    this.blacklist = [...new Set(this.blacklist.concat(accounts))]
  }
  /**
   * RelationStore移除黑名单列表的处理函数（RelationStore内部使用，外层不太推荐直接使用）
   * @param accounts - 账号数组
   */
  removeBlacklist(accounts: string[]): void {
    this.blacklist = this.blacklist.filter((i) =>
      accounts.every((j) => i !== j)
    )
  }
  /**
   * RelationStore加入静音列表的处理函数（RelationStore内部使用，外层不太推荐直接使用）
   * @param accounts - 账号数组
   */
  addMutes(accounts: string[]): void {
    this.mutes = [...new Set(this.mutes.concat(accounts))]
  }
  /**
   * RelationStore移除静音列表的处理函数（RelationStore内部使用，外层不太推荐直接使用）
   * @param accounts - 账号数组
   */
  removeMutes(accounts: string[]): void {
    this.mutes = this.mutes.filter((i) => accounts.every((j) => i !== j))
  }
  /**
   * 加入/移除 黑名单
   * @param account 账号
   * @param isAdd  isAdd 为 true 时, 会将 account 设置（黑名单，静音） 如果一个用户被加入了黑名单, 那么就不再会收到此用户发送的消息。isAdd 为 false 时, 会将 account 取消设置 如果一个用户被从黑名单移除, 那么可以收到此用户发送的消息
   */
  async setBlackActive({
    account,
    isAdd,
  }: UpdateRelationsOptions): Promise<void> {
    try {
      logger.log('setBlackActive', { account, isAdd })
      await this.nim.setBlack({ account, isAdd })
      if (isAdd) {
        this.addBlacklist([account])
      } else {
        this.removeBlacklist([account])
      }
      logger.log('setBlackActive success', { account, isAdd })
    } catch (error) {
      logger.error('setBlackActive failed: ', { account, isAdd }, error)
      throw error
    }
  }
  /**
   * 加入/移除 静音列表
   * @param account 账号
   * @param isAdd  isAdd 为 true 时, 会将 account 设置静音， isAdd 为 false 时, 会将 account 取消设置
   */
  async setMuteActive({
    account,
    isAdd,
  }: UpdateRelationsOptions): Promise<void> {
    try {
      logger.log('setMuteActive', { account, isAdd })
      await this.nim.setMute({ account, isAdd })
      if (isAdd) {
        this.addMutes([account])
      } else {
        this.removeMutes([account])
      }
      logger.log('setMuteActive success', { account, isAdd })
    } catch (error) {
      logger.error('setMuteActive failed: ', { account, isAdd }, error)
      throw error
    }
  }

  private _onRelations(data: Relations) {
    logger.log('_onRelations: ', data)
    this.addBlacklist(data.blackList.map((item) => item.account))
    this.addMutes(data.muteList.map((item) => item.account))
  }

  private _onUpdateBlackList(data: { account: string; isAdd: boolean }) {
    logger.log('_onUpdateBlackList: ', data)
    if (data.isAdd) {
      this.addBlacklist([data.account])
    } else {
      this.removeBlacklist([data.account])
    }
  }

  private _onUpdateMuteList(data: { account: string; isAdd: boolean }) {
    logger.log('_onUpdateMuteList: ', data)
    if (data.isAdd) {
      this.addMutes([data.account])
    } else {
      this.removeMutes([data.account])
    }
  }
}
