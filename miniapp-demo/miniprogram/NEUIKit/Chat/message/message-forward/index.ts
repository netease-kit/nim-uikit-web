Component({
  properties: {
    forwardMsg: {
      type: Object,
      value: {}
    },
    forwardType: {
      type: String,
      value: 'single' // single | multi
    },
    showTime: {
      type: Boolean,
      value: true
    },
    theme: {
      type: String,
      value: 'light' // light | dark
    }
  },

  data: {
    senderName: '',
    fileName: '',
    messageTypeText: '',
    participants: [] as any[],
    participantsText: '',
    previewMessages: [] as any[],
    totalCount: 0,
    formatTime: ''
  },

  observers: {
    'forwardMsg, forwardType': function(forwardMsg: any, forwardType: string) {
      if (forwardMsg) {
        this.updateForwardData(forwardMsg, forwardType);
      }
    }
  },

  methods: {
    // 更新转发消息数据
    updateForwardData(forwardMsg: any, forwardType: string) {
      if (!forwardMsg) {
        return;
      }
      
      if (forwardType === 'single') {
        this.updateSingleForwardData(forwardMsg);
      } else if (forwardType === 'multi') {
        this.updateMultiForwardData(forwardMsg);
      }
      
      // 更新格式化时间
      const formatTime = this.formatMessageTime(forwardMsg.createTime || Date.now());
      this.setData({ formatTime });
    },
    
    // 更新单条消息转发数据
    updateSingleForwardData(forwardMsg: any) {
      const senderName = this.getSenderName(forwardMsg);
      const messageTypeText = this.getMessageTypeText(forwardMsg.messageType);
      
      let fileName = '';
      if (forwardMsg.messageType === 'file' && forwardMsg.attachment) {
        fileName = forwardMsg.attachment.name || forwardMsg.attachment.fileName || '未知文件';
      }
      
      this.setData({
        senderName,
        fileName,
        messageTypeText
      });
    },
    
    // 更新多条消息转发数据
    updateMultiForwardData(forwardMsg: any) {
      if (!forwardMsg.messages || !Array.isArray(forwardMsg.messages)) {
        return;
      }
      
      const messages = forwardMsg.messages;
      const totalCount = messages.length;
      
      // 获取参与者列表
      const participantSet = new Set();
      messages.forEach((msg: any) => {
        const senderName = this.getSenderName(msg);
        participantSet.add(senderName);
      });
      
      const participants = Array.from(participantSet) as string[];
      const participantsText = this.formatParticipantsText(participants);
      
      // 生成消息预览列表（最多显示3条）
      const previewMessages = messages.slice(0, 3).map((msg: any) => {
        return {
          messageClientId: msg.messageClientId,
          senderName: this.getSenderName(msg),
          previewText: this.getMessagePreviewText(msg)
        };
      });
      
      this.setData({
        participants,
        participantsText,
        previewMessages,
        totalCount
      });
    },
    
    // 获取发送者名称
    getSenderName(msg: any): string {
      // 优先使用消息中的发送者名称
      if (msg.senderName) {
        return msg.senderName;
      }
      
      // 从store中获取用户昵称
      try {
        const app = getApp();
        const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
        
        if (store && store.uiStore && msg.senderId) {
          const nickname = store.uiStore.getAppellation({ account: msg.senderId });
          if (nickname && nickname !== msg.senderId) {
            return nickname;
          }
        }
      } catch (error) {
        console.error('获取用户昵称失败:', error);
      }
      
      // 最后使用发送者ID
      return msg.senderId || '未知用户';
    },
    
    // 获取消息类型文本
    getMessageTypeText(messageType: string): string {
      const typeMap: { [key: string]: string } = {
        'text': '文本',
        'image': '图片',
        'audio': '语音',
        'video': '视频',
        'file': '文件',
        'location': '位置',
        'custom': '自定义消息',
        'notification': '通知',
        'tip': '提示'
      };
      
      return typeMap[messageType] || '未知类型';
    },
    
    // 获取消息预览文本
    getMessagePreviewText(msg: any): string {
      switch (msg.messageType) {
        case 'text':
          return this.truncateText(msg.text || '', 20);
        case 'image':
          return '[图片]';
        case 'audio':
          const duration = (msg.attachment && msg.attachment.duration) ? msg.attachment.duration : 0;
          return `[语音 ${Math.ceil(duration)}s]`;
        case 'video':
          return '[视频]';
        case 'file':
          const fileName = (msg.attachment && msg.attachment.name) ? msg.attachment.name : ((msg.attachment && msg.attachment.fileName) ? msg.attachment.fileName : '未知文件');
          return `[文件] ${this.truncateText(fileName, 15)}`;
        case 'location':
          return '[位置]';
        case 'custom':
          return '[自定义消息]';
        case 'notification':
          return '[通知]';
        default:
          return '[未知消息类型]';
      }
    },
    
    // 格式化参与者文本
    formatParticipantsText(participants: string[]): string {
      if (participants.length === 0) {
        return '';
      }
      
      if (participants.length <= 3) {
        return participants.join('、');
      }
      
      return `${participants.slice(0, 3).join('、')}等${participants.length}人`;
    },
    
    // 格式化消息时间
    formatMessageTime(timestamp: number): string {
      // 使用统一的时间格式化函数，避免toLocaleTimeString等可能导致英文显示的API
      const { formatMessageTime } = require('../../../utils/date');
      return formatMessageTime(timestamp);
    },
    
    // 截断文本
    truncateText(text: string, maxLength: number): string {
      if (!text || text.length <= maxLength) {
        return text;
      }
      
      return text.substring(0, maxLength) + '...';
    },
    
    // 处理转发消息点击
    handleForwardClick() {
      this.triggerEvent('forwardClick', {
        forwardMsg: this.data.forwardMsg,
        forwardType: this.data.forwardType
      });
    },
    
    // 获取转发消息摘要
    getForwardSummary(): string {
      const { forwardMsg, forwardType } = this.data;
      
      if (!forwardMsg) {
        return '';
      }
      
      if (forwardType === 'single') {
        const senderName = this.getSenderName(forwardMsg);
        const previewText = this.getMessagePreviewText(forwardMsg);
        return `${senderName}: ${previewText}`;
      } else if (forwardType === 'multi') {
        const { participants, totalCount } = this.data;
        const participantsText = this.formatParticipantsText(participants);
        return `${participantsText}的聊天记录(${totalCount}条消息)`;
      }
      
      return '转发消息';
    },
    
    // 检查是否为媒体消息
    isMediaMessage(messageType: string): boolean {
      return ['image', 'audio', 'video', 'file'].includes(messageType);
    },
    
    // 获取消息大小信息
    getMessageSizeInfo(msg: any): string {
      if (!msg.attachment) {
        return '';
      }
      
      const size = msg.attachment.size || msg.attachment.fileSize;
      if (!size) {
        return '';
      }
      
      return this.formatFileSize(size);
    },
    
    // 格式化文件大小
    formatFileSize(size: number): string {
      if (!size || size <= 0) {
        return '';
      }
      
      const units = ['B', 'KB', 'MB', 'GB'];
      let index = 0;
      let fileSize = size;
      
      while (fileSize >= 1024 && index < units.length - 1) {
        fileSize /= 1024;
        index++;
      }
      
      return `${fileSize.toFixed(index === 0 ? 0 : 1)}${units[index]}`;
    }
  }
});