Component({
  properties: {
    replyMsg: {
      type: Object,
      value: {}
    },
    showClose: {
      type: Boolean,
      value: false
    },
    theme: {
      type: String,
      value: 'light' // light | dark
    }
  },

  data: {
    senderName: '',
    fileName: ''
  },

  observers: {
    'replyMsg': function(replyMsg: any) {
      if (replyMsg) {
        this.updateReplyData(replyMsg);
      }
    }
  },

  methods: {
    // 更新回复消息数据
    updateReplyData(replyMsg: any) {
      if (!replyMsg) {
        return;
      }
      
      // 获取发送者名称
      const senderName = this.getSenderName(replyMsg);
      
      // 获取文件名（如果是文件消息）
      let fileName = '';
      if (replyMsg.messageType === 'file' && replyMsg.attachment) {
        fileName = replyMsg.attachment.name || replyMsg.attachment.fileName || '未知文件';
      }
      
      this.setData({
        senderName,
        fileName
      });
    },
    
    // 获取发送者名称
    getSenderName(replyMsg: any): string {
      // 优先使用消息中的发送者名称
      if (replyMsg.senderName) {
        return replyMsg.senderName;
      }
      
      // 从store中获取用户昵称
      try {
        const app = getApp();
        const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
        
        if (store && store.uiStore && replyMsg.senderId) {
          const nickname = store.uiStore.getAppellation({ account: replyMsg.senderId });
          if (nickname && nickname !== replyMsg.senderId) {
            return nickname;
          }
        }
      } catch (error) {
        console.error('获取用户昵称失败:', error);
      }
      
      // 最后使用发送者ID
      return replyMsg.senderId || '未知用户';
    },
    
    // 处理关闭按钮点击
    handleClose() {
      this.triggerEvent('close', {
        replyMsg: this.data.replyMsg
      });
    },
    
    // 处理回复消息点击
    handleReplyClick() {
      this.triggerEvent('replyClick', {
        replyMsg: this.data.replyMsg
      });
    },
    
    // 获取消息类型显示文本
    getMessageTypeText(messageType: string): string {
      const typeMap: { [key: string]: string } = {
        'text': '文本',
        'image': '[图片]',
        'audio': '[语音]',
        'video': '[视频]',
        'file': '[文件]',
        'location': '[位置]',
        'custom': '[自定义消息]',
        'notification': '[通知]',
        'tip': '[提示]',
        'robot': '[机器人消息]'
      };
      
      return typeMap[messageType] || '[未知消息类型]';
    },
    
    // 获取回复消息的预览文本
    getReplyPreviewText(replyMsg: any): string {
      if (!replyMsg) {
        return '';
      }
      
      switch (replyMsg.messageType) {
        case 'text':
          return replyMsg.text || '';
        case 'image':
          return '[图片]';
        case 'audio':
          const duration = (replyMsg.attachment && replyMsg.attachment.duration) ? replyMsg.attachment.duration : 0;
          return `[语音 ${Math.ceil(duration)}s]`;
        case 'video':
          return '[视频]';
        case 'file':
          const fileName = (replyMsg.attachment && replyMsg.attachment.name) ? replyMsg.attachment.name : ((replyMsg.attachment && replyMsg.attachment.fileName) ? replyMsg.attachment.fileName : '未知文件');
          return `[文件] ${fileName}`;
        case 'location':
          return '[位置]';
        case 'custom':
          // 可以根据自定义消息的具体内容来显示
          return '[自定义消息]';
        case 'notification':
          return '[通知]';
        default:
          return '[未知消息类型]';
      }
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
    },
    
    // 检查是否为媒体消息
    isMediaMessage(messageType: string): boolean {
      return ['image', 'audio', 'video', 'file'].includes(messageType);
    },
    
    // 获取媒体消息图标类型
    getMediaIconType(messageType: string): string {
      const iconMap: { [key: string]: string } = {
        'image': 'image',
        'audio': 'voice',
        'video': 'video',
        'file': 'file',
        'location': 'location',
        'custom': 'custom',
        'notification': 'notification'
      };
      
      return iconMap[messageType] || 'unknown';
    },
    
    // 截断长文本
    truncateText(text: string, maxLength: number = 50): string {
      if (!text || text.length <= maxLength) {
        return text;
      }
      
      return text.substring(0, maxLength) + '...';
    }
  }
});