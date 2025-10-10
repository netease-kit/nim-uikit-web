Component({
  properties: {
    msg: {
      type: Object,
      value: {}
    },
    teamId: {
      type: String,
      value: ''
    },
    replyMsgsMap: {
      type: Object,
      value: {}
    }
  },

  data: {
    senderName: '',
    replyMsg: null,
    replyMsgType: '',
    imageUrl: '',
    readStatus: '',
    // 话单消息相关数据
    callIconType: '',
    callStatusText: '',
    callDuration: ''
  },

  observers: {
    'msg': function(msg: any) {
      if (msg) {
        this.updateMessageData(msg);
      }
    },
    
    'replyMsgsMap, msg.messageClientId': function(replyMsgsMap: any, messageClientId: string) {
      if (messageClientId && replyMsgsMap) {
        const replyMsg = replyMsgsMap[messageClientId];
        if (replyMsg && replyMsg.messageClientId !== 'noFind') {
          const msgTypeMap: { [key: string]: string } = {
            'text': '文本',
            'image': '图片',
            'audio': '语音',
            'video': '视频',
            'location': '位置',
            'notification': '通知',
            'file': '文件',
            'avchat': '音视频通话',
            'tips': '提示',
            'robot': '机器人消息',
            'call': '话单',
            'custom': '自定义消息',
            'unknown': '未知消息'
          };
          
          // 确保回复消息有正确的发送者名称
          if (replyMsg.senderId && !replyMsg.senderName) {
            const store = getApp().globalData.store;
            if (store && store.uiStore) {
              replyMsg.senderName = store.uiStore.getAppellation({ account: replyMsg.senderId }) || replyMsg.senderId;
            }
          }
          
          this.setData({
            replyMsg,
            replyMsgType: msgTypeMap[replyMsg.messageType] || '未知类型'
          });
        } else {
          this.setData({
            replyMsg: null,
            replyMsgType: ''
          });
        }
      }
    }
  },

  methods: {
    // 更新消息数据
    updateMessageData(msg: any) {
      // 设置发送者名称
      const senderName = this.getSenderName(msg);
      
      // 设置图片URL
      let imageUrl = '';
      if (msg.messageType === 'image' && msg.attachment) {
        imageUrl = msg.attachment.url || msg.attachment.thumbUrl || '';
      }
      
      // 设置已读状态
      const readStatus = this.getReadStatus(msg);
      
      // 处理话单消息
      let callIconType = '';
      let callStatusText = '';
      let callDuration = '';
      
      if (msg.messageType === 'call') {
        const callData = this.updateCallData(msg);
        callIconType = callData.iconType;
        callStatusText = callData.statusText;
        callDuration = callData.duration;
      }
      
      this.setData({
        senderName,
        imageUrl,
        readStatus,
        callIconType,
        callStatusText,
        callDuration
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
    
    // 获取消息已读状态
    getReadStatus(msg: any): string {
      if (!msg.isSelf) {
        return '';
      }
      
      // 根据消息状态返回不同的文本
      switch (msg.sendingState) {
        case 'sending':
          return '发送中';
        case 'failed':
          return '发送失败';
        case 'success':
          // 这里可以根据实际的已读回执状态来显示
          return msg.readCount > 0 ? '已读' : '未读';
        default:
          return '';
      }
    },
    
    // 处理重新编辑消息
    handleReeditMsg() {
      const { msg } = this.data;
      this.triggerEvent('reeditMsg', {
        msg
      });
    },
    
    // 处理图片点击
    handleImageClick() {
      const { msg, imageUrl } = this.data;
      
      if (imageUrl) {
        // 预览图片
        wx.previewImage({
          current: imageUrl,
          urls: [imageUrl],
          fail: (err) => {
            console.error('预览图片失败:', err);
          }
        });
        
        // 触发图片点击事件
        this.triggerEvent('imageClick', {
          msg,
          imageUrl
        });
      }
    },
    
    // 处理文件点击
    handleFileClick(e: any) {
      const { detail } = e;
      this.triggerEvent('fileClick', detail);
    },
    
    // 处理视频点击
    handleVideoClick(e: any) {
      const { detail } = e;
      const { msg, videoUrl } = detail;
      
      if (videoUrl) {
        // 使用微信小程序原生视频播放
        wx.previewMedia({
          sources: [{
            url: videoUrl,
            type: 'video',
            poster: (msg.attachment && msg.attachment.thumbUrl) ? msg.attachment.thumbUrl : ((msg.attachment && msg.attachment.coverUrl) ? msg.attachment.coverUrl : '')
          }],
          current: 0,
          success: () => {
            console.log('视频播放成功');
          },
          fail: (error) => {
            console.error('视频播放失败:', error);
            // 降级方案：显示提示
            wx.showModal({
              title: '播放失败',
              content: '无法播放该视频，请检查网络连接或视频格式',
              showCancel: false
            });
          }
        });
        
        // 触发视频点击事件
        this.triggerEvent('videoClick', detail);
      } else {
        wx.showToast({
          title: '视频地址无效',
          icon: 'none'
        });
      }
    },
    
    // 处理删除消息
    handleDeleteMsg(e: any) {
      const { detail } = e;
      this.triggerEvent('deleteMsg', detail);
    },
    
    // 处理回复消息
    handleReplyMsg(e: any) {
      const { detail } = e;
      this.triggerEvent('replyMsg', detail);
    },
    
    // 处理转发消息
    handleForwardMsg(e: any) {
      const { detail } = e;
      this.triggerEvent('forwardMsg', detail);
    },

    // 处理头像点击事件
    handleAvatarClick(e: any) {
      console.log('Message item received avatar click:', e.detail);
      this.triggerEvent('avatarClick', e.detail);
    },
    
    // 格式化时间
    formatTime(timestamp: number): string {
      // 使用统一的时间格式化函数，避免toLocaleTimeString等可能导致英文显示的API
      const { formatMessageTime } = require('../../../utils/date');
      return formatMessageTime(timestamp);
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
    
    // 获取消息状态图标
    getMessageStatusIcon(msg: any): string {
      if (!msg.isSelf) {
        return '';
      }
      
      switch (msg.sendingState) {
        case 'sending':
          return 'icon-loading';
        case 'failed':
          return 'icon-failed';
        case 'success':
          return '';
        default:
          return '';
      }
    },
    
    // 处理话单消息数据
    updateCallData(msg: any) {
      const attachment = msg.attachment || {};
      const type = attachment.type || 1; // 1: 音频通话, 2: 视频通话
      const status = attachment.status || 0;
      const duration = attachment.duration || 0;
      
      // 获取图标类型
      const iconType = type === 2 ? 'video' : 'audio';
      
      // 获取状态文本
      const statusText = this.getCallStatusText(status, duration);
      
      // 格式化通话时长
      const formattedDuration = duration > 0 ? this.convertSecondsToTime(duration) : '';
      
      return {
        iconType,
        statusText,
        duration: formattedDuration
      };
    },
    
    // 获取话单状态文本
    getCallStatusText(status: number, duration: number): string {
      if (duration > 0) {
        return '通话时长';
      }
      
      const statusMap: { [key: number]: string } = {
        1: '已取消',
        2: '已拒绝', 
        3: '未接听',
        4: '忙线中'
      };
      
      return statusMap[status] || '未知状态';
    },
    
    // 转换秒数为时间格式
    convertSecondsToTime(seconds: number): string {
      if (seconds <= 0) return '00:00';
      
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      } else {
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }
  }
});