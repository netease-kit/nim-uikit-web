import { autorun } from "../../../../libs/store";
import { t } from "../../../utils/i18n";

const ALLOW_AT = "yxAllowAt";

const enum V2NIMMessageNotificationType {
    /** 未定义通知类型 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_UNDEFINED = -1,
    /** 群拉人 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE = 0,
    /** 群踢人 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_KICK = 1,
    /** 退出群 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_LEAVE = 2,
    /** 更新群信息 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_UPDATE_TINFO = 3,
    /** 群解散 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_DISMISS = 4,
    /** 群申请加入通过 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_APPLY_PASS = 5,
    /** 移交群主 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_OWNER_TRANSFER = 6,
    /** 添加管理员 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_ADD_MANAGER = 7,
    /** 移除管理员 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_REMOVE_MANAGER = 8,
    /** 接受邀请进群 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE_ACCEPT = 9,
    /** 禁言群成员 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_BANNED_TEAM_MEMBER = 10,
    /** 群拉人 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_INVITE = 401,
    /** 群踢人 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_KICK = 402,
    /** 退出群 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_LEAVE = 403,
    /** 更新群信息 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_UPDATE_TINFO = 404,
    /** 解散群 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_DISMISS = 405,
    /** 群申请加入通过 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_APPLY_PASS = 410,
    /** 移交群主 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_OWNER_TRANSFER = 406,
    /** 添加管理员 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_ADD_MANAGER = 407,
    /** 移除管理员 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_REMOVE_MANAGER = 408,
    /** 接受邀请进群 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_INVITE_ACCEPT = 411,
    /** 禁言群成员 */
    V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_BANNED_TEAM_MEMBER = 409
}

/**
 * 群组邀请模式定义
 */
const enum V2NIMTeamInviteMode {
    /**
     * 群主，管理员可以邀请其他人入群
     */
    V2NIM_TEAM_INVITE_MODE_MANAGER = 0,
    /**
     * 所有人都可以邀请其他人入群
     */
    V2NIM_TEAM_INVITE_MODE_ALL = 1
}

/**
 * 群组资料修改模式
 */
const enum V2NIMTeamUpdateInfoMode {
    /**
     * 群主, 管理员可以修改群组资料
     */
    V2NIM_TEAM_UPDATE_INFO_MODE_MANAGER = 0,
    /**
     * 所有人均可以修改群组资料
     */
    V2NIM_TEAM_UPDATE_INFO_MODE_ALL = 1
}

/**
 * 群组禁言模式类型定义
 */
const enum V2NIMTeamChatBannedMode {
    /**
     * 不禁言. 群组成员可以自由发言
     */
    V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN = 0,
    /**
     * 普通成员禁言. 但不包括管理员, 群主.
     */
    V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_NORMAL = 1,
    /**
     * 全员禁言，群组所有成员都被禁言.
     *
     * 注: 该状态只能 OpenApi 发起, 而 SDK 不允许主动设置这个状态
     */
    V2NIM_TEAM_CHAT_BANNED_MODE_BANNED_ALL = 3
}

