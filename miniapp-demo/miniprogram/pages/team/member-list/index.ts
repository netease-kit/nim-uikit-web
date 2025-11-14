import { autorun } from "../../../libs/store";
import { t } from "../../../NEUIKit/utils/i18n";

Page({
  data: {
    teamId: '',
    teamMembers: [] as any[],
    team: null as any,
    canAddMember: false,
    myMemberInfo: null as any,
    loading: true,
    statusBarHeight: 0, // 状态栏高度
    // 国际化文本
    teamOwnerText: t('teamOwner'),
    teamManagerText: t('teamManager')
  },

  onLoad(options: any) {    
    // 设置状态栏高度
    this.setStatusBarHeight();
    
    if (options.teamId) {
      this.setData({
        teamId: options.teamId
      });
      
      this.initTeamData(options.teamId);
    }
  },

  onShow() {
    // 每次显示页面时更新国际化文本，以防语言切换
    this.updateI18nTexts();
  },

  /**
   * 更新国际化文本
   */
  updateI18nTexts() {
    this.setData({
      teamOwnerText: t('teamOwner'),
      teamManagerText: t('teamManager')
    });
  },

  /**
   * 设置状态栏高度
   */
  setStatusBarHeight() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 0
      });
    } catch (error) {
      console.error('获取状态栏高度失败:', error);
      this.setData({
        statusBarHeight: 44 // 默认高度
      });
    }
  },

  onUnload() {
    // 清理监听器
    if (this.teamDisposer) {
      this.teamDisposer();
    }
    if (this.teamMemberDisposer) {
      this.teamMemberDisposer();
    }
  },

  /**
   * 初始化团队数据
   */
  async initTeamData(teamId: string) {
    try {
      const store = getApp().globalData.store;
      if (!store) {
        console.error('Store not found');
        return;
      }

      // 设置自动监听
      this.setupAutorun(store, teamId);
      
      // 加载团队成员数据（需提供 queryOption）
      await store.teamMemberStore.getTeamMemberActive({
        teamId,
        queryOption: {
          limit: 200,
          roleQueryType: 0
        }
      });
      
      this.setData({ loading: false });
    } catch (error) {
      console.error('初始化团队数据失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  /**
   * 设置自动监听
   */
  setupAutorun(store: any, teamId: string) {
    // 监听团队信息变化
    this.teamDisposer = autorun(() => {
      const team = store.teamStore.teams.get(teamId);
      if (team) {
        this.setData({ team });
        this.updatePermissions(store, teamId, team);
      }
    });

    // 监听团队成员变化
    this.teamMemberDisposer = autorun(() => {
      const members = store.teamMemberStore.getTeamMember(teamId);
      if (members) {
        const sortedMembers = this.sortTeamMembers(members);
        // 为每个成员添加权限信息
        const membersWithPermissions = sortedMembers.map(member => ({
          ...member,
          canRemove: this.canRemoveMember(member)
        }));
        this.setData({ teamMembers: membersWithPermissions });
      }
    });
  },

  /**
   * 更新权限状态
   */
  updatePermissions(store: any, teamId: string, team: any) {
    const myAccountId = (store.userStore.myUserInfo && store.userStore.myUserInfo.accountId) ? store.userStore.myUserInfo.accountId : null;
    const myMemberInfoArray = store.teamMemberStore.getTeamMember(teamId, [myAccountId]);
    const myMemberInfo = (myMemberInfoArray && myMemberInfoArray.length > 0) ? myMemberInfoArray[0] : null;
    
    if (myMemberInfo) {
      const canAddMember = this.checkCanAddMember(myMemberInfo, team);
      this.setData({ 
        myMemberInfo,
        canAddMember 
      });
      
      // 重新计算所有成员的移除权限
      const { teamMembers } = this.data;
      if (teamMembers.length > 0) {
        const updatedMembers = teamMembers.map(member => ({
          ...member,
          canRemove: this.canRemoveMember(member)
        }));
        this.setData({ teamMembers: updatedMembers });
      }
    }
  },

  /**
   * 检查是否可以添加成员
   */
  checkCanAddMember(myMemberInfo: any, team: any): boolean {
    if (!myMemberInfo || !team) return false;
    
    const store = getApp().globalData.store;
    const myAccountId = (store && store.userStore && store.userStore.myUserInfo && store.userStore.myUserInfo.accountId) ? store.userStore.myUserInfo.accountId : null;
    const isOwner = team.ownerAccountId === myAccountId;
    const isManager = myMemberInfo.memberRole === 1; // V2NIM_TEAM_MEMBER_ROLE_MANAGER
    
    // 检查群组是否允许普通成员邀请
    const allowMemberInvite = team.inviteMode === 1; // 所有人可邀请
    
    return isOwner || isManager || allowMemberInvite;
  },

  /**
   * 检查是否可以移除成员
   */
  canRemoveMember(targetMember: any): boolean {
    const { myMemberInfo, team } = this.data;
    if (!myMemberInfo || !targetMember) return false;

    const store = getApp().globalData.store;
    const myAccountId = (store && store.userStore && store.userStore.myUserInfo && store.userStore.myUserInfo.accountId) ? store.userStore.myUserInfo.accountId : null;
    
    // 不能移除自己
    if (targetMember.accountId === myAccountId) return false;
    
    const isOwner = (team && team.ownerAccountId) ? team.ownerAccountId === myAccountId : false;
    const isManager = myMemberInfo.memberRole === 1;
    const targetIsOwner = (team && team.ownerAccountId) ? team.ownerAccountId === targetMember.accountId : false;
    const targetIsManager = targetMember.memberRole === 1;
    
    // 群主可以移除任何人（除了自己）
    if (isOwner) {
      return true;
    }
    
    // 管理员可以移除普通成员，但不能移除群主和其他管理员
    if (isManager) {
      return !targetIsOwner && !targetIsManager;
    }
    
    return false;
  },

  /**
   * 排序团队成员
   */
  sortTeamMembers(members: any[]): any[] {
    const { team } = this.data;
    const owner = members.filter(item => 
      (team && team.ownerAccountId) ? team.ownerAccountId === item.accountId : false
    );
    const manager = members.filter(item => 
      item.memberRole === 1 && ((team && team.ownerAccountId) ? team.ownerAccountId !== item.accountId : true)
    );
    const normal = members.filter(item => 
      item.memberRole !== 1 && ((team && team.ownerAccountId) ? team.ownerAccountId !== item.accountId : true)
    ).sort((a, b) => a.joinTime - b.joinTime);
    
    return [...owner, ...manager, ...normal];
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
  handleAddMember() {
    const { teamId } = this.data;
    wx.navigateTo({
      url: `/pages/team/add-member/index?teamId=${teamId}`,
      fail: () => {
        wx.showToast({
          title: '功能暂未实现',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 移除群成员
   */
  async handleRemoveMember(event: any) {
    const { account } = event.currentTarget.dataset;
    if (!account) return;

    const result = await new Promise((resolve) => {
      wx.showModal({
        title: '确认移除',
        content: '确定要移除该成员吗？',
        confirmText: '移除',
        confirmColor: '#e6605c',
        success: (res) => resolve(res.confirm),
        fail: () => resolve(false)
      });
    });

    if (!result) return;

    try {
      const store = getApp().globalData.store;
      const { teamId } = this.data;
      
      await store.teamMemberStore.removeTeamMemberActive({
        teamId,
        accounts: [account]
      });
      
      wx.showToast({
        title: '移除成功',
        icon: 'success'
      });
    } catch (error: any) {
      console.error('移除成员失败:', error);
      let message = '移除失败';
      
      if (error && error.code === 109306) {
        message = '无权限操作';
      }
      
      wx.showToast({
        title: message,
        icon: 'none'
      });
    }
  },

  // 存储监听器清理函数
  teamDisposer: null as any,
  teamMemberDisposer: null as any
});