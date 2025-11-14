import { autorun } from "../../../libs/store";

const enum V2NIMConversationType {
    /** 未知 */
    V2NIM_CONVERSATION_TYPE_UNKNOWN = 0,
    /** 单聊 */
    V2NIM_CONVERSATION_TYPE_P2P = 1,
    /** 群聊 */
    V2NIM_CONVERSATION_TYPE_TEAM = 2,
    /** 超大群 */
    V2NIM_CONVERSATION_TYPE_SUPER_TEAM = 3
}

const enum V2NIMConnectStatus {
    /**
     * 未连接
     */
    V2NIM_CONNECT_STATUS_DISCONNECTED = 0,
    /**
     * 已连接
     */
    V2NIM_CONNECT_STATUS_CONNECTED = 1,
    /**
     * 连接中
     */
    V2NIM_CONNECT_STATUS_CONNECTING = 2,
    /**
     * 等待重连中
     */
    V2NIM_CONNECT_STATUS_WAITING = 3
}

const enum V2NIMLoginStatus {
    /**
     * 未登录
     *
     * 注: 初始状态也是未登录.
     */
    V2NIM_LOGIN_STATUS_LOGOUT = 0,
    /**
     * 已登录
     */
    V2NIM_LOGIN_STATUS_LOGINED = 1,
    /**
     * 登录中
     */
    V2NIM_LOGIN_STATUS_LOGINING = 2,
    /**
     * 处在退避间隔中
     *
     * 注: 这是一个中间状态, SDK 将会在这个状态下等待一段时间后再次尝试登录
     */
    V2NIM_LOGIN_STATUS_UNLOGIN = 3
}

/**
 * 回复消息接口
 */
export interface YxReplyMsg {
  messageClientId: string
  scene: V2NIMConversationType
  from: string
  receiverId: string
  to: string
  idServer: string
  time: number
}

/**
 * 聊天页面主组件
 */
