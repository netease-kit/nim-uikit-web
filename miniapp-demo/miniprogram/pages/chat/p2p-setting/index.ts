// pages/chat/p2p-setting/index.ts
Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme: 'light',
    to: '',
    account: '',
    conversationId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options: any) {    
    // 从页面参数获取对方用户ID
    if (options.to) {
      const account = options.to;
      const app = getApp() as any;
      const nim = app?.globalData?.nim;
      const conversationId = (nim && nim.V2NIMConversationIdUtil && nim.V2NIMConversationIdUtil.p2pConversationId)
        ? nim.V2NIMConversationIdUtil.p2pConversationId(account)
        : `p2p|${account}`;
      
      this.setData({
        to: account,
        account: account,
        conversationId: conversationId
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
    // 停止下拉刷新
    wx.stopPullDownRefresh();
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
      title: '聊天设置',
      path: `/pages/chat/p2p-setting/index?to=${this.data.to}`
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
   * 处理消息免打扰状态变化
   */
  onMuteChange(event: any) {
    const { muted } = event.detail;
    
    wx.showToast({
      title: muted ? '已开启免打扰' : '已关闭免打扰',
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * 处理置顶聊天状态变化
   */
  onStickChange(event: any) {
    const { sticked } = event.detail;
    
    wx.showToast({
      title: sticked ? '已置顶聊天' : '已取消置顶',
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * 处理清空聊天记录
   */
  onClearHistory(event: any) {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空聊天记录吗？此操作不可恢复。',
      confirmText: '清空',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          // 执行清空操作
          this.performClearHistory();
        }
      }
    });
  },

  /**
   * 执行清空聊天记录
   */
  performClearHistory() {
    wx.showLoading({
      title: '清空中...',
      mask: true
    });
    
    // 模拟清空操作
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '聊天记录已清空',
        icon: 'success',
        duration: 2000
      });
    }, 1500);
  },

  /**
   * 处理拉黑用户
   */
  onBlockUser(event: any) {
    const { blocked } = event.detail;
    
    const action = blocked ? '拉黑' : '取消拉黑';
    const confirmText = blocked ? '拉黑' : '取消拉黑';
    const confirmColor = blocked ? '#ff4757' : '#007aff';
    
    wx.showModal({
      title: `确认${action}`,
      content: `确定要${action}该用户吗？`,
      confirmText: confirmText,
      confirmColor: confirmColor,
      success: (res) => {
        if (res.confirm) {
          // 执行拉黑/取消拉黑操作
          this.performBlockUser(blocked);
        }
      }
    });
  },

  /**
   * 执行拉黑/取消拉黑用户
   */
  performBlockUser(blocked: boolean) {
    const action = blocked ? '拉黑' : '取消拉黑';
    
    wx.showLoading({
      title: `${action}中...`,
      mask: true
    });
    
    // 模拟拉黑操作
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: `已${action}该用户`,
        icon: 'success',
        duration: 2000
      });
      
      // 如果是拉黑操作，可能需要返回上一页
      if (blocked) {
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      }
    }, 1500);
  },

  /**
   * 处理查看用户信息
   */
  onUserInfo(event: any) {
    const { userInfo } = event.detail;
    
    // 显示用户信息操作选项
    wx.showActionSheet({
      itemList: ['查看详细信息', '发送名片', '添加到通讯录'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 查看详细信息
          this.showUserDetail(userInfo);
        } else if (res.tapIndex === 1) {
          // 发送名片
          this.shareUserCard(userInfo);
        } else if (res.tapIndex === 2) {
          // 添加到通讯录
          this.addToContacts(userInfo);
        }
      },
      fail: (err) => {}
    });
  },

  /**
   * 显示用户详细信息
   */
  showUserDetail(userInfo: any) {
    wx.showToast({
      title: '查看用户详情功能待实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 分享用户名片
   */
  shareUserCard(userInfo: any) {
    wx.showToast({
      title: '发送名片功能待实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 添加到通讯录
   */
  addToContacts(userInfo: any) {
    wx.showToast({
      title: '添加到通讯录功能待实现',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 处理添加好友创建群聊
   */
  onAddTeamMember(event: any) {
    const { account, conversationId } = event.detail;
    
    // 跳转到创建群聊页面，传递当前用户信息
    wx.navigateTo({
      url: `/pages/team/create-team/index?p2pConversationId=${conversationId}&account=${account}`,
      fail: (error) => {
        console.error('跳转到创建群聊页面失败:', error);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'error',
          duration: 2000
        });
      }
    });
  }
});