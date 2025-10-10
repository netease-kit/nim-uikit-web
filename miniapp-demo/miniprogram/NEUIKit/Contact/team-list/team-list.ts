import { t } from "../../utils/i18n";
import { autorun } from "../../../libs/store";

Component({
  properties: {
    extClass: {
      type: String,
      value: ''
    }
  },

  data: {
    teamList: [] as any[],
    statusBarHeight: 0, // 状态栏高度
    disposer: null as any,
    
    // 国际化文本
    noTeamText: t('teamEmptyText'),
    teamMenuText: t('teamMenuText')
  },

  lifetimes: {
    attached() {
      this.setStatusBarHeight();
      
      // 初始化nim和store实例
      const app = getApp() as any;
      const { nim, store } = app.globalData;
      
      // 将nim、store对象存储为不需要监听变化的实例属性
      (this as any).nimInstance = nim;
      (this as any).storeInstance = store;
      
      if (store) {
        // 监听群组列表变化
        const disposer = autorun(() => {
          const teamList = (store.uiStore && store.uiStore.teamList) ? store.uiStore.teamList : [];
          // 按群组名称排序
          const sortedTeamList = teamList.sort((a: any, b: any) => {
            const nameA = (a.name || a.teamId || '').toLowerCase();
            const nameB = (b.name || b.teamId || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });
          
          this.setData({ teamList: sortedTeamList });
        });
        
        this.setData({ disposer });
      }
    },

    detached() {
      // 清理监听器
      if (this.data.disposer) {
        this.data.disposer();
      }
    }
  },

  methods: {
    setStatusBarHeight() {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 0
      });
    },

    goBack() {
      wx.navigateBack();
    },

    handleTeamItemClick(event: any) {
      const { team } = event.currentTarget.dataset;
      if (!team) return;
      
      // 获取nim实例来生成会话ID
      const app = getApp() as any;
      const { nim } = app.globalData;
      
      if (!nim) {
        wx.showToast({
          title: 'NIM实例未初始化',
          icon: 'error'
        });
        return;
      }
      
      try {
        // 生成团队会话ID
        const conversationId = nim.V2NIMConversationIdUtil.teamConversationId(team.teamId);
        
        // 跳转到聊天页面
        wx.navigateTo({
          url: `/pages/chat/index/index?conversationId=${conversationId}&to=${team.teamId}`,
          fail: (err) => {
            console.error('跳转到群聊页面失败:', err);
            wx.showToast({
              title: '跳转失败',
              icon: 'error'
            });
          }
        });
      } catch (error) {
        console.error('生成会话ID失败:', error);
        wx.showToast({
          title: '生成会话ID失败',
          icon: 'error'
        });
      }
    }
  }
});