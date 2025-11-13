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
    validList: [] as any[],
    statusBarHeight: 0, // 状态栏高度
    disposer: null as any,
    applyFriendLoading: false, // 操作加载状态
    
    // 国际化文本
    validMsgText: t('validMsgText'),
    defaultValidMsgText: t('defaultValidMsgText'),
    acceptText: t('acceptText'),
    rejectText: t('rejectText'),
    acceptedText: t('acceptedText'),
    rejectedText: t('rejectedText'),
    noValidMsgText: t('noValidMsgText'),
    validEmptyText: t('validEmptyText'), // 验证消息空状态文本
    applyFriendText: t('applyFriendText'),
    acceptResultText: t('acceptResultText'),
    rejectResultText: t('rejectResultText'),
    beRejectResultText: t('beRejectResultText'),
    acceptFailedText: t('acceptFailedText'),
    rejectFailedText: t('rejectFailedText'),
    passFriendAskText: t('passFriendAskText')
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
        // 监听验证消息列表变化
        const disposer = autorun(() => {
          const validList = (store && store.sysMsgStore && store.sysMsgStore.friendApplyMsgs) ? store.sysMsgStore.friendApplyMsgs : [];
          
          // 获取用户信息并处理数据
          const processedList = validList.map((item: any) => {
            // 从store中直接获取用户信息（同步方式）
            const applicantUser = (store && store.userStore && store.userStore.users && store.userStore.users.get) ? store.userStore.users.get(item.applicantAccountId) : null;
            const recipientUser = (store && store.userStore && store.userStore.users && store.userStore.users.get) ? store.userStore.users.get(item.recipientAccountId) : null;
            
            // 如果用户信息不存在，异步获取
            if (!applicantUser && item.applicantAccountId) {
              if (store && store.userStore && store.userStore.getUserActive) {
                store.userStore.getUserActive(item.applicantAccountId);
              }
            }
            if (!recipientUser && item.recipientAccountId) {
              if (store && store.userStore && store.userStore.getUserActive) {
                store.userStore.getUserActive(item.recipientAccountId);
              }
            }
            
            return {
              ...item,
              applicantUser,
              recipientUser,
              // 判断是否是我发起的申请
              isMeApplicant: item.applicantAccountId === (store && store.userStore && store.userStore.myUserInfo && store.userStore.myUserInfo.accountId) ? store.userStore.myUserInfo.accountId : null,
              // 格式化时间
              timeStr: this.formatTime(item.timestamp || item.time || Date.now())
            };
          });
          
          // 按时间倒序排列
          const sortedValidList = processedList.sort((a: any, b: any) => {
            return (b.timestamp || b.time || 0) - (a.timestamp || a.time || 0);
          });
          
          this.setData({ validList: sortedValidList });
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

    /** 是否是我发起的申请 */
    isMeApplicant(data: any) {
      const store = (this as any).storeInstance;
      return data.applicantAccountId === (store && store.userStore && store.userStore.myUserInfo && store.userStore.myUserInfo.accountId) ? store.userStore.myUserInfo.accountId : null;
    },

    formatTime(timestamp: number): string {
      // 使用统一的时间格式化函数，避免toLocaleTimeString等可能导致英文显示的API
      const { formatMessageTime } = require('../../utils/date');
      return formatMessageTime(timestamp);
    },

    goBack() {
      wx.navigateBack();
    },

    handleValidMsgItemClick(event: any) {
      const { item } = event.currentTarget.dataset;
      if (!item) return;
      
      // 标记为已读
      this.markAsRead(item);
    },

    async handleAcceptApply(event: any) {
      event.stopPropagation();
      const { item } = event.currentTarget.dataset;
      if (!item || this.data.applyFriendLoading) return;
      
      this.setData({ applyFriendLoading: true });
      
      try {
        const store = (this as any).storeInstance;
        const nim = (this as any).nimInstance;
        
        if (!store || !nim) {
          console.error('store或nim实例不存在');
          return;
        }
        
        // 使用store的方法接受好友申请
        await store.friendStore.acceptAddApplicationActive(item);
        
        wx.showToast({
          title: this.data.acceptedText,
          icon: 'success'
        });
        
        // 发送通过好友申请的消息
        try {
          const textMsg = nim.V2NIMMessageCreator.createTextMessage(
            this.data.passFriendAskText
          );
          
          await store.msgStore.sendMessageActive({
            msg: textMsg,
            conversationId: nim.V2NIMConversationIdUtil.p2pConversationId(
              item.operatorAccountId || item.applicantAccountId
            ),
          });
        } catch (msgError) {}
        
      } catch (error) {
        wx.showToast({
          title: this.data.acceptFailedText,
          icon: 'error'
        });
      } finally {
        this.setData({ applyFriendLoading: false });
      }
    },

    async handleRejectApply(event: any) {
      event.stopPropagation();
      const { item } = event.currentTarget.dataset;
      if (!item || this.data.applyFriendLoading) return;
      
      this.setData({ applyFriendLoading: true });
      
      try {
        const store = (this as any).storeInstance;
        
        if (!store) {
          console.error('store实例不存在');
          return;
        }
        
        // 使用store的方法拒绝好友申请
        await store.friendStore.rejectAddApplicationActive(item);
        
        wx.showToast({
          title: this.data.rejectedText,
          icon: 'success'
        });
        
      } catch (error) {
        console.error('拒绝好友申请失败:', error);
        wx.showToast({
          title: this.data.rejectFailedText,
          icon: 'error'
        });
      } finally {
        this.setData({ applyFriendLoading: false });
      }
    },

    async markAsRead(item: any) {
      try {
        const nim = (this as any).nimInstance;
        if (!nim || item.read) {
          return;
        }
        
        // 标记系统消息为已读
        await nim.markSysMsgRead({
          idServer: item.idServer
        });
        
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }
  }
});