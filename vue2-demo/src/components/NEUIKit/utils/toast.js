import Vue from "vue";
import Toast from "../CommonComponents/Toast.vue";

export const showToast = (options) => {
  const opt =
    typeof options === "string" ? { message: options } : options || {};
  const duration = opt.duration != null ? opt.duration : 2000;

  const container = document.createElement("div");
  document.body.appendChild(container);

  const vm = new Vue({
    render(h) {
      return h(Toast, {
        props: {
          message: opt.message,
          duration,
          type: opt.type || "info",
        },
      });
    },
  });

  vm.$mount(container);

  setTimeout(() => {
    try {
      vm.$destroy();
    } catch (e) {
      console.log(e);
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, duration + 300);
};

export const toast = {
  info: (message, duration) =>
    showToast({ message, type: "warning", duration }),
  success: (message, duration) =>
    showToast({ message, type: "success", duration }),
  warning: (message, duration) =>
    showToast({ message, type: "warning", duration }),
  error: (message, duration) => showToast({ message, type: "error", duration }),
};
