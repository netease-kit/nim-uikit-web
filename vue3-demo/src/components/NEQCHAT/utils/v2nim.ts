/**
 * V2NIM 实例访问辅助工具
 * 提供类型安全的V2NIM服务访问方式
 */
import V2NIM from "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK";
import { getCurrentInstance } from "vue";

declare global {
  interface Window {
    qchat: InstanceType<typeof V2NIM>;
    v2nimInstance: InstanceType<typeof V2NIM>;
    nim: InstanceType<typeof V2NIM>;
    V2NIM: typeof V2NIM;
  }
}

// 全局NIM实例引用，用于非Vue组件上下文中访问
let globalNIMInstance: InstanceType<typeof V2NIM> | null = null;

/**
 * 设置全局NIM实例引用
 * @param instance NIM实例
 */
export function setGlobalNIMInstance(instance: InstanceType<typeof V2NIM>) {
  globalNIMInstance = instance;
}

/**
 * 获取V2NIM实例
 * 使用UIKit提供的NIM实例获取方式
 * @returns V2NIM实例
 */
export function getV2NIMInstance(): InstanceType<typeof V2NIM> {
  // 优先从Vue组件上下文获取
  try {
    const currentInstance = getCurrentInstance();
    if (currentInstance?.proxy?.$NIM) {
      return currentInstance.proxy.$NIM;
    }
  } catch (error) {
    // 在非Vue组件上下文中，getCurrentInstance会失败
  }

  // 从全局引用获取
  if (globalNIMInstance) {
    return globalNIMInstance;
  }

  throw new Error("V2NIM实例未初始化，请确保在UIKit初始化完成后使用QChat功能");
}

/**
 * 圈组服务器服务
 */
export function getQChatServerService() {
  const instance = getV2NIMInstance();
  return instance.qchatServer;
}

/**
 * 圈组频道服务
 */
export function getQChatChannelService() {
  const instance = getV2NIMInstance();
  return instance.qchatChannel;
}

/**
 * 圈组消息服务
 */
export function getQChatMsgService() {
  const instance = getV2NIMInstance();
  return instance.qchatMsg;
}

/**
 * 圈组角色服务
 */
export function getQChatRoleService() {
  const instance = getV2NIMInstance();
  return instance.qchatRole;
}

export function getCloudStorageService() {
  const instance = getV2NIMInstance();
  return instance.cloudStorage;
}

/**
 * 圈组媒体服务
 */
export function getQChatMediaService() {
  const instance = getV2NIMInstance();
  return instance.qchatMedia;
}

/**
 * V2NIM登录服务
 */
export function getV2NIMLoginService() {
  const instance = getV2NIMInstance();
  return instance.V2NIMLoginService;
}

/**
 * 检查V2NIM实例是否已初始化
 */
export function isV2NIMInitialized(): boolean {
  try {
    return !!getV2NIMInstance();
  } catch (error) {
    return false;
  }
}
