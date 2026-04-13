import { message } from "ant-design-vue";
import { Module } from "vuex";
import { promiseDebounce } from "../utils/index.js";

import { TRootState } from "./global.js";
import {
  getQChatChannelService,
  getQChatMsgService,
  getQChatRoleService,
} from "../utils/v2nim.js";
// 移除循环引用，将在运行时通过context获取store
import {
  ChannelInfo,
  CreateChannelOptions,
  GetChannelsByPageOptions,
  GetChannelsByPageResult,
  GetWhiteBlackMembersPageOptions,
  UpdateChannelOptions,
  UpdateWhiteBlackMembersOptions,
  GetMembersByPageOptions,
  GetMembersByPageResult,
  QChatMessage,
  AddMemberRoleOptions,
  QChatChannelRole,
  GetMemberRolesOptions,
  QChatUnreadInfo,
  GetChannelRolesOptions,
  QChatServerRole,
  UpdateChannelRoleOptions,
  UpdateMemberRoleOptions,
  UpdateServerRoleOptions,
  GetExistingAccidsOfMemberRolesOptions,
  MemberInfo,
} from "../types/v2-compat.js";

interface ServerUnReadCountAgg {
  serverId: string;
  unreadCount: number;
}

type ChannelUnReadInfo = {
  channelId: string;
  unreadCount: number;
  serverId: string;
};

type TState = {
  channelList: ChannelInfo[];
  currentChannel: ChannelInfo | null;
  settingChannelRole: QChatChannelRole | null;
  ChannelMembers: GetMembersByPageResult | null;
  channelListQueryTag: {
    hasMore: boolean;
    nextTimetag: number;
  };
  currentChannelMsgs: QChatMessage[];
  channelUnReadInfoList: ChannelUnReadInfo[];
  serverUnReadCountList: ServerUnReadCountAgg[];
};

