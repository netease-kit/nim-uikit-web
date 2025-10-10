export interface ModalOptions {
  title: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const showModal = (options: ModalOptions) => {
  const {
    title,
    content = '',
    confirmText = '确定',
    cancelText = '取消',
    onConfirm,
    onCancel
  } = options;

  // 微信小程序环境
  if (typeof wx !== 'undefined' && wx.showModal) {
    wx.showModal({
      title,
      content,
      confirmText,
      cancelText,
      success: (res) => {
        if (res.confirm) {
          onConfirm && onConfirm();
        } else {
          onCancel && onCancel();
        }
      },
      fail: (err) => {
        console.error('Modal显示失败:', err);
        onCancel && onCancel();
      }
    });
    return;
  }
};

// 便捷方法
export const modal = {
  confirm: (options: ModalOptions | string) => {
    const opt = typeof options === 'string' ? { title: options } : options;
    return new Promise<void>((resolve, reject) => {
      showModal({
        ...opt,
        onConfirm: () => {
          opt.onConfirm && opt.onConfirm();
          resolve();
        },
        onCancel: () => {
          opt.onCancel && opt.onCancel();
          reject();
        }
      });
    });
  },
  
  alert: (options: Omit<ModalOptions, 'cancelText' | 'onCancel'> | string) => {
    const opt = typeof options === 'string' ? { title: options } : options;
    return new Promise<void>((resolve) => {
      showModal({
        ...opt,
        cancelText: '', // 微信小程序中设置为空字符串可以隐藏取消按钮
        onConfirm: () => {
          opt.onConfirm && opt.onConfirm();
          resolve();
        }
      });
    });
  }
};