Component({
  /**
   * 组件属性
   */
  properties: {
    // 主题模式
    theme: {
      type: String,
      value: 'light'
    },
    // 会话ID
    conversationId: {
      type: String,
      value: ''
    },
    // 是否显示群组消息已读未读
    teamMsgReceiptVisible: {
      type: Boolean,
      value: false
    },
    // 是否显示P2P消息已读未读
    p2pMsgReceiptVisible: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件数据
   */
  data: {
    // 状态栏高度
    statusBarHeight: 0,
    // 输入面板高度
    inputPanelHeight: 0,
    // 清理监听器
    conversationTypeDisposer: null as any,
    connectedDisposer: null as any,
    msgsDisposer: null as any,
    teamInfoDisposer: null as any,
    // 页面标题
    title: '',
    // 会话类型
    conversationType: null as V2NIMConversationType | null,
    // 对话方ID
    to: '',
    // 消息列表
    msgs: [] as any[],
    // 回复消息映射
    replyMsgsMap: {} as Record<string, any>,
    // 是否正在加载更多
    loadingMore: false,
    // 是否没有更多消息
    noMore: false,
    // 是否正在加载
    loading: false,
    // 错误信息
    errorMessage: '',
    // 是否显示操作菜单
    showActionMenu: false,
    // 选中的消息
    selectedMessage: null as any | null,
    // 是否显示确认对话框
    showConfirmModal: false,
    // 确认对话框标题
    confirmTitle: '',
    // 确认对话框内容
    confirmMessage: '',
    // 确认回调
    confirmCallback: null as (() => void) | null,
    // 是否显示转发弹窗
    showForwardModal: false,
    // 好友列表
    friends: [] as any[],
    // 群组列表
    teams: [] as any[],
    // 最近联系人
    recentContacts: [] as any[],
    // 是否已挂载
    isMounted: false,
    // 历史消息限制
    HISTORY_LIMIT: 20
  },


  lifetimes: {
    attached() {
      this.setStatusBarHeight();
      
      // 初始化nim和store实例
      const app = getApp() as any;
      const { nim, store } = app.globalData;
      
      // 将nim、store对象存储为不需要监听变化的实例属性
      (this as any).nimInstance = nim;
      (this as any).storeInstance = store;

      // 优先使用传入的conversationId，如果没有则使用store中的selectedConversation
      const conversationId = this.data.conversationId || (store && store.uiStore && store.uiStore.selectedConversation)

      if (conversationId) {
        this.setData({ conversationId })
        this.init()
      }
    },

    detached() {
      // 清理监听器
      if (this.data.conversationTypeDisposer) {
        this.data.conversationTypeDisposer();
      }
      if (this.data.connectedDisposer) {
        this.data.connectedDisposer();
      }
      if (this.data.msgsDisposer) {
        this.data.msgsDisposer();
      }
      if (this.data.teamInfoDisposer) {
        this.data.teamInfoDisposer();
      }
      // 解绑 SDK 事件
      this.unbindEvents();
      // 清理绑定的回调引用
      delete (this as any).__onReceiveMessages;
      delete (this as any).__onTeamDismissed;
      delete (this as any).__onTeamLeft;
      
      // 重置挂载状态，确保下次进入页面时能正常初始化
      this.setData({ isMounted: false })
    }
  },

  /**
   * 组件方法
   */
  methods: {
    setStatusBarHeight() {
      const systemInfo = wx.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || 44;
      this.setData({
        statusBarHeight: statusBarHeight
      });
    },
    /**
     * 初始化组件
     */
    init() {
      // 清除之前的错误状态
      this.setData({ errorMessage: '' })
      
      if (!this.data.conversationId) {
        this.setData({ errorMessage: '会话ID不能为空' })
        return
      }

      try {
        // 清理旧的监听器
        if (this.data.connectedDisposer) {
          this.data.connectedDisposer()
          this.setData({ connectedDisposer: null })
        }
        if (this.data.msgsDisposer) {
          this.data.msgsDisposer()
          this.setData({ msgsDisposer: null })
        }

        // 清空上一个会话的消息记录和相关状态
        this.setData({
          msgs: [],
          replyMsgsMap: {},
          loadingMore: false,
          noMore: false,
          loading: false,
          showActionMenu: false,
          selectedMessage: null,
          showConfirmModal: false,
          confirmTitle: '',
          confirmMessage: '',
          confirmCallback: null,
          showForwardModal: false,
          isMounted: false // 重置挂载状态，以便重新加载消息
        })

        // 解析会话类型和对话方ID
        const conversationType = getApp().globalData.nim.V2NIMConversationIdUtil.parseConversationType(
          this.data.conversationId
        ) as V2NIMConversationType
        
        const to = getApp().globalData.nim.V2NIMConversationIdUtil.parseConversationTargetId(
          this.data.conversationId
        )

        this.setData({
          conversationType,
          to
        })

        // 设置页面标题
        this.setNavTitle()

        // 绑定事件监听
        this.bindEvents()

        // 加载联系人数据
        this.loadContactsData()

        // 重新创建监听器
        this.createListeners()

        // 直接加载当前会话的消息
        this.loadCurrentConversationMessages()

      } catch (error) {
        console.error('初始化聊天页面失败:', error)
        this.setData({ errorMessage: '初始化失败，请重试' })
      }
    },

    /**
     * 创建监听器
     */
    createListeners() {
      const store = getApp().globalData.store

      if (!store) return

      // 监听连接状态
      const self = this
      const connectedDisposer = autorun(() => {
        const currentConversationId = self.data.conversationId
        if (!currentConversationId) return

        const connectStatus = store.connectStore.connectStatus
        if (connectStatus === V2NIMConnectStatus.V2NIM_CONNECT_STATUS_CONNECTED) {
          if (!self.data.isMounted) {
            self.getHistory(Date.now())
            self.setData({ isMounted: true })
          }
        }
      })

      // 监听消息
      /** 动态更新消息 */
      const msgsDisposer = autorun(() => {
        // 监听msgStore的变化
        const msgStore = store && store.msgStore
        if (!msgStore) return
        
        // 当msgStore有变化时，重新加载当前会话的消息
        self.loadCurrentConversationMessages()
      })

      const teamInfoDisposer = autorun(() => {
        const t = self.data.conversationType
        const to = self.data.to
        if (t === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
          const team = (store && store.teamStore && store.teamStore.teams) ? store.teamStore.teams.get(to) : null
          const members = (store && store.teamMemberStore && store.teamMemberStore.getTeamMember) ? store.teamMemberStore.getTeamMember(to) || [] : []
          const count = (team && typeof (team as any).memberCount === 'number') ? (team as any).memberCount : (Array.isArray(members) ? members.length : 0)
          const name = (team && (team as any).name) ? (team as any).name : ''
          self.setData({ title: `${name}(${count})` })
        }
      })

      this.setData({
        connectedDisposer,
        msgsDisposer,
        teamInfoDisposer
      })
    },

    /**
     * 加载当前会话消息
     */
    loadCurrentConversationMessages() {
      const store = getApp().globalData.store
      const currentConversationId = this.data.conversationId
      
      if (!currentConversationId || !store || !store.msgStore) {
        return
      }

      // 直接从store获取当前会话的消息
      const messages = store.msgStore.getMsg ? store.msgStore.getMsg(currentConversationId) || [] : []
      
      this.setData({ msgs: messages })

      // 处理回复消息映射
      this.processReplyMsgsMap(messages)
    },

    /**
     * 设置导航栏标题
     */
    setNavTitle() {
      const { conversationType, to } = this.data
      const store = getApp().globalData.store

      if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P) {
        // 单聊：显示对方昵称
        const title = (store && store.uiStore && store.uiStore.getAppellation) ? store.uiStore.getAppellation({ account: to }) || to : to
        this.setData({ title })
      } else if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM) {
        // 群聊：显示群名称和成员数
        const team = (store && store.teamStore && store.teamStore.teams) ? store.teamStore.teams.get(to) : null
        const subTitle = `(${(team && team.memberCount) || 0})`
        const title = ((team && team.name) || '') + subTitle
        this.setData({ title })
      }
    },

    /**
     * 绑定事件监听
     */
    bindEvents() {
      const nim = getApp().globalData.nim

      ;(this as any).__onReceiveMessages = this.onReceiveMessages.bind(this)
      ;(this as any).__onTeamDismissed = this.onTeamDismissed.bind(this)
      ;(this as any).__onTeamLeft = this.onTeamLeft.bind(this)

      // 监听收到新消息
      nim.V2NIMMessageService.on('onReceiveMessages', (this as any).__onReceiveMessages)
      // 监听群组解散
      nim.V2NIMTeamService.on('onTeamDismissed', (this as any).__onTeamDismissed)
      // 监听离开群组
      nim.V2NIMTeamService.on('onTeamLeft', (this as any).__onTeamLeft)
    },

    /**
     * 解绑事件监听
     */
    unbindEvents() {
      const nim = getApp().globalData.nim

      nim.V2NIMMessageService.off('onReceiveMessages', (this as any).__onReceiveMessages || this.onReceiveMessages)
      nim.V2NIMTeamService.off('onTeamDismissed', (this as any).__onTeamDismissed || this.onTeamDismissed)
      nim.V2NIMTeamService.off('onTeamLeft', (this as any).__onTeamLeft || this.onTeamLeft)
    },

    /**
     * 收到新消息回调
     */
    onReceiveMessages(msgs: any[]) {
      try {
        if (!Array.isArray(msgs) || msgs.length === 0) return

        const firstMsg = msgs.find((m) => m && m.conversationId)
        if (!firstMsg) return

        // 检查是否是当前会话的消息
        if (firstMsg.conversationId === this.data.conversationId && !firstMsg.isSelf) {
          this.handleMsgReceipt(msgs)
          this.scrollToBottomAfterNewMessage()
        }
      } catch (e) {
        console.error('处理收到消息异常:', e)
      }
    },

    /**
     * 群组解散回调
     */
    onTeamDismissed(data: any) {
      if (data.teamId === this.data.to) {
        this.showConfirm('提示', '群组已解散', () => {
          this.backToConversation()
        })
      }
    },

    /**
     * 离开群组回调
     */
    onTeamLeft(data: any) {
      wx.showToast({
        title: '您已离开群组',
        icon: 'none',
        duration: 1000
      })
      this.backToConversation()
    },

    /**
     * 处理消息已读回执
     */
    handleMsgReceipt(msgs: any[]) {
      const { conversationType, p2pMsgReceiptVisible, teamMsgReceiptVisible } = this.data
      const store = getApp().globalData.store

      if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P && p2pMsgReceiptVisible) {
        // P2P消息已读回执
        if (store && store.msgStore && store.msgStore.sendMsgReceiptActive) {
          store.msgStore.sendMsgReceiptActive(msgs[0])
        }
      } else if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && teamMsgReceiptVisible) {
        // 群消息已读回执
        if (store && store.msgStore && store.msgStore.sendTeamMsgReceiptActive) {
          store.msgStore.sendTeamMsgReceiptActive(msgs)
        }
      }
    },

    /**
     * 处理历史消息已读回执
     */
    handleHistoryMsgReceipt(msgs: any[]) {
      const { conversationType, p2pMsgReceiptVisible, teamMsgReceiptVisible, conversationId } = this.data
      const store = getApp().globalData.store
      const nim = getApp().globalData.nim
      const myUserAccountId = nim.V2NIMLoginService.getLoginUser()

      if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P && p2pMsgReceiptVisible) {
        // P2P消息处理
        const othersMsgs = msgs
          .filter(item => !['beReCallMsg', 'reCallMsg'].includes((item as any).recallType || ''))
          .filter(item => item.senderId !== myUserAccountId)

        if (othersMsgs.length > 0) {
          if (store && store.msgStore && store.msgStore.sendMsgReceiptActive) {
            store.msgStore.sendMsgReceiptActive(othersMsgs[0])
          }
        }
      } else if (conversationType === V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM && teamMsgReceiptVisible) {
        // 群消息处理
        const myMsgs = msgs
          .filter(item => !['beReCallMsg', 'reCallMsg'].includes((item as any).recallType || ''))
          .filter(item => item.senderId === myUserAccountId)

        if (store && store.msgStore && store.msgStore.getTeamMsgReadsActive) {
            store.msgStore.getTeamMsgReadsActive(myMsgs, conversationId)
          }

        const othersMsgs = msgs
          .filter(item => !['beReCallMsg', 'reCallMsg'].includes((item as any).recallType || ''))
          .filter(item => item.senderId !== myUserAccountId)

        if (othersMsgs.length > 0 && othersMsgs.length < 50) {
          if (store && store.msgStore && store.msgStore.sendTeamMsgReceiptActive) {
            store.msgStore.sendTeamMsgReceiptActive(othersMsgs)
          }
        }
      }
    },

    /**
     * 获取历史消息
     */
    async getHistory(endTime: number, lastMsgId?: string) {
      try {
        // 检查conversationId是否有效
        if (!this.data.conversationId) {
          console.warn('conversationId为空，跳过获取历史消息')
          return []
        }

        if (this.data.noMore || this.data.loadingMore) {
          return []
        }

        this.setData({ loadingMore: true })

        const store = getApp().globalData.store
        const historyMsgs = (store && store.msgStore && store.msgStore.getHistoryMsgActive) ? await store.msgStore.getHistoryMsgActive({
          conversationId: this.data.conversationId,
          endTime,
          lastMsgId,
          limit: this.data.HISTORY_LIMIT
        }) : []

        this.setData({ 
          loadingMore: false,
          errorMessage: '' // 清除错误状态
        })

        if (historyMsgs && historyMsgs.length) {
          if (historyMsgs.length < this.data.HISTORY_LIMIT) {
            this.setData({ noMore: true })
          }
          // 处理消息已读回执
          this.handleHistoryMsgReceipt(historyMsgs)
          return historyMsgs
        } else {
          this.setData({ noMore: true })
        }
      } catch (error) {
        console.error('获取历史消息失败:', error)
        this.setData({ 
          loadingMore: false,
          errorMessage: '获取消息失败，请重试'
        })
        throw error
      }
    },

    /**
     * 加载更多消息
     */
    loadMoreMsgs(event: any) {
      // 清除错误状态
      this.setData({ errorMessage: '' })
      
      const { lastMsg } = event.detail
      if (lastMsg) {
        this.getHistory(lastMsg.createTime, lastMsg.messageServerId)
      } else {
        // 如果没有传入lastMsg，使用当前消息列表中最早消息的时间
        const msgs = this.data.msgs
        if (msgs && msgs.length > 0) {
          const earliestMsg = msgs[0]
          this.getHistory(earliestMsg.createTime, earliestMsg.messageServerId)
        } else {
          // 如果没有消息，获取当前时间之前的历史消息
          this.getHistory(Date.now())
        }
      }
    },

    /**
     * 处理回复消息映射
     */
    processReplyMsgsMap(messages: any[]) {
      if (!messages.length) return

      const _replyMsgsMap: Record<string, any> = {}
      const reqMsgs: YxReplyMsg[] = []
      const messageClientIdsMap: Record<string, string[]> = {}

      messages.forEach(msg => {
        if (msg.serverExtension) {
          try {
            const { yxReplyMsg } = JSON.parse(msg.serverExtension)
            if (yxReplyMsg) {
              // 查找被回复的消息
              const replyMsg = messages.find(item => item.messageClientId === yxReplyMsg.idClient)
              if (replyMsg) {
                // 为回复消息设置发送者名称
                const store = getApp().globalData.store;
                if (replyMsg.senderId && store && store.uiStore && !replyMsg.senderName) {
                  replyMsg.senderName = store.uiStore.getAppellation({ account: replyMsg.senderId }) || replyMsg.senderId;
                }
                _replyMsgsMap[msg.messageClientId] = replyMsg
              } else {
                _replyMsgsMap[msg.messageClientId] = { messageClientId: 'noFind' } as any
                
                const { scene, from, to, idServer, messageClientId, time, receiverId } = yxReplyMsg
                if (scene && from && to && idServer && messageClientId && time && receiverId) {
                reqMsgs.push({ scene, from, to, idServer, messageClientId, time, receiverId })
                if (!messageClientIdsMap[idServer]) {
                  messageClientIdsMap[idServer] = []
                }
                messageClientIdsMap[idServer].push(msg.messageClientId)
                }
              }
            }
          } catch (error) {
            console.error('解析回复消息失败:', error)
          }
        }
      })

      if (reqMsgs.length > 0) {
        // 从服务器获取被回复的消息
        const nim = getApp().globalData.nim
        nim.V2NIMMessageService.getMessageListByRefers(
          reqMsgs.map(item => ({
            senderId: item.from,
            receiverId: item.receiverId,
            messageClientId: item.messageClientId,
            messageServerId: item.idServer,
            createTime: item.time,
            conversationType: item.scene,
            conversationId: item.to
          }))
        ).then((res: any[]) => {
          if (res && res.length > 0) {
            const store = getApp().globalData.store;
            res.forEach(item => {
              if (item.messageServerId) {
                if (item.senderId && store && store.uiStore) {
                  item.senderName = store.uiStore.getAppellation({ account: item.senderId }) || item.senderId;
                }
                const cids = messageClientIdsMap[item.messageServerId] || []
                cids.forEach(cid => {
                  _replyMsgsMap[cid] = item
                })
              }
            })
          }
          this.setData({ replyMsgsMap: Object.assign({}, _replyMsgsMap) })
        }).catch(() => {
          this.setData({ replyMsgsMap: Object.assign({}, _replyMsgsMap) })
        })
      } else {
        this.setData({ replyMsgsMap: Object.assign({}, _replyMsgsMap) })
      }
    },

    /**
     * 返回会话列表
     */
    backToConversation() {
      wx.navigateBack({
        delta: 1
      })
    },

    /**
     * 跳转设置页面
     */
    handleSetting() {
      const { conversationType, to } = this.data      
      // 触发setting事件给父页面
      this.triggerEvent('setting', {
        conversationType,
        to
      })
    },

    /**
     * 处理消息点击
     */
    handleMessageClick(event: any) {
      const { message } = event.detail
      this.setData({
        selectedMessage: message,
        showActionMenu: true
      })
    },

    /**
     * 处理头像点击
     */
    handleAvatarClick(event: any) {
      const { account } = event.detail
      const store = getApp().globalData.store
      
      if (!account) {
        console.warn('头像点击事件缺少account参数')
        return
      }
      
      // 获取当前用户账号
      const myAccount = (store && store.userStore && store.userStore.myUserInfo && store.userStore.myUserInfo.accountId) || null
      
      if (account === myAccount) {
        // 点击自己头像，跳转到个人详情页面
        wx.navigateTo({
          url: `/pages/user/my-detail/index`
        }).catch((error) => {
          console.error('跳转个人详情页面失败:', error)
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        })
      } else {
        // 点击好友头像，跳转到好友名片页面
        wx.navigateTo({
          url: `/pages/friend/friend-card/index?accountId=${account}`
        }).catch((error) => {
          console.error('跳转好友名片页面失败:', error)
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        })
      }
    },

    /**
     * 处理发送文本消息
     */
    handleSendTextMsg(event: any) {
      const { text, replyMsg } = event.detail
      const { conversationId, conversationType, to } = this.data
      const store = getApp().globalData.store
      const nim = getApp().globalData.nim
      
      if (!text || !text.trim()) {
        return
      }
      
      // 创建文本消息
      const textMsg = nim.V2NIMMessageCreator.createTextMessage(text.trim())
      
      // 如果有回复消息，设置serverExtension
      if (replyMsg) {
        const yxReplyMsg: YxReplyMsg = {
          messageClientId: replyMsg.messageClientId,
          scene: conversationType!,
          from: replyMsg.senderId,
          receiverId: replyMsg.receiverId || to,
          to: conversationId,
          idServer: replyMsg.messageServerId || '',
          time: replyMsg.createTime
        }
        
        textMsg.serverExtension = JSON.stringify({ yxReplyMsg })
      }
      
      // 发送消息
      if (store && store.msgStore && store.msgStore.sendMessageActive) {
        const sendPromise = store.msgStore.sendMessageActive({
          msg: textMsg,
          conversationId,
          sendBefore: () => {
            // 发送消息后滚动到底部
            this.scrollToBottomAfterNewMessage()
          }
        })
        if (sendPromise && typeof sendPromise.then === 'function') {
          sendPromise.catch(() => {
            wx.showToast({ title: '发送失败', icon: 'none' })
          })
        }
      }
    },

    /**
     * 处理发送消息
     */
    handleSendMessage(event: any) {
      // const { message } = event.detail
      // 消息发送逻辑由message-input组件处理
    },

    /**
     * 处理发送图片消息
     */
    handleSendImageMsg(event: any) {
      const { tempFiles } = event.detail;
      const store = getApp().globalData.store;
      const nim = store.nim;
      
      if (!tempFiles || tempFiles.length === 0) {
        return;
      }
      
      tempFiles.forEach((file: any) => {
        try {
          // 创建图片消息
          const imgMsg = nim.V2NIMMessageCreator.createImageMessage(file.tempFilePath);
          
          // 发送图片消息
          store.msgStore.sendMessageActive({
            msg: imgMsg,
            conversationId: this.data.conversationId,
            sendBefore: () => {
              // 发送图片消息后滚动到底部
              this.scrollToBottomAfterNewMessage()
            }
          }).catch((error: any) => {
            console.error('发送图片消息失败:', error);
            wx.showToast({
              title: '发送失败',
              icon: 'error'
            });
          });
        } catch (error) {
          console.error('创建图片消息失败:', error);
          wx.showToast({
            title: '发送失败',
            icon: 'error'
          });
        }
      });
    },

    /**
     * 处理发送文件消息
     */
    handleSendFileMsg(event: any) {
      const { tempFiles } = event.detail;
      const store = getApp().globalData.store;
      const nim = store.nim;
      
      if (!tempFiles || tempFiles.length === 0) {
        return;
      }
      
      tempFiles.forEach((file: any) => {
        try {
          // 创建文件消息
          const fileMsg = nim.V2NIMMessageCreator.createFileMessage(file.path, file.name, file.size);
          
          // 发送文件消息
          store.msgStore.sendMessageActive({
            msg: fileMsg,
            conversationId: this.data.conversationId,
            sendBefore: () => {
              // 发送文件消息后滚动到底部
              this.scrollToBottomAfterNewMessage()
            }
          }).catch((error: any) => {
            console.error('发送文件消息失败:', error);
            wx.showToast({
              title: '发送失败',
              icon: 'error'
            });
          });
        } catch (error) {
          console.error('创建文件消息失败:', error);
          wx.showToast({
            title: '发送失败',
            icon: 'error'
          });
        }
      });
    },

    /**
     * 处理输入框聚焦
     */
    handleInputFocus() {
      // 可以在这里处理键盘弹起的逻辑
    },

    /**
     * 处理输入框失焦
     */
    handleInputBlur() {
      // 可以在这里处理键盘收起的逻辑
    },

    /**
     * 处理输入面板高度变化
     */
    handleInputPanelHeightChange(event: any) {
      const { height } = event.detail;
      console.log('输入面板高度变化:', height)
      this.setData({
        inputPanelHeight: height
      });
    },

    /**
     * 隐藏操作菜单
     */
    hideActionMenu() {
      this.setData({
        showActionMenu: false,
        selectedMessage: null
      })
    },

    /**
     * 复制消息
     */
    handleCopyMessage() {
      const { selectedMessage } = this.data
      if (selectedMessage && selectedMessage.text) {
        wx.setClipboardData({
          data: selectedMessage.text,
          success: () => {
            wx.showToast({
              title: '复制成功',
              icon: 'success'
            })
          }
        })
      }
      this.hideActionMenu()
    },

    /**
     * 回复消息
     */
    handleReplyMessage(event?: any) {
      let messageToReply = null
      
      // 优先使用事件传递的消息，否则使用选中的消息
      if (event && event.detail && event.detail.msg) {
        messageToReply = event.detail.msg
      } else {
        messageToReply = this.data.selectedMessage
      }
      
      if (messageToReply) {
        // 为消息设置发送者名称
        const store = getApp().globalData.store;
        if (messageToReply.senderId && store && store.uiStore && !messageToReply.senderName) {
          messageToReply.senderName = store.uiStore.getAppellation({ account: messageToReply.senderId }) || messageToReply.senderId;
        }
        
        // 调用message-input组件的setReplyMsg方法
        const messageInput = this.selectComponent('#messageInput')
        if (messageInput) {
          messageInput.setReplyMsg(messageToReply)
        }
      }
      this.hideActionMenu()
    },

    /**
     * 转发消息
     */
    handleForwardMessage(event?: any) {
      let messageToForward = null
      
      // 如果有事件参数，使用事件中的消息数据（来自长按菜单）
      if (event && event.detail && event.detail.msg) {
        messageToForward = event.detail.msg
      } else {
        // 否则使用选中的消息（来自点击选择）
        messageToForward = this.data.selectedMessage
      }
      
      // 先隐藏操作菜单（但不清空selectedMessage）
      this.setData({
        showActionMenu: false
      })
      
      if (messageToForward) {
        // 设置要转发的消息
        this.setData({
          selectedMessage: messageToForward
        })
        
        // 刷新联系人数据
        this.loadContactsData()
        
        // 显示转发弹窗
        this.setData({
          showForwardModal: true
        })
      } else {
        // 如果没有消息可转发，清空selectedMessage
        this.setData({
          selectedMessage: null
        })
      }
    },

    /**
     * 处理转发弹窗关闭
     */
    handleForwardModalClose() {
      this.setData({
        showForwardModal: false,
        selectedMessage: null
      })
    },

    /**
     * 处理转发确认
     */
    handleForwardConfirm(event: any) {
      const { contacts } = event.detail
      const { selectedMessage } = this.data
            
      if (!selectedMessage || !contacts || contacts.length === 0) {
        console.error('转发失败：缺少消息或联系人', { selectedMessage, contacts })
        wx.showToast({
          title: '转发失败：缺少消息或联系人',
          icon: 'error'
        })
        return
      }

      const store = getApp().globalData.store
      const nim = getApp().globalData.nim
            
      if (!store || !store.msgStore) {
        console.error('store 或 msgStore 不存在')
        wx.showToast({
          title: '转发失败：系统错误',
          icon: 'error'
        })
        return
      }
      
      const sourceMsg = (selectedMessage && selectedMessage.conversationId && selectedMessage.messageClientId)
        ? (store.msgStore.getMsg(selectedMessage.conversationId, [selectedMessage.messageClientId])?.[0] || null)
        : null

      const promises = contacts.map((contact: any) => {
        const conversationId =
          contact.type === 'team'
            ? nim.V2NIMConversationIdUtil.teamConversationId(contact.id)
            : nim.V2NIMConversationIdUtil.p2pConversationId(contact.id)

        if (sourceMsg) {
          return store.msgStore
            .forwardMsgActive(sourceMsg, conversationId)
            .catch((error: any) => {
              console.error(`消息转发失败到: ${contact.name || contact.id}`, error)
              throw error
            })
        }

        let forwardMsg: any = null
        if (selectedMessage.messageType === 'text') {
          forwardMsg = nim.V2NIMMessageCreator.createTextMessage(selectedMessage.text || '')
        } else if (selectedMessage.messageType === 'image') {
          forwardMsg = nim.V2NIMMessageCreator.createImageMessage(
            (selectedMessage.attachment && selectedMessage.attachment.path) || '',
            (selectedMessage.attachment && selectedMessage.attachment.name) || '',
            (selectedMessage.attachment && selectedMessage.attachment.sceneName) || '',
            (selectedMessage.attachment && selectedMessage.attachment.width) || 0,
            (selectedMessage.attachment && selectedMessage.attachment.height) || 0
          )
        } else if (selectedMessage.messageType === 'audio') {
          forwardMsg = nim.V2NIMMessageCreator.createAudioMessage(
            (selectedMessage.attachment && selectedMessage.attachment.path) || '',
            (selectedMessage.attachment && selectedMessage.attachment.name) || '',
            (selectedMessage.attachment && selectedMessage.attachment.sceneName) || '',
            (selectedMessage.attachment && selectedMessage.attachment.duration) || 0
          )
        } else if (selectedMessage.messageType === 'video') {
          forwardMsg = nim.V2NIMMessageCreator.createVideoMessage(
            (selectedMessage.attachment && selectedMessage.attachment.path) || '',
            (selectedMessage.attachment && selectedMessage.attachment.name) || '',
            (selectedMessage.attachment && selectedMessage.attachment.sceneName) || '',
            (selectedMessage.attachment && selectedMessage.attachment.duration) || 0,
            (selectedMessage.attachment && selectedMessage.attachment.width) || 0,
            (selectedMessage.attachment && selectedMessage.attachment.height) || 0
          )
        } else if (selectedMessage.messageType === 'file') {
          forwardMsg = nim.V2NIMMessageCreator.createFileMessage(
            (selectedMessage.attachment && selectedMessage.attachment.path) || '',
            (selectedMessage.attachment && selectedMessage.attachment.name) || '',
            (selectedMessage.attachment && selectedMessage.attachment.size) || 0
          )
        } else {
          forwardMsg = nim.V2NIMMessageCreator.createTextMessage(`[${selectedMessage.messageType}]`)
        }

        if (!forwardMsg) {
          return Promise.reject(new Error('无法创建转发消息'))
        }

        return store.msgStore
          .sendMessageActive({
            msg: forwardMsg,
            conversationId,
            sendBefore: () => {}
          })
          .catch((error: any) => {
            console.error(`消息转发失败到: ${contact.name || contact.id}`, error)
            throw error
          })
      })

      Promise.all(promises)
        .then(() => {
          wx.showToast({
            title: '转发成功',
            icon: 'success'
          })
        })
        .catch(() => {
          wx.showToast({
            title: '转发失败',
            icon: 'error'
          })
        })
        .finally(() => {
          this.handleForwardModalClose()
        })
    },

    /**
     * 撤回消息
     */
    handleRecallMessage() {
      const { selectedMessage } = this.data
      if (selectedMessage) {
        this.showConfirm('撤回消息', '确定要撤回这条消息吗？', async () => {
          try {
            const store = getApp().globalData.store
            if (store && store.msgStore && store.msgStore.recallMsgActive) {
          await store.msgStore.recallMsgActive(selectedMessage)
        }
            wx.showToast({
              title: '撤回成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('撤回消息失败:', error)
            wx.showToast({
              title: '撤回失败',
              icon: 'none'
            })
          }
        })
      }
      this.hideActionMenu()
    },

    /**
     * 删除消息
     */
    handleDeleteMessage(event?: any) {
      // 优先使用事件传递的消息，否则使用选中的消息
      let messageToDelete = null
      if (event && event.detail && event.detail.msg) {
        messageToDelete = event.detail.msg
      } else {
        const { selectedMessage } = this.data
        messageToDelete = selectedMessage
      }
      
      if (messageToDelete) {
        this.showConfirm('删除消息', '确定要删除这条消息吗？', async () => {
          try {
            const store = getApp().globalData.store
            if (store && store.msgStore && store.msgStore.deleteMsgActive) {
          await store.msgStore.deleteMsgActive([messageToDelete])
        }
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
          } catch (error) {
            console.error('删除消息失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        })
      }
      this.hideActionMenu()
    },

    /**
     * 显示确认对话框
     */
    showConfirm(title: string, message: string, callback: () => void) {
      this.setData({
        showConfirmModal: true,
        confirmTitle: title,
        confirmMessage: message,
        confirmCallback: callback
      })
    },

    /**
     * 隐藏确认对话框
     */
    hideConfirmModal() {
      this.setData({
        showConfirmModal: false,
        confirmTitle: '',
        confirmMessage: '',
        confirmCallback: null
      })
    },

    /**
     * 确认对话框取消
     */
    handleConfirmCancel() {
      this.hideConfirmModal()
    },

    /**
     * 确认对话框确定
     */
    handleConfirmOk() {
      const { confirmCallback } = this.data
      if (confirmCallback) {
        confirmCallback()
      }
      this.hideConfirmModal()
    },

    /**
     * 加载联系人数据
     */
    loadContactsData() {
      const store = getApp().globalData.store
      
      if (store) {
        // 获取好友列表
        const friendList = (store && store.uiStore && store.uiStore.friends) 
        ? store.uiStore.friends.filter((item: any) => !(store && store.relationStore && store.relationStore.blacklist && store.relationStore.blacklist.includes(item.accountId))) 
        : []
        
        const friends = friendList.map((item: any) => ({
          id: item.accountId,
          userId: item.accountId,
          accountId: item.accountId,
          name: (store && store.uiStore && store.uiStore.getAppellation) ? store.uiStore.getAppellation({ account: item.accountId }) || item.nick || item.accountId : item.nick || item.accountId,
          avatar: item.avatar,
          signature: item.signature || ''
        }))
        
        // 获取群组列表
        const teams = (store && store.uiStore && store.uiStore.teamList) ? store.uiStore.teamList : []
        
        // 获取最近联系人（简化处理，可以后续优化）
        const recentContacts = friends.slice(0, 5).concat(teams.slice(0, 5))
        
        this.setData({
          friends,
          teams,
          recentContacts
        })
      }
    },

    /**
     * 重试
     */
    handleRetry() {
      this.setData({ errorMessage: '' })
      this.init()
    },

    /**
     * 阻止事件冒泡
     */
    stopPropagation() {
      // 阻止事件冒泡
    },
    
    // 新消息到达时滚动到底部
    scrollToBottomAfterNewMessage() {
      // 延迟执行，确保DOM已更新
      setTimeout(() => {
        const messageList = this.selectComponent('#messageList')
        if (messageList && messageList.scrollToBottom) {
          messageList.scrollToBottom()
        }
      }, 100)
    }
  },

  /**
   * 属性观察器
   */
  observers: {
    'conversationId': function(newVal: string) {
      if (newVal) {
        this.init()
      }
    }
  }
})
