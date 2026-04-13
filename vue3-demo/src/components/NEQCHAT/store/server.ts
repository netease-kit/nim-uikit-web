/* eslint-disable */
import { TRootState } from "./global";
import { Module } from "vuex";
import store from ".";
import {
  getQChatServerService,
  getQChatMsgService,
  getQChatRoleService,
} from "../utils/v2nim";
import {
  GetServersByPageOptions,
  GetServersOptions,
  GetServersByPageResult,
  GetServerMembersByPageOptions,
  GetServerMembersByPageResult,
  ApplyServerJoinOptions,
  UpdateServerOptions,
  CreateServerOptions,
  ServerInfo,
  MemberInfo,
  DeleteServerOptions,
  UpdateMyMemberInfoOptions,
  GetServerMembersOptions,
  KickServerMembersOptions,
  LeaveServerOptions,
  SubscribeServerOptions,
  InviteServerMembersOptions,
  GetServerRolesByAccidOptions,
  QChatServerRole,
  CreateServerRoleOptions,
  DeleteServerRoleOptions,
  UpdateServerRolePrioritiesOptions,
  GetServerRolesOptions,
  UpdateServerRoleOptions,
  GetMembersFromServerRoleOptions,
  AddMembersToServerRoleOptions,
  RemoveMembersFromServerRoleOptions,
  RemoveMemberRoleOptions,
  UpdateMemberRoleOptions,
  AddChannelRoleOptions,
  GetMemberRolesOptions,
  CheckPermissionOptions,
  QChatUnreadInfo,
  SendSystemNotificationOptions,
} from "../types/v2-compat";

type TState = {
  serverList: ServerInfo[];
  curServer: ServerInfo | null;
  curServerRoles: QChatServerRole[];
  settingServerRole: QChatServerRole | null;
  serverMembers: GetServerMembersByPageResult | null;
  curMember: MemberInfo | null;
  curMemberRoles: QChatServerRole[] | null;
  listQueryTag: GetServersByPageResult["listQueryTag"];
  searchServerId: string;
};

