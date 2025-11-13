import { t } from "../../../utils/i18n";
import { autorun } from "../../../../libs/store"

Component({
  data: {
    inputFocus: false,
    searchText: '',
    searchResult: [] as any[],
    searchList: [] as any[],
    statusBarHeight: 0, // 状态栏高度
    
    // 国际化文本
    searchTitleText: '搜索',
    searchPlaceholder: '搜索',
    friendText: '好友',
    teamText: '群组',
    searchResultNullText: '无搜索结果'
  },

  lifetimes: {
    attached() {
      // 获取系统信息，设置状态栏高度
      this.setStatusBarHeight();

      // 监听全局数据变化
      const { store } = getApp<IAppOption>().globalData;
      // 将store对象存储为实例属性，便于后续使用
      (this as any).store = store;
      
      const searchListWatcher = autorun(() => {
        const friends = (store && store.uiStore && store.uiStore.friends ? store.uiStore.friends
        .filter((item: { accountId: any; }) => !(store && store.relationStore && store.relationStore.blacklist && store.relationStore.blacklist.includes(item.accountId)))
        .map((item: { accountId: any; }) => {
          const user = (store && store.userStore && store.userStore.users && store.userStore.users.get(item.accountId)) || {
            accountId: "",
            name: "",
            createTime: Date.now(),
          };
          return {
            ...item,
            ...user,
          }
        }) : []);
        const teamList = (store && store.uiStore && store.uiStore.teamList) || [];

        this.setData({
          searchList: [
            {
              id: "friends",
              list: friends,
            },
            {
              id: "groups",
              list: teamList,
            },
          ].filter((item) => !!item.list.length)
        })
      })

      this.setData({ inputFocus: true, searchListWatcher })
    },
    detached() {
      if (this.data.searchListWatcher) {
        this.data.searchListWatcher();
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
      } catch (error) {
        console.error('获取系统信息失败:', error);
        // 设置默认值
        this.setData({
          statusBarHeight: 44
        });
      }
    },

    onInput(e: any) {
      const searchText = e.detail.value
      this.setData({ searchText })
      this.performSearch(searchText)
    },

    onInputFocus() {
      this.setData({ inputFocus: true })
    },

    onInputBlur() {
      this.setData({ inputFocus: false })
    },

    clearInput() {
      this.setData({
        searchText: '',
        searchResult: []
      })
    },

    performSearch(keyword: string) {
      const res: { title?: string; renderKey: string }[] = [];


  if (keyword) {
    const finalSections = this.data.searchList
      .map((item) => {
        if (item.id === "friends") {
          return {
            ...item,
            list: (item.list && item.list.filter) ? item.list.filter((item: any) => {
              return (
                (item.alias && item.alias.includes && item.alias.includes(keyword)) ||
                (item.name && item.name.includes && item.name.includes(keyword)) ||
                (item.accountId && item.accountId.includes && item.accountId.includes(keyword))
              );
            }) : [],
          };
        }

        if (item.id === "groups") {
          return {
            ...item,
            list: (item.list && item.list.filter) ? item.list.filter((item: any) => {
              return (item.name || item.teamId).includes(keyword);
            }) : [],
          };
        }

        return { ...item };
      })
      .filter((item) => !!(item.list && item.list.length));

    finalSections.forEach((item) => {
      if (item.id === "friends") {
        res.push({
          title: "friends",
          renderKey: "friends",
        });
        item.list.forEach((item: any) => {
          res.push({
            ...item,
            renderKey: item.accountId,
          });
        });
      } else if (item.id === "groups") {
        res.push({
          title: "groups",
          renderKey: "groups",
        });
        item.list.forEach((item: any) => {
          res.push({
            ...item,
            renderKey: item.teamId,
          });
        });
      }
    });
  }
  this.setData({ searchResult: res })
    }
  }
})