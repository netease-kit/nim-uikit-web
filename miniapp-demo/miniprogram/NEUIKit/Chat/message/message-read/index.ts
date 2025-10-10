Component({
  properties: {
    readInfo: {
      type: Object,
      value: {}
    },
    mode: {
      type: String,
      value: 'simple' // simple | detail | modal
    },
    visible: {
      type: Boolean,
      value: false
    },
    showTime: {
      type: Boolean,
      value: false
    },
    theme: {
      type: String,
      value: 'light'
    }
  },

  data: {
    readUsers: [] as any[],
    unreadUsers: [] as any[],
    activeTab: 'read',
    formatTime: '',
    isEmpty: false
  },

  observers: {
    'readInfo': function(readInfo: any) {
      this.updateReadData(readInfo);
    },
    
    'readInfo.time, showTime': function(time: number, showTime: boolean) {
      if (showTime && time) {
        this.setData({
          formatTime: this.formatReadTime(time)
        });
      } else {
        this.setData({
          formatTime: ''
        });
      }
    }
  },

  methods: {
    // 更新已读数据
    updateReadData(readInfo: any) {
      if (!readInfo) {
        this.setData({
          readUsers: [],
          unreadUsers: [],
          isEmpty: true
        });
        return;
      }
      
      const readUsers = readInfo.readUsers || [];
      const unreadUsers = readInfo.unreadUsers || [];
      
      // 处理已读用户数据
      const processedReadUsers = readUsers.map((user: any) => {
        return {
          ...user,
          name: this.getUserName(user),
          avatar: this.getUserAvatar(user)
        };
      });
      
      // 处理未读用户数据
      const processedUnreadUsers = unreadUsers.map((user: any) => {
        return {
          ...user,
          name: this.getUserName(user),
          avatar: this.getUserAvatar(user)
        };
      });
      
      // 按时间排序已读用户（最近已读的在前）
      processedReadUsers.sort((a: any, b: any) => {
        const timeA = a.readTime || 0;
        const timeB = b.readTime || 0;
        return timeB - timeA;
      });
      
      const isEmpty = processedReadUsers.length === 0 && processedUnreadUsers.length === 0;
      
      this.setData({
        readUsers: processedReadUsers,
        unreadUsers: processedUnreadUsers,
        isEmpty
      });
    },
    
    // 获取用户名称
    getUserName(user: any): string {
      if (!user) {
        return '未知用户';
      }
      
      return user.name || user.nick || user.userId || '未知用户';
    },
    
    // 获取用户头像
    getUserAvatar(user: any): string {
      if (!user) {
        return '';
      }
      
      return user.avatar || '';
    },
    
    // 获取已读状态图标
    getReadStatusIcon(): string {
      const { readInfo } = this.data;
      if (!readInfo) {
        return 'clock';
      }
      
      const { readCount = 0, totalCount = 0 } = readInfo;
      
      if (readCount === 0) {
        return 'clock';
      } else if (readCount === totalCount) {
        return 'check-all';
      } else {
        return 'check';
      }
    },
    
    // 获取已读状态颜色
    getReadStatusColor(): string {
      const { readInfo } = this.data;
      if (!readInfo) {
        return '#999';
      }
      
      const { readCount = 0, totalCount = 0 } = readInfo;
      
      if (readCount === 0) {
        return '#999';
      } else if (readCount === totalCount) {
        return '#34c759';
      } else {
        return '#007aff';
      }
    },
    
    // 获取已读状态文本
    getReadStatusText(): string {
      const { readInfo } = this.data;
      if (!readInfo) {
        return '未读';
      }
      
      const { readCount = 0, totalCount = 0 } = readInfo;
      
      if (readCount === 0) {
        return '未读';
      } else if (readCount === totalCount) {
        return '已读';
      } else {
        return `${readCount}/${totalCount}已读`;
      }
    },
    
    // 格式化已读时间
    formatReadTime(timestamp: number): string {
      // 使用统一的时间格式化函数，避免toLocaleTimeString等可能导致英文显示的API
      const { formatMessageTime } = require('../../../utils/date');
      return formatMessageTime(timestamp);
    },
    
    // 格式化用户已读时间
    formatUserReadTime(timestamp: number): string {
      if (!timestamp) {
        return '';
      }
      
      // 使用统一的时间格式化函数，避免toLocaleTimeString等可能导致英文显示的API
      const { formatMessageTime } = require('../../../utils/date');
      const timeStr = formatMessageTime(timestamp);
      
      // 为已读时间添加"已读"后缀
      if (timeStr === '刚刚') {
        return '刚刚已读';
      } else if (timeStr.includes('分钟前')) {
        return timeStr.replace('分钟前', '分钟前已读');
      } else {
        return `${timeStr} 已读`;
      }
    },
    
    // 处理用户点击
    handleUserClick(e: any) {
      const user = e.currentTarget.dataset.user;
      if (!user) {
        return;
      }
      
      this.triggerEvent('userClick', {
        user,
        readInfo: this.data.readInfo
      });
    },
    
    // 处理标签页切换
    handleTabChange(e: any) {
      const tab = e.currentTarget.dataset.tab;
      if (!tab || tab === this.data.activeTab) {
        return;
      }
      
      this.setData({ activeTab: tab });
      
      this.triggerEvent('tabChange', {
        activeTab: tab,
        readUsers: this.data.readUsers,
        unreadUsers: this.data.unreadUsers
      });
    },
    
    // 处理关闭弹窗
    handleClose() {
      this.triggerEvent('close');
    },
    
    // 处理遮罩点击
    handleMaskClick() {
      this.handleClose();
    },
    
    // 阻止事件冒泡
    stopPropagation() {
      // 阻止点击弹窗内容时关闭弹窗
    },
    
    // 获取当前标签页的用户列表
    getCurrentUsers(): any[] {
      const { activeTab, readUsers, unreadUsers } = this.data;
      return activeTab === 'read' ? readUsers : unreadUsers;
    },
    
    // 获取已读率
    getReadRate(): number {
      const { readInfo } = this.data;
      if (!readInfo || !readInfo.totalCount || readInfo.totalCount === 0) {
        return 0;
      }
      
      const { readCount = 0, totalCount } = readInfo;
      return Math.round((readCount / totalCount) * 100);
    },
    
    // 获取已读状态摘要
    getReadSummary(): string {
      const { readInfo } = this.data;
      if (!readInfo) {
        return '暂无数据';
      }
      
      const { readCount = 0, totalCount = 0 } = readInfo;
      const rate = this.getReadRate();
      
      if (totalCount === 0) {
        return '暂无数据';
      }
      
      if (readCount === 0) {
        return '暂无人已读';
      }
      
      if (readCount === totalCount) {
        return '全部已读';
      }
      
      return `${readCount}/${totalCount}人已读 (${rate}%)`;
    },
    
    // 检查是否全部已读
    isAllRead(): boolean {
      const { readInfo } = this.data;
      if (!readInfo || !readInfo.totalCount) {
        return false;
      }
      
      const { readCount = 0, totalCount } = readInfo;
      return readCount === totalCount && totalCount > 0;
    },
    
    // 检查是否无人已读
    isNoneRead(): boolean {
      const { readInfo } = this.data;
      if (!readInfo) {
        return true;
      }
      
      const { readCount = 0 } = readInfo;
      return readCount === 0;
    },
    
    // 获取最近已读用户
    getRecentReadUsers(count: number = 3): any[] {
      const { readUsers } = this.data;
      return readUsers.slice(0, count);
    },
    
    // 搜索用户
    searchUsers(keyword: string): { readUsers: any[], unreadUsers: any[] } {
      if (!keyword) {
        return {
          readUsers: this.data.readUsers,
          unreadUsers: this.data.unreadUsers
        };
      }
      
      const lowerKeyword = keyword.toLowerCase();
      
      const filteredReadUsers = this.data.readUsers.filter((user: any) => {
        const name = (user.name || '').toLowerCase();
        const userId = (user.userId || '').toLowerCase();
        return name.includes(lowerKeyword) || userId.includes(lowerKeyword);
      });
      
      const filteredUnreadUsers = this.data.unreadUsers.filter((user: any) => {
        const name = (user.name || '').toLowerCase();
        const userId = (user.userId || '').toLowerCase();
        return name.includes(lowerKeyword) || userId.includes(lowerKeyword);
      });
      
      return {
        readUsers: filteredReadUsers,
        unreadUsers: filteredUnreadUsers
      };
    },
    
    // 导出已读数据
    exportReadData(): any {
      const { readInfo, readUsers, unreadUsers } = this.data;
      
      return {
        readInfo,
        readUsers,
        unreadUsers,
        summary: {
          readCount: (readInfo && readInfo.readCount) ? readInfo.readCount : 0,
          unreadCount: (readInfo && readInfo.unreadCount) ? readInfo.unreadCount : 0,
          totalCount: (readInfo && readInfo.totalCount) ? readInfo.totalCount : 0,
          readRate: this.getReadRate(),
          isAllRead: this.isAllRead(),
          isNoneRead: this.isNoneRead()
        }
      };
    }
  }
});