const global: Module<TState, TRootState> = {
  namespaced: true,

  state: () => ({
    serverList: [],
    listQueryTag: {
      nextTimetag: 0,
      hasMore: false,
    },
    curServer: null,
    curServerRoles: [],
    settingServerRole: null,
    serverMembers: null,
    curMember: null,
    curMemberRoles: [],
    searchServerId: "",
  }),
  mutations: {
    // 同步方法
    setCurServer(state: TState, payload: ServerInfo) {
      state.curServer = payload;
    },
    setCurServerRoles(state: TState, payload: QChatServerRole[]) {
      state.curServerRoles = payload;
    },
    setSettingServerRole(state: TState, payload: QChatServerRole | null) {
      state.settingServerRole = payload;
    },
    setSeverList(state: TState, payload: GetServersByPageResult) {
      state.listQueryTag = payload.listQueryTag;
      state.serverList = payload.datas as ServerInfo[];
      if (state.serverList) {
        state.serverList.forEach((item) => {
          item["unReadInfo"] = 0;
        });
      }
    },
    setSeverMembers(state: TState, payload: GetServerMembersByPageResult) {
      state.serverMembers = payload;
    },
    setCurMember(state: TState, payload: MemberInfo) {
      state.curMember = payload;
    },
    setCurMemberRoles(state: TState, payload: QChatServerRole[]) {
      state.curMemberRoles = payload;
    },
    setSearchServerId(state: TState, payload: string) {
      state.searchServerId = payload;
    },
    setUnReadInfo(state: TState, payload: any[]) {
      for (let index = 0; index < payload.length; index++) {
        const serverAggCount = payload[index];
        for (let j = 0; index < state.serverList.length; j++) {
          const item = state.serverList[j];
          if (item.serverId === serverAggCount.serverId) {
            item["unReadInfo"] = serverAggCount.unreadCount;
            break;
          }
        }
      }
    },

    resetServerUnReadCount(state: TState) {
      if (state.serverList) {
        state.serverList.forEach((item) => {
          item["unReadInfo"] = 0;
        });
      }
    },
    // 从服务器列表中移除指定服务器
    removeServerFromList(state: TState, serverId: string) {
      state.serverList = state.serverList.filter(
        (server) => server.serverId !== serverId,
      );
    },
    setServerUnReadCount(state: TState, payload: any) {
      if (state.serverList && payload.serverId && payload.readCount) {
        for (let index = 0; index < state.serverList.length; index++) {
          const item = state.serverList[index];
          if (item.serverId === payload.serverId) {
            item["unReadInfo"] = item["unReadInfo"] - payload.readCount;
            break;
          }
        }
      }
    },
  },
  actions: {
    // 获取服务器列表
    async getSeverList(context, options: GetServersByPageOptions) {
      try {
        const qchatServerService = getQChatServerService();
        const res = await qchatServerService.getServersByPage(options as any);
        context.commit("setSeverList", res);
        return res;
      } catch (error) {
        console.warn("QChat服务器模块未初始化:", error);
        return { datas: [], listQueryTag: { nextTimetag: 0, hasMore: false } };
      }
    },
    // 添加下一页服务器列表
    async appendServerList(context, options: GetServersByPageOptions) {
      const res = await getQChatServerService().getServersByPage(
        options as any,
      );
      const { datas = [], listQueryTag } = res;
      context.commit("setSeverList", {
        datas: [...(context.state.serverList || []), ...datas],
        listQueryTag,
      });
    },
    // 获取服务器成员列表
    async getSeverMembers(context, options: GetServerMembersByPageOptions) {
      const res = await getQChatServerService().getServerMembersByPage(
        Object.assign(
          {
            timetag: 0,
            timestamp: 0,
          },
          options,
        ),
      );
      context.commit("setSeverMembers", res);
      return res;
    },
    // 获取服务器成员
    async getSeverMember(context, options: GetServerMembersOptions) {
      const res = await getQChatServerService().getServerMembers(
        options as any,
      );
      context.commit("setSeverMembers", res);
      return res;
    },
    // 添加下一页服务器成员列表
    async appendSeverMembers(context, options: GetServerMembersByPageOptions) {
      const res = await getQChatServerService().getServerMembersByPage(
        Object.assign(
          {
            timetag: 0,
            timestamp: 0,
          },
          options,
        ),
      );
      const { datas = [], listQueryTag } = res;
      context.commit("setSeverMembers", {
        datas: [...(context.state.serverMembers?.datas || []), ...datas],
        listQueryTag,
      });
      return res;
    },
    // 获取服务器成员身份组列表
    async getCurMemberRoles(context, options: GetServerRolesByAccidOptions) {
      const res = await getQChatRoleService().getServerRolesByAccid(
        options as any,
      );
      context.commit("setCurMemberRoles", res);
      return res;
    },
    // 根据severId获取server
    async getServers(context, options: GetServersOptions) {
      const res = await getQChatServerService().getServers(options as any);
      return res;
    },
    // 根据severId删除server
    async deleteServers(context, options: DeleteServerOptions) {
      const res = await getQChatServerService().deleteServer(options as any);
      return res;
    },
    // 申请加入服务器
    async applySeverJoin(context, options: ApplyServerJoinOptions) {
      const res = await getQChatServerService().applyServerJoin({
        ...options,
        ps: options.ps || "",
      } as any);
      return res;
    },
    // 创建服务器
    async createServer(context, options: CreateServerOptions) {
      const res = await getQChatServerService().createServer(options as any);
      return res;
    },
    // 更新服务器
    async updateServer(context, options: UpdateServerOptions) {
      const res = await getQChatServerService().updateServer(options as any);
      // 更新当前服务器信息到 store
      if (
        context.state.curServer &&
        context.state.curServer.serverId === options.serverId
      ) {
        context.commit("setCurServer", {
          ...context.state.curServer,
          ...res,
        });
      }
      // 同时更新服务器列表中的信息
      const updatedServerList = context.state.serverList.map((server) =>
        server.serverId === options.serverId ? { ...server, ...res } : server,
      );
      context.commit("setSeverList", {
        datas: updatedServerList,
        listQueryTag: context.state.listQueryTag,
      });
      return res;
    },
    // 删除服务器提醒
    async deleteServerTip(context, options: SendSystemNotificationOptions) {
      await getQChatMsgService().sendSystemNotification(options as any);
    },

    // 获取服务器角色组列表
    async getServerRoles(context, options: GetServerRolesOptions) {
      const res = await getQChatRoleService().getServerRoles(options as any);
      if (res.roles && res.roles.length > 0) {
        context.commit("setCurServerRoles", res.roles);
      }
      return res;
    },
    //将身份组加入频道
    async addChannelRole(context, options: AddChannelRoleOptions) {
      const res = await getQChatRoleService().addChannelRole(options as any);
      return res;
    },
    // 创建服务器角色组
    async createServerRole(context, options: CreateServerRoleOptions) {
      const res = await getQChatRoleService().createServerRole(options as any);
      //新增时设置默认权限
      const udpateOptions = {
        serverId: options.serverId,
        roleId: res.roleId,
        /**
         * 权限
         */
        auths: {
          accountInfoOther: "deny",
          accountInfoSelf: "deny",
          deleteMsg: "deny",
          inviteServer: "allow",
          kickServer: "deny",
          manageBlackWhiteList: "deny",
          manageChannel: "deny",
          manageRole: "deny",
          manageServer: "deny",
          recallMsg: "deny",
          remindEveryone: "deny",
          remindOther: "deny",
          sendMsg: "allow",
        },
        /**
         * 优先级，越小的数字优先级越高
         */
        priority: options.priority,
      };
      context.dispatch("updateServerRole", udpateOptions);
      return res;
    },
    // 服务器角色组排序
    async updateServerRolePriorities(
      context,
      options: UpdateServerRolePrioritiesOptions,
    ) {
      const res = await getQChatRoleService().updateServerRolePriorities(
        options as any,
      );
      return res;
    },
    //订阅服务器
    async subscribeServer(context, options: SubscribeServerOptions) {
      const res = await getQChatServerService().subscribeServer(options as any);
      return res;
    },
    // 删除服务器角色组
    async deleteServerRole(context, options: DeleteServerRoleOptions) {
      const res = await getQChatRoleService().deleteServerRole(options as any);
      return res;
    },
    // 更新服务器角色组
    async updateServerRole(context, options: UpdateServerRoleOptions) {
      const res = await getQChatRoleService().updateServerRole(options as any);
      context.commit("setSettingServerRole", res);
      context.dispatch("getServerRoles", { serverId: res.serverId });
      return res;
    },
    // 获取服务器角色组成员
    async getMembersFromServerRole(
      context,
      options: GetMembersFromServerRoleOptions,
    ) {
      const res = await getQChatRoleService().getMembersFromServerRole(
        options as any,
      );
      return res;
    },
    // 将某些人加入某服务器身份组
    async addMembersToServerRole(
      context,
      options: AddMembersToServerRoleOptions,
    ) {
      const res = await getQChatRoleService().addMembersToServerRole(
        options as any,
      );
      return res;
    },
    // 将某些人加入某服务器身份组
    async removeMembersFromServerRole(
      context,
      options: RemoveMembersFromServerRoleOptions,
    ) {
      const res = await getQChatRoleService().removeMembersFromServerRole(
        options as any,
      );
      return res;
    },
    //根据用户 ID 获取其已经分配的身份组列表
    async getServerRolesByAccid(
      context,
      options: GetServerRolesByAccidOptions,
    ) {
      const res = await getQChatRoleService().getServerRolesByAccid(
        options as any,
      );
      return res;
    },
    //更新身份组
    async updateMemberRole(context, options: UpdateMemberRoleOptions) {
      const res = await getQChatRoleService().updateMemberRole(options as any);
      return res;
    },
    //根据用户 ID 获取其已经分配的身份组列表
    async removeMemberRole(context, options: RemoveMemberRoleOptions) {
      const res = await getQChatRoleService().removeMemberRole(options as any);
      return res;
    },
    //修改自己服务器成员信息
    async updateMyMemberInfo(context, options: UpdateMyMemberInfoOptions) {
      const res = await getQChatServerService().updateMyMemberInfo(
        options as any,
      );
      return res;
    },
    //获取个人权限
    async checkPermissionMessage(context, options: CheckPermissionOptions) {
      const res = await getQChatRoleService().checkPermission(options as any);
      return res;
    },
    async removeMembersFromServer(context, options: KickServerMembersOptions) {
      const res = await getQChatServerService().kickServerMembers(
        options as any,
      );
      return res;
    },
    async getMemberRoles(context, options: GetMemberRolesOptions) {
      const res = await getQChatRoleService().getMemberRoles(options as any);
      return res;
    },

    async leaveServer(context, options: LeaveServerOptions) {
      const res = await getQChatServerService().leaveServer(options as any);
      // 退出成功后，从服务器列表中移除该服务器
      context.commit("removeServerFromList", options.serverId);
      return res;
    },
    // 邀请用户进入服务器
    async inviteServerMembers(context, options: InviteServerMembersOptions) {
      const res = await getQChatServerService().inviteServerMembers(
        options as any,
      );
      return res;
    },
  },
};

export default global;
