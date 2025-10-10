Component({
  properties: {
    // 人员列表
    personList: {
      type: Array,
      value: []
    },
    // 是否显示确认按钮
    showBtn: {
      type: Boolean,
      value: true
    },
    // 按钮文本
    btnText: {
      type: String,
      value: '确认'
    },
    // 是否单选模式
    radio: {
      type: Boolean,
      value: false
    },
    // 最大选择数量
    max: {
      type: Number,
      value: Number.MAX_SAFE_INTEGER
    },
    // 空状态文本
    emptyText: {
      type: String,
      value: '暂无好友'
    },
    // 自定义样式类
    customClass: {
      type: String,
      value: ''
    },
    // 自定义样式
    customStyle: {
      type: String,
      value: ''
    }
  },

  data: {
    selectAccount: []
  },

  observers: {
    'personList': function(personList) {

      console.log('personList',personList)
      // 初始化选中状态
      if (personList && personList.length > 0) {
        const selectedAccounts = personList
          .filter(item => item.checked)
          .map(item => item.accountId);
        
        this.setData({
          selectAccount: selectedAccounts
        });
      }
    }
  },

  lifetimes: {
    attached() {
      this.initSelectAccount();
    }
  },

  methods: {
    // 初始化选中账号
    initSelectAccount() {
      const { personList } = this.data;
      if (personList && personList.length > 0) {
        const selectedAccounts = personList
          .filter(item => item.checked)
          .map(item => item.accountId);
        
        this.setData({
          selectAccount: selectedAccounts
        });
      }
    },

    // 处理项目点击
    handleItemTap(e) {
      const { accountId, index } = e.currentTarget.dataset;
      const { personList, radio, max, selectAccount } = this.data;
      const item = personList[index];
      
      // 检查是否禁用
      if (item.disabled) {
        return;
      }
      
      // 检查是否超出最大选择数量
      if (selectAccount.length >= max && selectAccount.indexOf(accountId) === -1) {
        wx.showToast({
          title: `最多只能选择${max}个`,
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      if (radio) {
        this.handleRadioChange(accountId);
      } else {
        this.handleCheckboxChange(accountId);
      }
    },

    // 处理单选变化
    handleRadioChange(accountId) {
      const { selectAccount, personList } = this.data;
      const newSelectAccount = selectAccount.includes(accountId) ? [] : [accountId];
      
      // 同步更新personList中的checked状态
      const updatedPersonList = personList.map(person => ({
        ...person,
        checked: newSelectAccount.includes(person.accountId)
      }));
      
      this.setData({
        selectAccount: newSelectAccount,
        personList: updatedPersonList
      });
      
      this.triggerEvent('checkboxChange', newSelectAccount);
      
      // 触发personListChange事件，通知父组件personList已更新
      this.triggerEvent('personListChange', updatedPersonList);
      
      // 触发select事件，传递选中的用户信息
      const selectedUsers = updatedPersonList.filter(person => 
        newSelectAccount.includes(person.accountId)
      );
      this.triggerEvent('select', {
        selectedUsers: selectedUsers
      });
    },

    // 处理多选变化
    handleCheckboxChange(accountId) {
      const { selectAccount, personList } = this.data;
      let newSelectAccount;
      
      if (selectAccount.includes(accountId)) {
        // 取消选择
        newSelectAccount = selectAccount.filter(id => id !== accountId);
      } else {
        // 添加选择
        newSelectAccount = [...selectAccount, accountId];
      }
      
      // 同步更新personList中的checked状态
      const updatedPersonList = personList.map(person => ({
        ...person,
        checked: newSelectAccount.includes(person.accountId)
      }));
      
      this.setData({
        selectAccount: newSelectAccount,
        personList: updatedPersonList
      });
      
      this.triggerEvent('checkboxChange', newSelectAccount);
      
      // 触发personListChange事件，通知父组件personList已更新
      this.triggerEvent('personListChange', updatedPersonList);
      
      // 触发select事件，传递选中的用户信息
      const selectedUsers = updatedPersonList.filter(person => 
        newSelectAccount.includes(person.accountId)
      );
      this.triggerEvent('select', {
        selectedUsers: selectedUsers
      });
    },

    // 确认按钮点击
    onBtnClick() {
      this.triggerEvent('onBtnClick', {
        selectAccount: this.data.selectAccount
      });
    },

    // 获取选中的账号列表
    getSelectedAccounts() {
      return this.data.selectAccount;
    },

    // 设置选中的账号列表
    setSelectedAccounts(accounts) {
      const { personList } = this.data;
      const newSelectAccount = accounts || [];
      
      // 同步更新personList中的checked状态
      const updatedPersonList = personList.map(person => ({
        ...person,
        checked: newSelectAccount.includes(person.accountId)
      }));
      
      this.setData({
        selectAccount: newSelectAccount,
        personList: updatedPersonList
      });
    },

    // 清空选择
    clearSelection() {
      const { personList } = this.data;
      
      // 同步更新personList中的checked状态
      const updatedPersonList = personList.map(person => ({
        ...person,
        checked: false
      }));
      
      this.setData({
        selectAccount: [],
        personList: updatedPersonList
      });
    },

    // 全选
    selectAll() {
      const { personList, max } = this.data;
      const availableAccounts = personList
        .filter(item => !item.disabled)
        .map(item => item.accountId)
        .slice(0, max);
      
      // 同步更新personList中的checked状态
      const updatedPersonList = personList.map(person => ({
        ...person,
        checked: availableAccounts.includes(person.accountId)
      }));
      
      this.setData({
        selectAccount: availableAccounts,
        personList: updatedPersonList
      });
      
      this.triggerEvent('checkboxChange', availableAccounts);
    },

    // 反选
    invertSelection() {
      const { personList, selectAccount, max } = this.data;
      const availableAccounts = personList
        .filter(item => !item.disabled)
        .map(item => item.accountId);
      
      const invertedAccounts = availableAccounts
        .filter(accountId => !selectAccount.includes(accountId))
        .slice(0, max);
      
      // 同步更新personList中的checked状态
      const updatedPersonList = personList.map(person => ({
        ...person,
        checked: invertedAccounts.includes(person.accountId)
      }));
      
      this.setData({
        selectAccount: invertedAccounts,
        personList: updatedPersonList
      });
      
      this.triggerEvent('checkboxChange', invertedAccounts);
    },

    // 检查是否已选择指定账号
    isSelected(accountId) {
      return this.data.selectAccount.includes(accountId);
    },

    // 获取选中数量
    getSelectedCount() {
      return this.data.selectAccount.length;
    }
  }
});