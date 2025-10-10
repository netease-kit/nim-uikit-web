Component({
  properties: {
    msg: {
      type: Object,
      value: {}
    }
  },

  data: {
    iconType: 'icon-weizhiwenjian',
    prefixName: '',
    suffixName: '',
    fileSize: ''
  },

  observers: {
    'msg': function(msg: any) {
      if (msg && msg.attachment) {
        const { name = '', ext = '', size = 0 } = msg.attachment;
        
        // 文件类型图标映射
        const fileIconMap: { [key: string]: string } = {
          pdf: 'icon-PPT',
          word: 'icon-Word',
          excel: 'icon-Excel',
          ppt: 'icon-PPT',
          zip: 'icon-RAR1',
          txt: 'icon-qita',
          img: 'icon-tupian2',
          audio: 'icon-yinle',
          video: 'icon-shipin'
        };
        
        // 获取文件类型
        const fileType = this.getFileType(ext);
        const iconType = fileIconMap[fileType] || 'icon-weizhiwenjian';
        
        // 处理文件名显示
        const index = name.lastIndexOf('.') > -1 ? name.lastIndexOf('.') : name.length;
        const prefixName = name.slice(0, Math.max(index - 5, 0));
        const suffixName = name.slice(Math.max(index - 5, 0));
        
        // 格式化文件大小
        const fileSize = this.parseFileSize(size);
        
        this.setData({
          iconType,
          prefixName,
          suffixName,
          fileSize
        });
      }
    }
  },

  methods: {
    // 获取文件类型
    getFileType(ext: string): string {
      const extension = ext.toLowerCase();
      
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
        return 'img';
      }
      if (['mp3', 'wav', 'flac', 'aac', 'm4a'].includes(extension)) {
        return 'audio';
      }
      if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(extension)) {
        return 'video';
      }
      if (['doc', 'docx'].includes(extension)) {
        return 'word';
      }
      if (['xls', 'xlsx'].includes(extension)) {
        return 'excel';
      }
      if (['ppt', 'pptx'].includes(extension)) {
        return 'ppt';
      }
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
        return 'zip';
      }
      if (extension === 'pdf') {
        return 'pdf';
      }
      if (extension === 'txt') {
        return 'txt';
      }
      
      return 'unknown';
    },
    
    // 格式化文件大小
    parseFileSize(size: number): string {
      if (size < 1024) {
        return size + 'B';
      }
      if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + 'KB';
      }
      if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(1) + 'MB';
      }
      return (size / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
    },
    
    // 点击文件处理
    onFileClick() {
      const { msg } = this.data;
      if (msg && msg.attachment) {
        const { url, name } = msg.attachment;
        
        // 触发文件下载事件
        this.triggerEvent('fileClick', {
          url,
          name,
          msg
        });
        
        // 在小程序中，可以使用 wx.downloadFile 下载文件
        if (url) {
          wx.downloadFile({
            url: url,
            success: (res) => {
              if (res.statusCode === 200) {
                // 下载成功，可以打开文件
                wx.openDocument({
                  filePath: res.tempFilePath,
                  success: () => {
                    console.log('文件打开成功');
                  },
                  fail: (err) => {
                    console.error('文件打开失败:', err);
                    wx.showToast({
                      title: '文件打开失败',
                      icon: 'none'
                    });
                  }
                });
              }
            },
            fail: (err) => {
              console.error('文件下载失败:', err);
              wx.showToast({
                title: '文件下载失败',
                icon: 'none'
              });
            }
          });
        }
      }
    }
  }
});