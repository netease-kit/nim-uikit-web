Component({
  properties: {
    conversationType: {
      type: String,
      value: 'p2p'
    },
    to: {
      type: String,
      value: ''
    },
    replyMsgsMap: {
      type: Object,
      value: {}
    }
  },

  data: {
    inputText: '',
    sendMoreVisible: false,
    emojiVisible: false,
    isReplyMsg: false,
    replyMsg: null,
    replyMsgTypeText: '',
    isTeamMute: false,
    isFocus: false,
    inputPanelHeight: 0
  },

  lifetimes: {
    attached() {
      // 监听回复消息事件
      this.onReplyMessage = this.onReplyMessage.bind(this);
      // 这里可以添加事件监听器
    },
    
    detached() {
      // 清理事件监听器
    }
  },

  methods: {
    // 处理输入
    handleInput(e: any) {
      const v = e.detail.value || '';
      this.setData({
        inputText: v.length > 140 ? v.slice(0, 140) : v
      });
    },

    // 处理输入框焦点
    handleInputFocus() {
      this.setData({
        isFocus: true,
        sendMoreVisible: false,
        emojiVisible: false,
        inputPanelHeight: 0
      });
      this.updateParentPanelHeight();
    },

    // 处理输入框失焦
    handleInputBlur() {
      this.setData({
        isFocus: false
      });
    },

    // 切换表情面板显示
    handleEmojiVisible() {
      const { emojiVisible } = this.data;
      const newEmojiVisible = !emojiVisible;
      this.setData({
        emojiVisible: newEmojiVisible,
        sendMoreVisible: false,
        inputPanelHeight: newEmojiVisible ? 240 : 0
      });
      this.updateParentPanelHeight();
    },

    // 切换更多功能面板显示
    handleSendMoreVisible() {
      const { sendMoreVisible } = this.data;
      const newSendMoreVisible = !sendMoreVisible;
      this.setData({
        sendMoreVisible: newSendMoreVisible,
        emojiVisible: false,
        inputPanelHeight: newSendMoreVisible ? 120 : 0
      });
      this.updateParentPanelHeight();
    },

    // 更新父组件的面板高度
    updateParentPanelHeight() {
      const { inputPanelHeight } = this.data;
      this.triggerEvent('inputPanelHeightChange', { height: inputPanelHeight });
    },

    // 阻止事件冒泡
    stopPropagation() {
      // 阻止事件冒泡
    },

    // 处理表情点击
    handleEmoji(e: any) {
      const { emoji } = e.detail;
      const { inputText } = this.data;
      if (!emoji) return;
      if ((inputText || '').length >= 140) {
        wx.showToast({ title: '最多140字', icon: 'none' });
        return;
      }
      const next = (inputText || '') + emoji;
      const limited = next.length > 140 ? next.slice(0, 140) : next;
      if (limited.length !== next.length) {
        wx.showToast({ title: '最多140字', icon: 'none' });
      }
      this.setData({ inputText: limited });
    },

    // 处理表情删除
    handleEmojiDelete() {
      const { inputText } = this.data;
      if (inputText.length > 0) {
        this.setData({
          inputText: inputText.slice(0, -1)
        });
      }
    },

    // 发送文本消息
    handleSendTextMsg() {
      const { inputText, replyMsg } = this.data;
      
      if (!inputText.trim()) {
        return;
      }

      // 触发发送消息事件
      this.triggerEvent('sendTextMsg', {
        text: inputText.trim(),
        replyMsg: replyMsg
      });

      // 清空输入框和回复消息
      this.setData({
        inputText: '',
        isReplyMsg: false,
        replyMsg: null,
        emojiVisible: false
      });
    },

    // 发送图片消息
    handleSendImageMsg() {
      wx.chooseMedia({
        count: 9,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFiles = res.tempFiles;
          
          // 触发发送图片事件
          this.triggerEvent('sendImageMsg', {
            tempFiles
          });
          
          this.setData({
            sendMoreVisible: false
          });
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
        }
      });
    },

    // 发送文件消息
    handleSendFileMsg() {
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        success: (res) => {
          const tempFiles = res.tempFiles;
          
          // 触发发送文件事件
          this.triggerEvent('sendFileMsg', {
            tempFiles
          });
          
          this.setData({
            sendMoreVisible: false
          });
        },
        fail: (err) => {
          console.error('选择文件失败:', err);
        }
      });
    },

    // 处理跳转到会话设置页面
    handleGoToConversationSettings() {
      const { conversationType, to } = this.data;
      
      // 根据会话类型跳转到不同的设置页面
      if (conversationType === '2') {
        // 群组会话设置页面
        wx.navigateTo({
          url: `/pages/chat/team-setting/index?teamId=${to}`,
          fail: (err) => {
            console.error('跳转到群聊设置页面失败:', err);
            wx.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
      } else {
        // P2P会话设置页面
        wx.navigateTo({
          url: `/pages/chat/p2p-setting/index?to=${to}`,
          fail: (err) => {
            console.error('跳转到P2P设置页面失败:', err);
            wx.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          }
        });
      }
      
      // 关闭所有面板
      this.setData({
        sendMoreVisible: false,
        emojiVisible: false,
        inputPanelHeight: 0
      });
      this.updateParentPanelHeight();
    },

    // 设置回复消息
    setReplyMsg(msg: any) {
      const msgTypeMap: { [key: string]: string } = {
        'text': '文本',
        'image': '图片',
        'audio': '语音',
        'video': '视频',
        'file': '文件',
        'location': '位置',
        'notification': '通知'
      };
      
      // 确保回复消息有正确的发送者名称
      if (msg && msg.senderId && !msg.senderName) {
        const store = getApp().globalData.store;
        if (store && store.uiStore) {
          msg.senderName = store.uiStore.getAppellation({ account: msg.senderId }) || msg.senderId;
        }
      }
      
      this.setData({
        isReplyMsg: true,
        replyMsg: msg,
        replyMsgTypeText: msgTypeMap[msg.messageType] || '未知类型'
      });
    },

    // 移除回复消息
    removeReplyMsg() {
      this.setData({
        isReplyMsg: false,
        replyMsg: null
      });
    },

    // 监听回复消息事件
    onReplyMessage(msg: any) {
      this.setReplyMsg(msg);
    },

    // 设置群禁言状态
    setTeamMute(isMute: boolean) {
      this.setData({
        isTeamMute: isMute
      });
    },

    // 清空输入框
    clearInput() {
      this.setData({
        inputText: ''
      });
    },

    // 获取输入框内容
    getInputText() {
      return this.data.inputText;
    },

    // 设置输入框内容
    setInputText(text: string) {
      this.setData({
        inputText: text
      });
    }
  }
});