const channelModule: Module<TState, TRootState> = {
  namespaced: true,

  state: () => ({
    channelList: [],
    channelListQueryTag: { hasMore: false, nextTimetag: 0 },
    currentChannel: null,
    ChannelMembers: null,
    currentChannelMsgs: [],
    channelUnReadInfoList: [],
    settingChannelRole: null,
    serverUnReadCountList: [],
  }),
  mutations: {
    setChannelList(state, payload: GetChannelsByPageResult) {
      // 注意：在mutations中不能直接commit其他模块的mutation
      // 这个需要在action中处理
      state.channelList = payload.datas;
      if (state.channelList) {
        state.channelList.forEach((item) => {
          item["unreadCount"] = 0;
          for (
            let index = 0;
            index < state.channelUnReadInfoList.length;
            index++
          ) {
            const unReadInfo = state.channelUnReadInfoList[index];
            if (unReadInfo.channelId === item.channelId) {
              item["unreadCount"] = unReadInfo.unreadCount;
            }
          }
        });
      }
      state.channelListQueryTag = (payload.listQueryTag as any) || {
        hasMore: false,
        nextTimetag: 0,
      };
      // 移除这里的commit，在action中处理
    },
    subscribleChannels(state) {
      state.channelUnReadInfoList = [];
      const channels = [];
      state.channelList.forEach((item) => {
        //@ts-ignore
        channels.push({ serverId: item.serverId, channelId: item.channelId });
      });

      const qchatChannelService = getQChatChannelService();
      qchatChannelService
        .subscribeChannel({
          type: 2,
          opeType: 1,
          channels: channels,
        })
        .then((resp) => {
          const unreadInfos = resp || [];
          if (Array.isArray(unreadInfos)) {
            unreadInfos.forEach((item: any) => {
              if (state.channelList && state.channelList.length > 0) {
                state.channelList.forEach((channelItem) => {
                  if (channelItem.channelId === item.channelId) {
                    channelItem["unreadCount"] = item.unreadCount;
                  }
                });
              }
              state.channelUnReadInfoList.push({
                channelId: item.channelId,
                unreadCount: item.unreadCount,
                serverId: item.serverId,
              });
            });

            state.serverUnReadCountList = [];
            state.channelUnReadInfoList.forEach((item) => {
              let existsFlag = false;
              for (
                let index = 0;
                index < state.serverUnReadCountList.length;
                index++
              ) {
                const serverCount = state.serverUnReadCountList[index];
                if (serverCount.serverId === item.serverId) {
                  existsFlag = true;
                  break;
                }
              }
              if (!existsFlag) {
                state.serverUnReadCountList.push({
                  serverId: item.serverId,
                  unreadCount: item.unreadCount,
                });
              } else {
                for (
                  let index = 0;
                  index < state.serverUnReadCountList.length;
                  index++
                ) {
                  const serverUnReadCountAgg =
                    state.serverUnReadCountList[index];
                  if (serverUnReadCountAgg.serverId == item.serverId) {
                    serverUnReadCountAgg.unreadCount =
                      serverUnReadCountAgg.unreadCount + item.unreadCount;
                    break;
                  }
                }
              }
            });
            // TODO: 需要通过context来调用，暂时注释掉
            // store.commit("server/setUnReadInfo", state.serverUnReadCountList);
          }
        });
    },

    //设置channel的未读消息数
    setUnReadNum(state, payload: QChatUnreadInfo) {
      if (state.channelList && state.channelList.length > 0) {
        state.channelList.forEach((channelItem) => {
          if (channelItem.channelId === payload.channelId) {
            channelItem["unreadCount"] = payload.unreadCount;
          }
        });
      }
      let exists = false;
      if (state.channelUnReadInfoList) {
        for (
          let index = 0;
          index < state.channelUnReadInfoList.length;
          index++
        ) {
          const item = state.channelUnReadInfoList[index];
          if (item.channelId === payload.channelId) {
            item.unreadCount = payload.unreadCount;
            exists = true;
            break;
          }
        }
      }
      if (!exists) {
        state.channelUnReadInfoList.push({
          channelId: payload.channelId,
          unreadCount: payload.unreadCount,
          serverId: payload.serverId,
        });
      }
      state.serverUnReadCountList = [];
      state.channelUnReadInfoList.forEach((item) => {
        let existsFlag = false;
        for (
          let index = 0;
          index < state.serverUnReadCountList.length;
          index++
        ) {
          const serverCount = state.serverUnReadCountList[index];
          if (serverCount.serverId === item.serverId) {
            existsFlag = true;
            break;
          }
        }
        if (!existsFlag) {
          state.serverUnReadCountList.push({
            serverId: item.serverId,
            unreadCount: item.unreadCount,
          });
        } else {
          for (
            let index = 0;
            index < state.serverUnReadCountList.length;
            index++
          ) {
            const serverUnReadCountAgg = state.serverUnReadCountList[index];
            if (serverUnReadCountAgg.serverId == item.serverId) {
              serverUnReadCountAgg.unreadCount =
                serverUnReadCountAgg.unreadCount + item.unreadCount;
              break;
            }
          }
        }
      });
      // TODO: 需要通过context来调用，暂时注释掉
      // store.commit("server/setUnReadInfo", state.serverUnReadCountList);
    },

    setCurChannel(state, payload: ChannelInfo) {
      state.currentChannel = payload;
    },
    setChannelMembers(state, payload: GetMembersByPageResult) {
      state.ChannelMembers = payload;
    },
    settingChannelRole(state, payload: QChatChannelRole) {
      state.settingChannelRole = payload;
    },
    resetChannelUnReadCount(state) {
      if (state.currentChannel) {
        if (state.channelUnReadInfoList) {
          let finalIndex = -1;
          for (
            let index = 0;
            index < state.channelUnReadInfoList.length;
            index++
          ) {
            const unReadInfo = state.channelUnReadInfoList[index];
            if (unReadInfo.channelId === state.currentChannel.channelId) {
              finalIndex = index;
              break;
            }
          }
          if (finalIndex > -1) {
            state.channelUnReadInfoList.slice(finalIndex, 1);
          }
        }
        const readCount = state.currentChannel["unreadCount"];
        if (readCount < 1) {
          return;
        }
        // TODO: 需要通过context来调用，暂时注释掉
        // store.commit("server/setServerUnReadCount", {
        //   serverId: state.currentChannel.serverId,
        //   readCount: readCount,
        // });
        const markMessageReadOption = {
          serverId: state.currentChannel.serverId,
          channelId: state.currentChannel.channelId,
          time: new Date().getTime(),
          ackTimestamp: new Date().getTime(),
          unreadCount: readCount,
          mentionedCount: 0,
          maxCount: 99,
          lastMsgTime: new Date().getTime(),
        };
        getQChatMsgService().markMessageRead(markMessageReadOption as any);
        state.currentChannel["unreadCount"] = 0;
      }
    },
    // channelList 有变化时，让当前的 currentChannel 变化为 channelList 列表里最新的对象
    resetCurrentChannel(state) {
      const newChannel = state.channelList.find(
        (channel) => channel.channelId === state.currentChannel?.channelId,
      );
      if (newChannel) {
        state.currentChannel = newChannel;
      }
    },
    addCurChannelMsgs(
      state,
      {
        data,
        isUnShift = false,
      }: {
        data: QChatMessage[];
        isUnShift: boolean;
      },
    ) {
      const existMsgs = data.filter((i) =>
        state.currentChannelMsgs.some((j) => j.msgIdClient === i.msgIdClient),
      );
      const newMsgs = data.filter((i) =>
        state.currentChannelMsgs.every((j) => j.msgIdClient !== i.msgIdClient),
      );
      const msgs = state.currentChannelMsgs.map((i) => {
        const existMsg = existMsgs.find((j) => j.msgIdClient === i.msgIdClient);
        if (existMsg) {
          return {
            ...i,
            ...existMsg,
          };
        }
        return i;
      });
      state.currentChannelMsgs = isUnShift
        ? [...newMsgs, ...msgs]
        : [...msgs, ...newMsgs];
    },
    removeCurChannelMsgs(state, payload: QChatMessage[]) {
      state.currentChannelMsgs = state.currentChannelMsgs.filter((i) =>
        payload.every((j) => j.msgIdClient !== i.msgIdClient),
      );
    },
    setCurChannelMsgs(state, payload: QChatMessage[]) {
      state.currentChannelMsgs = payload;
    },
    clearCurChannelMsgs(state) {
      state.currentChannelMsgs = [];
    },
    // 更新频道列表中的某个频道信息
    updateChannelInList(state, updatedChannel: ChannelInfo) {
      const index = state.channelList.findIndex(
        (channel) => channel.channelId === updatedChannel.channelId,
      );
      if (index !== -1) {
        // 保留未读数等额外属性
        state.channelList[index] = {
          ...state.channelList[index],
          ...updatedChannel,
        };
      }
      // 如果是当前频道，也更新当前频道信息
      if (state.currentChannel?.channelId === updatedChannel.channelId) {
        state.currentChannel = {
          ...state.currentChannel,
          ...updatedChannel,
        };
      }
    },
  },
  actions: {
    // 获取 channel 列表
    getChannelsByPage: promiseDebounce(
      async (context: any, options: GetChannelsByPageOptions) => {
        try {
          const res = await getQChatChannelService().getChannelsByPage(
            Object.assign(
              {
                timetag: 0,
                timestamp: 0,
              },
              options,
            ) as any,
          );
          context.commit("setChannelList", res);
          // 重置服务器未读数 - 不传null，因为mutation不需要参数
          try {
            context.commit("server/resetServerUnReadCount", undefined, {
              root: true,
            });
          } catch (error) {
            console.warn("重置服务器未读数失败:", error);
          }
          // 订阅频道
          context.commit("subscribleChannels");
          return res;
        } catch (error) {
          console.error("获取频道列表失败:", error);
          context.commit("setChannelList", { datas: [] });
          return { datas: [] };
        }
      },
      1000,
    ),

    // 创建 channel
    async createChannel(context, options: CreateChannelOptions) {
      await getQChatChannelService().createChannel({
        ...options,
        type: "message",
      });
    },

    // 更新 channel
    async updateChannel(context, options: UpdateChannelOptions) {
      await getQChatChannelService().updateChannel(options as any);

      // 更新成功后，使用当前频道信息和更新参数合并来更新状态
      if (context.state.currentChannel?.channelId === options.channelId) {
        const updatedChannel = {
          ...context.state.currentChannel,
          ...options,
          // 确保使用正确的字段名
          ext: options.custom || context.state.currentChannel.ext,
        };
        context.commit("updateChannelInList", updatedChannel);
      }
    },

    // 删除 channel
    async deleteChannel(context) {
      if (!context.state.currentChannel?.channelId) {
        throw new Error("No curr channel");
      }
      const channelId = context.state.currentChannel?.channelId;
      await getQChatChannelService().deleteChannel({
        channelId,
      });
      message.success("success");
    },

    // 获取历史消息
    async getChannelHistoryMsgs(
      context,
      options: {
        limit: number;
      },
    ) {
      if (!context.state.currentChannel) {
        throw new Error("no currentChannel");
      }
      const msgs = (
        await getQChatMsgService().getHistoryMessage({
          serverId: context.state.currentChannel.serverId,
          channelId: context.state.currentChannel.channelId,
          limit: options.limit,
        })
      ).reverse();
      return msgs;
    },

    // 加载更多历史消息
    async loadMoreHistoryMsgs(
      context,
      options: {
        limit: number;
        lastTime: number;
      },
    ) {
      if (!context.state.currentChannel) {
        throw new Error("no currentChannel");
      }
      const msgs = (
        await getQChatMsgService().getHistoryMessage({
          serverId: context.state.currentChannel.serverId,
          channelId: context.state.currentChannel.channelId,
          limit: options.limit,
          endTime: options.lastTime - 1,
        })
      ).reverse();
      context.commit("addCurChannelMsgs", {
        data: msgs,
        isUnShift: true,
      });
      return msgs;
    },

    // 发送文本消息
    async sendTextMsg(
      context,
      options: {
        body: string;
        mentionAccids?: string[];
      },
    ) {
      if (!context.state.currentChannel) {
        throw new Error("no currentChannel");
      }
      try {
        const qchatMsgService = getQChatMsgService();
        const msg = await qchatMsgService.sendMessage({
          serverId: context.state.currentChannel.serverId,
          channelId: context.state.currentChannel.channelId,
          type: "text",
          body: options.body,
          mentionAccids: options.mentionAccids,
          onSendBefore: (msg) => {
            context.commit("addCurChannelMsgs", { data: [msg] });
          },
        });
        if (msg.channelId === context.state.currentChannel?.channelId) {
          context.commit("addCurChannelMsgs", { data: [msg] });
        }
      } catch (error: any) {
        console.error("sendMessage error: ", error);
        if (error.msg) {
          context.commit("addCurChannelMsgs", { data: [error.msg] });
        }
      }
    },

    // 发送文件消息
    async sendFileMsg(
      context,
      options: {
        file: any;
        onUploadStart: any;
        onUploadDone: any;
      },
    ) {
      if (!context.state.currentChannel) {
        throw new Error("no currentChannel");
      }
      try {
        const msg = await getQChatMsgService().sendMessage({
          serverId: context.state.currentChannel.serverId,
          channelId: context.state.currentChannel.channelId,
          type: "file",
          file: options.file,
          onUploadStart: options.onUploadStart,
          onUploadDone: options.onUploadDone,
          onSendBefore: (msg) => {
            context.commit("addCurChannelMsgs", { data: [msg] });
          },
        });
        if (msg.channelId === context.state.currentChannel?.channelId) {
          context.commit("addCurChannelMsgs", { data: [msg] });
        }
      } catch (error: any) {
        console.error("sendMessage error: ", error);
        if (error.msg) {
          context.commit("addCurChannelMsgs", { data: [error.msg] });
        }
      }
    },

    // 发送图片消息
    async sendImageMsg(
      context,
      options: {
        file: any;
        onUploadStart: any;
        onUploadDone: any;
      },
    ) {
      if (!context.state.currentChannel) {
        throw new Error("no currentChannel");
      }
      try {
        const msg = await getQChatMsgService().sendMessage({
          serverId: context.state.currentChannel.serverId,
          channelId: context.state.currentChannel.channelId,
          type: "image",
          file: options.file,
          onUploadStart: options.onUploadStart,
          onUploadDone: options.onUploadDone,
          onSendBefore: (msg) => {
            context.commit("addCurChannelMsgs", { data: [msg] });
          },
        });
        if (msg.channelId === context.state.currentChannel?.channelId) {
          context.commit("addCurChannelMsgs", { data: [msg] });
        }
      } catch (error: any) {
        console.error("sendMessage error: ", error);
        if (error.msg) {
          context.commit("addCurChannelMsgs", { data: [error.msg] });
        }
      }
    },

    // 重发文本消息
    async resendTextMsg(context, options: QChatMessage) {
      const msg = await getQChatMsgService().resendMessage(options as any);
      if (msg.channelId === context.state.currentChannel?.channelId) {
        context.commit("addCurChannelMsgs", { data: [msg] });
      }
    },

    // 重发文件消息
    async resendFileMsg(context, options: QChatMessage) {
      const msg = await getQChatMsgService().resendMessage(options as any);
      if (msg.channelId === context.state.currentChannel?.channelId) {
        context.commit("addCurChannelMsgs", { data: [msg] });
      }
    },

    // 重发图片消息
    async resendImageMsg(context, options: QChatMessage) {
      const msg = await getQChatMsgService().resendMessage(options as any);
      if (msg.channelId === context.state.currentChannel?.channelId) {
        context.commit("addCurChannelMsgs", { data: [msg] });
      }
    },

    // 获取频道黑白名单
    async getWhiteBlackMembersPage(
      context,
      options: GetWhiteBlackMembersPageOptions,
    ) {
      const res = await getQChatChannelService().getWhiteBlackMembersPage(
        options as any,
      );
      return res;
    },

    //更新频道黑白名单成员
    async updateWhiteBlackMembers(
      context,
      options: UpdateWhiteBlackMembersOptions,
    ) {
      const msg = await getQChatChannelService().updateWhiteBlackMembers(
        options as any,
      );
    },

    //更新频道身份组权限
    async updateChannelRole(context, options: UpdateChannelRoleOptions) {
      const msg = await getQChatRoleService().updateChannelRole(options as any);
    },

    //更新频道成员权限
    async updateMemberRole(context, options: UpdateMemberRoleOptions) {
      return await getQChatRoleService().updateMemberRole(options as any);
    },

    //新增成员频道权限
    async addMemberRole(context, options: AddMemberRoleOptions) {
      const msg = await getQChatRoleService().addMemberRole(options as any);
    },
    //获取频道身份组
    async getChannelRoles(context, options: GetChannelRolesOptions) {
      const res = await getQChatRoleService().getChannelRoles(options as any);
      return res;
    },
    //查询频道下名单
    async getMembersByPage(context, options: GetMembersByPageOptions) {
      const res = await getQChatChannelService().getMembersByPage(
        Object.assign(
          {
            timetag: 0,
            timestamp: 0,
          },
          options,
        ) as any,
      );
      context.commit("setChannelMembers", res);
      return res;
    },
    async getMemberRoles(context, options: GetMemberRolesOptions) {
      const res = await getQChatRoleService().getMemberRoles(options as any);
      return res;
    },
    async getExistingAccidsOfMemberRoles(
      context,
      options: GetExistingAccidsOfMemberRolesOptions,
    ) {
      const res = await getQChatRoleService().getExistingAccidsOfMemberRoles(
        options as any,
      );
      return res;
    },
  },
};

export default channelModule;
