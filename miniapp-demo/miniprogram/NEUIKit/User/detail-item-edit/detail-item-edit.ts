import { t } from "../../utils/i18n";

Component({
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    // 编辑的字段类型
    editKey: {
      type: String,
      value: 'name'
    },
    // 初始值
    initialValue: {
      type: String,
      value: ''
    }
  },

  data: {
    inputValue: '',
    showClearIcon: false,
    showToast: false,
    toastMessage: '',
    
    // 国际化文本
    okText: t('okText'),
    nameText: t('name'),
    mobileText: t('mobile'),
    signText: t('sign'),
    emailText: t('email'),
    telErrorText: t('telErrorText'),
    emailErrorText: t('emailErrorText'),
    saveText: t('saveText'),
    failText: t('failText'),
    
    // 字段最大长度映射
    maxlengthMap: {
      name: 15,
      mobile: 11,
      sign: 50,
      email: 30
    }
  },

  lifetimes: {
    attached() {
      this.setData({
        inputValue: this.data.initialValue
      });
    }
  },

  methods: {
    // 获取当前编辑字段的标题
    getTitle() {
      const titleMap: { [key: string]: any } = {
        name: this.data.nameText,
        mobile: this.data.mobileText,
        sign: this.data.signText,
        email: this.data.emailText
      };
      return titleMap[this.data.editKey] || '';
    },

    // 获取当前字段的最大长度
    getMaxLength() {
      const maxlengthMap: { [key: string]: number } = this.data.maxlengthMap;
      return maxlengthMap[this.data.editKey] || 50;
    },

    // 输入框内容变化
    onInputChange(event: any) {
      const { value } = event.detail;
      this.setData({
        inputValue: value,
        showClearIcon: value.length > 0
      });
    },

    // 输入框获得焦点
    onInputFocus() {
      this.setData({
        showClearIcon: this.data.inputValue.length > 0
      });
    },

    // 输入框失去焦点
    onInputBlur() {
      this.setData({
        showClearIcon: false
      });
    },

    // 清空输入框
    clearInputValue() {
      this.setData({
        inputValue: '',
        showClearIcon: false
      });
    },

    // 验证输入内容
    validateInput(value: string, key: string): boolean {
      // 手机号验证
      if (key === 'mobile' && value.trim() !== '') {
        if (!/^\d+(\.\d+)?$/.test(value)) {
          this.showToastMessage(this.data.telErrorText);
          return false;
        }
      }
      
      // 邮箱验证
      if (key === 'email' && value.trim() !== '') {
        if (!/[a-zA-Z0-9]+([-_.][A-Za-zd]+)*@([a-zA-Z0-9]+[-.])+[A-Za-zd]{2,5}$/.test(value)) {
          this.showToastMessage(this.data.emailErrorText);
          return false;
        }
      }
      
      return true;
    },

    // 显示提示消息
    showToastMessage(message: string) {
      this.setData({
        toastMessage: message,
        showToast: true
      });
      
      setTimeout(() => {
        this.setData({
          showToast: false
        });
      }, 2000);
    },

    // 确认保存
    onUserInfoConfirm() {
      const value = this.data.inputValue.trim();
      const key = this.data.editKey;
      
      // 验证输入内容
      if (!this.validateInput(value, key)) {
        return;
      }
      
      // 通知父组件保存数据
      this.triggerEvent('save', {
        key: key,
        value: value
      });
    },

    // 返回上一页
    onBack() {
      this.triggerEvent('back', {});
    },

    // 关闭Toast
    onToastClose() {
      this.setData({
        showToast: false
      });
    }
  }
});