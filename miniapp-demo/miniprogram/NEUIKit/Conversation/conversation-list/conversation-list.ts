import { t } from "../../utils/i18n";
import { autorun } from "../../../libs/store"

Component({
  properties: {
    extClass: {
      type: String,
      value: ''
    }
  },

  data: {
    addDropdownVisible: false,
    currentMoveSessionId: '',
    conversationList: [] as any[],
    statusBarHeight: 0, // 状态栏高度
    buttonClass: 'button-box',
    
    // 添加nim和store实例
    nim: null as any,
    store: null as any,
    enableV2CloudConversation: false,
    disposer: null as any,
    
    // 国际化文本
    appText: t('appText'),
    addFriendText: t('addFriendText'),
    createTeamText: t('createTeamText'),
    securityTipText: t('securityTipText'),
    searchText: t('searchText'),
    conversationEmptyText: t('conversationEmptyText')
  },

  lifetimes: {
    attached() {
      // 获取系统信息，设置状态栏高度
      this.setStatusBarHeight();

      // 初始化nim和store实例
      const app = getApp<IAppOption>();
      const { nim, store } = app.globalData;

      // 将nim、store对象存储为不需要监听变化的实例属性
      (this as any).nimInstance = nim;
      (this as any).storeInstance = store;

      const enableV2CloudConversation = (store && store.sdkOptions && store.sdkOptions.enableV2CloudConversation) || false;

      const disposer = autorun(() => {
        const _conversationList = enableV2CloudConversation
          ? (store && store.uiStore && store.uiStore.conversations) || []
          : (store && store.uiStore && store.uiStore.localConversations) || [];
        const sortedList = _conversationList && _conversationList.sort ? _conversationList.sort(
          ( a: { sortOrder: number; }, b: { sortOrder: number; }) => b.sortOrder - a.sortOrder
        ) : [];

        this.setData({
          conversationList: sortedList
        })
      })

      this.setData({
        enableV2CloudConversation,
        disposer
      });
      
      // 选择空会话
      if (store && store.uiStore && store.uiStore.selectConversation) {
        store.uiStore.selectConversation("");
      }
    },
    
    detached() {
      this.unbindEvents();
      // 清理监听器
      if (this.data.disposer) {
        this.data.disposer();
      }
    }
  },

  methods: {
    // 设置状态栏高度
    setStatusBarHeight() {
      try {
        const systemInfo = wx.getSystemInfoSync();
        const statusBarHeight = systemInfo.statusBarHeight || 44; // 默认44px
        
        this.setData({
          statusBarHeight: statusBarHeight
        });
        
        console.log('状态栏高度设置为:', statusBarHeight, 'px');
      } catch (error) {
        console.error('获取系统信息失败:', error);
        // 设置默认值
        this.setData({
          statusBarHeight: 44
        });
      }
    },

    showAddDropdown() {
      this.setData({
        addDropdownVisible: true,
        buttonClass: 'button-box button-box-active'
      })
    },

    hideAddDropdown() {
      this.setData({
        addDropdownVisible: false,
        buttonClass: 'button-box'
      })
    },

    onAddFriend() {
      this.hideAddDropdown();
      // 跳转到添加好友页面
      wx.navigateTo({
        url: '/pages/friend/add-friend/index'
      });
    },

    onCreateGroup() {
      this.hideAddDropdown();
      // 跳转到创建群聊页面
      wx.navigateTo({
        url: '/pages/team/create-team/index'
      });
    },

    goToSearchPage() {
      wx.navigateTo({
        url: '/pages/conversation/conversation-search/index'
      })
    },

    handleSessionItemClick(e: any) {
      const { conversation } = e.detail;
      const { storeInstance } = this as any;
      
      if (!storeInstance) {
        console.warn('Store未初始化');
        return;
      }
      
      try {
        // 选择会话
        if (storeInstance && storeInstance.uiStore && storeInstance.uiStore.selectConversation) {
          storeInstance.uiStore.selectConversation(conversation.conversationId);
        }
        
        // 触发session-click事件，让父组件处理跳转
        this.triggerEvent('session-click', { conversation });
      } catch (error) {
        console.error('选择会话失败:', error);
        wx.showToast({
          title: t('selectSessionFailText'),
          icon: 'none'
        });
      }
    },

    handleSessionItemDeleteClick(e: any) {
      const { conversation } = e.detail;
      const { enableV2CloudConversation } = this.data;
      const { nimInstance } = this as any;
      
      wx.showModal({
        title: '提示',
        content: '确定要删除该会话吗？',
        success: async (res) => {
          if (res.confirm && nimInstance) {
            try {
              if (enableV2CloudConversation) {
                if (nimInstance && nimInstance.conversationStore && nimInstance.conversationStore.deleteConversationActive) {
                  await nimInstance.conversationStore.deleteConversationActive(conversation.conversationId);
                }
              } else {
                if (nimInstance && nimInstance.localConversationStore && nimInstance.localConversationStore.deleteConversationActive) {
                  await nimInstance.localConversationStore.deleteConversationActive(conversation.conversationId);
                }
              }
              
              this.setData({
                currentMoveSessionId: ''
              });
            } catch (error) {
              console.error('删除会话失败:', error);
              wx.showToast({
                title: t('deleteSessionFailText'),
                icon: 'none'
              });
            }
          }
        }
      });
    },

    handleSessionItemStickTopChange(e: any) {
      const { conversation } = e.detail;
      const { enableV2CloudConversation } = this.data;
      const { storeInstance } = this as any;
      
      if (!storeInstance) return;
      
      const stickTop = !conversation.stickTop;
      
      try {
        if (enableV2CloudConversation) {
          if (storeInstance && storeInstance.conversationStore && storeInstance.conversationStore.stickTopConversationActive) {
            storeInstance.conversationStore.stickTopConversationActive(conversation.conversationId, stickTop);
          }
        } else {
          if (storeInstance && storeInstance.localConversationStore && storeInstance.localConversationStore.stickTopConversationActive) {
            storeInstance.localConversationStore.stickTopConversationActive(conversation.conversationId, stickTop);
          }
        }
      } catch (error) {
        console.error('置顶操作失败:', error);
        const errorKey = stickTop ? 'addStickTopFailText' : 'deleteStickTopFailText';
        wx.showToast({
          title: t(errorKey),
          icon: 'none'
        });
      }
    },

    handleSessionItemLeftSlide(e: any) {
      const { conversationId } = e.detail
      this.setData({
        currentMoveSessionId: conversationId
      })
    },

    handleScroll() {
      // 滚动时隐藏操作菜单
      if (this.data.currentMoveSessionId) {
        this.setData({
          currentMoveSessionId: ''
        })
      }
    },

    deleteConversation(conversationId: string) {
      // 删除会话逻辑
      const conversationList = this.data.conversationList.filter(
        (item: any) => item.conversationId !== conversationId
      )
      this.setData({ conversationList })
    },

    updateConversationStickTop(conversationId: string, stickTop: boolean) {
      // 更新置顶状态
      const conversationList = this.data.conversationList.map((item: any) => {
        if (item.conversationId === conversationId) {
          return { ...item, stickTop }
        }
        return item
      })
      this.setData({ conversationList })
    },

    bindEvents() {
      // 绑定全局事件
    },

    unbindEvents() {
      // 解绑全局事件
    }
  }
})