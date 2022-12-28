import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { logger } from '../../utils'
import RootStore from '.'
import { TMsgScene } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'
/**Mobx 可观察对象，负责管理会话列表的子 store */
export class SessionStore {
  sessions: Map<string, Session> = new Map()

  constructor(
    private rootStore: RootStore,
    private nim: NimKitCoreTypes.INimKitCore
  ) {
    makeAutoObservable(this)

    this._onSessions = this._onSessions.bind(this)
    this._onUpdateSession = this._onUpdateSession.bind(this)

    // 会话信息
    nim.on('sessions', this._onSessions)
    // 会话更新
    nim.on('updateSession', this._onUpdateSession)
  }
  /**
   * 销毁SessionStore，会取消会话相关事件监听
   */
  destroy(): void {
    this.nim.off('sessions', this._onSessions)
    this.nim.off('updateSession', this._onUpdateSession)
  }
  /**
   * SessionStore添加会话处理函数（SessionStore内部使用，外层不太推荐直接使用）
   * @param sessions - 消息所属的会话的ID数组
   */
  addSession(sessions: Session[]): void {
    // 暂时不支持 superTeam
    sessions
      .filter((item) => !!item.id)
      .filter((item) => item.lastMsg !== void 0)
      .filter((item) => item.scene !== 'superTeam')
      .forEach((item) => {
        this.sessions.set(item.id, item)
      })
  }
  /**
   * SessionStore更新会话处理函数（SessionStore内部使用，外层不太推荐直接使用）
   * @param sessions - 消息所属的会话的ID数组
   */
  // 更新时不过滤 lastMsg 为空的情况，因为在 add 时已经过滤过一次了，理论上除了本地临时会话，都是有 lastMsg 的
  updateSession(sessions: Session[]): void {
    // 暂时不支持 superTeam
    sessions
      .filter((item) => !!item.id)
      .filter((item) => item.scene !== 'superTeam')
      .forEach((item) => {
        const oldSession = this.sessions.get(item.id)
        this.sessions.set(item.id, { ...oldSession, ...item })
      })
  }
  /**
   * SessionStore移除会话处理函数（SessionStore内部使用，外层不太推荐直接使用）
   * @param sessionIds - 消息所属的会话的ID数组
   */
  removeSession(sessionIds: string[]): void {
    sessionIds.forEach((item) => {
      this.sessions.delete(item)
      if (this.rootStore.uiStore.selectedSession === item) {
        this.rootStore.uiStore.unselectSession()
      }
    })
  }
  /**
   * SessionStore获取会话ID函数（SessionStore内部使用，外层不太推荐直接使用）
   * @param sessions - 消息所属的会话的ID数组
   * @param scene - 场景
   * @param from - 发送方
   * @param to - 接收方, 对方帐号或者群id
   */
  getSessionId(scene: TMsgScene, from: string, to: string): string {
    const myAccount = this.rootStore.userStore.myUserInfo?.account
    // 在（超级）群中，不管 from 是不是自己，sessionId 都要取 to
    let target = ''
    if (scene === 'p2p') {
      if (from === myAccount) {
        target = to
      } else {
        target = from
      }
    } else {
      target = to
    }
    const sessionId = `${scene}-${target}`
    return sessionId
  }
  /**
   * SessionStore重置会话函数（SessionStore内部使用，外层不太推荐直接使用）
   * @param sessionId - 消息所属的会话的ID
   */
  async resetSession(sessionId: string): Promise<void> {
    logger.log('resetSession', sessionId)
    let session = this.sessions.get(sessionId)
    if (!session) {
      logger.warn('resetSession: session is not found.', sessionId)
      return
    }
    try {
      if (session.unread) {
        await this.nim.resetSessionUnreadCount({
          id: session.id,
        })
        session = { ...session, unread: 0, unreadMsgs: [] }
        this.addSession([session])
      }
      logger.log('resetSession success')
    } catch (error) {
      logger.error('resetSession failed: ', error)
      throw error
    }
  }
  /**
   * 插入一条会话记录
   * @param scene - 场景
   * @param to - 接收方, 对方帐号或者群id
   * @param isSelected - 是否选中
   */
  async insertSessionActive(
    scene: TMsgScene,
    to: string,
    isSelected = true
  ): Promise<void> {
    logger.log('insertSessionActive', { scene, to, isSelected })
    const sessionId = `${scene}-${to}`
    if (!this.sessions.has(sessionId)) {
      const _t = this._genTempSession(scene, to)
      const tempSession = {
        ..._t,
        // 这里统一给 tempSession 加上 lastMsg
        lastMsg: _t.lastMsg || ({} as any),
      }
      this.addSession([tempSession])
    }

    if (isSelected) {
      await this.rootStore.uiStore.selectSession(sessionId)
    }
  }
  /**
   * 删除会话记录
   * @param sessionId - 消息所属的会话的ID
   */
  async deleteSessionActive(sessionId: string): Promise<void> {
    try {
      logger.log('deleteSessionActive', sessionId)
      await this.nim.deleteSession({
        id: sessionId,
        isSyncToServer: true,
      })
      this.removeSession([sessionId])
      logger.log('deleteSessionActive success')
    } catch (error) {
      logger.error('deleteSessionActive failed: ', error)
      throw error
    }
  }
  /**
   * 新增会话置顶
   * @param sessionId - 消息所属的会话的ID
   */
  async addStickTopSessionActive(sessionId: string): Promise<void> {
    try {
      logger.log('addStickTopSessionActive', sessionId)
      const res = await this.nim.addStickTopSession({
        id: sessionId,
      })
      this.updateSession([{ ...res, updateTime: Date.now() }])
      logger.log('addStickTopSessionActive success')
    } catch (error) {
      logger.error('addStickTopSessionActive failed: ', error)
      throw error
    }
  }
  /**
   * 删除置顶会话
   * @param sessionId - 消息所属的会话的ID
   */
  async deleteStickTopSessionActive(sessionId: string): Promise<void> {
    try {
      logger.log('deleteStickTopSessionActive', sessionId)
      const res = await this.nim.deleteStickTopSession({
        id: sessionId,
      })
      // 因为临时会话返回的 updateTime 为0，因此这边处理一下
      this.updateSession([{ ...res, updateTime: Date.now() }])
      logger.log('deleteStickTopSessionActive success')
    } catch (error) {
      logger.error('deleteStickTopSessionActive failed: ', error)
      throw error
    }
  }

  private _onSessions(data: Session[]) {
    logger.log('_onSessions: ', data)
    this.addSession(data)
  }

  private async _onUpdateSession(data: Session) {
    logger.log('_onUpdateSession: ', data)
    this.addSession([data])
    if (this.rootStore.uiStore.selectedSession === data.id) {
      await this.resetSession(data.id)
    }
  }

  private _genTempSession(scene: TMsgScene, to: string): Session {
    const tempSession: Session = {
      id: `${scene}-${to}`,
      scene,
      to,
      unread: 0,
      updateTime: Date.now(),
    }
    return tempSession
  }
}
