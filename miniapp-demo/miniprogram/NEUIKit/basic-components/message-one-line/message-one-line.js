Component({
  properties: {
    // 头像
    avatar: {
      type: String,
      value: ''
    },
    // 用户名
    name: {
      type: String,
      value: ''
    },
    // 最后一条消息
    lastMessage: {
      type: String,
      value: ''
    },
    // 时间戳
    time: {
      type: Number,
      value: 0
    },
    // 未读消息数
    unreadCount: {
      type: Number,
      value: 0
    },
    // 是否显示箭头
    showArrow: {
      type: Boolean,
      value: true
    },
    // 是否在线
    online: {
      type: Boolean,
      value: false
    },
    // 是否静音
    muted: {
      type: Boolean,
      value: false
    },
    // 是否选中
    selected: {
      type: Boolean,
      value: false
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
    formatTime: ''
  },

  observers: {
    'time': function(time) {
      this.updateFormatTime(time);
    }
  },

  lifetimes: {
    attached() {
      this.updateFormatTime(this.data.time);
    }
  },

  methods: {
    // 格式化时间
    updateFormatTime(timestamp) {
      // 使用统一的时间格式化函数，避免toLocaleTimeString等可能导致英文显示的API
      const { formatConversationTime } = require('../../utils/date');
      const formatTime = formatConversationTime(timestamp);
      this.setData({ formatTime });
    },

    // 判断是否同一天
    isSameDay(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    },

    // 头像加载失败
    onAvatarError() {
      console.warn('MessageOneLine: 头像加载失败');
      this.triggerEvent('avatarError', {
        avatar: this.data.avatar
      });
    },

    // 点击事件
    onTap() {
      this.triggerEvent('tap', {
        name: this.data.name,
        avatar: this.data.avatar,
        lastMessage: this.data.lastMessage,
        time: this.data.time,
        unreadCount: this.data.unreadCount
      });
    },

    // 长按事件
    onLongPress() {
      this.triggerEvent('longpress', {
        name: this.data.name,
        avatar: this.data.avatar,
        lastMessage: this.data.lastMessage,
        time: this.data.time,
        unreadCount: this.data.unreadCount
      });
    }
  }
});