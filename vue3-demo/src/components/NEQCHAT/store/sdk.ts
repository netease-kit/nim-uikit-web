import V2NIM from "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK";
import { Module, Store } from "vuex";
import { TRootState } from "./global";
import { qchatAttachEvents } from "../utils/events";
import {
  getQChatServerService,
  getQChatChannelService,
  getQChatMsgService,
  getQChatRoleService,
} from "../utils/v2nim";

window.V2NIM = V2NIM;

type TState = {
  isSDKInitialized: boolean;
};

const sdk: Module<TState, TRootState> = {
  namespaced: true,
  state: () => ({
    isSDKInitialized: true, // 默认为true，因为SDK在UIKit层已经初始化
  }),
  mutations: {
    setSDKInitialized(state, payload: boolean) {
      state.isSDKInitialized = payload;
    },
  },
  actions: {
    // SDK初始化已经在UIKit层完成，这里只是保持状态管理
    async initializeQChat(context) {
      context.commit("setSDKInitialized", true);
    },
  },
};

export default sdk;
