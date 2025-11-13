Page({
  data: {
    editKey: '',
    initialValue: ''
  },

  onLoad(options: any) {    
    // 从页面参数中获取编辑的字段和初始值
    const { editKey, initialValue } = options;
    this.setData({
      editKey: editKey || '',
      initialValue: decodeURIComponent(initialValue || '')
    });
  },

  onShow() {},

  // 处理返回事件
  onBack() {
    wx.navigateBack();
  },

  // 处理保存事件
  onSave(event: any) {
    const { editKey, value } = event.detail;
    
    // 这里可以调用API保存用户信息
    // 保存成功后返回上一页并传递结果
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    if (prevPage) {
      // 通知上一页数据已更新
      prevPage.setData({
        [`userInfo.${editKey}`]: value
      });
    }
    
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  },

  // 处理输入变化事件
  onInputChange(event: any) {
    const { value } = event.detail;
  },

  // 处理输入验证失败事件
  onValidationError(event: any) {
    const { message } = event.detail;
    
    wx.showToast({
      title: message,
      icon: 'none'
    });
  }
});