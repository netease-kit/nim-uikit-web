import { autorun } from "../../../libs/store";

Component({
  properties: {
    currentPath: {
      type: String,
      value: '/conversation'
    },
    showTabBar: {
      type: Boolean,
      value: true
    }
  },

  data: {
    conversationUnread: false,
    contactsUnread: false,
    tabs: [
      {
        path: '/pages/conversation/conversation-list/index',
        icon: 'https://yx-web-nosdn.netease.im/common/e2b7e14443a6ee276e11e38d9d9e7276/conversation.png',
        selectedIcon: 'https://yx-web-nosdn.netease.im/common/47898e58a1c482ccbdcf8f0112cb77a3/conversation-selected.png',
        text: '消息',
        key: '/pages/conversation/conversation-list/index'
      },
      {
        path: '/pages/contacts/index/index',
        icon: 'https://yx-web-nosdn.netease.im/common/eb026b4b160c7ed0439b296b2687c8b5/contact.png',
        selectedIcon: 'https://yx-web-nosdn.netease.im/common/e1162ff197b47c5a11ce07dee2be94d3/contact-selected.png',
        text: '通讯录',
        key: '/pages/contacts/index/index'
      },
      {
        path: '/pages/user/my/index',
        icon: 'https://yx-web-nosdn.netease.im/common/b8a1422035778fe60f564508d7dc3118/me.png',
        selectedIcon: 'https://yx-web-nosdn.netease.im/common/b2df82891a6115ea0d9b474f748932be/me-selected.png',
        text: '我的',
        key: '/pages/user/my/index'
      }
    ],
    disposer: null as (() => void) | null
  },

  lifetimes: {
    attached() {
      this._setupAutorun();
    },
    detached() {
      this._cleanupAutorun();
    }
  },

  methods: {
    _setupAutorun() {
      const app = getApp();
      
      if (!(app.globalData && app.globalData.store)) {
        return;
      }

      const disposer = autorun(() => {
        const store = app.globalData.store;
        const enableV2CloudConversation = (store && store.sdkOptions && store.sdkOptions.enableV2CloudConversation) ? store.sdkOptions.enableV2CloudConversation : false;

        // 会话未读数
        const conversationUnread = enableV2CloudConversation
          ? !!(store && store.conversationStore && store.conversationStore.totalUnreadCount)
          : !!(store && store.localConversationStore && store.localConversationStore.totalUnreadCount);

        // 通讯录验证消息未读数
        const contactsUnread = !!(store && store.sysMsgStore && store.sysMsgStore.getTotalUnreadMsgsCount && store.sysMsgStore.getTotalUnreadMsgsCount());

        this.setData({
          conversationUnread,
          contactsUnread
        });
      });

      this.setData({ disposer });
    },

    _cleanupAutorun() {
      const { disposer } = this.data;
      if (disposer) {
        disposer();
        this.setData({ disposer: null });
      }
    },

    onTabClick(e: any) {
      const { path } = e.currentTarget.dataset;
      this.triggerEvent('tabChange', { path });
    },

    isActive(path: string) {
      return this.properties.currentPath === path;
    },

    getTabIcon(tab: any) {
      return this.isActive(tab.path) ? tab.selectedIcon : tab.icon;
    },

    shouldShowUnread(key: string) {
      if (key === '/pages/conversation/conversation-list/index') {
        return this.data.conversationUnread;
      }
      if (key === '/pages/contacts/index/index') {
        return this.data.contactsUnread;
      }
      return false;
    }
  }
});