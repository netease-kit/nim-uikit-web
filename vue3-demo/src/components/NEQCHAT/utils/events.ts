/* eslint-disable */
// V2NIM 事件监听工具
import { Store } from "vuex";
import V2NIM from "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK";
import logger from "./logger";
import { Modal } from "ant-design-vue";
import { UserNameCard } from "../types/v2-compat";
import { getV2NIMInstance, getQChatServerService } from "./v2nim";

// 定义系统通知响应类型
type SystemNotificationResponse = {
  feature?: string;
  systemNotifications: QChatSystemNotification[];
};

// 定义圈组系统通知类型
interface QChatSystemNotification {
  serverId: string;
  channelId?: string;
  fromAccount: string;
  toAccids?: string[];
  type: string;
  attach?: any;
  msgIdServer?: string;
  time: number;
}

// 定义圈组未读信息类型
interface QChatUnreadInfo {
  serverId: string;
  channelId: string;
  unreadCount: number;
  mentionedCount: number;
  ackTimeTag: number;
  maxCount: number;
}

// 定义获取服务器成员分页结果类型
interface GetServerMembersByPageResult {
  datas: any[];
  listQueryTag: any;
}

// 定义扩展的V2NIM类型以包含事件监听方法（基于你的示例代码）
interface ExtendedV2NIM {
  on(event: string, callback: (...args: any[]) => void): void;
  account: string; // 保持与V2NIM一致，必需属性
  destroy?(): void;
  // 包含V2NIM的其他必要属性和方法
  [key: string]: any;
}

// 定义NIMSDK类型
interface NIMSDK {
  on(event: string, callback: (...args: any[]) => void): void;
  destroy?(): void;
  [key: string]: any;
}

function destroySocket() {
  // 根据实际API调整销毁方法
  if (
    (window as any).nim &&
    typeof (window as any).nim.destroy === "function"
  ) {
    (window as any).nim.destroy();
  }
  if (
    (window as any).qchat &&
    typeof (window as any).qchat.destroy === "function"
  ) {
    (window as any).qchat.destroy();
  }
  (window as any).nim = null;
  (window as any).qchat = null;
  Modal.warning({
    title: "已断开连接",
    content: "请刷新页面后重试",
    onOk() {
      location.reload();
    },
  });
}

