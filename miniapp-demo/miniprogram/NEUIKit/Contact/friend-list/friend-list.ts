import { autorun } from '../../../libs/store';
import { t } from '../../utils/i18n';
import { friendGroupByPy } from '../../utils/friend';

Component({
  properties: {
    extClass: {
      type: String,
      value: ''
    }
  },

  data: {
    friendGroupList: [] as any[],
    statusBarHeight: 0, // 状态栏高度
    disposer: null as any,
    
    // 国际化文本
    friendListText: t('friendListText'),
    noFriendText: t('noFriendText')
  },

  lifetimes: {
    attached() {
      // 初始化nim和store实例
      const app = getApp() as any;
      const { nim, store } = app.globalData;
      
      // 将nim、store对象存储为不需要监听变化的实例属性
      (this as any).nimInstance = nim;
      (this as any).storeInstance = store;
      
      if (store) {
        // 监听好友列表变化
        const disposer = autorun(() => {
          const friendList = (store && store.uiStore && store.uiStore.friends && store.uiStore.friends
            .filter((item: any) => !(store && store.relationStore && store.relationStore.blacklist && store.relationStore.blacklist.includes(item.accountId)))) || [];
          
          // 转换为分组所需的数据格式
          const friendData = friendList.map((item: any) => ({
            accountId: item.accountId,
            nick: item.nick || item.accountId,
            avatar: item.avatar,
            appellation: (store && store.uiStore && store.uiStore.getAppellation && store.uiStore.getAppellation({ account: item.accountId })) || item.nick || item.accountId
          }));
          
          // 按拼音分组
          const friendGroupList = friendGroupByPy(
            friendData,
            {
              firstKey: 'appellation'
            },
            false
          );
          
          this.setData({ friendGroupList });
          console.log('好友分组列表更新:', friendGroupList);
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


    handleFriendClick(event: any) {
      const { friend } = event.currentTarget.dataset;
      console.log('点击好友:', friend);

      if (!friend) return;
      
      // 跳转到好友卡片页面
      wx.navigateTo({
        url: `/pages/friend/friend-card/index?accountId=${friend.accountId}`
      });
    }
  }
});