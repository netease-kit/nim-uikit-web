import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import {
  Relations,
  UpdateRelationsOptions,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/UserServiceInterface'
import RootStore from '.'
import { logger } from '../../utils'

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

  destroy(): void {
    this.nim.off('relations', this._onRelations)
    this.nim.off('updateBlackList', this._onUpdateBlackList)
    this.nim.off('updateMuteList', this._onUpdateMuteList)
  }

  addBlacklist(accounts: string[]): void {
    this.blacklist = [...new Set(this.blacklist.concat(accounts))]
  }

  removeBlacklist(accounts: string[]): void {
    this.blacklist = this.blacklist.filter((i) =>
      accounts.every((j) => i !== j)
    )
  }

  addMutes(accounts: string[]): void {
    this.mutes = [...new Set(this.mutes.concat(accounts))]
  }

  removeMutes(accounts: string[]): void {
    this.mutes = this.mutes.filter((i) => accounts.every((j) => i !== j))
  }

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
