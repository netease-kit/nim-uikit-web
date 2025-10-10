Component({
  properties: {
    msg: {
      type: Object,
      value: {}
    }
  },

  data: {
    videoCoverUrl: '',
    videoDuration: '',
    showDefaultCover: false
  },

  observers: {
    'msg': function(msg: any) {
      if (msg && msg.attachment) {
        this.updateVideoData(msg);
      }
    }
  },

  methods: {
    updateVideoData(msg: any) {
      const attachment = msg.attachment;
      let coverUrl = '';
      let duration = '';

      if (attachment) {
        // 获取视频封面图片URL
        if (attachment.thumbUrl) {
          // 优先使用缩略图
          coverUrl = attachment.thumbUrl;
        } else if (attachment.coverUrl) {
          // 使用封面图
          coverUrl = attachment.coverUrl;
        } else if (attachment.url) {
          // 如果没有缩略图和封面，使用视频URL获取首帧
          const url = attachment.url;
          coverUrl = `${url}${url.includes('?') ? '&' : '?'}vframe=1`;
        }

        // 格式化视频时长
        if (attachment.duration) {
          duration = this.formatDuration(attachment.duration);
        }
      }

      this.setData({
        videoCoverUrl: coverUrl,
        videoDuration: duration,
        showDefaultCover: false
      });
    },

    handleImageError() {
      // 图片加载失败时显示默认封面
      this.setData({
        showDefaultCover: true
      });
    },

    formatDuration(seconds: number): string {
      if (!seconds || seconds <= 0) return '';
      
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      
      if (minutes > 0) {
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      } else {
        return `0:${remainingSeconds.toString().padStart(2, '0')}`;
      }
    },

    handleVideoClick() {
      const msg = this.data.msg;
      if (!msg || !msg.attachment || !msg.attachment.url) {
        wx.showToast({
          title: '视频加载失败',
          icon: 'none'
        });
        return;
      }

      // 触发父组件的视频点击事件
      this.triggerEvent('videoClick', {
        msg: msg,
        videoUrl: msg.attachment.url
      });
    }
  }
});