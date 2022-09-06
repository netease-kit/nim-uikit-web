import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
import { IMEventSyncFriendResult } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/NIMInterface'
import RootStore from '.'
import { logger } from '../../utils'

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
    // 多端同步时收到了好友相关的资料
    nim.on('syncFriend', this._onSyncFriend)
  }

  destroy(): void {
    this.nim.off('friends', this._onFriends)
    this.nim.off('syncFriend', this._onSyncFriend)
  }

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

  addFriend(data: FriendProfile[]): void {
    data
      .filter((item) => !!item.valid)
      .filter((item) => !!item.account)
      .forEach((item) => {
        this.friends.set(item.account, item)
        this.rootStore.userStore.getUserActive(item.account)
      })
  }

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
    if (data.friend) {
      this.addFriend([data.friend])
    }
  }
}
