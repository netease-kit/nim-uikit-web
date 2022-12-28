import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { ConnectState } from '../types'
import RootStore from '.'
import { logger } from '../../utils'
/**Mobx 可观察对象，负责连接的子 store */
export class ConnectStore {
  connectState: ConnectState = 'idle'

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore
  ) {
    makeAutoObservable(this)

    this._onLogined = this._onLogined.bind(this)
    this._onDisconnect = this._onDisconnect.bind(this)
    this._onWillReconnect = this._onWillReconnect.bind(this)
    this._onKicked = this._onKicked.bind(this)
    this._onMultiPortLogin = this._onMultiPortLogin.bind(this)
    this._onSyncDone = this._onSyncDone.bind(this)

    // 连接成功
    nim.on('logined', this._onLogined)
    // 连接断开
    nim.on('disconnect', this._onDisconnect)
    // 开始自动重连
    nim.on('willReconnect', this._onWillReconnect)
    // 被踢下线
    nim.on('kicked', this._onKicked)
    // 多端登录通知
    nim.on('multiPortLogin', this._onMultiPortLogin)
    // 同步完成
    nim.on('syncdone', this._onSyncDone)
  }
  /** 销毁当前 IM 实例，同时会退出登录状态，并断开websocket连接 */
  destroy(): void {
    this.nim.off('logined', this._onLogined)
    this.nim.off('disconnect', this._onDisconnect)
    this.nim.off('willReconnect', this._onWillReconnect)
    this.nim.off('kicked', this._onKicked)
    this.nim.off('multiPortLogin', this._onMultiPortLogin)
    this.nim.off('syncdone', this._onSyncDone)
  }

  private _onLogined() {
    logger.log('_onLogined')
    this.connectState = 'connected'
  }

  private _onDisconnect() {
    logger.log('_onDisconnect')
    this.connectState = 'disconnected'
  }

  private _onWillReconnect() {
    logger.log('_onWillReconnect')
    this.connectState = 'connecting'
  }

  private _onKicked() {
    logger.log('_onKicked')
    this.connectState = 'disconnected'
  }

  private _onMultiPortLogin(data: any) {
    logger.log('_onMultiPortLogin', data)
  }

  private _onSyncDone() {
    logger.log('_onSyncDone')
  }
}
