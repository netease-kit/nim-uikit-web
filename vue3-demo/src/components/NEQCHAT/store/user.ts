import { UpdateMyInfoOptions, UserNameCard } from "../types/v2-compat";
import { Module } from "vuex";

import { TRootState } from "./global";

type TState = {
  userProfile: UserNameCard;
};

const userModule: Module<TState, TRootState> = {
  namespaced: true,

  state: () => ({
    userProfile: {} as UserNameCard,
  }),
  mutations: {
    setUserProfile(state, payload: UserNameCard) {
      state.userProfile = payload;
    },
  },
  actions: {
    async updateUserProfile(context, payload) {
      try {
        const newUserProfile = payload; // await window.qchat.userService.updateMyNameCard(payload as any);
        context.commit("setUserProfile", newUserProfile);
      } catch (error) {
        console.error("更新用户资料失败", error);
      }
    },
  },
};

export default userModule;
