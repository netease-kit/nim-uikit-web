// 导入必要的类型定义
/// <reference path="../../../../typings/index.d.ts" />

interface User {
  accountId: string;
  nick?: string;
  avatar?: string;
}



Page({
  data: {
    teamName: '',
    selectedMembers: [] as User[],
    canCreate: false,
    friendList: [] as User[],
    p2pConversationId: '',
    preSelectedAccount: '',
    preSelectedUser: null as User | null,
    statusBarHeight: 0 // 状态栏高度
  },

  onLoad(options: any) {
    console.log('CreateTeamPage onLoad options:', options);
    
    // 设置状态栏高度
    this.setStatusBarHeight();
    
    // 保存传递的参数
    if (options.p2pConversationId) {
      this.setData({
        p2pConversationId: options.p2pConversationId
      });
    }
    
    if (options.account) {
      this.setData({
        preSelectedAccount: options.account
      });
    }
    
    // 页面加载时的初始化
    this.loadFriendList();
  },

  /**
   * 设置状态栏高度
   */
  setStatusBarHeight() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const statusBarHeight = systemInfo.statusBarHeight || 44; // 默认44px
      
      this.setData({
        statusBarHeight: statusBarHeight
      });
      
      console.log('状态栏高度设置为:', statusBarHeight, 'px');
    } catch (error) {
      console.error('获取状态栏高度失败:', error);
      // 设置默认值
      this.setData({
        statusBarHeight: 44
      });
    }
  },

  /**
   * 加载好友列表
   */
  async loadFriendList() {
    try {
      const app = getApp<IAppOption>();
      const store = app.globalData.store;
      let friends = [];
      
      if (store && store.uiStore && store.uiStore.friends) {
        // 从store获取好友列表
        friends = store.uiStore.friends.map((friend: any) => ({
          accountId: friend.accountId,
          nick: friend.nick || friend.name,
          avatar: friend.avatar
        }));
      } else {
        // 如果store中没有数据，尝试从NIM获取
        const nim = app.globalData.nim;
        if (nim && nim.friendService) {
          const friendList = await nim.friendService.getFriendList();
          friends = friendList.map((friend: any) => ({
            accountId: friend.accountId,
            nick: friend.alias || friend.nick,
            avatar: friend.avatar
          }));
        }
      }
      
      // 如果有预选账号，从好友列表中过滤掉该好友
       const { preSelectedAccount } = this.data;
       if (preSelectedAccount) {
         friends = friends.filter((friend: User) => friend.accountId !== preSelectedAccount);
       }
      
      this.setData({
        friendList: friends
      });
      
      // 处理预选账号
      await this.handlePreSelectedAccount();
    } catch (error) {
      console.error('加载好友列表失败:', error);
      wx.showToast({
        title: '加载好友列表失败',
        icon: 'none'
      });
    }
  },

  /**
   * 处理预选账号
   */
  async handlePreSelectedAccount() {
    const { preSelectedAccount } = this.data;
    
    if (preSelectedAccount) {
      try {
        const app = getApp<IAppOption>();
        const store = app.globalData.store;
        let preSelectedUser: User | null = null;
        
        // 从store中查找预选用户信息
        if (store && store.uiStore && store.uiStore.friends) {
          const friend = store.uiStore.friends.find((f: any) => f.accountId === preSelectedAccount);
          if (friend) {
            preSelectedUser = {
              accountId: friend.accountId,
              nick: friend.nick || friend.name,
              avatar: friend.avatar
            };
          }
        }
        
        // 如果store中没有找到，尝试从NIM获取
        if (!preSelectedUser) {
          const nim = app.globalData.nim;
          if (nim && nim.friendService) {
            try {
              const friendList = await nim.friendService.getFriendList();
              const friend = friendList.find((f: any) => f.accountId === preSelectedAccount);
              if (friend) {
                preSelectedUser = {
                  accountId: friend.accountId,
                  nick: friend.alias || friend.nick,
                  avatar: friend.avatar
                };
              }
            } catch (error) {
              console.error('从NIM获取好友信息失败:', error);
            }
          }
        }
        
        // 如果还是没有找到，创建一个基本的用户对象
        if (!preSelectedUser) {
          preSelectedUser = {
            accountId: preSelectedAccount,
            nick: preSelectedAccount, // 使用账号作为显示名称
            avatar: ''
          };
        }
        
        // 设置预选用户信息用于显示
        this.setData({
          preSelectedUser: preSelectedUser,
          selectedMembers: [preSelectedUser]
        });
        
        // 更新创建按钮状态
        this.updateCanCreate();
        
        console.log('预选用户已添加:', preSelectedUser);
      } catch (error) {
        console.error('处理预选账号失败:', error);
      }
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onTeamNameInput(e: any) {
    const teamName = e.detail.value;
    this.setData({
      teamName
    });
    this.updateCanCreate();
  },

  onMemberSelect(e: any) {
    const selectedUsers = e.detail.selectedUsers || [];
    this.setData({
      selectedMembers: selectedUsers
    });
    this.updateCanCreate();
  },

  removeMember(e: any) {
    const accountId = e.currentTarget.dataset.account;
    const selectedMembers = this.data.selectedMembers.filter(member => member.accountId !== accountId);
    this.setData({
      selectedMembers
    });
    this.updateCanCreate();
  },

  updateCanCreate() {
    const canCreate = this.data.teamName.trim().length > 0 && this.data.selectedMembers.length > 0;
    this.setData({
      canCreate
    });
  },

  async createTeam() {
    if (!this.data.canCreate) {
      return;
    }

    const { teamName, selectedMembers, preSelectedAccount } = this.data;

    try {
      wx.showLoading({
        title: '创建中...'
      });

      // 获取 NIM 实例和 store
      const app = getApp<IAppOption>();
      const { nim, store } = app.globalData;

      if (!nim || !store) {
        throw new Error('NIM 实例或 Store 未初始化');
      }

      // 创建群聊参数，包含预选好友
      let memberAccountIds = selectedMembers.map(member => member.accountId);
      
      // 如果有预选账号，确保将其包含在群成员中
      if (preSelectedAccount && !memberAccountIds.includes(preSelectedAccount)) {
        memberAccountIds.push(preSelectedAccount);
      }
      
      // 使用 store.teamStore.createTeamActive 创建群聊
      const team = await store.teamStore.createTeamActive({
        accounts: memberAccountIds,
        name: teamName.trim(),
        avatar: '', // 可以设置默认头像
      });

      wx.hideLoading();
      
      wx.showToast({
        title: '创建成功',
        icon: 'success'
      });

      // 选择新创建的群聊会话并跳转到聊天页面
      if (team && team.teamId) {
        const conversationId = nim.V2NIMConversationIdUtil.teamConversationId(team.teamId);
        store.uiStore.selectConversation(conversationId);
        
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/chat/index/index`
          });
        }, 1500);
      }

    } catch (error) {
      wx.hideLoading();
      console.error('创建群聊失败:', error);
      
      wx.showToast({
        title: '创建失败',
        icon: 'error'
      });
    }
  }
});