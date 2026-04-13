// V2 SDK 兼容性类型定义
// 临时解决方案，后续需要逐步替换为真正的V2类型

// QChat 服务器相关类型
export interface ServerInfo {
  serverId: string;
  name: string;
  icon: string;
  custom: string;
  owner: string;
  memberNumber: number;
  inviteMode: number;
  applyMode: number;
  valid: boolean;
  createTime: number;
  updateTime: number;
  channelNum: number;
  searchType: number;
  searchEnable: boolean;
  [key: string]: any;
}

export interface MemberInfo {
  serverId: string;
  accid: string;
  type: number;
  nick: string;
  avatar: string;
  custom: string;
  joinTime: number;
  inviter: string;
  valid: boolean;
  updateTime: number;
  createTime: number;
  [key: string]: any;
}

// QChat 频道相关类型
export interface ChannelInfo {
  serverId: string;
  channelId: string;
  name: string;
  topic: string;
  custom: string;
  type: number;
  categoryId: string;
  viewMode: number;
  valid: boolean;
  createTime: number;
  updateTime: number;
  owner: string;
  memberNumber: number;
  syncMode: number;
  visitorMode: number;
  [key: string]: any;
}

// QChat 消息相关类型
export interface QChatMessage {
  serverId: string;
  channelId: string;
  fromAccid: string;
  fromClientType: number;
  fromDeviceId: string;
  fromNick: string;
  toAccids: string[];
  time: number;
  updateTime: number;
  msgIdServer: string;
  msgIdClient: string;
  msgType: number;
  body: string;
  attach: any;
  ext: any;
  callbackExt: any;
  mentionedAccidAll: boolean;
  mentionedAccids: string[];
  mentionedRoleAll: boolean;
  mentionedRoles: string[];
  historyEnable: boolean;
  pushPayload: any;
  pushContent: string;
  pushEnable: boolean;
  needBadge: boolean;
  needPushNick: boolean;
  routeEnable: boolean;
  env: string;
  status: number;
  // v2 兼容性字段
  type?: any;
  fromAccount?: string;
  [key: string]: any;
}

// QChat 角色相关类型
export interface QChatServerRole {
  serverId: string;
  roleId: string;
  name: string;
  icon: string;
  ext: string;
  permissions: any;
  type: number;
  memberCount: number;
  priority: number;
  createTime: number;
  updateTime: number;
  valid: boolean;
  [key: string]: any;
}

export interface QChatChannelRole {
  serverId: string;
  channelId: string;
  roleId: string;
  parentRoleId: string;
  name: string;
  icon: string;
  ext: string;
  permissions: any;
  type: number;
  valid: boolean;
  createTime: number;
  updateTime: number;
  [key: string]: any;
}

// 用户相关类型
export interface UserNameCard {
  account: string;
  nick: string;
  avatar: string;
  sign: string;
  gender: string;
  email: string;
  birth: string;
  mobile: string;
  ex: string;
  createTime: number;
  updateTime: number;
  [key: string]: any;
}

// 分页查询结果类型
export interface GetServerMembersByPageResult {
  datas: MemberInfo[];
  listQueryTag: string;
}

export interface GetMembersByPageResult {
  datas: MemberInfo[];
  listQueryTag: string;
}

// 选项类型
export interface CreateChannelOptions {
  serverId: string;
  name: string;
  topic?: string;
  custom?: string;
  type?: number;
  categoryId?: string;
  viewMode?: number;
  syncMode?: number;
  visitorMode?: number;
  [key: string]: any;
}

export interface UpdateChannelOptions {
  serverId: string;
  channelId: string;
  name?: string;
  topic?: string;
  custom?: string;
  viewMode?: number;
  syncMode?: number;
  visitorMode?: number;
  [key: string]: any;
}

export interface DeleteChannelOptions {
  serverId: string;
  channelId: string;
  [key: string]: any;
}

export interface GetChannelsByPageOptions {
  serverId: string;
  timestamp?: number;
  limit?: number;
  [key: string]: any;
}

// 更多选项接口，根据需要添加
export interface GetServerMembersByPageOptions {
  serverId: string;
  timestamp?: number;
  limit?: number;
  [key: string]: any;
}

