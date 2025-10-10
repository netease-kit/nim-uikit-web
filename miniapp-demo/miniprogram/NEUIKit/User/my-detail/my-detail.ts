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
    myUserInfo: null as any,
    disposer: null as (() => void) | null,
    statusBarHeight: 0,
    
    // 国际化文本
    personalPageText: t('PersonalPageText'),
    avatarText: t('avatarText'),
    name: t('name'),
    accountText: t('accountText'),
    genderText: t('genderText'),
    birthText: t('birthText'),
    mobile: t('mobile'),
    email: t('email'),
    sign: t('sign'),
    man: t('man'),
    woman: t('woman'),
    unknow: t('unknow'),
    saveText: t('saveText'),
    cancelText: t('cancelText')
  },

  lifetimes: {
    attached() {
      this.setStatusBarHeight();
      this._setupAutorun();
    },

    detached() {
      this._cleanupAutorun();
    }
  },

  methods: {
    // 设置状态栏高度
    setStatusBarHeight() {
      try {
        const systemInfo = wx.getSystemInfoSync();
        this.setData({
          statusBarHeight: systemInfo.statusBarHeight || 0
        });
      } catch (error) {
        console.error('获取系统信息失败:', error);
        this.setData({
          statusBarHeight: 0
        });
      }
    },

    _setupAutorun() {
      const app = getApp<IAppOption>();
      const { store } = app.globalData;

      const disposer = autorun(() => {
        const myUserInfo = (store && store.userStore && store.userStore.myUserInfo) || null;
        this.setData({
          myUserInfo
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

    // 选择头像
    onChooseAvatar() {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFiles[0].tempFilePath;
          this.uploadAvatar(tempFilePath);
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          wx.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },

    // 上传头像
    uploadAvatar(filePath: string) {
      wx.showLoading({ title: '上传中...' });
      
      const app = getApp<IAppOption>();
      const { store } = app.globalData;
      
      // 先上传文件到服务器
      if (store && store.storageStore && store.storageStore.uploadFileActive) {
        store.storageStore.uploadFileActive(filePath)
          .then((avatarUrl: string) => {
            // 上传成功后，更新用户头像信息
            const updatedUserInfo = {
              ...this.data.myUserInfo,
              avatar: avatarUrl
            };
            
            // 通过store更新用户信息
            if (store && store.userStore && store.userStore.updateSelfUserProfileActive) {
              return store.userStore.updateSelfUserProfileActive(updatedUserInfo);
            }
          })
        .then(() => {
          wx.hideLoading();
          wx.showToast({
            title: '头像更新成功',
            icon: 'success'
          });
        })
        .catch((error: any) => {
          wx.hideLoading();
          wx.showToast({
            title: '头像更新失败',
            icon: 'none'
          });
          console.error('更新头像失败:', error);
        });
      }
    },

    // 编辑用户信息项
    navigatorToUserItem(event: any) {
      const field = event.currentTarget.dataset.field;
      const { myUserInfo } = this.data;
      let currentValue = '';
      let title = '';
      
      // 性别字段使用下拉选择
      if (field === 'gender') {
        wx.showActionSheet({
          itemList: [this.data.man, this.data.woman],
          success: (res) => {
            const genderValue = res.tapIndex === 0 ? 1 : 2; // 1为男，2为女
            this.handleGenderChange(genderValue);
          }
        });
        return;
      }
      
      // 生日字段使用picker组件，不需要在这里处理
      if (field === 'birthday') {
        return;
      }
      
      switch (field) {
        case 'name':
          currentValue = (myUserInfo && myUserInfo.name) ? myUserInfo.name : ((myUserInfo && myUserInfo.accountId) ? myUserInfo.accountId : '');
          title = this.data.name;
          break;
        case 'mobile':
          currentValue = (myUserInfo && myUserInfo.mobile) ? myUserInfo.mobile : '';
          title = this.data.mobile;
          break;
        case 'email':
          currentValue = (myUserInfo && myUserInfo.email) ? myUserInfo.email : '';
          title = this.data.email;
          break;
        case 'sign':
          currentValue = (myUserInfo && myUserInfo.sign) ? myUserInfo.sign : '';
          title = this.data.sign;
          break;
        default:
          return;
      }
      
      // 手机号字段使用数字键盘
      if (field === 'mobile') {
        wx.showModal({
          title: `编辑${title}`,
          editable: true,
          placeholderText: '请输入11位手机号',
          content: currentValue,
          confirmText: this.data.saveText,
          cancelText: this.data.cancelText,
          success: (res) => {
            if (res.confirm && res.content !== undefined) {
              this.handleModalConfirm(field, res.content);
            }
          }
        });
      } else {
        // 其他字段使用默认modal
        wx.showModal({
          title: `编辑${title}`,
          editable: true,
          placeholderText: '请输入内容',
          content: currentValue,
          confirmText: this.data.saveText,
          cancelText: this.data.cancelText,
          success: (res) => {
            if (res.confirm && res.content !== undefined) {
              this.handleModalConfirm(field, res.content);
            }
          }
        });
      }
    },

    // 处理原生modal确认
    handleModalConfirm(field: string, inputValue: string) {
      if (!inputValue.trim()) {
        wx.showToast({
          title: '内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 手机号格式验证
      if (field === 'mobile') {
        // 只允许数字
        if (!/^\d+$/.test(inputValue.trim())) {
          wx.showToast({
            title: '手机号只能输入数字',
            icon: 'none'
          });
          return;
        }
        
        // 验证手机号格式（11位数字，以1开头）
        if (!/^1[3-9]\d{9}$/.test(inputValue.trim())) {
          wx.showToast({
            title: '请输入正确的11位手机号',
            icon: 'none'
          });
          return;
        }
      }
      
      // 邮箱格式验证
      if (field === 'email') {
        // 验证邮箱格式
        if (!/^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@([a-zA-Z0-9]+[-.])+[a-zA-Z0-9]{2,5}$/.test(inputValue.trim()) && inputValue.trim() !== '') {
          wx.showToast({
            title: '请输入正确的邮箱格式',
            icon: 'none'
          });
          return;
        }
      }
      
      // 调用store更新用户信息
      wx.showLoading({ title: '保存中...' });
      
      const app = getApp<IAppOption>();
      const { store } = app.globalData;
      
      let finalValue: any = inputValue.trim();
      
      // 性别字段需要特殊处理
      if (field === 'gender') {
        if (finalValue === this.data.man) {
          finalValue = 1;
        } else if (finalValue === this.data.woman) {
          finalValue = 2;
        } else {
          finalValue = 0; // 未知
        }
      }
      
      const updatedUserInfo = {
        ...this.data.myUserInfo,
        [field]: finalValue
      };
      
      // 通过store更新用户信息
      if (store && store.userStore && store.userStore.updateSelfUserProfileActive) {
        store.userStore.updateSelfUserProfileActive(updatedUserInfo)
          .then(() => {
          wx.hideLoading();
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
        })
        .catch((error: any) => {
          wx.hideLoading();
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
          console.error('更新用户信息失败:', error);
        });
      }
    },

    // 返回上一页
    onBack() {
      this.triggerEvent('back', {});
    },

    // 复制账号
    onCopyAccount() {
      const accountId = (this.data.myUserInfo && this.data.myUserInfo.accountId) ? this.data.myUserInfo.accountId : null;
      if (accountId) {
        wx.setClipboardData({
          data: accountId,
          success: () => {
            wx.showToast({
              title: '账号已复制',
              icon: 'success',
              duration: 2000
            });
          },
          fail: () => {
            wx.showToast({
              title: '复制失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      }
    },

    // 处理性别选择
    handleGenderChange(genderValue: number) {
      const { myUserInfo } = this.data;
      if (!myUserInfo) return;

      // 更新用户信息
      const updatedUserInfo = {
        ...myUserInfo,
        gender: genderValue
      };
      
      wx.showLoading({ title: '保存中...' });
      
      const app = getApp<IAppOption>();
      const { store } = app.globalData;
      
      // 通过store更新用户信息
      if (store && store.userStore && store.userStore.updateSelfUserProfileActive) {
        store.userStore.updateSelfUserProfileActive(updatedUserInfo)
          .then(() => {
          wx.hideLoading();
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          });
        })
        .catch((error: any) => {
          wx.hideLoading();
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
          console.error('更新用户信息失败:', error);
        });
      }
    },

    // 处理生日选择
    onBirthdayChange(event: any) {
      const { myUserInfo } = this.data;
      if (!myUserInfo) return;

      const selectedDate = event.detail.value;
      
      // 更新用户信息
      const updatedUserInfo = {
        ...myUserInfo,
        birthday: selectedDate
      };
      
      wx.showLoading({ title: '保存中...' });
      
      const app = getApp<IAppOption>();
      const { store } = app.globalData;
      
      // 通过store更新用户信息
      if (store && store.userStore && store.userStore.updateSelfUserProfileActive) {
        store.userStore.updateSelfUserProfileActive(updatedUserInfo)
          .then(() => {
          wx.hideLoading();
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          });
        })
        .catch((error: any) => {
          wx.hideLoading();
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
          console.error('更新用户信息失败:', error);
        });
      }
    }
  }
});