export interface ToastOptions {
  message: string;
  duration?: number;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const showToast = (options: ToastOptions | string) => {
  // 如果传入的是字符串，转换为对象格式
  const opt = typeof options === 'string' ? { message: options } : options;
  
  // 根据类型选择合适的微信小程序API
  const { message, duration = 2000, type = 'info' } = opt;
  
  if (type === 'success') {
    wx.showToast({
      title: message,
      icon: 'success',
      duration,
      mask: true
    });
  } else if (type === 'error') {
    wx.showToast({
      title: message,
      icon: 'error',
      duration,
      mask: true
    });
  } else if (type === 'warning') {
    wx.showToast({
      title: message,
      icon: 'none',
      duration,
      mask: true
    });
  } else {
    // info 类型
    wx.showToast({
      title: message,
      icon: 'none',
      duration,
      mask: true
    });
  }
};

// 便捷方法
export const toast = {
  info: (message: string, duration?: number) => showToast({ message, type: 'info', duration }),
  success: (message: string, duration?: number) => showToast({ message, type: 'success', duration }),
  warning: (message: string, duration?: number) => showToast({ message, type: 'warning', duration }),
  error: (message: string, duration?: number) => showToast({ message, type: 'error', duration })
};