export const qchatAttachEvents = (
  instance: ExtendedV2NIM,
  store: Store<any>,
) => {
  logger.log("开始设置QChat事件监听...");

  instance.on("logined", (res: any) => {
    logger.log(`收到 qchat logined 事件：`, res);
  });

  instance.on("systemNotification", (res: SystemNotificationResponse) => {
    logger.log(`收到 systemNotification 事件：`, res);
  });

  instance.on("disconnect", () => {
    logger.log(`qchat 断开连接!`);
    destroySocket();
  });

  instance.on("kicked", () => {
    logger.log(`qchat 被踢下线!`);
    destroySocket();
  });

  // 监听系统通知，实时同步成员列表状态
  instance.on("systemNotification", async (res: SystemNotificationResponse) => {
    const { systemNotifications = [] } = res;

    // 如果当前有选中服务器，则处理成员加入和成员离开事件
    if (store.state.server.curServer?.serverId) {
      const joinMemberAccids: string[] = [];
      const leaveMemberAccids: string[] = [];

      const notificationsOfCurServer = systemNotifications.filter((note) => {
        return note.serverId === store.state.server.curServer?.serverId;
      });

      for (let i = 0; i < notificationsOfCurServer.length; i++) {
        const msg = notificationsOfCurServer[i];
        const { attach, fromAccount, type } = msg;

        switch (type) {
          case "serverMemberInviteDone":
            joinMemberAccids.push(...attach.invitedAccids);
            break;
          case "serverMemberInviteAccept":
            joinMemberAccids.push(attach.inviteAccid);
            break;
          case "serverMemberApplyDone":
            joinMemberAccids.push(fromAccount);
            break;
          case "serverMemberApplyAccept":
            joinMemberAccids.push(attach.applyAccid);
            break;
          case "serverMemberKick":
            leaveMemberAccids.push(...(attach?.kickedAccids || []));
            break;
          case "serverMemberLeave":
            leaveMemberAccids.push(fromAccount);
            break;

          default:
            break;
        }
      }

      /**
       * 如果频道人数过多的情况下，
       * 每次有系统通知下发，每个频道成员各自客户端请求刷新成员列表会导致服务器请求过多，造成服务器压力过大
       * 这时就不建议从服务端刷新成员列表了
       */
      if (joinMemberAccids.length) {
        try {
          const serverService = getQChatServerService();
          const joinMembers = await serverService.getServerMembers({
            accids: joinMemberAccids.map((accid) => ({
              accid,
              serverId: store.state.server.curServer?.serverId,
            })),
          });

          const { datas, listQueryTag }: GetServerMembersByPageResult =
            store.state.server.serverMembers;

          const newDatas = datas.filter(
            (data) => leaveMemberAccids.indexOf(data.accid) === -1,
          );

          store.commit("server/setSeverMembers", {
            datas: [...newDatas, ...joinMembers],
            listQueryTag,
          });
        } catch (error) {
          logger.log("❌ 更新成员列表失败:", error);
        }
      }
    }
  });

  // 登录完成后请求服务器列表
  instance.on("logined", () => {
    store.dispatch("server/getSeverList", { timestamp: 0 });
  });

  // serverBar监听系统通知，通知store更新serverList
  instance.on("systemNotification", async (res: SystemNotificationResponse) => {
    const { systemNotifications = [] } = res;

    // 尝试从多个来源获取当前用户的 accid
    let accid = store.state.user.userProfile?.account;

    // 如果 store 中没有，尝试从 localStorage 获取
    if (!accid) {
      try {
        const STORAGE_KEY = "__yx_im_options_pc_vue3";
        const loginInfo = localStorage.getItem(STORAGE_KEY);
        if (loginInfo) {
          const parsed = JSON.parse(loginInfo);
          accid = parsed.account;
        }
      } catch (error) {
        logger.log("从 localStorage 获取用户信息失败:", error);
      }
    }

    logger.log(
      `当前用户 accid: ${accid}, 收到 ${systemNotifications.length} 条系统通知`,
    );

    // 过滤掉与当前账户无关的系统通知
    const notificationsOfCurAccid = systemNotifications.filter((note) => {
      if (!note.toAccids || note.toAccids.length === 0) {
        // 没有指定接收者，说明是广播通知
        return true;
      } else {
        // 检查当前用户是否在接收者列表中（支持字符串和数字类型的匹配）
        const isForCurrentUser = note.toAccids.some(
          (targetAccid) => String(targetAccid) === String(accid),
        );
        return isForCurrentUser;
      }
    });

    logger.log(
      `过滤后与当前用户相关的通知: ${notificationsOfCurAccid.length} 条`,
      notificationsOfCurAccid,
    );

    for (const systemNotification of notificationsOfCurAccid) {
      const { type, serverId, attach } = systemNotification;
      logger.log(`处理系统通知类型: ${type}, serverId: ${serverId}`);

      switch (type) {
        // 被邀请进入服务器
        case "serverMemberInviteDone":
          logger.log(
            `🎉 被邀请加入服务器 ${serverId}, 邀请的成员:`,
            attach?.invitedAccids,
          );
          // 刷新服务器列表，让用户看到新的服务器
          await store.dispatch("server/getSeverList", { timestamp: 0 });
          logger.log(`✅ 已刷新服务器列表`);

          // 只有在用户当前没有选中任何服务器的情况下，才自动选择新服务器
          // 这样不会打断用户当前的聊天
          const currentServer = store.state.server.curServer;
          const serverList = store.state.server.serverList;

          if (!currentServer && serverList && serverList.length > 0) {
            // 如果用户当前没有选中服务器（比如刚登录），选择第一个服务器
            const newServer =
              serverList.find((s) => s.serverId === serverId) || serverList[0];
            store.commit("server/setCurServer", newServer);
            logger.log(
              "🎯 自动选择新加入的服务器（用户当前无选中服务器）:",
              newServer,
            );

            // 获取该服务器的频道列表
            await store.dispatch("channel/getChannelsByPage", {
              serverId: newServer.serverId,
              timestamp: 0,
            });

            // 选择第一个频道
            const channelList = store.state.channel.channelList;
            if (channelList && channelList.length > 0) {
              store.commit("channel/setCurChannel", channelList[0]);
              logger.log("🎯 自动选择第一个频道:", channelList[0]);
            }
          } else {
            // 用户正在其他服务器聊天，只刷新服务器列表，不自动切换
            logger.log(
              "✅ 用户正在其他服务器聊天，只刷新服务器列表，不自动切换到新服务器",
            );
          }
          break;
        // 被踢出服务器
        case "serverMemberKick":
          await store.dispatch("server/getSeverList", { timestamp: 0 });

          // 如果当前选中的服务器是被踢出的服务器，重置选择
          if (store.state.server.curServer?.serverId === serverId) {
            const serverList = store.state.server.serverList;
            if (serverList && serverList.length > 0) {
              store.commit("server/setCurServer", serverList[0]);
              // 获取新服务器的频道列表
              await store.dispatch("channel/getChannelsByPage", {
                serverId: serverList[0].serverId,
                timestamp: 0,
              });
            } else {
              // 没有其他服务器了，重置状态
              store.commit("server/setCurServer", null);
              store.commit("channel/resetCurrentChannel");
            }
          }
          break;
        // 删除服务器
        case "serverRemove":
          await store.dispatch("server/getSeverList", { timestamp: 0 });

          // 如果当前选中的服务器被删除，重置选择
          if (store.state.server.curServer?.serverId === serverId) {
            const serverList = store.state.server.serverList;
            if (serverList && serverList.length > 0) {
              store.commit("server/setCurServer", serverList[0]);
              // 获取新服务器的频道列表
              await store.dispatch("channel/getChannelsByPage", {
                serverId: serverList[0].serverId,
                timestamp: 0,
              });
            } else {
              // 没有其他服务器了，重置状态
              store.commit("server/setCurServer", null);
              store.commit("channel/resetCurrentChannel");
            }
          }
          break;
        // 更新服务器
        case "serverUpdate":
          store.dispatch("server/getSeverList", { timestamp: 0 });
          break;

        // 创建频道
        case "channelCreate":
          store.dispatch("channel/getChannelsByPage", {
            serverId: serverId,
            timestamp: 0,
          });
          break;
        // 删除频道
        case "channelRemove":
          await store.dispatch("channel/getChannelsByPage", {
            serverId: serverId,
            timestamp: 0,
          });
          store.commit("channel/resetCurrentChannel");
          break;
        // 修改频道
        case "channelUpdate":
          await store.dispatch("channel/getChannelsByPage", {
            serverId: serverId,
            timestamp: 0,
          });
          store.commit("channel/resetCurrentChannel");
          break;
      }
    }
  });

  // 频道聊天室消息
  instance.on("message", (res: any) => {
    logger.log("收到QChat消息事件:", res);
    if (
      store.state.channel.currentChannel &&
      res.channelId === store.state.channel.currentChannel.channelId
    ) {
      //消息追加到当前窗口中
      store.commit("channel/addCurChannelMsgs", { data: [res] });
    }
  });

  instance.on("messageUpdate", function (msg: any) {
    // 可以在此处理消息更新事件
    logger.log("收到消息更新事件:", msg);
  });

  //监听未读消息
  instance.on("unreadInfo", (unreadInfo: QChatUnreadInfo) => {
    if (unreadInfo.unreadCount > 0) {
      store.commit("channel/setUnReadNum", unreadInfo);
    }
  });

  logger.log("✅ QChat事件监听设置完成");
};

export const nimAttachEvents = (instance: NIMSDK, store: any) => {
  logger.log("开始设置NIM事件监听...");

  instance.on("syncMyNameCard", (syncMyNameCardResult: UserNameCard) => {
    logger.log(`收到 IM 个人信息：`);
    store.commit("user/setUserProfile", syncMyNameCardResult);
  });

  instance.on("logined", (res: any) => {
    logger.log(`收到 IM logined 事件：`, res);
  });

  instance.on("disconnect", () => {
    logger.log(`nim 断开连接!`);
    destroySocket();
  });

  instance.on("kicked", () => {
    logger.log(`nim 被踢下线!`);
    destroySocket();
  });

  logger.log("✅ NIM事件监听设置完成");
};