export interface CreateServerOptions {
  name: string;
  icon?: string;
  custom?: string;
  inviteMode?: number;
  applyMode?: number;
  searchType?: number;
  searchEnable?: boolean;
  [key: string]: any;
}

export interface UpdateServerOptions {
  serverId: string;
  name?: string;
  icon?: string;
  custom?: string;
  inviteMode?: number;
  applyMode?: number;
  searchType?: number;
  searchEnable?: boolean;
  [key: string]: any;
}

// 其他工具类型
export interface QChatUnreadInfo {
  serverId: string;
  channelId: string;
  unreadCount: number;
  mentionedCount: number;
  maxCount: number;
  lastMsgTime: number;
  [key: string]: any;
}

export interface IUploadFileOptions {
  type: string;
  fileInput?: HTMLInputElement;
  blob?: Blob;
  fileName?: string;
  [key: string]: any;
}

// 更多类型定义...
export interface AddMemberRoleOptions {
  [key: string]: any;
}

export interface GetMemberRolesOptions {
  [key: string]: any;
}

export interface UpdateServerRoleOptions {
  [key: string]: any;
}

export interface GetExistingAccidsOfMemberRolesOptions {
  [key: string]: any;
}

export interface GetChannelRolesOptions {
  [key: string]: any;
}

export interface GetServersByPageOptions {
  [key: string]: any;
}

export interface SubscribeChannelOptions {
  [key: string]: any;
}

export interface SubscribeChannelResult {
  [key: string]: any;
}

export interface GetServerRolesByAccidOptions {
  [key: string]: any;
}

export interface GetServersOptions {
  [key: string]: any;
}

export interface DeleteServerOptions {
  [key: string]: any;
}

export interface ApplyServerJoinOptions {
  [key: string]: any;
}

export interface SendSystemNotificationOptions {
  [key: string]: any;
}

export interface GetServerRolesOptions {
  [key: string]: any;
}

export interface AddChannelRoleOptions {
  [key: string]: any;
}

export interface CreateServerRoleOptions {
  [key: string]: any;
}

export interface UpdateServerRolePrioritiesOptions {
  [key: string]: any;
}

export interface SubscribeServerOptions {
  [key: string]: any;
}

export interface DeleteServerRoleOptions {
  [key: string]: any;
}

export interface GetMembersFromServerRoleOptions {
  [key: string]: any;
}

export interface AddMembersToServerRoleOptions {
  [key: string]: any;
}

export interface RemoveMembersFromServerRoleOptions {
  [key: string]: any;
}

export interface UpdateMemberRoleOptions {
  [key: string]: any;
}

export interface RemoveMemberRoleOptions {
  [key: string]: any;
}

export interface UpdateMyMemberInfoOptions {
  [key: string]: any;
}

export interface CheckPermissionOptions {
  [key: string]: any;
}

export interface KickServerMembersOptions {
  [key: string]: any;
}

export interface LeaveServerOptions {
  [key: string]: any;
}

export interface InviteServerMembersOptions {
  [key: string]: any;
}

export interface UpdateMyInfoOptions {
  [key: string]: any;
}

export interface GetWhiteBlackMembersPageOptions {
  [key: string]: any;
}

export interface UpdateWhiteBlackMembersOptions {
  [key: string]: any;
}

export interface UpdateChannelRoleOptions {
  [key: string]: any;
}

export interface GetMembersByPageOptions {
  [key: string]: any;
}

// 添加缺失的类型
export interface GetServersByPageResult {
  datas?: ServerInfo[];
  listQueryTag?: {
    hasMore?: boolean;
    nextTimetag?: number;
  };
}

export interface GetChannelsByPageResult {
  datas?: ChannelInfo[];
  listQueryTag?: {
    hasMore?: boolean;
    nextTimetag?: number;
  };
}

export interface GetServerMembersOptions {
  serverId: string;
  timestamp?: number;
  limit?: number;
  [key: string]: any;
}

export interface SendMessageOptions {
  serverId: string;
  channelId: string;
  msgType?: number;
  body?: string;
  attach?: any;
  mentionedAll?: boolean;
  mentionedRoleIdList?: string[];
  mentionedAccidList?: string[];
  [key: string]: any;
}
