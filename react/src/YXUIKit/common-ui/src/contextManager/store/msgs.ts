import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { GetHistoryMsgsOptions } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgLogServiceInterface'
import {
  DeleteSelfMsgsResult,
  GetTeamMsgReadResult,
  IMMessage,
  TeamMsgReceipt,
  teamMsgReceipt,
  TMsgScene,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import RootStore from '.'
import zh from '../../locales/zh'
import { parseSessionId, logger } from '../../utils'

const RECALL_TIME = 2 * 60 * 1000
/**Mobx 可观察对象，负责管理会话消息的子 store */
export class MsgStore {
  msgs: Map<string, IMMessage[]> = new Map()
  /** 回复消息 */
  replyMsgs: Map<string, IMMessage> = new Map()

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore,
    /** @ignore */
    private t: (str: keyof typeof zh) => string
  ) {
    makeAutoObservable(this)

    this._onMsg = this._onMsg.bind(this)
    // this._onSyncOfflineMsgs = this._onSyncOfflineMsgs.bind(this)
    // this._onSyncRoamingMsgs = this._onSyncRoamingMsgs.bind(this)
    this._onTeamMsgReceipts = this._onTeamMsgReceipts.bind(this)
    this._onDeleteSelfMsgs = this._onDeleteSelfMsgs.bind(this)

    // 收到消息
    nim.on('msg', this._onMsg)
    // 同步时离线消息
    // nim.on('syncOfflineMsgs', this._onSyncOfflineMsgs)
    // 同步时漫游消息
    // nim.on('syncRoamingMsgs', this._onSyncRoamingMsgs)
    // 群已读
    nim.on('teamMsgReceipts', this._onTeamMsgReceipts)
    // 多端同步单向删除某消息的通知
    nim.on('deleteSelfMsgs', this._onDeleteSelfMsgs)
  }
  /**
   * 销毁MsgStore，会取消消息相关事件监听
   */
  destroy(): void {
    this.nim.off('msg', this._onMsg)
    // this.nim.off('syncOfflineMsgs', this._onSyncOfflineMsgs)
    // this.nim.off('syncRoamingMsgs', this._onSyncRoamingMsgs)
    this.nim.off('teamMsgReceipts', this._onTeamMsgReceipts)
    this.nim.off('deleteSelfMsgs', this._onDeleteSelfMsgs)

    this.getMsg().forEach((msg) => {
      this._handleClearMsgTimer(msg)
    })
  }
  /**
   * 回复消息
   * @param msg 消息对象
   */
  replyMsgActive(msg: IMMessage): void {
    this.replyMsgs.set(msg.sessionId, msg)
  }
  /**
   * 回复消息
   * @param msg 消息对象
   */
  reomveReplyMsgActive(sessionId: string): void {
    this.replyMsgs.delete(sessionId)
  }
  /**
   * 撤回消息
   * @param msg 消息对象
   */
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
        idClient: msg.idClient,
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
  /**
   * 插入一条对方撤回的自定义消息
   * @param __namedParameters.scene - 场景
   * @param __namedParameters.from - 消息发送方帐号
   * @param __namedParameters.to - 接收方, 对方帐号或者群id
   * @param __namedParameters.idClient - 端测生成的消息id, 可作为消息唯一主键使用
   * @param __namedParameters.time - 消息发送成功的时间戳(单位毫秒)
   */
  beReCallMsgActive({
    scene,
    from,
    to,
    idClient,
    time,
  }: {
    scene: TMsgScene
    from: string
    to: string
    idClient: string
    time: number
  }): void {
    logger.log('beReCallMsgActive', {
      scene,
      from,
      to,
      idClient,
      time,
    })
    const sessionId = this.rootStore.sessionStore.getSessionId(scene, from, to)
    this.removeMsg(sessionId, [idClient])
    // // 可能是多端同步过来的消息
    // const isSelf = this.rootStore.userStore.myUserInfo?.account === from
    // 插入一条对方撤回的自定义消息。目前是直接插入内存，如果需要记录到服务端，各端统一好格式，发送一条真实的自定义消息。
    const beRecallMsg: IMMessage = {
      idClient: idClient,
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
      // 因为还要考虑群昵称、备注、昵称这些复杂情况，这边不再提供 body，渲染者自行渲染
      body: '',
      // body: `${isSelf ? this.t('you') : fromNick || from} ${this.t(
      //   'recallMessageText'
      // )}`,
      feature: 'default',
      attach: {
        type: 'beReCallMsg',
      },
    }
    this.addMsg(sessionId, [beRecallMsg])
  }
  /**
   * 单向删除消息
   * @param msgs 消息对象数组
   */
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
  /**
   * 通过 NIMSDK实例 发送自定义消息
   * @param cb 调用NIMSDK实例上发送消息接口的回调，参数为NIMSDK实例
   */
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
  /**
   * 发送自定义消息
   * @param __namedParameters.to - 接收方, 对方帐号或者群id
   * @param __namedParameters.scene - 场景
   * @param __namedParameters.body - 发送方帐号
   * @param __namedParameters.attach - 附件信息
   */
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
        ext: this._getExtByReplyMsgs(`${scene}-${to}`),
        body,
        attach,
        // @ts-ignore
        teamSpecializationInfo: {
          needACK: true,
        },
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
    } finally {
      this.reomveReplyMsgActive(`${scene}-${to}`)
    }
  }
  /**
   * 发送文件消息
   * @param __namedParameters.to - 接收方, 对方帐号或者群id
   * @param __namedParameters.scene - 场景
   * @param __namedParameters.file - 文件对象
   */
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
        ext: this._getExtByReplyMsgs(`${scene}-${to}`),
        file,
        // @ts-ignore
        teamSpecializationInfo: {
          needACK: true,
        },
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
    } finally {
      this.reomveReplyMsgActive(`${scene}-${to}`)
    }
  }
  /**
   * 发送图片消息
   * @param __namedParameters.to - 接收方, 对方帐号或者群id
   * @param __namedParameters.scene - 场景
   * @param __namedParameters.file - 图片对象
   */
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
        ext: this._getExtByReplyMsgs(`${scene}-${to}`),
        file,
        // @ts-ignore
        teamSpecializationInfo: {
          needACK: true,
        },
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
    } finally {
      this.reomveReplyMsgActive(`${scene}-${to}`)
    }
  }
  /**
   * 发送文本消息
   * @param __namedParameters.to - 接收方, 对方帐号或者群id
   * @param __namedParameters.scene - 场景
   * @param __namedParameters.body - 发送方帐号
   */
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
        ext: this._getExtByReplyMsgs(`${scene}-${to}`),
        body,
        // @ts-ignore
        teamSpecializationInfo: {
          needACK: true,
        },
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
    } finally {
      this.reomveReplyMsgActive(`${scene}-${to}`)
    }
  }
  /**
   * 消息重发
   * @param msg 消息对象
   */
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
  /**
   * 发送 p2p 消息已读回执
   * @param msg 消息对象
   */
  async sendMsgReceiptActive(msg: IMMessage): Promise<void> {
    try {
      logger.log('sendMsgReceiptActive', msg)
      await this.nim.sendMsgReceipt({
        msg,
      })
      logger.log('sendMsgReceiptActive success', msg)
    } catch (error) {
      logger.error('sendMsgReceiptActive failed: ', msg, error)
      throw error
    }
  }
  /**
   * 发送群组消息已读回执
   * @param options 参考 https://doc.yunxin.163.com/messaging-enhanced/api-refer/web/typedoc/Latest/zh/NIM/modules/MsgServiceInterface.html#teamMsgReceipt-2
   */
  async sendTeamMsgReceiptActive(options: teamMsgReceipt[]): Promise<void> {
    try {
      logger.log('sendTeamMsgReceiptActive', options)
      if (options.length) {
        await this.nim.sendTeamMsgReceipt({
          teamMsgReceipts: options,
        })
      }
      logger.log('sendTeamMsgReceiptActive success', options)
    } catch (error) {
      logger.error('sendTeamMsgReceiptActive failed: ', options, error)
      throw error
    }
  }
  /**
   * 获取群组消息已读未读数
   * @param options 参考 https://doc.yunxin.163.com/messaging-enhanced/api-refer/web/typedoc/Latest/zh/NIM/modules/MsgServiceInterface.html#teamMsgReceipt-2
   */
  async getTeamMsgReadsActive(
    options: teamMsgReceipt[]
  ): Promise<GetTeamMsgReadResult[]> {
    try {
      logger.log('getTeamMsgReadsActive', options)
      if (!options.length) {
        return []
      }
      const res = await this.nim.getTeamMsgReads({
        teamMsgReceipts: options,
      })
      logger.log('getTeamMsgReadsActive success', res)
      return res
    } catch (error) {
      logger.error('getTeamMsgReadsActive failed: ', options, error)
      throw error
    }
  }
  /**
   * 获取历史消息
   * @param options.sessionId - 消息所属的会话的ID
   * @param options.endTime - 结束时间戳, 精确到 ms, 默认为服务器的当前时间
   * @param options.lastMsgId - 上次查询的最后一条消息的 idServer, 第一次不填
   * @param options.limit - 本次查询的消息数量限制, 最多 100 条, 默认 100 条
   */
  async getHistoryMsgActive(options: {
    sessionId: string
    endTime: number
    lastMsgId?: string
    limit: number
  }): Promise<IMMessage[]> {
    try {
      logger.log('getHistoryMsgActive', options)
      const { sessionId, endTime, lastMsgId, limit = 100 } = options
      const { scene, to } = parseSessionId(sessionId)

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
      // 如果是群组消息，需要获取下自己发出的消息已读未读数，拼接到 attach 中用来渲染
      if (scene === 'team') {
        const myMsgs = msgs.filter(
          (item) => item.from === this.rootStore.userStore.myUserInfo.account
        )
        const teamMsgReceipts: teamMsgReceipt[] = myMsgs.map((item) => ({
          teamId: to,
          idClient: item.idClient,
          idServer: item.idServer!,
        }))
        let res: GetTeamMsgReadResult[] = []
        try {
          res = await this.getTeamMsgReadsActive(teamMsgReceipts)
        } catch (error) {
          // 兼容老用户，忽略这个报错
        }
        const newMsgs = msgs.map((item) => {
          const teamMsgReceipt = res.find((j) => j.idClient === item.idClient)
          if (teamMsgReceipt) {
            return this._updateReceiptMsg(item, teamMsgReceipt)
          }
          return item
        })
        this.addMsg(sessionId, newMsgs)
      } else {
        this.addMsg(sessionId, msgs)
      }

      logger.log('getHistoryMsgActive success', options, finalParams, msgs)
      return msgs
    } catch (error: any) {
      logger.error('getHistoryMsgActive failed: ', options, error)
      throw error
    }
  }
  /**
   * MsgStore添加消息处理函数（MsgStore内部使用，外层不太推荐直接使用）
   * @param sessionId - 消息所属的会话的ID
   * @param msgs- 消息对象数组
   */
  addMsg(sessionId: string, msgs: IMMessage[]): void {
    const sortFunc = (a: IMMessage, b: IMMessage) => {
      return a.time - b.time
    }
    const _msgs = this.msgs.get(sessionId) || []
    msgs
      .filter((item) => !!item.idClient)
      .forEach((item) => {
        const _msg = _msgs.find((msg) => msg.idClient === item.idClient)
        // SDK 可能会返回多条 idClient 相同的数据，此时取 time 最新的
        if (_msg) {
          if (_msg.time <= item.time || _msg.status === 'sending') {
            _msgs.splice(_msgs.indexOf(_msg), 1, item)
          }
        } else {
          _msgs.push(item)
        }
      })
    this.msgs.set(sessionId, [..._msgs].sort(sortFunc))
  }
  /**
   * MsgStore删除消息处理函数（MsgStore内部使用，外层不太推荐直接使用）
   * @param sessionId - 消息所属的会话的ID
   * @param idClients - 端测生成的消息id数组
   */
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
    this.msgs.set(
      sessionId,
      msgs.filter((msg) => {
        const isDelete = idClients.includes(msg.idClient)
        if (isDelete) {
          this._handleClearMsgTimer(msg)
        }
        return !isDelete
      })
    )
  }
  /**
   * MsgStore获取消息函数（MsgStore内部使用，外层不太推荐直接使用）
   * @param sessionId - 消息所属的会话的ID
   * @param idClients - 端测生成的消息id数组
   */
  getMsg(sessionId?: string, idClients?: string[]): IMMessage[] {
    if (!sessionId) {
      return [...this.msgs.values()].flat()
    }
    const msgs = this.msgs.get(sessionId) || []

    if (!idClients || !idClients.length) {
      return msgs
    }
    // 如果有 idClients，只返回 idClients 中的消息，新数组
    return msgs.filter((item) => idClients.includes(item.idClient))
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
            // 从内存中取最新的，因为中间可能有其他更新
            const _msg = this.getMsg(msg.sessionId, [msg.idClient])[0]
            if (_msg) {
              const _attach = _msg.attach
              if (_attach) {
                delete _attach.canRecall
                delete _attach.reCallTimer
              }
              _msg.attach = _attach
              this.addMsg(msg.sessionId, [_msg])
            }
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

  private _onTeamMsgReceipts(data: TeamMsgReceipt[]): void {
    logger.log('_onTeamMsgReceipts: ', data)
    data.forEach((item) => {
      const sessionId = `team-${item.teamId}`
      const msg = this.getMsg(sessionId, [item.idClient])[0]
      if (msg) {
        const newMsg = this._updateReceiptMsg(msg, item)
        this.addMsg(sessionId, [newMsg])
      }
    })
  }

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

  private _getExtByReplyMsgs(sessionId: string): string | undefined {
    let ext
    const replyMsg = this.replyMsgs.get(sessionId)
    if (replyMsg) {
      // 记录部分信息，过多ext会导致发送不成功
      // 'type' | 'body' | 'attach' | 'idClient' | 'fromNick' | 'from'
      const yxReplyMsg = {
        sessionId: replyMsg.sessionId,
        fromNick: replyMsg.fromNick,
        flow: replyMsg.flow,
        from: replyMsg.from,
        type: replyMsg.type,
        body: replyMsg.body,
        idClient: replyMsg.idClient,
        idServer: replyMsg.idServer,
      }
      ext = JSON.stringify({
        yxReplyMsg: yxReplyMsg,
      })
    }
    return ext
  }

  private _updateReceiptMsg(
    originMsg: IMMessage,
    data: {
      unread: number
      read: number
    }
  ): IMMessage {
    return {
      ...originMsg,
      // 在 attach 中存一下，这样不用改 ts 定义
      attach: {
        ...originMsg.attach,
        yxUnread: Number(data.unread),
        yxRead: Number(data.read),
      },
    }
  }
}
