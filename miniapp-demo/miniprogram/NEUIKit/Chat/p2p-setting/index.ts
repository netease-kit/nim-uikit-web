Component({
  properties: {
    // 用户账号
    account: {
      type: String,
      value: ''
    },
    // 会话ID
    conversationId: {
      type: String,
      value: ''
    },
    // 主题模式
    theme: {
      type: String,
      value: 'light'
    }
  },

  data: {
    // 用户昵称
    myNick: '',
    // 是否免打扰
    isMute: false,
    // 是否置顶
    isStickTop: false,
    // 是否正在加载
    loading: false,
    // 会话信息
    conversation: null as any,
    // 状态栏高度
    statusBarHeight: 0
  },

  observers: {
    'account, conversationId': function(account: string, conversationId: string) {
      if (account && conversationId) {
        this.loadUserInfo();
        this.loadConversationInfo();
      }
    }
  },

  methods: {
    /**
     * 加载用户信息
     */
    loadUserInfo() {
      const { account } = this.properties;
      
      if (!account) return;

      try {
        const app = getApp();
        const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
        
        if (store) {
          // 获取用户昵称
          const nick = this.getUserNick(account);
          this.setData({ myNick: nick });

          // 获取免打扰状态
          const isMute = (store.relationStore && store.relationStore.mutes && store.relationStore.mutes.includes) ? store.relationStore.mutes.includes(account) : false;
          this.setData({ isMute });


        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      }
    },

    /**
     * 加载会话信息
     */
    loadConversationInfo() {
      const { conversationId } = this.properties;
      
      if (!conversationId) return;

      try {
        const app = getApp();
        const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
        
        if (store) {
          // 获取会话信息
          const conversation = (store.conversationStore && store.conversationStore.conversations && store.conversationStore.conversations.get) ? 
                              store.conversationStore.conversations.get(conversationId) :
                              ((store.localConversationStore && store.localConversationStore.conversations && store.localConversationStore.conversations.get) ? 
                               store.localConversationStore.conversations.get(conversationId) : null);
          
          if (conversation) {
            this.setData({ 
              conversation,
              isStickTop: !!conversation.stickTop 
            });
          }
        }
      } catch (error) {
        console.error('加载会话信息失败:', error);
      }
    },

    /**
     * 获取用户昵称
     */
    getUserNick(account: string): string {
      const app = getApp();
      const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
      
      if (store && store.uiStore) {
        return store.uiStore.getAppellation({ account }) || account;
      }
      
      return account;
    },

    /**
     * 返回上一页
     */
    handleBack() {
      wx.navigateBack();
    },

    /**
     * 添加群成员
     */
    handleAddTeamMember() {
      const { account } = this.properties;
      
      this.triggerEvent('addTeamMember', {
        account,
        conversationId: this.properties.conversationId
      });
    },

    /**
     * 处理免打扰状态变更
     */
    async handleSessionMuteChange(event: any) {
      const value = event.detail.value;
      const { account } = this.properties;
      
      this.setData({ 
        loading: true, 
        loadingText: value ? '设置免打扰中...' : '取消免打扰中...' 
      });

      try {
        const app = getApp();
        const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
        
        if (store && store.relationStore) {
          // 使用SDK枚举的数值形式：0=OFF(关闭免打扰)，1=ON(开启免打扰)
          await store.relationStore.setP2PMessageMuteModeActive(
            account,
            value ? 1 : 0
          );

          this.setData({ isMute: value });

          wx.showToast({
            title: value ? '已设置免打扰' : '已取消免打扰',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('设置免打扰失败:', error);
        wx.showToast({
          title: '设置失败，请重试',
          icon: 'error'
        });
      } finally {
        this.setData({ loading: false });
      }
    },

    /**
     * 处理置顶状态变更
     */
    async handleStickTopChange(event: any) {
      const value = event.detail.value;
      const { conversationId, account } = this.properties;
      
      this.setData({ 
        loading: true, 
        loadingText: value ? '置顶中...' : '取消置顶中...' 
      });

      try {
        const app = getApp();
        const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
        const nim = (app.globalData && app.globalData.nim) ? app.globalData.nim : null;
        
        if (store) {
          // 根据是否启用云端会话选择不同的store，并确保会话ID正确
          const enableV2CloudConversation = (store.sdkOptions && store.sdkOptions.enableV2CloudConversation) || false;
          const convId = (nim && nim.V2NIMConversationIdUtil && nim.V2NIMConversationIdUtil.p2pConversationId)
            ? nim.V2NIMConversationIdUtil.p2pConversationId(account)
            : conversationId;

          if (enableV2CloudConversation) {
            await store.conversationStore?.stickTopConversationActive(convId, value);
          } else {
            await store.localConversationStore?.stickTopConversationActive(convId, value);
          }

          this.setData({ isStickTop: value });

          wx.showToast({
            title: value ? '已置顶' : '已取消置顶',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('设置置顶失败:', error);
        wx.showToast({
          title: '设置失败，请重试',
          icon: 'error'
        });
      } finally {
        this.setData({ loading: false });
      }
    },









    /**
     * 阻止事件冒泡
     */
    stopPropagation() {
      // 阻止事件冒泡
    },

    /**
     * 获取设置摘要
     */
    getSettingSummary() {
      const { isMute, isStickTop } = this.data;
      
      return {
        isMute,
        isStickTop,
        account: this.properties.account,
        conversationId: this.properties.conversationId
      };
    },

    /**
     * 重置设置
     */
    async resetSettings() {
      const { account, conversationId } = this.properties;
      
      this.setData({ 
        loading: true, 
        loadingText: '重置中...' 
      });

      try {
        const app = getApp();
        const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
        
        if (store) {
          // 取消免打扰
          if (this.data.isMute && store.relationStore) {
            await store.relationStore.setP2PMessageMuteModeActive(account, 0);
          }
          
          // 取消置顶
          if (this.data.isStickTop) {
            const conversationStore = store.conversationStore || store.localConversationStore;
            if (conversationStore) {
              await conversationStore.stickTopConversationActive(conversationId, false);
            }
          }
          
          this.setData({
            isMute: false,
            isStickTop: false
          });
          
          wx.showToast({
            title: '设置已重置',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('重置设置失败:', error);
        wx.showToast({
          title: '重置失败，请重试',
          icon: 'error'
        });
      } finally {
        this.setData({ loading: false });
      }
    },

    /**
     * 获取系统状态栏高度
     */
    getStatusBarHeight() {
      try {
        const systemInfo = wx.getSystemInfoSync();
        const statusBarHeight = systemInfo.statusBarHeight || 0;
        
        this.setData({
          statusBarHeight: statusBarHeight
        });
      } catch (error) {
        // console.error('获取系统信息失败:', error);
        // 设置默认状态栏高度
        this.setData({
          statusBarHeight: 20
        });
      }
    }
  },

  lifetimes: {
    attached() {
      // 获取系统状态栏高度
      this.getStatusBarHeight();
      
      // 组件初始化
      const { account, conversationId } = this.properties;
      if (account && conversationId) {
        this.loadUserInfo();
        this.loadConversationInfo();
      }
    },
    
    detached() {
      // 组件销毁时清理
    }
  }
});