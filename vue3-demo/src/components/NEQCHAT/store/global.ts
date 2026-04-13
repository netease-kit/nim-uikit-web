// import { ModuleTree } from "vuex";

export type TRootState = {
  loginStatus: boolean;
};

const global = {
  namespaced: true,
  state: () => ({
    loginStatus: false,
  }),
  mutations: {
    // 同步方法
    login(
      state: { loginStatus: boolean },
      payload: { [propName: string]: any }
    ) {
      state.loginStatus = true;
    },
    logout(
      state: { loginStatus: boolean },
      payload: { [propName: string]: any }
    ) {
      state.loginStatus = false;
    },
  },
  actions: {
    // 异步方法，作用与 mutations 类似
  },
  getters: {
    loginStatusDesc: (state: { loginStatus: boolean }) => {
      return state.loginStatus ? "登录" : "未登录";
    },
  },
};

export default global;
