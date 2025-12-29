import Vue from "vue";
import Modal from "../CommonComponents/Modal.vue";

let container = null;

export const showModal = (options) => {
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

  const vm = new Vue({
    render(h) {
      const children =
        typeof content === "string"
          ? [h("div", content)]
          : content
          ? [content]
          : [];
      return h(
        Modal,
        {
          props: {
            title,
            confirmText,
            cancelText,
            width,
            height,
            top,
            visible: true,
          },
          on: {
            confirm: () => {
              onConfirm && onConfirm();
              destroy();
            },
            cancel: () => {
              onCancel && onCancel();
              destroy();
            },
            close: () => {
              destroy();
            },
            "update:visible": (val) => {
              if (!val) destroy();
            },
          },
        },
        children
      );
    },
  });

  vm.$mount(container);

  const destroy = () => {
    try {
      vm.$destroy();
    } catch (e) {
      console.log(e);
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
  };
};

// 便捷方法
export const modal = {
  confirm: (options) => {
    const opt = typeof options === "string" ? { title: options } : options;
    return new Promise((resolve, reject) => {
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
