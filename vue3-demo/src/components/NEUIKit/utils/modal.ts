import { createVNode, render } from "vue";
import Modal from "../CommonComponents/Modal.vue";

let container: HTMLDivElement | null = null;

export interface ModalOptions {
  title: string;
  content?: string;
  confirmText?: string;
  width?: string | number;
  height?: string | number;
  cancelText?: string;
  top?: string | number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const showModal = (options: ModalOptions) => {
  // 创建容器
  if (!container) {
    container = document.createElement("div");
    document.body.appendChild(container);
  }

  const {
    title,
    content,
    confirmText = "确定",
    cancelText = "取消",
    width = 400,
    height = 180,
    top = 100,
    onConfirm,
    onCancel,
  } = options;

  // 创建 vnode
  const vnode = createVNode(
    Modal,
    {
      title,
      confirmText,
      cancelText,
      width,
      height,
      top,
      visible: true,
      onConfirm: () => {
        onConfirm?.();
        destroy();
      },
      onCancel: () => {
        onCancel?.();
        destroy();
      },
    },
    {
      default: () => content,
    }
  );

  // 渲染组件
  render(vnode, container);

  // 清理函数
  const destroy = () => {
    if (container) {
      render(null, container);
      document.body.removeChild(container);
      container = null;
    }
  };
};

// 便捷方法
export const modal = {
  confirm: (options: ModalOptions | string) => {
    const opt = typeof options === "string" ? { title: options } : options;
    return new Promise<void>((resolve, reject) => {
      showModal({
        ...opt,
        onConfirm: () => {
          opt.onConfirm?.();
          resolve();
        },
        onCancel: () => {
          opt.onCancel?.();
          reject();
        },
      });
    });
  },
};
