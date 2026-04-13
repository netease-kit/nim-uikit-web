// V2 SDK 类型兼容工具
// 临时解决方案：将本地类型转换为SDK期望的类型

export function toV2Type<T>(obj: any): T {
  return obj as T;
}

export function fromV2Type<T>(obj: any): T {
  return obj as T;
}

// 为特定的参数创建转换函数
export function toV2GetChannelsByPageOptions(options: any) {
  return {
    ...options,
    limit: options.limit || 100,
  } as any;
}

export function toV2GetMembersByPageOptions(options: any) {
  return {
    serverId: options.serverId,
    channelId: options.channelId,
    ...options,
  } as any;
}

export function toV2QChatMessage(msg: any) {
  return {
    ...msg,
    type: msg.type || msg.msgType,
    fromAccount: msg.fromAccount || msg.fromAccid,
  } as any;
}

export function toV2ServerOptions(options: any) {
  return {
    ...options,
    inviteMode: (options.inviteMode as 0 | 1) || 0,
  } as any;
}

export function toV2SubscribeChannelResult(result: any): any[] {
  if (Array.isArray(result)) {
    return result;
  }
  return [];
}
