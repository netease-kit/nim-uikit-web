import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { TMsgScene } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import {
  SystemMessage,
  TSystemMessageStatus,
  TSystemMessageType,
} from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SystemMessageServiceInterface'
import zh from '../../locales/zh'
import RootStore from '.'
import { logger } from '../../utils'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'
/**Mobx 可观察对象，负责管理系统消息的子 store */
export class SysMsgStore {
  // 申请消息
  applyMsgs: Map<string, SystemMessage> = new Map()
  unReadSysMsgs: Map<string, SystemMessage> = new Map()
  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore,
    /** @ignore */
    private t: (str: keyof typeof zh) => string
  ) {
    makeAutoObservable(this)

    this._onSysMsg = this._onSysMsg.bind(this)
    this._onUpdateSystemMessages = this._onUpdateSystemMessages.bind(this)
    this._onSyncSysMsgs = this._onSyncSysMsgs.bind(this)

    // 系统通知
    nim.on('sysMsg', this._onSysMsg)
    // 系统消息，主动通过或拒绝好友，本端收到该事件，多端同步走 syncFriend
    nim.on('updateSystemMessages', this._onUpdateSystemMessages)
    // 同步时系统消息
    nim.on('syncSysMsgs', this._onSyncSysMsgs)
  }
  /**
   * SysMsgStore增加申请消息处理函数（SysMsgStore内部使用，外层不太推荐直接使用）
   * @param msg 系统消息对象
   */
  addApplyMsg(msg: SystemMessage): void {
    if (msg.from && msg.type && msg.to) {
      // TODO SDK 有部分系统通知没有 idServer，因此先用 from 和 type 做 key，等后续 sdk 升级
      const id = `${msg.from}-${msg.type}-${msg.to}`
      this.unReadSysMsgs.set(id, msg)
      this.applyMsgs.set(id, msg)
    } else {
      logger.warn('addApplyMsg drop', msg)
      return
    }
  }
  /**
   * SysMsgStore删除申请消息处理函数（SysMsgStore内部使用，外层不太推荐直接使用）
   * @param idServer 服务器用于区分消息用的ID
   */
  deleteApplyMsg(msg: SystemMessage): void {
    if (msg.from && msg.type && msg.to) {
      const id = `${msg.from}-${msg.type}-${msg.to}`
      this.applyMsgs.delete(id)
      this.unReadSysMsgs.delete(id)
    } else {
      logger.warn('deleteApplyMsg drop', msg)
      return
    }
  }

  // TODO 这里 sdk 没有返回 idServer，因此只能根据 from 和 type 来更新，等待 sdk 优化
  // IM1 在同意好友申请和拒绝好友申请时，这个回调里什么都没有，因此还需要手动处理
  /**
   * SysMsgStore更新申请消息处理函数（SysMsgStore内部使用，外层不太推荐直接使用）
   */

  updateApplyMsg({
    idServer,
    from,
    state,
    type,
    to,
  }: {
    idServer?: string
    from: string
    state: TSystemMessageStatus
    type: TSystemMessageType
    to: string
  }): void {
    let id = ''
    if (from && type && to) {
      id = `${from}-${type}-${to}`
    } else {
      logger.warn('updateApplyMsg drop', {
        idServer,
        from,
        state,
        type,
      })
      return
    }
    const oldSysMsg = this.applyMsgs.get(id)
    if (oldSysMsg) {
      this.applyMsgs.set(id, { ...oldSysMsg, ...{ from, type, state } })
    }
    // 这里还要继续响应一些操作
    switch (type) {
      case 'friendRequest':
        if (state === 'pass') {
          this.rootStore.friendStore.addFriend([
            {
              account: from,
              updateTime: Date.now(),
              createTime: Date.now(),
              valid: true,
            },
          ])
        }
        break
      default:
        break
    }
  }
  /**
   * 获取去重后的未读系统消息
   */
  getUnReadsysMsgsCount() {
    return [...this.unReadSysMsgs.keys()].length
  }

  /**
   * 删除未读系统消息
   */
  deleteUnReadSysMsgs(type: TSystemMessageType, from: string, to: string) {
    const id = `${from}-${type}-${to}`
    this.unReadSysMsgs.delete(id)
  }

  /**
   * 重置系统消息未读
   */
  resetSystemMsgUnread(): void {
    this.unReadSysMsgs.clear()
  }

  /**
   * 销毁SysMsgStore，会取消系统消息事件监听
   */
  destroy(): void {
    this.nim.off('sysMsg', this._onSysMsg)
    this.nim.off('updateSystemMessages', this._onUpdateSystemMessages)
    this.nim.off('syncSysMsgs', this._onSyncSysMsgs)
  }

  private _handleBeRecallMsg(msg: SystemMessage, scene: TMsgScene) {
    if (!msg.recallMessageInfo) {
      return
    }
    const { from, to, time } = msg
    const { idClient, opeAccount } = msg.recallMessageInfo
    const fromAccount = opeAccount || from

    this.rootStore.msgStore.beReCallMsgActive({
      scene,
      from: fromAccount,
      to,
      idClient,
      time,
    })
  }

  private _handleAddFriend(msg: SystemMessage) {
    const { from, time } = msg
    // TODO 这边先由端上构造一条 FriendProfile，实际该由 SDK 提供
    const friend: FriendProfile = {
      account: from,
      updateTime: time,
      createTime: time,
      valid: true,
      relationShip: 1,
      passRelationShip: 1,
    }
    this.rootStore.friendStore.addFriend([friend])
  }

  private _handleSysMsg(msg: SystemMessage) {
    switch (msg.type) {
      // 申请加入超级群
      case 'applySuperTeam':
        // this.addApplyMsg(msg)
        break
      // 申请加入群
      case 'applyTeam':
        this.addApplyMsg(msg)
        break
      // 自定义点对点系统通知
      case 'customP2p':
        break
      // // 自定义超级群系统通知
      case 'customSuperTeam':
        break
      // 自定义群系统通知
      case 'customTeam':
        break
      // 删除好友
      case 'deleteFriend':
        this.rootStore.friendStore.removeFriend([msg.from])
        break
      // 单向删除点对点消息
      case 'deleteMsgP2pOneWay':
        break
      // 单向删除群消息
      case 'deleteMsgTeamOneWay':
        break
      // 好友申请
      case 'friendRequest': {
        switch (msg.attach?.type) {
          // 添加好友
          case 'addFriend':
            this._handleAddFriend(msg)
            break
          // 申请加为好友
          case 'applyFriend':
            this.addApplyMsg(msg)
            break
          // 好友申请通过
          case 'passFriendApply':
            this._handleAddFriend(msg)
            this.addApplyMsg(msg)
            break
          // 拒绝好友申请
          case 'rejectFriendApply':
            this.addApplyMsg(msg)
            break
        }
        break
      }
      // 撤回点对点消息（被动）
      case 'recallMsgP2p':
        this._handleBeRecallMsg(msg, 'p2p')
        break
      // 撤回超级群消息（被动）
      case 'recallMsgSuperTeam':
        this._handleBeRecallMsg(msg, 'superTeam')
        break
      // 撤回群消息（被动）
      case 'recallMsgTeam':
        this._handleBeRecallMsg(msg, 'team')
        break
      // 相关 (管理员)拒绝申请入超级群
      case 'rejectSuperTeamApply':
        // this.addApplyMsg(msg)
        break
      // 相关 (某人)拒绝邀请
      case 'rejectSuperTeamInvite':
        // this.addApplyMsg(msg)
        break
      // 相关 (管理员)拒绝申请入群
      case 'rejectTeamApply':
        this.addApplyMsg(msg)
        break
      // 相关 (某人)拒绝邀请
      case 'rejectTeamInvite':
        this.addApplyMsg(msg)
        break
      // 相关 (管理员)邀请某人
      case 'superTeamInvite':
        break
      // 相关 (管理员)邀请某人
      case 'teamInvite':
        this.addApplyMsg(msg)
        break
    }
  }

  // private _handleUnreadSysMsgKey(type: string, from: string, to?: string) {
  //   let id = ''
  //   //因为群相关系统消息无法通过from和type来确定系统消息唯一性，所以根据type区分，群消息key中增加to
  //   if (type === 'friendRequest') {
  //     id = `${from}-${type}`
  //   } else {
  //     id = `${from}-${type}-${to}`
  //   }
  //   return id
  // }

  private _onSysMsg(data: SystemMessage) {
    logger.log('_onSysMsg: ', data)
    this._handleSysMsg(data)
  }

  private _onUpdateSystemMessages(
    data: {
      idServer: string
      from: string
      state: TSystemMessageStatus
      type: TSystemMessageType
    }[]
  ) {
    logger.log('_onUpdateSystemMessages: ', data)
    data.forEach((item) => {
      this.updateApplyMsg({
        ...item,
        to: this.rootStore.userStore.myUserInfo.account,
      })
    })
  }

  private _onSyncSysMsgs(data: SystemMessage[]) {
    logger.log('_onSyncSysMsgs: ', data)
    data
      .sort((a, b) => a.time - b.time)
      .forEach((item) => {
        this._handleSysMsg(item)
      })
  }
}
