// Global type declarations for V2 SDK compatibility
// This file temporarily overrides SDK types to allow compilation

declare global {
  interface Window {
    qchat: any;
    V2NIM: any;
  }
}

declare module "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK" {
  const V2NIM: any;
  export default V2NIM;
}

// Override SDK method types to accept any parameters
declare namespace QChatSDK {
  interface QChatServerService {
    getServersByPage(options: any): Promise<any>;
    getServerMembers(options: any): Promise<any>;
    getServers(options: any): Promise<any>;
    deleteServer(options: any): Promise<any>;
    applyServerJoin(options: any): Promise<any>;
    createServer(options: any): Promise<any>;
    updateServer(options: any): Promise<any>;
    subscribeServer(options: any): Promise<any>;
    updateMyMemberInfo(options: any): Promise<any>;
    kickServerMembers(options: any): Promise<any>;
    leaveServer(options: any): Promise<any>;
    inviteServerMembers(options: any): Promise<any>;
  }

  interface QChatChannelService {
    getChannelsByPage(options: any): Promise<any>;
    createChannel(options: any): Promise<any>;
    updateChannel(options: any): Promise<any>;
    deleteChannel(options: any): Promise<any>;
    getWhiteBlackMembersPage(options: any): Promise<any>;
    updateWhiteBlackMembers(options: any): Promise<any>;
    getMembersByPage(options: any): Promise<any>;
    subscribeChannel(options: any): Promise<any>;
  }

  interface QChatRoleService {
    getServerRolesByAccid(options: any): Promise<any>;
    getServerRoles(options: any): Promise<any>;
    createServerRole(options: any): Promise<any>;
    updateServerRole(options: any): Promise<any>;
    deleteServerRole(options: any): Promise<any>;
    updateServerRolePriorities(options: any): Promise<any>;
    getMembersFromServerRole(options: any): Promise<any>;
    addMembersToServerRole(options: any): Promise<any>;
    removeMembersFromServerRole(options: any): Promise<any>;
    getChannelRoles(options: any): Promise<any>;
    addChannelRole(options: any): Promise<any>;
    updateChannelRole(options: any): Promise<any>;
    getMemberRoles(options: any): Promise<any>;
    addMemberRole(options: any): Promise<any>;
    updateMemberRole(options: any): Promise<any>;
    removeMemberRole(options: any): Promise<any>;
    checkPermission(options: any): Promise<any>;
    getExistingAccidsOfMemberRoles(options: any): Promise<any>;
  }

  interface QChatMsgService {
    sendSystemNotification(options: any): Promise<any>;
    resendMessage(options: any): Promise<any>;
    sendMessage(options: any): Promise<any>;
    getHistoryMessage(options: any): Promise<any>;
    markMessageRead(options: any): Promise<any>;
  }
}

export {};
