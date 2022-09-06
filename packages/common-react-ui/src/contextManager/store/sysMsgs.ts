import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { TMsgScene } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
import { SystemMessage } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SystemMessageServiceInterface'
import zh from '../../locales/zh'
import RootStore from '.'
import { logger } from '../../utils'
import { FriendProfile } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/FriendServiceInterface'

export class SysMsgStore {
  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore,
    private t: (str: keyof typeof zh) => string
  ) {
    makeAutoObservable(this)

    this._onSysMsg = this._onSysMsg.bind(this)
    // this._onUpdateSystemMessages = this._onUpdateSystemMessages.bind(this)
    this._onSyncSysMsgs = this._onSyncSysMsgs.bind(this)

    // 系统通知
    nim.on('sysMsg', this._onSysMsg)
    // 系统消息，看上去目前只有主动通过或拒绝好友才会收到，暂时用不到
    // nim.on('updateSystemMessages', this._onUpdateSystemMessages)
    // 同步时系统消息
    nim.on('syncSysMsgs', this._onSyncSysMsgs)
  }

  destroy(): void {
    this.nim.off('sysMsg', this._onSysMsg)
    // this.nim.off('updateSystemMessages', this._onUpdateSystemMessages)
    this.nim.off('syncSysMsgs', this._onSyncSysMsgs)
  }

  private _handleBeRecallMsg(msg: SystemMessage, scene: TMsgScene) {
    if (!msg.recallMessageInfo) {
      return
    }
    const { from, to, time } = msg
    const { idClient, fromNick = '', opeAccount } = msg.recallMessageInfo
    const fromAccount = opeAccount || from

    this.rootStore.msgStore.beReCallMsgActive({
      scene,
      from: fromAccount,
      fromNick,
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
        break
      // 申请加入群
      case 'applyTeam':
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
            break
          // 好友申请通过
          case 'passFriendApply':
            this._handleAddFriend(msg)
            break
          // 拒绝好友申请
          case 'rejectFriendApply':
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
        break
      // 相关 (某人)拒绝邀请
      case 'rejectSuperTeamInvite':
        break
      // 相关 (管理员)拒绝申请入群
      case 'rejectTeamApply':
        break
      // 相关 (某人)拒绝邀请
      case 'rejectTeamInvite':
        break
      // 相关 (管理员)邀请某人
      case 'superTeamInvite':
        break
      // 相关 (管理员)邀请某人
      case 'teamInvite':
        break
    }
  }

  private _onSysMsg(data: SystemMessage) {
    logger.log('_onSysMsg: ', data)
    this._handleSysMsg(data)
  }

  // private _onUpdateSystemMessages(
  //   data: {
  //     idServer: string
  //     from: string
  //     state: TSystemMessageStatus
  //     type: TSystemMessageType
  //   }[]
  // ) {}

  private _onSyncSysMsgs(data: SystemMessage[]) {
    logger.log('_onSyncSysMsgs: ', data)
    data
      .sort((a, b) => a.time - b.time)
      .forEach((item) => {
        this._handleSysMsg(item)
      })
  }
}
