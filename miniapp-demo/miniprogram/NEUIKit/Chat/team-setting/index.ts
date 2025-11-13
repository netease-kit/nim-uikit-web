import { autorun } from "../../../libs/store";

Component({
  properties: {
    // 群组ID
    teamId: {
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
    }
  },

  data: {
    // 群组信息
    team: null as any,
    // 群成员列表
    teamMembers: [] as any[],
    // 会话信息
    conversation: null as any,
    // 群消息免打扰模式
    teamMuteMode: null as any,
    // 是否免打扰
    isMute: false,
    // 是否置顶
    isStickTop: false,
    // 状态栏高度
    statusBarHeight: 0,
    // 当前用户是否是群主
    isTeamOwner: false,
    // 当前用户是否是管理员
    isTeamManager: false,
    // 是否可以添加成员
    canAddMember: false,
    // 我在群里的昵称
    myNickname: '',
    // 群是否被禁言
    isTeamBanned: false,
    // 确认对话框相关
    showConfirmModal: false,
    confirmTitle: '',
    
    // autorun disposers
    teamDisposer: null as any,
    conversationDisposer: null as any,
    confirmMessage: '',
    confirmAction: '',
    // 是否正在加载
    loading: false,
    loadingText: '加载中...',
    // 计算属性
    canManageTeam: false,
    canEditTeamInfo: false,
    showDismissButton: false,
    showLeaveButton: false,
    avatarColor: '#ccc',
    displayName: '群'
  },

  observers: {
    'teamId': function(teamId: string) {
      if (teamId) {
        // 先清理之前的监听
        if (this.data.teamDisposer) {
          this.data.teamDisposer();
          this.setData({ teamDisposer: null });
        }
        if (this.data.conversationDisposer) {
          this.data.conversationDisposer();
          this.setData({ conversationDisposer: null });
        }
        
        // 重新设置监听（teamId变化时）- 异步调用
        this.setupAutorun().catch((error) => {
          console.error('Setup autorun failed:', error);
        });
      }
    }
  },

  methods: {
    /**
     * 加载群免打扰状态
     */
    async loadTeamMuteStatus() {
      const { teamId } = this.properties;
      
      try {
        const app = getApp<IAppOption>();
        const { store } = app.globalData;
        
        if (!store) return;

        const muteMode = await store.teamStore.getTeamMessageMuteModeActive(teamId, 1);
        this.setData({
          isMute: muteMode === 1 // 1表示免打扰开启
        });

      } catch (error) {
        console.error('获取群免打扰状态失败:', error);
      }
    },

    /**
     * 处理群信息点击
     */
    handleInfoClick() {
      const { canEditTeamInfo, team } = this.data;
      
      if (!canEditTeamInfo) {
        this.showError('您没有权限修改群信息');
        return;
      }

      // 跳转到群信息编辑页面
      wx.navigateTo({
        url: `/pages/team-info-edit/index?teamId=${(team && team.teamId) ? team.teamId : this.properties.teamId}`,
        fail: (err) => {
          console.error('跳转到群信息编辑页面失败:', err);
          this.showError('跳转失败，请重试');
        }
      });
    },

    /**
     * 处理群成员列表点击
     */
    handleMemberListClick() {
      this.handleViewTeamMembers();
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
    handleAddTeamMember() {
      const { teamId } = this.properties;
      
      wx.navigateTo({
        url: `/pages/team/add-member/index?teamId=${teamId}`,
        fail: (err) => {
          console.error('跳转到添加群成员页面失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },

    /**
     * 查看群成员
     */
    handleViewTeamMembers() {
      const { teamId } = this.properties;
      
      wx.navigateTo({
        url: `/pages/team/member-list/index?teamId=${teamId}`,
        fail: (err) => {
          console.error('跳转到群成员列表页面失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },

    /**
     * 处理群免打扰状态变化
     */
    async handleTeamMuteChange(event: any) {
      const { value } = event.detail;
      const { teamId } = this.properties;
      
      try {
        this.setData({ loading: true, loadingText: '设置中...' });
        
        const app = getApp<IAppOption>();
        const { store } = app.globalData;
        
        if (!store) {
          throw new Error('Store未初始化');
        }

        // 设置群免打扰
        await store.teamStore.setTeamMessageMuteModeActive(
          teamId,
          1, // V2NIMTeamType.V2NIM_TEAM_TYPE_ADVANCED
          value ? 1 : 0 // 1表示开启免打扰，0表示关闭
        );

        this.setData({
          isMute: value,
          loading: false
        });

        wx.showToast({
          title: value ? '已开启免打扰' : '已关闭免打扰',
          icon: 'success'
        });

      } catch (error) {
        console.error('设置群免打扰失败:', error);
        this.setData({ loading: false });
        
        wx.showToast({
          title: '设置失败',
          icon: 'error'
        });
      }
    },

    /**
     * 处理置顶聊天切换
     */
    handleStickTopChange: function(event: any) {
      const debouncedHandler = this.debounce(async (event: any) => {
        const { value } = event.detail;
        const { conversationId } = this.properties;
        
        try {
          this.setData({ loading: true, loadingText: '设置中...' });
          
          const app = getApp<IAppOption>();
          const { store } = app.globalData;
          
          if (!store) {
            throw new Error('Store未初始化');
          }

          // 设置置顶
          if (store.conversationStore) {
            await store.conversationStore.stickTopConversationActive(conversationId, value);
          } else if (store.localConversationStore) {
            await store.localConversationStore.stickTopConversationActive(conversationId, value);
          }

          this.setData({
            isStickTop: value,
            loading: false
          });

          this.showSuccess(value ? '已置顶' : '已取消置顶');

        } catch (error) {
          console.error('设置置顶失败:', error);
          this.setData({ loading: false });
          
          this.showError('设置失败');
        }
      }, 300);
      
      return debouncedHandler.call(this, event);
    },

    /**
     * 退出群聊
     */
    handleLeaveTeam() {
      this.setData({
        showConfirmModal: true,
        confirmTitle: '退出群聊',
        confirmMessage: '确定要退出这个群聊吗？',
        confirmAction: 'leave'
      });
    },

    /**
     * 解散群聊（仅群主可用）
     */
    handleDismissTeam() {
      this.setData({
        showConfirmModal: true,
        confirmTitle: '解散群聊',
        confirmMessage: '确定要解散这个群聊吗？解散后所有成员都将被移除。',
        confirmAction: 'dismiss'
      });
    },

    /**
     * 确认对话框 - 取消
     */
    handleModalCancel() {
      this.setData({
        showConfirmModal: false,
        confirmTitle: '',
        confirmMessage: '',
        confirmAction: ''
      });
    },

    /**
     * 确认对话框 - 确认
     */
    async handleModalConfirm() {
      const { confirmAction } = this.data;
      
      this.setData({ showConfirmModal: false });
      
      if (confirmAction === 'leave') {
        await this.executeLeaveTeam();
      } else if (confirmAction === 'dismiss') {
        await this.executeDismissTeam();
      }
    },

    /**
     * 执行退出群聊
     */
    async executeLeaveTeam() {
      const { teamId } = this.properties;
      
      try {
        this.setData({ loading: true, loadingText: '退出中...' });
        
        const app = getApp<IAppOption>();
        const { store } = app.globalData;
        
        if (!store) {
          throw new Error('Store未初始化');
        }

        await store.teamStore.leaveTeamActive(teamId);
        
        this.setData({ loading: false });
        
        wx.showToast({
          title: '已退出群聊',
          icon: 'success'
        });

        // 返回会话列表
        setTimeout(() => {
          wx.navigateBack({ delta: 2 });
        }, 1500);

      } catch (error) {
        console.error('退出群聊失败:', error);
        this.setData({ loading: false });
        
        wx.showToast({
          title: '退出失败',
          icon: 'error'
        });
      }
    },

    /**
     * 执行解散群聊
     */
    async executeDismissTeam() {
      const { teamId } = this.properties;
      
      try {
        this.setData({ loading: true, loadingText: '解散中...' });
        
        const app = getApp<IAppOption>();
        const { store } = app.globalData;
        
        if (!store) {
          throw new Error('Store未初始化');
        }

        await store.teamStore.dismissTeamActive(teamId);
        
        this.setData({ loading: false });
        
        wx.showToast({
          title: '群聊已解散',
          icon: 'success'
        });

        // 返回会话列表
        setTimeout(() => {
          wx.navigateBack({ delta: 2 });
        }, 1500);

      } catch (error) {
        console.error('解散群聊失败:', error);
        this.setData({ loading: false });
        
        wx.showToast({
          title: '解散失败',
          icon: 'error'
        });
      }
    },

    /**
     * 验证输入数据
     */
    validateInput(value: string, type: 'name' | 'intro' | 'nickname'): { valid: boolean; message?: string } {
      if (!value || value.trim() === '') {
        return { valid: false, message: '内容不能为空' };
      }

      switch (type) {
        case 'name':
          if (value.length > 30) {
            return { valid: false, message: '群名称不能超过30个字符' };
          }
          break;
        case 'intro':
          if (value.length > 200) {
            return { valid: false, message: '群介绍不能超过200个字符' };
          }
          break;
        case 'nickname':
          if (value.length > 20) {
            return { valid: false, message: '昵称不能超过20个字符' };
          }
          break;
      }

      return { valid: true };
    },

    /**
     * 显示错误提示
     */
    showError(message: string) {
      wx.showToast({
        title: message,
        icon: 'error',
        duration: 2000
      });
    },

    /**
     * 显示成功提示
     */
    showSuccess(message: string) {
      wx.showToast({
        title: message,
        icon: 'success',
        duration: 1500
      });
    },

    /**
     * 检查网络状态
     */
    async checkNetworkStatus(): Promise<boolean> {
      try {
        const networkType = await wx.getNetworkType();
        if (networkType.networkType === 'none') {
          this.showError('网络连接失败，请检查网络设置');
          return false;
        }
        return true;
      } catch (error) {
        console.warn('获取网络状态失败:', error);
        return true; // 默认认为网络正常
      }
    },

    /**
     * 防抖处理
     */
    debounce(func: Function, wait: number) {
      let timeout: number;
      return function(this: any, ...args: any[]) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    },

    /**
     * 节流处理
     */
    throttle(func: Function, limit: number) {
      let inThrottle: boolean;
      return function(this: any, ...args: any[]) {
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    /**
     * 安全执行异步操作
     */
    async safeAsyncOperation(operation: () => Promise<void>, errorMessage: string = '操作失败') {
      try {
        await operation();
      } catch (error) {
        console.error(errorMessage, error);
        this.showError(errorMessage);
      }
    },

    /**
     * 检查组件是否已销毁
     */
    isComponentDestroyed(): boolean {
      return !this.data || this.data === null;
    },

    /**
     * 编辑群名称
     */
    handleEditTeamName() {
      const { team, canEditTeamInfo } = this.data;
      
      if (!canEditTeamInfo) {
        this.showError('您没有权限修改群信息');
        return;
      }

      wx.showModal({
        title: '修改群名称',
        editable: true,
        placeholderText: '请输入群名称',
        content: (team && team.name) ? team.name : '',
        success: (res) => {
          if (res.confirm) {
            const validation = this.validateInput(res.content || '', 'name');
            if (!validation.valid) {
              this.showError(validation.message || '输入无效');
              return;
            }
            this.updateTeamName(res.content);
          }
        }
      });
    },

    /**
     * 编辑群介绍
     */
    handleEditTeamIntro() {
      const { team, canEditTeamInfo } = this.data;
      
      if (!canEditTeamInfo) {
        this.showError('您没有权限修改群信息');
        return;
      }

      wx.showModal({
        title: '修改群介绍',
        editable: true,
        placeholderText: '请输入群介绍',
        content: (team && team.intro) ? team.intro : '',
        success: (res) => {
          if (res.confirm) {
            const validation = this.validateInput(res.content || '', 'intro');
            if (!validation.valid) {
              this.showError(validation.message || '输入无效');
              return;
            }
            this.updateTeamIntro(res.content || '');
          }
        }
      });
    },

    /**
     * 编辑我在群里的昵称
     */
    handleEditMyNickname() {
      const { myNickname } = this.data;
      wx.showModal({
        title: '修改群昵称',
        editable: true,
        placeholderText: '请输入群昵称',
        content: myNickname || '',
        success: (res) => {
          if (res.confirm) {
            const validation = this.validateInput(res.content || '', 'nickname');
            if (!validation.valid) {
              this.showError(validation.message || '输入无效');
              return;
            }
            this.updateMyNickname(res.content || '');
          }
        }
      });
    },

    /**
     * 处理消息提醒开关
     */
    handleNotificationChange: function(event: any) {
      const debouncedHandler = this.debounce(async (event: any) => {
        const { value } = event.detail;
        // 消息提醒开关与免打扰状态相反
        await this.handleTeamMuteChange({ detail: { value: !value } });
      }, 300);
      
      return debouncedHandler.call(this, event);
    },

    /**
     * 处理群禁言开关
     */
    handleTeamMuteAllChange: function(event: any) {
      const debouncedHandler = this.debounce(async (event: any) => {
        const { value } = event.detail;
        
        if (!this.data.canManageTeam) {
          this.showError('您没有权限管理群设置');
          return;
        }

        try {
          const app = getApp<IAppOption>();
          const { store, nim } = app.globalData;
          const { teamId } = this.properties;

          if (!store) {
            throw new Error('Store未初始化');
          }

          this.setData({ loading: true, loadingText: value ? '开启群禁言中...' : '关闭群禁言中...' });

          // 使用store方法设置群禁言状态，与Vue版本保持一致
          await store.teamStore.setTeamChatBannedActive({
            teamId,
            chatBannedMode: value ? 1 : 0 // 1: V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL, 0: V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
          });

          this.setData({
            isTeamBanned: value,
            loading: false
          });

          this.showSuccess(value ? '已开启群禁言' : '已关闭群禁言');

        } catch (error: any) {
          console.error('设置群禁言失败:', error);
          this.setData({
            loading: false,
            isTeamBanned: !value // 恢复原状态
          });
          
          // 根据错误码提供更详细的错误信息
          let errorMessage = '设置失败，请重试';
          if (error && typeof error === 'object' && 'code' in error) {
            switch (error.code) {
              case 109432:
                errorMessage = '您没有权限管理群设置';
                break;
              case 109306:
                errorMessage = '权限不足，无法执行此操作';
                break;
              default:
                errorMessage = error.message || '设置失败，请重试';
                break;
            }
          } else if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = error.message;
          }
          
          this.showError(errorMessage);
        }
      }, 300);
      
      return debouncedHandler.call(this, event);
    },

    /**
     * 更新群名称
     */
    async updateTeamName(name: string) {
      try {
        // 检查网络状态
        const hasNetwork = await this.checkNetworkStatus();
        if (!hasNetwork) {
          return;
        }

        const app = getApp<IAppOption>();
        const { nim } = app.globalData;
        const { teamId } = this.properties;

        this.setData({ loading: true, loadingText: '更新群名称中...' });

        await nim.V2NIMTeamService.updateTeam({
          teamId,
          name
        });

        // 更新本地数据
        const { team } = this.data;
        this.setData({
          team: { ...team, name },
          loading: false
        });

        this.showSuccess('群名称已更新');

      } catch (error) {
        console.error('更新群名称失败:', error);
        this.setData({ loading: false });
        this.showError('更新失败，请重试');
      }
    },

    /**
     * 更新群介绍
     */
    async updateTeamIntro(intro: string) {
      try {
        // 检查网络状态
        const hasNetwork = await this.checkNetworkStatus();
        if (!hasNetwork) {
          return;
        }

        const app = getApp<IAppOption>();
        const { nim } = app.globalData;
        const { teamId } = this.properties;

        this.setData({ loading: true, loadingText: '更新群介绍中...' });

        await nim.V2NIMTeamService.updateTeam({
          teamId,
          intro
        });

        // 更新本地数据
        const { team } = this.data;
        this.setData({
          team: { ...team, intro },
          loading: false
        });

        this.showSuccess('群介绍已更新');

      } catch (error) {
        console.error('更新群介绍失败:', error);
        this.setData({ loading: false });
        this.showError('更新失败，请重试');
      }
    },

    /**
     * 更新我在群里的昵称
     */
    async updateMyNickname(nickname: string) {
      try {
        // 检查网络状态
        const hasNetwork = await this.checkNetworkStatus();
        if (!hasNetwork) {
          return;
        }

        const app = getApp<IAppOption>();
        const { store } = app.globalData;
        const { teamId } = this.properties;

        if (!store) {
          this.showError('Store实例未初始化');
          return;
        }

        this.setData({ loading: true, loadingText: '更新群昵称中...' });

        // 使用store的updateMyMemberInfoActive方法，与Vue版本保持一致
        await store.teamMemberStore.updateMyMemberInfoActive({
          teamId,
          memberInfo: {
            teamNick: nickname.trim()
          }
        });

        this.setData({
          myNickname: nickname,
          loading: false
        });

        this.showSuccess('群昵称已更新');

      } catch (error) {
        console.error('更新群昵称失败:', error);
        this.setData({ loading: false });
        
        // 提供更详细的错误信息
        if (error && typeof error === 'object' && 'code' in error) {
          switch (error.code) {
            case 403:
            case 'NO_PERMISSION':
            case 109306:
              this.showError('没有权限修改群昵称');
              break;
            case 'NETWORK_ERROR':
              this.showError('网络连接失败，请检查网络');
              break;
            default:
              const errorMessage = 'message' in error && typeof error.message === 'string' ? error.message : '请重试';
              this.showError(`更新失败: ${errorMessage}`);
              break;
          }
        } else {
          this.showError('更新失败，请重试');
        }
      }
    },

    /**
     * 生成头像背景颜色
     */
    generateAvatarColor(teamId: string): string {
      if (!teamId) {
        return '#ccc';
      }

      // 参考avatar组件的颜色生成算法
      const colors = [
        '#60B2FF', '#6AC4DC', '#73E6A6', '#A6E663',
        '#F2C94C', '#F2994A', '#EB5757', '#BB6BD9',
        '#9B59B6', '#3498DB', '#1ABC9C', '#2ECC71'
      ];
      
      let hash = 0;
      for (let i = 0; i < teamId.length; i++) {
        hash = teamId.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const colorIndex = Math.abs(hash) % colors.length;
      return colors[colorIndex];
    },

    /**
     * 获取显示名称（teamId后两位）
     */
    getDisplayName(teamId: string): string {
      if (!teamId) {
        return '群';
      }
      // 取teamId的后两位数字/字符
      return teamId.slice(-2);
    },

    /**
     * 获取状态栏高度
     */
    getStatusBarHeight() {
      try {
        const systemInfo = wx.getSystemInfoSync();
        this.setData({
          statusBarHeight: systemInfo.statusBarHeight || 0
        });
      } catch (error) {
        console.error('获取系统信息失败:', error);
        this.setData({
          statusBarHeight: 44 // 默认高度
        });
      }
    },

    /**
     * 初始化团队数据（参考React版本的实现）
     */
    async initTeamData(teamId: string, store: any) {
      try {
        // 主动获取团队信息
        await store.teamStore.getTeamActive(teamId).catch((err: any) => {
          console.warn('获取群组失败：', err.toString());
        });

        // 主动获取团队成员数据
        await store.teamMemberStore.getTeamMemberActive({
          teamId: teamId,
          type: 1,
          queryOption: {
            limit: 200, // 默认限制200个成员
            roleQueryType: 0,
          },
        }).catch((err: any) => {
          console.warn('获取群组成员失败：', err.toString());
        });
      } catch (error) {
        console.error('初始化团队数据失败:', error);
      }
    },

    /**
     * 设置autorun监听
     */
    async setupAutorun() {
      const app = getApp() as any;
      const { nim, store } = app.globalData;
      
      if (!store) {
        console.error('Store实例未初始化');
        return;
      }

      const teamId = this.properties.teamId;
      if (!teamId) {
        console.error('teamId为空，无法设置监听');
        return;
      }

      // 主动获取团队信息和成员数据（参考React版本的实现）
      await this.initTeamData(teamId, store);

      // 监听团队信息和成员变化
      const teamDisposer = autorun(() => {        
        // 获取团队信息
        const team = (store.teamStore && store.teamStore.teams && store.teamStore.teams.get(teamId)) || null;
        
        // 获取团队成员 - 参考Vue版本的简洁实现
        const teamMembersRaw = (store.teamMemberStore && store.teamMemberStore.getTeamMember && store.teamMemberStore.getTeamMember(teamId)) || [];
        const teamMembers = Array.isArray(teamMembersRaw) ? teamMembersRaw : [];

        // 计算权限
        const myUser = (store.userStore && store.userStore.myUserInfo) || null;
        const isTeamOwner = (team && team.ownerAccountId && myUser && myUser.accountId) ? team.ownerAccountId === myUser.accountId : false;
        
        const isTeamManager = teamMembers
          .filter((item: any) => item.memberRole === 1) // V2NIM_TEAM_MEMBER_ROLE_MANAGER
          .some((member: any) => (member.accountId && myUser && myUser.accountId) ? member.accountId === myUser.accountId : false);
        
        const canAddMember = (team && team.inviteMode === 0) || isTeamOwner || isTeamManager; // V2NIM_TEAM_INVITE_MODE_ALL
        
        // 获取当前用户在群里的信息
        const currentMember = teamMembers.find((member: any) => (member.accountId && myUser && myUser.accountId) ? member.accountId === myUser.accountId : false);
        
        // 计算更多权限和状态
        const canManageTeam = isTeamOwner || isTeamManager;
        const canEditTeamInfo = isTeamOwner || (isTeamManager && (team && team.updateInfoMode !== 'onlyOwner'));
        const showDismissButton = isTeamOwner;
        const showLeaveButton = !isTeamOwner;
        
        // 生成头像背景颜色和显示名称
        const avatarColor = this.generateAvatarColor((team && team.teamId) ? team.teamId : teamId);
        const displayName = this.getDisplayName((team && team.teamId) ? team.teamId : teamId);
        
        // 更新数据
        this.setData({
          team,
          teamMembers,
          isTeamOwner,
          isTeamManager,
          canAddMember,
          canManageTeam,
          canEditTeamInfo,
          showDismissButton,
          showLeaveButton,
          myNickname: (currentMember && currentMember.teamNick) ? currentMember.teamNick : '',
          isTeamBanned: (team && team.chatBannedMode === 'bannedNormal') || (team && team.chatBannedMode === 'bannedAll'),
          avatarColor,
          displayName
        });
      });
      

      // 监听会话信息变化
      const conversationId = (nim && nim.V2NIMConversationIdUtil && nim.V2NIMConversationIdUtil.teamConversationId) ? nim.V2NIMConversationIdUtil.teamConversationId(teamId) : null;
      const conversationDisposer = autorun(() => {
        if (!conversationId) return;
                
        const enableV2CloudConversation = (store && store.sdkOptions && store.sdkOptions.enableV2CloudConversation) || false;
        const conversation = enableV2CloudConversation
          ? (store.conversationStore && store.conversationStore.conversations && store.conversationStore.conversations.get(conversationId)) || null
          : (store.localConversationStore && store.localConversationStore.conversations && store.localConversationStore.conversations.get(conversationId)) || null;
                
        this.setData({
          conversation,
          isStickTop: (conversation && conversation.stickTop) ? conversation.stickTop : false
        });
      });

      // 保存disposer
      this.setData({
        teamDisposer,
        conversationDisposer
      });

      // 初始加载团队免打扰状态
      this.loadTeamMuteStatus();
    }
  },

  lifetimes: {
    attached() {
      this.getStatusBarHeight();
      // 设置autorun监听
      if (this.properties.teamId) {
        this.setupAutorun();
      }
    },
    
    detached() {
      // 清理autorun监听器
      const { teamDisposer, conversationDisposer } = this.data;
      if (teamDisposer) {
        teamDisposer();
      }
      if (conversationDisposer) {
        conversationDisposer();
      }
    }
  }
});