Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    teams: {
      type: Array,
      value: []
    },
    friends: {
      type: Array,
      value: []
    },
    recentContacts: {
      type: Array,
      value: []
    },
    multiSelect: {
      type: Boolean,
      value: true
    },
    theme: {
      type: String,
      value: 'light'
    }
  },

  data: {
    searchText: '',
    selectedContacts: [] as any[],
    filteredTeams: [] as any[],
    filteredFriends: [] as any[]
  },

  observers: {
    'visible': function(visible: boolean) {
      if (visible) {
        this.initModal();
      } else {
        this.resetModal();
      }
    },
    
    'teams, friends, searchText': function(teams: any[], friends: any[], searchText: string) {
      this.filterContacts(teams, friends, searchText);
    }
  },

  methods: {
    // 初始化弹窗
    initModal() {
      const { teams, friends } = this.data;
      this.filterContacts(teams, friends, '');
    },
    
    // 重置弹窗状态
    resetModal() {
      this.setData({
        searchText: '',
        selectedContacts: [],
        filteredTeams: [],
        filteredFriends: []
      });
    },
    
    // 过滤联系人
    filterContacts(teams: any[], friends: any[], searchText: string) {
      if (!teams || !friends) {
        return;
      }
      
      let filteredTeams = [...teams];
      let filteredFriends = [...friends];
      
      if (searchText) {
        const keyword = searchText.toLowerCase();
        
        filteredTeams = teams.filter((team: any) => {
          const name = (team.name || '').toLowerCase();
          const teamId = (team.teamId || '').toLowerCase();
          return name.includes(keyword) || teamId.includes(keyword);
        });
        
        filteredFriends = friends.filter((friend: any) => {
          const name = (friend.name || '').toLowerCase();
          const userId = (friend.userId || '').toLowerCase();
          const signature = (friend.signature || '').toLowerCase();
          return name.includes(keyword) || userId.includes(keyword) || signature.includes(keyword);
        });
      }
      
      // 标记已选择的联系人
      const selectedIds = this.data.selectedContacts.map((contact: any) => contact.id);
      
      filteredTeams = filteredTeams.map((team: any) => ({
        ...team,
        id: team.teamId,
        type: 'team',
        selected: selectedIds.includes(team.teamId)
      }));
      
      filteredFriends = filteredFriends.map((friend: any) => ({
        ...friend,
        id: friend.userId,
        type: 'friend',
        selected: selectedIds.includes(friend.userId)
      }));
      
      this.setData({
        filteredTeams,
        filteredFriends
      });
    },
    
    // 处理搜索输入
    handleSearchInput(e: any) {
      const searchText = e.detail.value;
      this.setData({ searchText });
    },
    
    // 处理搜索
    handleSearch() {
      // 搜索逻辑已在 observer 中处理
    },
    
    // 清除搜索
    handleClearSearch() {
      this.setData({ searchText: '' });
    },
    
    // 选择联系人
    handleSelectContact(e: any) {
      const contact = e.currentTarget.dataset.contact;
      if (!contact) {
        return;
      }
      
      const { multiSelect, selectedContacts } = this.data;
      
      if (!multiSelect) {
        // 单选模式，直接确认
        this.triggerEvent('confirm', {
          contacts: [contact]
        });
        return;
      }
      
      // 多选模式
      const existingIndex = selectedContacts.findIndex((item: any) => item.id === contact.id);
      
      let newSelectedContacts;
      if (existingIndex >= 0) {
        // 取消选择
        newSelectedContacts = selectedContacts.filter((item: any) => item.id !== contact.id);
      } else {
        // 添加选择
        newSelectedContacts = [...selectedContacts, contact];
      }
      
      this.setData({ selectedContacts: newSelectedContacts });
      
      // 重新过滤联系人以更新选中状态
      const { teams, friends, searchText } = this.data;
      this.filterContacts(teams, friends, searchText);
    },
    
    // 移除已选择的联系人
    handleRemoveContact(e: any) {
      const contact = e.currentTarget.dataset.contact;
      if (!contact) {
        return;
      }
      
      const { selectedContacts } = this.data;
      const newSelectedContacts = selectedContacts.filter((item: any) => item.id !== contact.id);
      
      this.setData({ selectedContacts: newSelectedContacts });
      
      // 重新过滤联系人以更新选中状态
      const { teams, friends, searchText } = this.data;
      this.filterContacts(teams, friends, searchText);
    },
    
    // 确认选择
    handleConfirm() {
      const { selectedContacts } = this.data;
      
      if (selectedContacts.length === 0) {
        wx.showToast({
          title: '请选择转发对象',
          icon: 'none'
        });
        return;
      }
      
      this.triggerEvent('confirm', {
        contacts: selectedContacts
      });
    },
    
    // 关闭弹窗
    handleClose() {
      this.triggerEvent('close');
    },
    
    // 处理遮罩点击
    handleMaskClick() {
      this.handleClose();
    },
    
    // 阻止事件冒泡
    stopPropagation() {
      // 阻止点击弹窗内容时关闭弹窗
    },
    
    // 获取联系人显示名称
    getContactDisplayName(contact: any): string {
      if (contact.type === 'team') {
        return contact.name || contact.teamId || '未知群聊';
      } else {
        return contact.name || contact.userId || '未知用户';
      }
    },
    
    // 获取联系人头像
    getContactAvatar(contact: any): string {
      return contact.avatar || '';
    },
    
    // 获取联系人描述
    getContactDescription(contact: any): string {
      if (contact.type === 'team') {
        return `${contact.memberCount || 0}人`;
      } else {
        return contact.signature || '';
      }
    },
    
    // 检查联系人是否已选择
    isContactSelected(contactId: string): boolean {
      const { selectedContacts } = this.data;
      return selectedContacts.some((contact: any) => contact.id === contactId);
    },
    
    // 获取最近联系人
    getRecentContacts(): any[] {
      // 这里可以从本地存储或接口获取最近联系人
      return this.data.recentContacts || [];
    },
    
    // 格式化联系人数据
    formatContactData(contact: any, type: string): any {
      return {
        ...contact,
        id: type === 'team' ? contact.teamId : contact.userId,
        type,
        name: this.getContactDisplayName({ ...contact, type }),
        avatar: this.getContactAvatar(contact),
        description: this.getContactDescription({ ...contact, type })
      };
    },
    
    // 搜索联系人
    searchContacts(keyword: string): { teams: any[], friends: any[] } {
      const { teams, friends } = this.data;
      
      if (!keyword) {
        return { teams, friends };
      }
      
      const lowerKeyword = keyword.toLowerCase();
      
      const filteredTeams = teams.filter((team: any) => {
        const name = (team.name || '').toLowerCase();
        const teamId = (team.teamId || '').toLowerCase();
        return name.includes(lowerKeyword) || teamId.includes(lowerKeyword);
      });
      
      const filteredFriends = friends.filter((friend: any) => {
        const name = (friend.name || '').toLowerCase();
        const userId = (friend.userId || '').toLowerCase();
        const signature = (friend.signature || '').toLowerCase();
        return name.includes(lowerKeyword) || userId.includes(lowerKeyword) || signature.includes(lowerKeyword);
      });
      
      return {
        teams: filteredTeams,
        friends: filteredFriends
      };
    },
    
    // 清空选择
    clearSelection() {
      this.setData({ selectedContacts: [] });
      
      // 重新过滤联系人以更新选中状态
      const { teams, friends, searchText } = this.data;
      this.filterContacts(teams, friends, searchText);
    }
  }
});