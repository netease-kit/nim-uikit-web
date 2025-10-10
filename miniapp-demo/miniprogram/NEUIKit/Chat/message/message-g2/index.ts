Component({
  properties: {
    g2Msg: {
      type: Object,
      value: {}
    },
    showTime: {
      type: Boolean,
      value: true
    },
    showActions: {
      type: Boolean,
      value: true
    },
    maxDisplayMessages: {
      type: Number,
      value: 3
    },
    theme: {
      type: String,
      value: 'light'
    }
  },

  data: {
    displayMessages: [] as any[],
    hasMoreMessages: false,
    totalMessageCount: 0,
    formatTime: ''
  },

  observers: {
    'g2Msg': function(g2Msg: any) {
      this.updateG2Data(g2Msg);
    },
    
    'g2Msg.time, showTime': function(time: number, showTime: boolean) {
      if (showTime && time) {
        this.setData({
          formatTime: this.formatMessageTime(time)
        });
      } else {
        this.setData({
          formatTime: ''
        });
      }
    }
  },

  methods: {
    // 更新G2消息数据
    updateG2Data(g2Msg: any) {
      if (!g2Msg) {
        this.setData({
          displayMessages: [],
          hasMoreMessages: false,
          totalMessageCount: 0
        });
        return;
      }
      
      const messages = g2Msg.messages || [];
      const maxDisplay = this.data.maxDisplayMessages;
      
      // 处理消息列表
      const processedMessages = messages.map((msg: any, index: number) => {
        return {
          ...msg,
          id: msg.id || `msg_${index}`,
          senderName: this.getSenderName(msg),
          content: this.getMessageContent(msg),
          fileName: this.getFileName(msg)
        };
      });
      
      // 限制显示的消息数量
      const displayMessages = processedMessages.slice(0, maxDisplay);
      const hasMoreMessages = processedMessages.length > maxDisplay;
      
      this.setData({
        displayMessages,
        hasMoreMessages,
        totalMessageCount: processedMessages.length
      });
    },
    
    // 获取发送者名称
    getSenderName(msg: any): string {
      // 优先使用消息中的发送者名称
      if (msg.senderName) {
        return msg.senderName;
      }
      
      // 检查from字段
      if (msg.from && msg.from.name) {
        return msg.from.name;
      }
      
      // 从store中获取用户昵称
      try {
        const app = getApp();
        const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
        const senderId = msg.senderId || (msg.from && msg.from.userId);
        
        if (store && store.uiStore && senderId) {
          const nickname = store.uiStore.getAppellation({ account: senderId });
          if (nickname && nickname !== senderId) {
            return nickname;
          }
        }
      } catch (error) {
        console.error('获取用户昵称失败:', error);
      }
      
      // 最后使用发送者ID
      return msg.senderId || (msg.from && msg.from.userId) || '未知用户';
    },
    
    // 获取消息内容
    getMessageContent(msg: any): string {
      if (!msg) {
        return '';
      }
      
      switch (msg.type) {
        case 'text':
          return msg.content || msg.text || '';
        case 'image':
          return '[图片]';
        case 'audio':
          return '[语音]';
        case 'video':
          return '[视频]';
        case 'file':
          const fileName = this.getFileName(msg);
          return fileName ? `[文件] ${fileName}` : '[文件]';
        case 'location':
          return '[位置]';
        case 'custom':
          return '[自定义消息]';
        default:
          return `[${this.getMessageTypeText(msg.type)}]`;
      }
    },
    
    // 获取文件名
    getFileName(msg: any): string {
      if (msg.fileName) {
        return msg.fileName;
      }
      
      if (msg.file && msg.file.name) {
        return msg.file.name;
      }
      
      if (msg.attach && msg.attach.name) {
        return msg.attach.name;
      }
      
      return '';
    },
    
    // 获取消息类型文本
    getMessageTypeText(type: string): string {
      const typeMap: { [key: string]: string } = {
        text: '文本',
        image: '图片',
        audio: '语音',
        video: '视频',
        file: '文件',
        location: '位置',
        custom: '自定义消息',
        notification: '通知',
        tip: '提示',
        robot: '机器人消息'
      };
      
      return typeMap[type] || '未知消息';
    },
    
    // 格式化消息时间
    formatMessageTime(timestamp: number): string {
      // 使用统一的时间格式化函数，避免toLocaleTimeString等可能导致英文显示的API
      const { formatMessageTime } = require('../../../utils/date');
      return formatMessageTime(timestamp);
    },
    
    // 处理消息点击
    handleMessageClick(e: any) {
      const message = e.currentTarget.dataset.message;
      if (!message) {
        return;
      }
      
      this.triggerEvent('messageClick', {
        message,
        g2Msg: this.data.g2Msg
      });
    },
    
    // 处理显示更多消息
    handleShowMore() {
      this.triggerEvent('showMore', {
        g2Msg: this.data.g2Msg,
        totalCount: this.data.totalMessageCount,
        displayCount: this.data.displayMessages.length
      });
    },
    
    // 处理加入群聊
    handleJoinGroup() {
      const { g2Msg } = this.data;
      if (!g2Msg || !g2Msg.groupInfo) {
        return;
      }
      
      this.triggerEvent('joinGroup', {
        groupInfo: g2Msg.groupInfo,
        g2Msg
      });
    },
    
    // 处理查看群聊
    handleViewGroup() {
      const { g2Msg } = this.data;
      if (!g2Msg || !g2Msg.groupInfo) {
        return;
      }
      
      this.triggerEvent('viewGroup', {
        groupInfo: g2Msg.groupInfo,
        g2Msg
      });
    },
    
    // 获取群聊信息摘要
    getGroupSummary(): string {
      const { g2Msg } = this.data;
      if (!g2Msg || !g2Msg.groupInfo) {
        return '';
      }
      
      const { groupInfo } = g2Msg;
      const parts = [];
      
      if (groupInfo.name) {
        parts.push(groupInfo.name);
      }
      
      if (groupInfo.memberCount) {
        parts.push(`${groupInfo.memberCount}人`);
      }
      
      return parts.join(' · ');
    },
    
    // 获取消息摘要
    getMessagesSummary(): string {
      const { displayMessages, totalMessageCount } = this.data;
      
      if (totalMessageCount === 0) {
        return '暂无消息';
      }
      
      if (displayMessages.length === 0) {
        return `${totalMessageCount}条消息`;
      }
      
      const lastMessage = displayMessages[displayMessages.length - 1];
      const preview = this.truncateText(lastMessage.content || '', 20);
      
      if (totalMessageCount > displayMessages.length) {
        return `${preview}...等${totalMessageCount}条消息`;
      }
      
      return preview;
    },
    
    // 截断文本
    truncateText(text: string, maxLength: number): string {
      if (!text || text.length <= maxLength) {
        return text;
      }
      
      return text.substring(0, maxLength) + '...';
    },
    
    // 检查是否为媒体消息
    isMediaMessage(type: string): boolean {
      return ['image', 'audio', 'video', 'file'].includes(type);
    },
    
    // 获取消息预览文本
    getMessagePreviewText(msg: any): string {
      if (!msg) {
        return '';
      }
      
      const content = this.getMessageContent(msg);
      return this.truncateText(content, 30);
    },
    
    // 格式化群聊成员数
    formatMemberCount(count: number): string {
      if (!count || count <= 0) {
        return '';
      }
      
      if (count < 1000) {
        return `${count}人`;
      }
      
      if (count < 10000) {
        return `${(count / 1000).toFixed(1)}k人`;
      }
      
      return `${(count / 10000).toFixed(1)}w人`;
    },
    
    // 获取G2消息类型
    getG2MessageType(): string {
      const { g2Msg } = this.data;
      if (!g2Msg) {
        return 'unknown';
      }
      
      if (g2Msg.groupInfo) {
        return 'group';
      }
      
      if (g2Msg.messages && g2Msg.messages.length > 0) {
        return 'messages';
      }
      
      return 'unknown';
    }
  }
});