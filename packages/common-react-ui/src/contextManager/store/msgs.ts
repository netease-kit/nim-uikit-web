import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { GetHistoryMsgsOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgLogServiceInterface'
import {
  DeleteSelfMsgsResult,
  IMMessage,
  TMsgScene,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import RootStore from '.'
import zh from '../../locales/zh'
import { logger } from '../../utils'

const RECALL_TIME = 2 * 60 * 1000
export class MsgStore {
  msgs: Map<string, Map<string, IMMessage>> = new Map()

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore,
    private t: (str: keyof typeof zh) => string
  ) {
    makeAutoObservable(this)

    this._onMsg = this._onMsg.bind(this)
    // this._onSyncOfflineMsgs = this._onSyncOfflineMsgs.bind(this)
    // this._onSyncRoamingMsgs = this._onSyncRoamingMsgs.bind(this)
    this._onDeleteSelfMsgs = this._onDeleteSelfMsgs.bind(this)

    // 收到消息
    nim.on('msg', this._onMsg)
    // 同步时离线消息
    // nim.on('syncOfflineMsgs', this._onSyncOfflineMsgs)
    // 同步时漫游消息
    // nim.on('syncRoamingMsgs', this._onSyncRoamingMsgs)
    // 群已读
    // nim.on('teamMsgReceipts', (data) => {})
    // 多端同步单向删除某消息的通知
    nim.on('deleteSelfMsgs', this._onDeleteSelfMsgs)
  }

  destroy(): void {
    this.nim.off('msg', this._onMsg)
    // this.nim.off('syncOfflineMsgs', this._onSyncOfflineMsgs)
    // this.nim.off('syncRoamingMsgs', this._onSyncRoamingMsgs)
    this.nim.off('deleteSelfMsgs', this._onDeleteSelfMsgs)

    this.getMsg().forEach((msg) => {
      this._handleClearMsgTimer(msg)
    })
  }

  async reCallMsgActive(msg: IMMessage): Promise<void> {
    try {
      logger.log('reCallMsgActive', msg)
      await this.nim.recallMsg({ msg })
      this.removeMsg(msg.sessionId, [msg.idClient])

      // 插入一条主动撤回的自定义消息。目前是直接插入内存，如果需要记录到服务端，各端统一好格式，发送一条真实的自定义消息。
      // 只有 type 为 custom 和 text 的消息可以被重新编辑
      const attach: any = {
        type: 'reCallMsg',
      }
      if (msg.type === 'custom' || msg.type === 'text') {
        attach.oldBody = msg.body
        attach.canEdit = true
        attach.canEditTimer = setTimeout(() => {
          this.addMsg(recallMsg.sessionId, [
            { ...recallMsg, attach: { ...recallMsg.attach, canEdit: false } },
          ])
        }, RECALL_TIME)
      }

      const recallMsg: IMMessage = {
        ...msg,
        idClient: `recall-${(Math.random() + '').slice(-6)}`,
        status: 'sent',
        time: Date.now(),
        userUpdateTime: Date.now(),
        type: 'custom',
        body: `${this.t('you')}${this.t('recallMessageText')}`,
        feature: 'default',
        attach,
      }
      this.addMsg(recallMsg.sessionId, [recallMsg])
      logger.log('reCallMsgActive success', msg)
    } catch (error) {
      logger.error('reCallMsgActive failed: ', msg, error)
      throw error
    }
  }

  beReCallMsgActive({
    scene,
    from,
    fromNick,
    to,
    idClient,
    time,
  }: {
    scene: TMsgScene
    from: string
    fromNick: string
    to: string
    idClient: string
    time: number
  }): void {
    logger.log('beReCallMsgActive', {
      scene,
      from,
      fromNick,
      to,
      idClient,
      time,
    })
    const sessionId = this.rootStore.sessionStore.getSessionId(scene, from, to)
    this.removeMsg(sessionId, [idClient])
    // 可能是多端同步过来的消息
    const isSelf = this.rootStore.userStore.myUserInfo?.account === from
    // 插入一条对方撤回的自定义消息。目前是直接插入内存，如果需要记录到服务端，各端统一好格式，发送一条真实的自定义消息。
    const beRecallMsg: IMMessage = {
      idClient: `berecall-${(Math.random() + '').slice(-6)}`,
      target: to,
      flow: 'in',
      sessionId,
      from,
      to,
      status: 'sent',
      scene,
      time,
      userUpdateTime: Date.now(),
      type: 'custom',
      body: `${isSelf ? this.t('you') : fromNick || from} ${this.t(
        'recallMessageText'
      )}`,
      feature: 'default',
      attach: {
        type: 'beReCallMsg',
      },
    }
    this.addMsg(sessionId, [beRecallMsg])
  }

  async deleteMsgActive(msgs: IMMessage[]): Promise<void> {
    try {
      logger.log('deleteMsgActive', msgs)
      const res = await this.nim.deleteSelfMsgs({ msgs })
      this._onDeleteSelfMsgs(res)
      logger.log('deleteMsgActive success', msgs)
    } catch (error) {
      this._onDeleteSelfMsgs(msgs as unknown as DeleteSelfMsgsResult[])
      logger.warn(
        'deleteMsgActive failed, but delete msgs from memory: ',
        msgs,
        error
      )
      // throw error
    }
  }

  async sendCustomMsgBySDK(
    cb: (nim: any) => Promise<IMMessage>
  ): Promise<void> {
    try {
      logger.log('sendCustomMsgBySDK')
      const res = await cb(this.nim.getNIM())
      this._handleSendMsgSuccess(res)
      logger.log('sendCustomMsgBySDK success', res)
    } catch (error: any) {
      this._handleSendMsgFail(error.msg)
      logger.error('sendCustomMsgBySDK failed: ', error)
      throw error
    }
  }

  async sendCustomMsgActive({
    scene,
    to,
    body,
    attach,
  }: {
    scene: TMsgScene
    to: string
    body: string
    attach: string
  }): Promise<void> {
    try {
      logger.log('sendCustomMsgActive', { scene, to, body })
      const res = await this.nim.sendCustomMsg({
        scene,
        to,
        body,
        attach,
        onSendBefore: (msg) => {
          this.addMsg(msg.sessionId, [msg])
        },
      })
      this._handleSendMsgSuccess(res)
      logger.log('sendCustomMsgActive success', { scene, to, body })
    } catch (error: any) {
      this._handleSendMsgFail(error.msg)
      logger.error('sendCustomMsgActive failed: ', { scene, to, body }, error)
      throw error
    }
  }

  async sendFileMsgActive({
    scene,
    to,
    file,
  }: {
    scene: TMsgScene
    to: string
    file: File
  }): Promise<void> {
    try {
      logger.log('sendFileMsgActive', { scene, to, file })
      const res = await this.nim.sendFileMsg({
        scene,
        to,
        file,
        onUploadStart: () => {
          this.rootStore.uiStore.setUploadFileLoading(true)
        },
        onUploadDone: () => {
          this.rootStore.uiStore.setUploadFileLoading(false)
        },
        onSendBefore: (msg) => {
          this.addMsg(msg.sessionId, [msg])
        },
      })
      this._handleSendMsgSuccess(res)
      logger.log('sendFileMsgActive success', { scene, to, file })
    } catch (error: any) {
      this._handleSendMsgFail(error.msg)
      logger.error('sendFileMsgActive failed: ', { scene, to, file }, error)
      throw error
    }
  }

  async sendImageMsgActive({
    scene,
    to,
    file,
  }: {
    scene: TMsgScene
    to: string
    file: File
  }): Promise<void> {
    try {
      logger.log('sendImageMsgActive', { scene, to, file })
      const res = await this.nim.sendImageMsg({
        scene,
        to,
        file,
        onUploadStart: () => {
          this.rootStore.uiStore.setUploadImageLoading(true)
        },
        onUploadDone: () => {
          this.rootStore.uiStore.setUploadImageLoading(false)
        },
        onSendBefore: (msg) => {
          this.addMsg(msg.sessionId, [msg])
        },
      })
      this._handleSendMsgSuccess(res)
      logger.log('sendImageMsgActive success', { scene, to, file })
    } catch (error: any) {
      this._handleSendMsgFail(error.msg)
      logger.error('sendImageMsgActive failed: ', { scene, to, file }, error)
      throw error
    }
  }

  async sendTextMsgActive({
    scene,
    to,
    body,
  }: {
    scene: TMsgScene
    to: string
    body: string
  }): Promise<void> {
    try {
      logger.log('sendTextMsgActive', { scene, to, body })
      const res = await this.nim.sendTextMsg({
        scene,
        to,
        body,
        onSendBefore: (msg) => {
          this.addMsg(msg.sessionId, [msg])
        },
      })
      this._handleSendMsgSuccess(res)
      logger.log('sendTextMsgActive success', { scene, to, body })
    } catch (error: any) {
      this._handleSendMsgFail(error.msg)
      logger.error('sendTextMsgActive failed: ', { scene, to, body }, error)
      throw error
    }
  }

  async resendMsgActive(msg: IMMessage): Promise<void> {
    try {
      logger.log('resendMsgActive', msg)
      const res = await this.nim.resendMsg({ msg })
      this._handleSendMsgSuccess(res)
      logger.log('resendMsgActive success', msg)
    } catch (error: any) {
      this._handleSendMsgFail(error.msg)
      logger.error('resendMsgActive failed: ', msg, error)
      throw error
    }
  }

  async getHistoryMsgActive(options: {
    sessionId: string
    endTime: number
    lastMsgId?: string
    limit: number
  }): Promise<IMMessage[]> {
    try {
      logger.log('getHistoryMsgActive', options)
      const { sessionId, endTime, lastMsgId, limit = 100 } = options
      const [scene, to] = sessionId.split('-')

      const finalParams: GetHistoryMsgsOptions = {
        scene: scene as any,
        to,
        endTime,
        limit,
      }
      if (lastMsgId) {
        // 这是因为 sdk 传了 undefined 会请求超时
        finalParams.lastMsgId = lastMsgId
      }

      const msgs = await this.nim.getHistoryMsgs(finalParams)
      this.addMsg(sessionId, msgs)
      logger.log('getHistoryMsgActive success', options, finalParams, msgs)
      return msgs
    } catch (error: any) {
      logger.error('getHistoryMsgActive failed: ', options, error)
      throw error
    }
  }

  addMsg(sessionId: string, msgs: IMMessage[]): void {
    let _msgs = this.msgs.get(sessionId)
    if (!_msgs) {
      _msgs = new Map<string, IMMessage>()
    }
    msgs
      .filter((item) => !!item.idClient)
      .forEach((item) => {
        const _msg = _msgs!.get(item.idClient)
        // SDK 可能会返回多条 idClient 相同的数据，此时取 time 最新的
        if (_msg) {
          if (_msg.time <= item.time) {
            _msgs!.set(item.idClient, item)
          }
        } else {
          _msgs!.set(item.idClient, item)
        }
      })
    this.msgs.set(sessionId, _msgs)
  }

  removeMsg(sessionId: string, idClients?: string[]): void {
    const msgs = this.msgs.get(sessionId)
    if (!msgs) {
      return
    }
    if (!idClients || !idClients.length) {
      msgs.forEach((item) => {
        this._handleClearMsgTimer(item)
      })
      this.msgs.delete(sessionId)
      return
    }
    idClients.forEach((item) => {
      const msg = msgs.get(item)
      this._handleClearMsgTimer(msg)
      msgs.delete(item)
    })
    this.msgs.set(sessionId, msgs)
  }

  getMsg(sessionId?: string, idClients?: string[]): IMMessage[] {
    const sortFunc = (a: IMMessage, b: IMMessage) => {
      return a.time - b.time
    }
    if (!sessionId) {
      return [...this.msgs.values()]
        .map((item) => [...item.values()])
        .flat()
        .sort(sortFunc)
    }
    const msgs = this.msgs.get(sessionId)
    if (!msgs) {
      return []
    }
    if (!idClients || !idClients.length) {
      return [...msgs.values()].sort(sortFunc)
    }

    return idClients
      .map((item) => msgs.get(item)!)
      .filter((item) => !!item)
      .sort(sortFunc)
  }

  private _handleSendMsgSuccess(msg: IMMessage) {
    // 两分钟之内可以撤回，记录到消息的 attach 中
    if (msg && msg.sessionId) {
      const canRecallMsg = {
        ...msg,
        attach: {
          ...msg.attach,
          canRecall: true,
          reCallTimer: setTimeout(() => {
            this.addMsg(msg.sessionId, [msg])
          }, RECALL_TIME),
        },
      }
      this.addMsg(msg.sessionId, [canRecallMsg])
    }
  }

  private _handleSendMsgFail(msg: IMMessage) {
    // 发送失败，拉黑的情况不能撤回、可以删除；网络情况不能撤回、不能删除
    // 因此删除那边做一下 try catch 处理，忽略错误消息
    // 先清除老消息的定时器，再更新消息
    if (msg && msg.sessionId) {
      const oldMsg = this.getMsg(msg.sessionId, [msg.idClient])[0]
      this._handleClearMsgTimer(oldMsg)
      this.addMsg(msg.sessionId, [msg])
    }
  }

  private _handleClearMsgTimer(msg?: IMMessage) {
    if (msg && msg.attach) {
      clearTimeout(msg.attach.canEditTimer)
      clearTimeout(msg.attach.reCallTimer)
    }
  }

  private _onMsg(data: IMMessage) {
    logger.log('_onMsg: ', data)
    this.addMsg(data.sessionId, [data])
  }

  // private _onSyncOfflineMsgs(data: SyncOfflineMsgsResult) {}

  // private _onSyncRoamingMsgs(data: SyncRoamingMsgsResult) {}

  private _onDeleteSelfMsgs(data: DeleteSelfMsgsResult[]) {
    logger.log('_onDeleteSelfMsgs: ', data)
    const res: { [key: string]: DeleteSelfMsgsResult[] } = {}
    data.forEach((item) => {
      const sessionId = this.rootStore.sessionStore.getSessionId(
        item.scene,
        item.from,
        item.to
      )
      if (res[sessionId]) {
        res[sessionId].push(item)
      } else {
        res[sessionId] = [item]
      }
    })
    Object.keys(res).forEach((sessionId) => {
      this.removeMsg(
        sessionId,
        res[sessionId].map((item) => item.idClient)
      )
    })
  }
}
