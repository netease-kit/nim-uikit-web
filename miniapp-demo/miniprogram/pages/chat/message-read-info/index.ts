// pages/chat/message-read-info/index.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme: 'light',
    messageId: '',
    conversationId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options: any) {    
    // 从页面参数获取消息ID和会话ID
    if (options.messageId) {
      this.setData({
        messageId: options.messageId
      });
    }
    
    if (options.conversationId) {
      this.setData({
        conversationId: options.conversationId
      });
    }
    
    // 获取系统主题
    this.getSystemTheme();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 触发组件刷新
    this.onRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '消息已读详情',
      path: `/pages/chat/message-read-info/index?messageId=${this.data.messageId}&conversationId=${this.data.conversationId}`
    };
  },

  /**
   * 获取系统主题
   */
  getSystemTheme() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      if (systemInfo.theme) {
        this.setData({
          theme: systemInfo.theme
        });
      }
    } catch (error) {
      console.error('获取系统主题失败:', error);
    }
  },

  /**
   * 处理刷新事件
   */
  onRefresh() {
    // 停止下拉刷新
    wx.stopPullDownRefresh();
    
    // 显示刷新提示
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * 处理导出事件
   */
  onExport(event: any) {
    const { readUsers, unreadUsers } = event.detail;
    
    // 显示导出选项
    wx.showActionSheet({
      itemList: ['导出已读用户列表', '导出未读用户列表', '导出全部用户列表'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.exportUserList(readUsers, '已读用户列表');
        } else if (res.tapIndex === 1) {
          this.exportUserList(unreadUsers, '未读用户列表');
        } else if (res.tapIndex === 2) {
          this.exportUserList([...readUsers, ...unreadUsers], '全部用户列表');
        }
      },
      fail: (err) => {}
    });
  },

  /**
   * 导出用户列表
   */
  exportUserList(users: any[], title: string) {
    if (!users || users.length === 0) {
      wx.showToast({
        title: '暂无数据可导出',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 生成导出内容
    let content = `${title}\n\n`;
    users.forEach((user, index) => {
      content += `${index + 1}. ${user.nick || user.account}\n`;
    });
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success',
          duration: 2000
        });
      },
      fail: (err) => {
        console.error('复制失败:', err);
        wx.showToast({
          title: '复制失败',
          icon: 'error',
          duration: 2000
        });
      }
    });
  },

  /**
   * 处理用户点击事件
   */
  onUserClick(event: any) {
    const { user } = event.detail;
    
    // 显示用户操作选项
    wx.showActionSheet({
      itemList: ['查看用户信息', '发送消息'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 查看用户信息
          wx.showToast({
            title: '查看用户信息功能待实现',
            icon: 'none',
            duration: 2000
          });
        } else if (res.tapIndex === 1) {
          // 发送消息
          wx.navigateTo({
            url: `/pages/chat/index/index?conversationId=${user.account}`
          });
        }
      },
      fail: (err) => {}
    });
  }
});