Component({
  properties: {
    notificationMsg: {
      type: Object,
      value: {}
    },
    showTime: {
      type: Boolean,
      value: false
    },
    theme: {
      type: String,
      value: 'light'
    }
  },

  data: {
    formatTime: '',
    notificationContent: '',
    notificationContentDisposer: null
  },

  lifetimes: {
    attached() {
      // 初始化nim和store实例
      const app = getApp() as any;
      const { nim, store } = app.globalData;
      
      // 将nim、store对象存储为不需要监听变化的实例属性
      (this as any).nimInstance = nim;
      (this as any).storeInstance = store;

      console.log('============ this.properties.notificationMsg ===========', this.properties.notificationMsg)
      
      if (store) {
        const notificationContentDisposer = autorun(()=>{
          const getNotificationContent = () => {
            const attachment = this.properties.notificationMsg.attachment;
            if (attachment && attachment.type !== undefined) {
              switch (attachment.type) {
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_UPDATE_TINFO: {
                  const team = (attachment && attachment.updatedTeamInfo) ? attachment.updatedTeamInfo : {};
                  const content: string[] = [];

                  if (team.avatar !== undefined) {
                    content.push(t("updateTeamAvatar"));
                  }
                  if (team.name !== undefined) {
                    content.push(`${t("updateTeamName")}“${team.name}”`);
                  }
                  if (team.intro !== undefined) {
                    content.push(t("updateTeamIntro"));
                  }
                  if (team.inviteMode !== undefined) {
                    content.push(
                      `${t("updateTeamInviteMode")}“${
                        team.inviteMode ===
                        V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
                          ? t("teamAll")
                          : t("teamOwnerAndManagerText")
                      }”`
                    );
                  }
                  if (team.updateInfoMode !== undefined) {
                    content.push(
                      `${t("updateTeamUpdateTeamMode")}“${
                        team.updateInfoMode ===
                        V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
                          ? t("teamAll")
                          : t("teamOwnerAndManagerText")
                      }”`
                    );
                  }
                  if (team.chatBannedMode !== void 0) {
                    content.push(
                      `${t("updateTeamMute")}${
                        team.chatBannedMode ===
                        V2NIMTeamChatBannedMode
                          .V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
                          ? t("closeText")
                          : t("openText")
                      }`
                    );
                  }
                  if (team.serverExtension) {
                    let ext:any = {};
                    try {
                      ext = JSON.parse(team.serverExtension);
                    } catch (error) {
                      //
                    }
                    if (ext[ALLOW_AT] !== undefined) {
                      content.push(
                        `${t("updateAllowAt")}“${
                          ext[ALLOW_AT] === "manager"
                            ? t("teamOwnerAndManagerText")
                            : t("teamAll")
                        }”`
                      );
                    }
                  }
                  return content.length
                    ? `${(this as any).storeInstance.uiStore.getAppellation({
                        account: this.properties.notificationMsg.senderId,
                        teamId: team.teamId,
                      })} ${content.join("、")}`
                    : "";
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_APPLY_PASS:
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE_ACCEPT: {
                  return `${(this as any).storeInstance.uiStore.getAppellation({
                    account: this.properties.notificationMsg.senderId,
                    teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                  })} ${t("joinTeamText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_INVITE: {
                  const accounts: string[] = (attachment && attachment.targetIds) ? attachment.targetIds : [];
                  accounts.map(async (item) => {
                    await (this as any).storeInstance.userStore.getUserActive(item);
                  });
                  const nicks = accounts
                    .map((item) => {
                      return (this as any).storeInstance.uiStore.getAppellation({
                        account: item,
                        teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                      });
                    })
                    .filter((item) => !!item)
                    .join("、");

                  return `${nicks} ${t("joinTeamText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_KICK: {
                  const accounts: string[] = (attachment && attachment.targetIds) ? attachment.targetIds : [];
                  accounts.map(async (item) => {
                    await (this as any).storeInstance.userStore.getUserActive(item);
                  });
                  const nicks = accounts
                    .map((item) => {
                      return (this as any).storeInstance.uiStore.getAppellation({
                        account: item,
                        teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                      });
                    })
                    .filter((item) => !!item)
                    .join("、");

                  return `${nicks} ${t("beRemoveTeamText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_ADD_MANAGER: {
                  const accounts: string[] = (attachment && attachment.targetIds) ? attachment.targetIds : [];
                  accounts.map(async (item) => {
                    await (this as any).storeInstance.userStore.getUserActive(item);
                  });
                  const nicks = accounts
                    .map((item) => {
                      return (this as any).storeInstance.uiStore.getAppellation({
                        account: item,
                        teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                      });
                    })
                    .filter((item) => !!item)
                    .join("、");

                  return `${nicks} ${t("beAddTeamManagersText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_REMOVE_MANAGER: {
                  const accounts: string[] = (attachment && attachment.targetIds) ? attachment.targetIds : [];
                  accounts.map(async (item) => {
                    await (this as any).storeInstance.userStore.getUserActive(item);
                  });
                  const nicks = accounts
                    .map((item) => {
                      return (this as any).storeInstance.uiStore.getAppellation({
                        account: item,
                        teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                      });
                    })
                    .filter((item) => !!item)
                    .join("、");

                  return `${nicks} ${t("beRemoveTeamManagersText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_LEAVE: {
                  return `${(this as any).storeInstance.uiStore.getAppellation({
                    account: this.properties.notificationMsg.senderId,
                    teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                  })} ${t("leaveTeamText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_OWNER_TRANSFER: {
                  return `${(this as any).storeInstance.uiStore.getAppellation({
                    account: ((attachment && attachment.targetIds) ? attachment.targetIds : [])[0],
                    teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                  })} ${t("newGroupOwnerText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_DISMISS: {
                  return `${(this as any).storeInstance.uiStore.getAppellation({
                    account: this.properties.notificationMsg.senderId,
                    teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                  })} 解散了群组`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_TEAM_BANNED_TEAM_MEMBER: {
                  const accounts: string[] = (attachment && attachment.targetIds) ? attachment.targetIds : [];
                  accounts.map(async (item) => {
                    await (this as any).storeInstance.userStore.getUserActive(item);
                  });
                  const nicks = accounts
                    .map((item) => {
                      return (this as any).storeInstance.uiStore.getAppellation({
                        account: item,
                        teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                      });
                    })
                    .filter((item) => !!item)
                    .join("、");

                  return `${nicks} 被禁言`;
                }
                // 超级群通知类型处理
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_UPDATE_TINFO: {
                  const team = (attachment && attachment.updatedTeamInfo) ? attachment.updatedTeamInfo : {};
                  const content: string[] = [];

                  if (team.avatar !== undefined) {
                    content.push(t("updateTeamAvatar"));
                  }
                  if (team.name !== undefined) {
                    content.push(`${t("updateTeamName")}"${team.name}"`);
                  }
                  if (team.intro !== undefined) {
                    content.push(t("updateTeamIntro"));
                  }
                  if (team.inviteMode !== undefined) {
                    content.push(
                      `${t("updateTeamInviteMode")}"${
                        team.inviteMode ===
                        V2NIMTeamInviteMode.V2NIM_TEAM_INVITE_MODE_ALL
                          ? t("teamAll")
                          : t("teamOwnerAndManagerText")
                      }"`
                    );
                  }
                  if (team.updateInfoMode !== undefined) {
                    content.push(
                      `${t("updateTeamUpdateTeamMode")}"${
                        team.updateInfoMode ===
                        V2NIMTeamUpdateInfoMode.V2NIM_TEAM_UPDATE_INFO_MODE_ALL
                          ? t("teamAll")
                          : t("teamOwnerAndManagerText")
                      }"`
                    );
                  }
                  if (team.chatBannedMode !== void 0) {
                    content.push(
                      `${t("updateTeamMute")}${
                        team.chatBannedMode ===
                        V2NIMTeamChatBannedMode
                          .V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
                          ? t("closeText")
                          : t("openText")
                      }`
                    );
                  }
                  if (team.serverExtension) {
                    let ext:any = {};
                    try {
                      ext = JSON.parse(team.serverExtension);
                    } catch (error) {
                      //
                    }
                    if (ext[ALLOW_AT] !== undefined) {
                      content.push(
                        `${t("updateAllowAt")}"${
                          ext[ALLOW_AT] === "manager"
                            ? t("teamOwnerAndManagerText")
                            : t("teamAll")
                        }"`
                      );
                    }
                  }
                  return content.length
                    ? `${(this as any).storeInstance.uiStore.getAppellation({
                        account: this.properties.notificationMsg.senderId,
                        teamId: team.teamId,
                      })} ${content.join("、")}`
                    : "";
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_APPLY_PASS:
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_INVITE_ACCEPT: {
                  return `${(this as any).storeInstance.uiStore.getAppellation({
                    account: this.properties.notificationMsg.senderId,
                    teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                  })} ${t("joinTeamText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_INVITE: {
                  const accounts: string[] = (attachment && attachment.targetIds) ? attachment.targetIds : [];
                  accounts.map(async (item) => {
                    await (this as any).storeInstance.userStore.getUserActive(item);
                  });
                  const nicks = accounts
                    .map((item) => {
                      return (this as any).storeInstance.uiStore.getAppellation({
                        account: item,
                        teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                      });
                    })
                    .filter((item) => !!item)
                    .join("、");

                  return `${nicks} ${t("joinTeamText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_KICK: {
                  const accounts: string[] = (attachment && attachment.targetIds) ? attachment.targetIds : [];
                  accounts.map(async (item) => {
                    await (this as any).storeInstance.userStore.getUserActive(item);
                  });
                  const nicks = accounts
                    .map((item) => {
                      return (this as any).storeInstance.uiStore.getAppellation({
                        account: item,
                        teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                      });
                    })
                    .filter((item) => !!item)
                    .join("、");

                  return `${nicks} ${t("beRemoveTeamText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_ADD_MANAGER: {
                  const accounts: string[] = (attachment && attachment.targetIds) ? attachment.targetIds : [];
                  accounts.map(async (item) => {
                    await (this as any).storeInstance.userStore.getUserActive(item);
                  });
                  const nicks = accounts
                    .map((item) => {
                      return (this as any).storeInstance.uiStore.getAppellation({
                        account: item,
                        teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                      });
                    })
                    .filter((item) => !!item)
                    .join("、");

                  return `${nicks} ${t("beAddTeamManagersText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_REMOVE_MANAGER: {
                  const accounts: string[] = (attachment && attachment.targetIds) ? attachment.targetIds : [];
                  accounts.map(async (item) => {
                    await (this as any).storeInstance.userStore.getUserActive(item);
                  });
                  const nicks = accounts
                    .map((item) => {
                      return (this as any).storeInstance.uiStore.getAppellation({
                        account: item,
                        teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                      });
                    })
                    .filter((item) => !!item)
                    .join("、");

                  return `${nicks} ${t("beRemoveTeamManagersText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_LEAVE: {
                  return `${(this as any).storeInstance.uiStore.getAppellation({
                    account: this.properties.notificationMsg.senderId,
                    teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                  })} ${t("leaveTeamText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_OWNER_TRANSFER: {
                  return `${(this as any).storeInstance.uiStore.getAppellation({
                    account: ((attachment && attachment.targetIds) ? attachment.targetIds : [])[0],
                    teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                  })} ${t("newGroupOwnerText")}`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_DISMISS: {
                  return `${(this as any).storeInstance.uiStore.getAppellation({
                    account: this.properties.notificationMsg.senderId,
                    teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                  })} 解散了群组`;
                }
                case V2NIMMessageNotificationType
                  .V2NIM_MESSAGE_NOTIFICATION_TYPE_SUPER_TEAM_BANNED_TEAM_MEMBER: {
                  const accounts: string[] = (attachment && attachment.targetIds) ? attachment.targetIds : [];
                  accounts.map(async (item) => {
                    await (this as any).storeInstance.userStore.getUserActive(item);
                  });
                  const nicks = accounts
                    .map((item) => {
                      return (this as any).storeInstance.uiStore.getAppellation({
                        account: item,
                        teamId: (attachment && attachment.teamId) ? attachment.teamId : null,
                      });
                    })
                    .filter((item) => !!item)
                    .join("、");

                  return `${nicks} 被禁言`;
                }
                default:
                  // 对于未知的通知类型，尝试使用parseNotificationContent方法
                  const parsedContent = this.parseNotificationContent(attachment);
                  if (parsedContent) {
                    return parsedContent;
                  }
                  // 如果还是没有内容，返回通用的系统通知
                  return t("notiMsgText") || "系统通知";
              }
            }
            
          };
          this.setData({
            notificationContent: getNotificationContent()
          });
        })

        this.setData({
          notificationContentDisposer
        });
      }

    },
    
    detached() {
      if (this.data.notificationContentDisposer) {
        (this.data.notificationContentDisposer as () => void)();
      }
    }
  },

  observers: {
    'notificationMsg.time, showTime': function(time: number, showTime: boolean) {
      if (showTime && time) {
        this.setData({
          formatTime: this.formatNotificationTime(time)
        });
      } else {
        this.setData({
          formatTime: ''
        });
      }
    },
    
    'notificationMsg': function(notificationMsg: any) {
      if (notificationMsg && notificationMsg.messageType === 'notification') {

        
        // 遍历打印所有属性
        console.log('=== notificationMsg ===', notificationMsg);


        // 如果没有content或text字段，尝试从attachment中解析
        if (!notificationMsg.content && !notificationMsg.text && notificationMsg.attachment) {
          const content = this.parseNotificationContent(notificationMsg.attachment);
          console.log('解析后的内容:', content);
          if (content) {
            // 更新消息对象的content字段
            notificationMsg.content = content;
            console.log('更新后的notificationMsg:', notificationMsg);
            this.setData({
              notificationMsg: { ...notificationMsg }
            });
            console.log('已强制更新组件数据');
          }
        }
      }
    }
  },

  methods: {
    // 处理通知点击
    handleNotificationClick(e: any) {
      const notification = e.currentTarget.dataset.notification;
      if (!notification) {
        return;
      }
      
      this.triggerEvent('notificationClick', {
        notification,
        type: notification.type
      });
    },
    
    // 处理接受好友申请
    handleAcceptFriend(e: any) {
      e.stopPropagation();
      const notification = e.currentTarget.dataset.notification;
      if (!notification) {
        return;
      }
      
      this.triggerEvent('acceptFriend', {
        notification,
        userId: notification.from || notification.userId
      });
    },
    
    // 处理拒绝好友申请
    handleRejectFriend(e: any) {
      e.stopPropagation();
      const notification = e.currentTarget.dataset.notification;
      if (!notification) {
        return;
      }
      
      this.triggerEvent('rejectFriend', {
        notification,
        userId: notification.from || notification.userId
      });
    },
    
    // 处理接受群邀请
    handleAcceptGroup(e: any) {
      e.stopPropagation();
      const notification = e.currentTarget.dataset.notification;
      if (!notification) {
        return;
      }
      
      this.triggerEvent('acceptGroup', {
        notification,
        groupId: notification.groupId || notification.teamId
      });
    },
    
    // 处理拒绝群邀请
    handleRejectGroup(e: any) {
      e.stopPropagation();
      const notification = e.currentTarget.dataset.notification;
      if (!notification) {
        return;
      }
      
      this.triggerEvent('rejectGroup', {
        notification,
        groupId: notification.groupId || notification.teamId
      });
    },
    
    // 获取成员变更图标
    getMemberChangeIcon(action: string): string {
      const iconMap: { [key: string]: string } = {
        join: 'user-add',
        leave: 'user-remove',
        kick: 'user-remove',
        invite: 'user-add',
        promote: 'crown',
        demote: 'user',
        mute: 'mute',
        unmute: 'unmute'
      };
      
      return iconMap[action] || 'user';
    },
    
    // 获取成员变更颜色
    getMemberChangeColor(action: string): string {
      const colorMap: { [key: string]: string } = {
        join: '#34c759',
        leave: '#ff3b30',
        kick: '#ff3b30',
        invite: '#34c759',
        promote: '#ff9500',
        demote: '#999999',
        mute: '#ff9500',
        unmute: '#34c759'
      };
      
      return colorMap[action] || '#999999';
    },
    
    // 格式化成员变更文本
    formatMemberChangeText(notification: any): string {
      if (!notification) {
        return '';
      }
      
      const { action, operator, target, targets } = notification;
      const operatorName = this.getUserName(operator);
      
      switch (action) {
        case 'join':
          if (targets && targets.length > 1) {
            const names = targets.map((user: any) => this.getUserName(user)).join('、');
            return `${names} 加入了群聊`;
          } else {
            const targetName = this.getUserName(target);
            return `${targetName} 加入了群聊`;
          }
          
        case 'leave':
          const leaveName = this.getUserName(target);
          return `${leaveName} 离开了群聊`;
          
        case 'kick':
          if (targets && targets.length > 1) {
            const names = targets.map((user: any) => this.getUserName(user)).join('、');
            return `${operatorName} 将 ${names} 移出了群聊`;
          } else {
            const targetName = this.getUserName(target);
            return `${operatorName} 将 ${targetName} 移出了群聊`;
          }
          
        case 'invite':
          if (targets && targets.length > 1) {
            const names = targets.map((user: any) => this.getUserName(user)).join('、');
            return `${operatorName} 邀请 ${names} 加入了群聊`;
          } else {
            const targetName = this.getUserName(target);
            return `${operatorName} 邀请 ${targetName} 加入了群聊`;
          }
          
        case 'promote':
          const promoteName = this.getUserName(target);
          return `${operatorName} 将 ${promoteName} 设为管理员`;
          
        case 'demote':
          const demoteName = this.getUserName(target);
          return `${operatorName} 取消了 ${demoteName} 的管理员身份`;
          
        case 'mute':
          const muteName = this.getUserName(target);
          return `${operatorName} 禁言了 ${muteName}`;
          
        case 'unmute':
          const unmuteName = this.getUserName(target);
          return `${operatorName} 取消了 ${unmuteName} 的禁言`;
          
        default:
          return notification.content || notification.text || '群成员发生变更';
      }
    },
    
    // 格式化群信息变更文本
    formatGroupChangeText(notification: any): string {
      if (!notification) {
        return '';
      }
      
      const { action, operator, oldValue, newValue } = notification;
      const operatorName = this.getUserName(operator);
      
      switch (action) {
        case 'updateName':
          return `${operatorName} 修改群名称为 "${newValue}"`;
          
        case 'updateAvatar':
          return `${operatorName} 修改了群头像`;
          
        case 'updateIntro':
          return `${operatorName} 修改了群介绍`;
          
        case 'updateAnnouncement':
          return `${operatorName} 发布了群公告`;
          
        case 'updateJoinMode':
          const joinModeText = newValue === 'free' ? '自由加入' : '需要验证';
          return `${operatorName} 修改群加入方式为 "${joinModeText}"`;
          
        case 'updateInviteMode':
          const inviteModeText = newValue === 'manager' ? '仅管理员可邀请' : '所有人可邀请';
          return `${operatorName} 修改群邀请权限为 "${inviteModeText}"`;
          
        case 'updateMuteMode':
          const muteText = newValue ? '开启全员禁言' : '关闭全员禁言';
          return `${operatorName} ${muteText}`;
          
        default:
          return notification.content || notification.text || '群信息发生变更';
      }
    },
    
    // 格式化撤回文本
    formatRecallText(notification: any): string {
      if (!notification) {
        return '';
      }
      
      const { operator, target } = notification;
      const operatorName = this.getUserName(operator);
      const targetName = this.getUserName(target);
      
      if (operator && target && operator.userId !== target.userId) {
        return `${operatorName} 撤回了 ${targetName} 的一条消息`;
      } else {
        return `${operatorName || targetName} 撤回了一条消息`;
      }
    },
    
    // 格式化好友申请文本
    formatFriendRequestText(notification: any): string {
      if (!notification) {
        return '';
      }
      
      const { from, message } = notification;
      const fromName = this.getUserName(from);
      
      let text = `${fromName} 申请添加您为好友`;
      if (message) {
        text += `\n验证消息：${message}`;
      }
      
      return text;
    },
    
    // 格式化群邀请文本
    formatGroupInviteText(notification: any): string {
      if (!notification) {
        return '';
      }
      
      const { from, groupName, message } = notification;
      const fromName = this.getUserName(from);
      
      let text = `${fromName} 邀请您加入群聊 "${groupName || '未知群聊'}"`;
      if (message) {
        text += `\n邀请消息：${message}`;
      }
      
      return text;
    },
    
    // 获取用户名称
    getUserName(user: any): string {
      if (!user) {
        return '未知用户';
      }
      
      if (typeof user === 'string') {
        return user;
      }
      
      return user.name || user.nick || user.userId || '未知用户';
    },
    
    // 格式化通知时间
    formatNotificationTime(timestamp: number): string {
      // 使用统一的时间格式化函数，避免toLocaleTimeString等可能导致英文显示的API
      const { formatMessageTime } = require('../../../utils/date');
      return formatMessageTime(timestamp);
    },
    
    // 获取通知类型显示文本
    getNotificationTypeText(type: string): string {
      const typeMap: { [key: string]: string } = {
        system: '系统通知',
        memberChange: '成员变更',
        groupChange: '群信息变更',
        recall: '消息撤回',
        friendRequest: '好友申请',
        groupInvite: '群邀请',
        time: '时间提示',
        custom: '自定义通知'
      };
      
      return typeMap[type] || '未知通知';
    },
    
    // 检查通知是否需要操作按钮
    needsActionButtons(notification: any): boolean {
      if (!notification) {
        return false;
      }
      
      const { type, status, showActions } = notification;
      
      // 明确指定不显示操作按钮
      if (showActions === false) {
        return false;
      }
      
      // 已处理的通知不显示操作按钮
      if (status === 'accepted' || status === 'rejected' || status === 'expired') {
        return false;
      }
      
      // 需要操作按钮的通知类型
      return type === 'friendRequest' || type === 'groupInvite';
    },
    
    // 获取通知状态文本
    getNotificationStatusText(notification: any): string {
      if (!notification || !notification.status) {
        return '';
      }
      
      const statusMap: { [key: string]: string } = {
        pending: '待处理',
        accepted: '已同意',
        rejected: '已拒绝',
        expired: '已过期',
        cancelled: '已取消'
      };
      
      return statusMap[notification.status] || '';
    },
    
    // 检查通知是否可点击
    isNotificationClickable(notification: any): boolean {
      if (!notification) {
        return false;
      }
      
      // 时间提示不可点击
      if (notification.type === 'time') {
        return false;
      }
      
      return true;
    },
    
    // 解析通知消息内容
    parseNotificationContent(attachment: any): string {
      if (!attachment) {
        return '';
      }
      
      // 根据不同的通知类型解析内容
      switch (attachment.type) {
        case 1: // 群成员加入
          return `${(attachment.targets && attachment.targets.join) ? attachment.targets.join(', ') : '用户'} 加入了群聊`;
        case 2: // 群成员退出
          return `${(attachment.targets && attachment.targets.join) ? attachment.targets.join(', ') : '用户'} 退出了群聊`;
        case 3: // 群信息更新
          return '群信息已更新';
        case 4: // 群成员被踢出
          return `${(attachment.targets && attachment.targets.join) ? attachment.targets.join(', ') : '用户'} 被移出群聊`;
        case 5: // 群主转让
          return '群主已转让';
        case 6: // 群管理员变更
          return '群管理员已变更';
        case 7: // 群禁言
          return '群聊已禁言';
        case 8: // 群解除禁言
          return '群聊已解除禁言';
        default:
          // 如果有文本内容，直接返回
          if (attachment.text) {
            return attachment.text;
          }
          // 否则返回通用提示
          return '系统通知';
      }
    }
  }
});