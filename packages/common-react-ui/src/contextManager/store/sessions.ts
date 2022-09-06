import { NimKitCoreTypes } from '@xkit-yx/core-kit'
import { makeAutoObservable, runInAction } from 'mobx'
import { Session } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/SessionServiceInterface'
import { logger } from '../../utils'
import RootStore from '.'
import { TMsgScene } from 'nim-web-sdk-ng/dist/NIM_BROWSER_SDK/MsgServiceInterface'

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

  destroy(): void {
    this.nim.off('sessions', this._onSessions)
    this.nim.off('updateSession', this._onUpdateSession)
  }

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

  removeSession(sessionIds: string[]): void {
    sessionIds.forEach((item) => {
      this.sessions.delete(item)
      if (this.rootStore.uiStore.selectedSession === item) {
        this.rootStore.uiStore.unselectSession()
      }
    })
  }

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
