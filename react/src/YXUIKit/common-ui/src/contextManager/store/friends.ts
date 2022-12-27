import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { IMEventSyncFriendResult } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import RootStore from '.'
import { logger } from '../../utils'

export enum SyncFriendActionType {
  // 添加好友
  addFriend,
  // 好友申请
  applyFriend,
  // 通过还有申请
  passFriendApply,
  // 拒绝好友申请
  rejectFriendApply,
  // 删除好友
  deleteFriend,
  // 更新好友备注
  updateFriend,
}
/**Mobx 可观察对象，负责管理好友信息的子 store */
export class FriendStore {
  friends: Map<string, FriendProfile> = new Map()

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore
  ) {
    makeAutoObservable(this)

    this._onFriends = this._onFriends.bind(this)
    this._onSyncFriend = this._onSyncFriend.bind(this)

    // 好友信息
    nim.on('friends', this._onFriends)
    // 多端同步好友操作
    nim.on('syncFriend', this._onSyncFriend)
  }
  /**
   * 销毁FriendStore，会取消好友事件监听
   */

  destroy(): void {
    this.nim.off('friends', this._onFriends)
    this.nim.off('syncFriend', this._onSyncFriend)
  }
  /**
   * 通过好友申请
   * @param account 账号
   */
  async passFriendApplyActive(account: string): Promise<void> {
    try {
      logger.log('passFriendApplyActive', account)
      await this.nim.passFriendApply({ account, ps: '' })
      // 本端会收到 updateSysMsg，其他多端会收到 syncFriend
      // 可是 IM1 updateSysMsg 有问题，因此还得在这边手动处理
      this.rootStore.sysMsgStore.updateApplyMsg({
        state: 'pass',
        from: account,
        type: 'friendRequest',
      })
      logger.log('passFriendApplyActive success', account)
    } catch (error) {
      logger.error('passFriendApplyActive failed: ', account, error)
      throw error
    }
  }
  /**
   * 拒绝好友申请
   * @param account 账号
   */

  async rejectFriendApplyActive(account: string): Promise<void> {
    try {
      logger.log('rejectFriendApplyActive', account)
      await this.nim.rejectFriendApply({ account, ps: '' })
      // 本端会收到 updateSysMsg，其他多端会收到 syncFriend
      // 可是 IM1 updateSysMsg 有问题，因此还得在这边手动处理
      this.rootStore.sysMsgStore.updateApplyMsg({
        state: 'decline',
        from: account,
        type: 'friendRequest',
      })
      logger.log('rejectFriendApplyActive success', account)
    } catch (error) {
      logger.error('rejectFriendApplyActive failed: ', account, error)
      throw error
    }
  }
  /**
   * 直接添加好友
   * @param account 账号
   */
  async addFriendActive(account: string): Promise<void> {
    try {
      logger.log('addFriendActive', account)
      const res = await this.nim.addFriend({ account })
      this.addFriend([res])
      // 业务需要，移除黑名单
      await this.rootStore.relationStore.setBlackActive({
        account,
        isAdd: false,
      })
      logger.log('addFriendActive success', account)
    } catch (error) {
      logger.error('addFriendActive failed: ', account, error)
      throw error
    }
  }
  /**
   * 添加好友申请
   * @param account 账号
   */
  async applyFriendActive(account: string): Promise<void> {
    try {
      logger.log('applyFriendActive', account)
      await this.nim.applyFriend({ account })
      logger.log('applyFriendActive success', account)
    } catch (error) {
      logger.error('applyFriendActive failed: ', account, error)
      throw error
    }
  }
  /**
   * 删除好友
   * @param account 账号
   */
  async deleteFriendActive(account: string): Promise<void> {
    try {
      logger.log('deleteFriendActive', account)
      await this.nim.deleteFriend({ account, delAlias: true })
      this.removeFriend([account])
      // 业务需要，移除黑名单
      await this.rootStore.relationStore.setBlackActive({
        account,
        isAdd: false,
      })
      logger.log('deleteFriendActive success', account)
    } catch (error) {
      logger.error('deleteFriendActive failed: ', account, error)
      throw error
    }
  }
  /**
   * 更新好友信息
   * @param account 账号
   * @param account 备注
   */
  async updateFriendActive(account: string, alias: string): Promise<void> {
    try {
      logger.log('updateFriendActive', account, alias)
      await this.nim.updateFriend({ account, alias })
      // 本端没有事件，需要手动处理
      this.addFriend([
        {
          account,
          alias,
          updateTime: Date.now(),
          createTime: Date.now(),
          valid: true,
        },
      ])
      logger.log('updateFriendActive success', account, alias)
    } catch (error) {
      logger.error('updateFriendActive failed: ', account, alias, error)
      throw error
    }
  }
  /**
   * FriendStore添加好友处理函数（FriendStore内部使用，外层不太推荐直接使用）
   * @param data - 好友数组
   */
  addFriend(data: FriendProfile[]): void {
    data
      // 更新时可能没有 valid 字段，因此全等过滤不等于false 的
      .filter((item) => item.valid !== false)
      .filter((item) => !!item.account)
      .forEach((item) => {
        const oldFriend = this.friends.get(item.account)
        if (!oldFriend) {
          this.friends.set(item.account, item)
          this.rootStore.userStore.getUserActive(item.account)
        } else {
          this.friends.set(item.account, { ...oldFriend, ...item })
        }
      })
  }
  /**
   * FriendStore删除好友处理函数（FriendStore内部使用，外层不太推荐直接使用）
   * @param data - 好友数组
   */
  removeFriend(accounts: string[]): void {
    accounts.forEach((item) => {
      this.friends.delete(item)
    })
  }

  private _onFriends(data: FriendProfile[]) {
    logger.log('_onFriends: ', data)
    this.addFriend(data)
  }

  private _onSyncFriend(data: IMEventSyncFriendResult) {
    logger.log('_onSyncFriend: ', data)
    switch (data.type as keyof typeof SyncFriendActionType) {
      case 'addFriend':
      case 'updateFriend':
        if (data.friend) {
          this.addFriend([data.friend])
        }
        break
      case 'deleteFriend':
        if (data.account) {
          this.removeFriend([data.account])
        }
        break
      case 'passFriendApply':
        this.rootStore.sysMsgStore.updateApplyMsg({
          from: data.account || '',
          state: 'pass',
          type: 'friendRequest',
        })
        break
      case 'rejectFriendApply':
        this.rootStore.sysMsgStore.updateApplyMsg({
          from: data.account || '',
          state: 'decline',
          type: 'friendRequest',
        })
        break
      case 'applyFriend':
        break
    }
  }
}
