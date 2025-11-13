Component({
  /**
   * 组件的属性列表
   */
  properties: {
    account: {
      type: String,
      value: '',
      observer: '_updateUserInfo'
    },
    teamId: {
      type: String,
      value: '',
      observer: '_updateAppellation'
    },
    avatar: {
      type: String,
      value: '',
      observer: '_updateAvatarUrl'
    },
    size: {
      type: String,
      value: '42'
    },
    gotoUserCard: {
      type: Boolean,
      value: false
    },
    fontSize: {
      type: String,
      value: '14'
    },
    isRedirect: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    avatarSize: 42,
    user: null,
    isLongPress: false,
    appellation: '',
    avatarUrl: '',
    color: '#ccc'
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this._initComponent();
    },
    detached() {
      // 清理资源
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 初始化组件
     */
    _initComponent() {
      const size = parseInt(this.data.size) || 42;
      this.setData({ avatarSize: size });
      
      this._updateUserInfo();
      this._updateAppellation();
      this._updateAvatarUrl();
      this._updateColor();
    },

    /**
     * 更新用户信息
     */
    _updateUserInfo() {
      const { account } = this.data;
      if (!account) return;

      const app = getApp();
      if (app && app.globalData && app.globalData.store) {
        try {
          // 获取用户信息
          app.globalData.store.userStore.getUserActive(account)
            .then((userData: any) => {
              this.setData({ user: userData });
              this._updateAvatarUrl();
            })
            .catch((error: any) => {
              console.warn('获取用户信息失败:', error);
            });
        } catch (error) {
          console.warn('UIKitStore访问失败:', error);
        }
      }
    },

    /**
     * 更新称谓显示
     */
    _updateAppellation() {
      const { account, teamId } = this.data;
      if (!account) {
        this.setData({ appellation: '' });
        return;
      }

      const app = getApp();
      if (app && app.globalData && app.globalData.store) {
        try {
          const appellation = app.globalData.store.uiStore.getAppellation({
            account,
            teamId,
            ignoreAlias: false,
            nickFromMsg: ''
          });
          
          // 只取前两个字符
          const displayName = appellation ? appellation.slice(0, 2) : '';
          this.setData({ appellation: displayName });
        } catch (error) {
          console.warn('获取用户称谓失败:', error);
          // 降级处理
          this.setData({ appellation: account ? account.slice(0, 2) : '' });
        }
      } else {
        // 降级处理
        this.setData({ appellation: account ? account.slice(0, 2) : '' });
      }
    },

    /**
     * 更新头像URL
     */
    _updateAvatarUrl() {
      const { avatar, user } = this.data as { avatar: string, user: any };
      
      // 优先使用传入的avatar，然后使用用户信息中的avatar
      const finalAvatarUrl = avatar || (user && user.avatar) || '';
      this.setData({ avatarUrl: finalAvatarUrl });
    },

    /**
     * 更新背景颜色
     */
    _updateColor() {
      const { account } = this.data;
      if (!account) {
        this.setData({ color: '#ccc' });
        return;
      }

      // 简单的颜色生成算法（可以根据实际需求调整）
      const colors = [
        '#60B2FF', '#6AC4DC', '#73E6A6', '#A6E663',
        '#F2C94C', '#F2994A', '#EB5757', '#BB6BD9',
        '#9B59B6', '#3498DB', '#1ABC9C', '#2ECC71'
      ];
      
      let hash = 0;
      for (let i = 0; i < account.length; i++) {
        hash = account.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const colorIndex = Math.abs(hash) % colors.length;
      this.setData({ color: colors[colorIndex] });
    },

    /**
     * 头像点击事件
     */
    handleAvatarClick() {
      const { gotoUserCard, isLongPress, account } = this.data;
      
      // 触发事件给父组件
      this.triggerEvent('avatarClick', { account });
      
      if (gotoUserCard && !isLongPress && account) {
        const app = getApp();
        const store = app && app.globalData && app.globalData.store;
        const myAccountId = (store && store.userStore && store.userStore.myUserInfo && store.userStore.myUserInfo.accountId) || null;
                
        if (account === myAccountId) {
          // 跳转到个人详情页
          wx.navigateTo({
            url: '/pages/user/my-detail/index'
          }).catch((error) => {
            console.error('跳转个人详情页面失败:', error);
            wx.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          });
        } else {
          // 跳转到好友卡片页
          wx.navigateTo({
            url: `/pages/friend/friend-card/index?accountId=${account}`
          }).catch((error) => {
            console.error('跳转好友名片页面失败:', error);
            wx.showToast({
              title: '跳转失败',
              icon: 'none'
            });
          });
        }
      }
    },

    /**
     * 长按事件
     */
    longpress() {
      this.setData({ isLongPress: true });
      this.triggerEvent('onLongpress', { account: this.data.account });
    },

    /**
     * 触摸结束事件
     */
    touchend() {
      setTimeout(() => {
        this.setData({ isLongPress: false });
      }, 200);
    }
  }
});