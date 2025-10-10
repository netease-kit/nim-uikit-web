import { autorun } from "../../../libs/store";
import { t } from '../../../NEUIKit/utils/i18n';

Page({
  data: {
    teamId: '',
    friendList: [] as any[],
    selectedMembers: [] as string[],
    loading: true,
    statusBarHeight: 0,
    // 国际化文本
    addMemberText: t('addMemberText'),
    confirmText: t('confirmText'),
    loadingText: t('loadingText'),
    noFriendsText: t('noFriendText'),
  },

  // 自动运行监听器
  friendListDisposer: null as any,

  onLoad(options: any) {
    console.log('添加群成员页面加载', options);
    
    // 设置状态栏高度
    this.setStatusBarHeight();
    
    if (options.teamId) {
      this.setData({
        teamId: options.teamId
      });
      
      this.initFriendList(options.teamId);
    }
  },

  onShow() {
    // 每次显示页面时更新国际化文本
    this.updateI18nTexts();
  },

  onUnload() {
    // 清理监听器
    if (this.friendListDisposer) {
      this.friendListDisposer();
    }
  },

  /**
   * 更新国际化文本
   */
  updateI18nTexts() {
    this.setData({
      addMemberText: t('addMemberText'),
      confirmText: t('confirm'),
      loadingText: t('loading'),
      noFriendsText: t('noFriendText'),
      alreadyInTeamText: t('alreadyInTeam'),
      blacklistedText: t('blacklisted')
    });
  },

  /**
   * 设置状态栏高度
   */
  setStatusBarHeight() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0
    });
  },

  /**
   * 初始化好友列表
   */
  async initFriendList(teamId: string) {
    try {
      const store = getApp().globalData.store;
      if (!store) {
        console.error('Store not found');
        this.setData({ loading: false });
        return;
      }

      // 设置自动监听
      this.setupAutorun(store, teamId);
      
      // 加载团队成员数据
      await store.teamMemberStore.getTeamMemberActive({ teamId });
      
      this.setData({ loading: false });
    } catch (error) {
      console.error('初始化好友列表失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 设置自动监听
   */
  setupAutorun(store: any, teamId: string) {
    this.friendListDisposer = autorun(() => {
      try {
        // 获取好友列表
        const friends = store.uiStore.friends || [];
        
        // 获取群成员列表
        const teamMembers = store.teamMemberStore.getTeamMember(teamId) || [];
        const teamMemberIds = teamMembers.map((member: any) => member.accountId);
        
        // 获取黑名单
        const blacklist = store.relationStore.blacklist || [];
        
        // 处理好友列表
        const friendList = friends.map((friend: any) => {
          const isInTeam = teamMemberIds.includes(friend.accountId);
          const isBlacklisted = blacklist.includes(friend.accountId);
          
          // 使用store.uiStore.getAppellation获取正确的昵称
          const appellation = (store && store.uiStore && store.uiStore.getAppellation) ? store.uiStore.getAppellation({ account: friend.accountId }) : null;
          const displayName = appellation || friend.nick || friend.accountId;
          
          return {
            account: friend.accountId,
            avatar: friend.avatar,
            nick: displayName,
            isInTeam,
            isBlacklisted,
            selected: isInTeam, // 现有群成员默认勾选
            disabled: isInTeam || isBlacklisted // 群成员和黑名单用户禁止编辑
          };
        });
        
        // 初始化已选择的成员列表（包含现有群成员）
        const initialSelectedMembers = friendList
          .filter((friend: any) => friend.selected)
          .map((friend: any) => friend.account);
        
        this.setData({
          friendList,
          selectedMembers: initialSelectedMembers
        });
        
        console.log('好友列表更新完成:', friendList.length);
        console.log('初始选中成员:', initialSelectedMembers.length);
      } catch (error) {
        console.error('更新好友列表失败:', error);
      }
    });
  },

  /**
   * 选择/取消选择好友
   */
  handleSelectFriend(event: any) {
    const { account } = event.currentTarget.dataset;
    const { friendList, selectedMembers } = this.data;
    
    // 查找目标好友
    const targetFriend = friendList.find((friend: any) => friend.account === account);
    if (!targetFriend || targetFriend.disabled) {
      return; // 如果是禁用状态（群成员或黑名单），不允许操作
    }
    
    // 更新好友选中状态
    const updatedFriendList = friendList.map((friend: any) => {
      if (friend.account === account) {
        return { ...friend, selected: !friend.selected };
      }
      return friend;
    });
    
    // 更新已选择的成员列表
    const updatedSelectedMembers = updatedFriendList
      .filter((friend: any) => friend.selected)
      .map((friend: any) => friend.account);
    
    this.setData({
      friendList: updatedFriendList,
      selectedMembers: updatedSelectedMembers
    });
  },

  /**
   * 确认添加群成员
   */
  async handleConfirm() {
    const { teamId, selectedMembers, friendList } = this.data;
    
    // 过滤出新添加的成员（排除现有群成员）
    const newMembers = selectedMembers.filter(account => {
      const friend = friendList.find((f: any) => f.account === account);
      return friend && !friend.isInTeam;
    });
    
    if (newMembers.length === 0) {
      wx.showToast({
        title: '请选择要添加的成员',
        icon: 'none'
      });
      return;
    }
    
    // 检查群成员数量限制
    if (newMembers.length > 200) {
      wx.showToast({
        title: '最多只能选择200个成员',
        icon: 'none'
      });
      return;
    }
    
    try {
      const store = getApp().globalData.store;
      if (!store) {
        wx.showToast({
          title: 'Store not found',
          icon: 'none'
        });
        return;
      }

      wx.showLoading({
        title: '添加中...'
      });
      
      // 调用添加群成员接口（只添加新成员）
      await store.teamMemberStore.addTeamMemberActive({
        teamId,
        accounts: newMembers
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
    } catch (error: any) {
      wx.hideLoading();
      console.error('添加群成员失败:', error);
      
      let errorMessage = '添加失败';
      if (error && error.code) {
        switch (error.code) {
          case 109306:
            errorMessage = '无权限操作';
            break;
          default:
            errorMessage = '添加群成员失败';
            break;
        }
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none'
      });
    }
  },

  /**
   * 返回上一页
   */
  handleBack() {
    wx.navigateBack();
  }
});