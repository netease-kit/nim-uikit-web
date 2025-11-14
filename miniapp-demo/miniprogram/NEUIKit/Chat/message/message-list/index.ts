Component({
  properties: {
    msgs: {
      type: Array,
      value: []
    },
    conversationType: {
      type: String,
      value: ''
    },
    to: {
      type: String,
      value: ''
    },
    loadingMore: {
      type: Boolean,
      value: false
    },
    noMore: {
      type: Boolean,
      value: false
    },
    replyMsgsMap: {
      type: Object,
      value: {}
    },
    teamId: {
      type: String,
      value: ''
    }
  },

  data: {
    scrollTop: 0,
    finalMsgs: [] as any[],
    lastScrollTop: 0,
    autoScrollToBottom: true
  },

  observers: {
    'msgs': function(msgs: any[]) {
      this.updateFinalMsgs(msgs);
    }
  },

  lifetimes: {
    attached() {
      this.initMessageList();
    },
    
    detached() {
      // 清理资源
    }
  },

  methods: {
    // 初始化消息列表
    initMessageList() {
      const { msgs } = this.data;
      this.updateFinalMsgs(msgs);
    },
    
    // 更新最终消息列表
    updateFinalMsgs(msgs: any[]) {
      if (!msgs || !Array.isArray(msgs)) {
        this.setData({ finalMsgs: [] });
        return;
      }
      
      // 处理消息列表，添加时间间隔等
      const finalMsgs = this.processMessages(msgs);
      
      this.setData({ 
        finalMsgs 
      }, () => {
        // 如果是新消息，自动滚动到底部
        if (this.data.autoScrollToBottom) {
          this.scrollToBottom();
        }
      });
    },
    
    // 处理消息列表
    processMessages(msgs: any[]): any[] {
      const processedMsgs: any[] = [];
      
      msgs.forEach((msg, index) => {
        const previousMsg = index > 0 ? msgs[index - 1] : null;
        
        // 检查是否需要显示时间
        if (this.shouldShowTime(msg, previousMsg)) {
          processedMsgs.push({
            messageType: 'custom',
            messageClientId: `time_${msg.createTime}`,
            createTime: msg.createTime,
            timeValue: this.formatTime(msg.createTime)
          });
        }
        
        // 添加消息本身
        processedMsgs.push({
          ...msg,
          // 转换消息类型为字符串
          messageType: this.getMessageTypeString(msg.messageType),
          // 添加一些额外的显示属性
          showAvatar: this.shouldShowAvatar(msg, previousMsg),
          showName: this.shouldShowName(msg, previousMsg),
          // 添加发送者头像信息
          senderAvatar: this.getSenderAvatar(msg)
        });
      });
      
      return processedMsgs;
    },
    
    // 检查是否需要显示时间
    shouldShowTime(currentMsg: any, previousMsg: any): boolean {
      if (!previousMsg) {
        return true;
      }
      
      const timeDiff = currentMsg.createTime - previousMsg.createTime;
      // 超过5分钟显示时间
      return timeDiff > 5 * 60 * 1000;
    },
    
    // 检查是否需要显示头像
    shouldShowAvatar(currentMsg: any, previousMsg: any): boolean {
      // 所有消息都显示头像
      return true;
    },
    
    // 检查是否需要显示昵称
    shouldShowName(currentMsg: any, previousMsg: any): boolean {
      // 自己发送的消息不显示昵称
      if (currentMsg.isSelf) {
        return false;
      }
      
      // 不是自己发送的消息都显示昵称
      return true;
    },

    // 获取发送者头像
    getSenderAvatar(msg: any): string {
      // 优先使用消息中的头像信息
      if (msg.senderAvatar) {
        return msg.senderAvatar;
      }
      
      // 如果消息中没有头像信息，从store中获取用户头像
      try {
        const app = getApp();
        const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
        
        if (store && store.userStore && msg.senderId) {
          const user = (store.userStore.users && store.userStore.users.get) ? store.userStore.users.get(msg.senderId) : null;
          return (user && user.avatar) ? user.avatar : '';
        }
      } catch (error) {
        console.error('获取用户头像失败:', error);
      }
      
      return '';
    },
    
    // 将数字类型的消息类型转换为字符串
    getMessageTypeString(messageType: number): string {
      switch (messageType) {
        case 0: // V2NIM_MESSAGE_TYPE_TEXT
          return 'text'
        case 1: // V2NIM_MESSAGE_TYPE_IMAGE
          return 'image'
        case 2: // V2NIM_MESSAGE_TYPE_AUDIO
          return 'audio'
        case 3: // V2NIM_MESSAGE_TYPE_VIDEO
          return 'video'
        case 4: // V2NIM_MESSAGE_TYPE_LOCATION
          return 'location'
        case 5: // V2NIM_MESSAGE_TYPE_NOTIFICATION
          return 'notification'
        case 6: // V2NIM_MESSAGE_TYPE_FILE
          return 'file'
        case 7: // V2NIM_MESSAGE_TYPE_AVCHAT
          return 'avchat'
        case 10: // V2NIM_MESSAGE_TYPE_TIPS
          return 'tips'
        case 11: // V2NIM_MESSAGE_TYPE_ROBOT
          return 'robot'
        case 12: // V2NIM_MESSAGE_TYPE_CALL
          return 'call'
        case 100: // V2NIM_MESSAGE_TYPE_CUSTOM
          return 'custom'
        default:
          return 'unknown'
      }
    },
    
    // 格式化时间
    formatTime(timestamp: number): string {
      // 使用统一的时间格式化函数，避免toLocaleTimeString等可能导致英文显示的API
      const { formatMessageTime } = require('../../../utils/date');
      return formatMessageTime(timestamp);
    },
    
    // 滚动到底部
    scrollToBottom() {
      wx.nextTick(() => {
        this.setData({
          scrollTop: 999999
        });
      });
    },
    
    // 加载更多消息
    onLoadMore() {
      if (this.data.loadingMore || this.data.noMore) {
        return;
      }
      
      // 记录当前滚动位置
      const query = this.createSelectorQuery();
      query.select('.message-scroll-list').scrollOffset((res) => {
        if (res) {
          this.setData({
            lastScrollTop: res.scrollTop,
            autoScrollToBottom: false
          });
        }
      }).exec();
      
      // 触发加载更多事件
      this.triggerEvent('loadMore', {
        conversationType: this.data.conversationType,
        to: this.data.to
      });
    },
    
    // 处理点击消息列表
    handleTapMessageList() {
      // 触发点击事件，可用于隐藏输入法等
      this.triggerEvent('tapMessageList');
    },
    
    // 处理重新编辑消息
    handleReeditMsg(e: any) {
      const { detail } = e;
      this.triggerEvent('reeditMsg', detail);
    },
    
    // 处理图片点击
    handleImageClick(e: any) {
      const { detail } = e;
      this.triggerEvent('imageClick', detail);
    },
    
    // 处理文件点击
    handleFileClick(e: any) {
      const { detail } = e;
      this.triggerEvent('fileClick', detail);
    },
    
    // 处理删除消息
    handleDeleteMsg(e: any) {
      this.triggerEvent('deleteMsg', e.detail);
    },
    
    // 处理回复消息
    handleReplyMsg(e: any) {
      this.triggerEvent('replyMsg', e.detail);
    },
    
    // 处理转发消息
    handleForwardMsg(e: any) {
      this.triggerEvent('forwardMsg', e.detail);
    },

    // 处理头像点击事件
    handleAvatarClick(e: any) {
      this.triggerEvent('avatarClick', e.detail);
    },
    
    // 滚动到指定消息
    scrollToMessage(messageClientId: string) {
      const query = this.createSelectorQuery();
      query.select(`[data-message-id="${messageClientId}"]`).boundingClientRect((res) => {
        if (res) {
          this.setData({
            scrollTop: res.top
          });
        }
      }).exec();
    },
    
    // 获取消息列表高度
    getMessageListHeight(): Promise<number> {
      return new Promise((resolve) => {
        const query = this.createSelectorQuery();
        query.select('.message-scroll-list').boundingClientRect((res) => {
          resolve(res ? res.height : 0);
        }).exec();
      });
    },
    
    // 重置自动滚动
    resetAutoScroll() {
      this.setData({
        autoScrollToBottom: true
      });
    }
  }
});