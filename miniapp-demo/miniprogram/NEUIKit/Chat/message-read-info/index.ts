Component({
  properties: {
    // 消息客户端ID
    messageClientId: {
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
    },
    // 是否显示
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    // 已读数量
    readCount: 0,
    // 未读数量
    unReadCount: 0,
    // 已读用户列表
    readList: [] as string[],
    // 未读用户列表
    unReadList: [] as string[],
    // 当前选中的类型
    selectedType: 'read',
    // 群组ID
    teamId: '',
    // 是否正在加载
    loading: false,
    // 错误信息
    errorMessage: ''
  },

  observers: {
    'messageClientId, conversationId': function(messageClientId: string, conversationId: string) {
      if (messageClientId && conversationId) {
        this.loadMessageReadInfo();
      }
    }
  },

  methods: {
    /**
     * 加载消息已读信息
     */
    loadMessageReadInfo() {
      const { messageClientId, conversationId } = this.properties;
      
      if (!messageClientId || !conversationId) {
        return;
      }

      this.setData({ loading: true, errorMessage: '' });

      try {
        // 解析群组ID
        const teamId = this.parseTeamId(conversationId);
        this.setData({ teamId });

        // 获取消息
        const msg = this.getMessage(conversationId, messageClientId);
        if (!msg) {
          this.setData({ 
            loading: false, 
            errorMessage: '消息不存在' 
          });
          return;
        }

        // 获取消息已读详情
        this.getMessageReceiptDetails(msg);
      } catch (error) {
        console.error('加载消息已读信息失败:', error);
        this.setData({ 
          loading: false, 
          errorMessage: '加载失败，请重试' 
        });
      }
    },

    /**
     * 解析群组ID
     */
    parseTeamId(conversationId: string): string {
      // 这里需要根据实际的SDK实现来解析
      // 假设conversationId格式为 "team|teamId"
      if (conversationId.startsWith('team|')) {
        return conversationId.split('|')[1];
      }
      return '';
    },

    /**
     * 获取消息
     */
    getMessage(conversationId: string, messageClientId: string) {
      // 这里需要根据实际的消息存储实现来获取消息
      // 返回消息对象或null
      const app = getApp();
      const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
      
      if (store && store.msgStore) {
        const messages = store.msgStore.getMsg(conversationId, [messageClientId]);
        return messages && messages.length > 0 ? messages[0] : null;
      }
      
      return null;
    },

    /**
     * 获取消息已读详情
     */
    async getMessageReceiptDetails(message: any) {
      try {
        const app = getApp();
        const store = (app.globalData && app.globalData.store) ? app.globalData.store : null;
        
        if (store && store.msgStore) {
          const result = await store.msgStore.getTeamMessageReceiptDetailsActive(message);
          
          if (result) {
            this.setData({
              readCount: (result.readReceipt && result.readReceipt.readCount) ? result.readReceipt.readCount : 0,
              unReadCount: (result.readReceipt && result.readReceipt.unreadCount) ? result.readReceipt.unreadCount : 0,
              readList: result.readAccountList || [],
              unReadList: result.unreadAccountList || [],
              loading: false
            });
          } else {
            this.setData({ 
              loading: false, 
              errorMessage: '获取已读详情失败' 
            });
          }
        }
      } catch (error) {
        console.error('获取消息已读详情失败:', error);
        this.setData({ 
          loading: false, 
          errorMessage: '获取已读详情失败' 
        });
      }
    },

    /**
     * 切换选中类型
     */
    handleTypeChange(event: any) {
      const type = event.currentTarget.dataset.type;
      this.setData({ selectedType: type });
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
     * 处理用户点击
     */
    handleUserClick(event: any) {
      const account = event.currentTarget.dataset.account;
      
      this.triggerEvent('userClick', {
        account,
        teamId: this.data.teamId
      });
    },

    /**
     * 刷新数据
     */
    handleRefresh() {
      this.loadMessageReadInfo();
    },

    /**
     * 关闭组件
     */
    handleClose() {
      this.triggerEvent('close');
    },

    /**
     * 阻止事件冒泡
     */
    stopPropagation() {
      // 阻止事件冒泡
    },

    /**
     * 获取当前显示的用户列表
     */
    getCurrentUserList(): string[] {
      const { selectedType, readList, unReadList } = this.data;
      return selectedType === 'read' ? readList : unReadList;
    },

    /**
     * 获取已读率
     */
    getReadRate(): number {
      const { readCount, unReadCount } = this.data;
      const total = readCount + unReadCount;
      return total > 0 ? Math.round((readCount / total) * 100) : 0;
    },

    /**
     * 检查是否全部已读
     */
    isAllRead(): boolean {
      return this.data.unReadCount === 0 && this.data.readCount > 0;
    },

    /**
     * 检查是否全部未读
     */
    isAllUnread(): boolean {
      return this.data.readCount === 0 && this.data.unReadCount > 0;
    },

    /**
     * 导出已读数据
     */
    exportReadData() {
      const { readList, unReadList, readCount, unReadCount } = this.data;
      
      const data = {
        readCount,
        unReadCount,
        readList,
        unReadList,
        readRate: this.getReadRate(),
        exportTime: new Date().toISOString()
      };
      
      this.triggerEvent('export', data);
    }
  },

  lifetimes: {
    attached() {
      // 组件初始化
    },
    
    detached() {
      // 组件销毁时清理
    }
  }
});