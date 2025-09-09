import { createVNode, render } from 'vue';
import Loading from '../CommonComponents/Loading.vue';

let loadingInstance: any = null;

const createLoading = () => {
  const container = document.createElement('div');
  const vnode = createVNode(Loading);
  render(vnode, container);
  document.body.appendChild(container);
  return vnode.component?.exposed;
};

export const loading = {
  show(text = '') {
    if (!loadingInstance) {
      loadingInstance = createLoading();
    }
    loadingInstance?.show(text);
  },
  hide() {
    loadingInstance?.hide();
  }
};