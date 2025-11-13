Page({
  data: {
    
  },

  onLoad() {},

  onShow() {},

  // 处理返回事件
  onBack() {
    wx.navigateBack();
  },

  // 处理头像选择事件
  onAvatarSelect(event: any) {
    const { avatarUrl } = event.detail;
    
    // 这里可以处理头像上传逻辑
    wx.showToast({
      title: '头像更新成功',
      icon: 'success'
    });
  },

  // 处理昵称编辑事件
  onNicknameEdit(event: any) {
    const { field, value } = event.detail;
    
    // 跳转到编辑页面
    wx.navigateTo({
      url: `/pages/user/detail-edit/index?key=${field}&value=${encodeURIComponent(value)}`
    });
  },

  // 处理保存事件
  onSave(event: any) {
    const { data } = event.detail;
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  }
});