import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import RootStore from "./store";
import V2NIM from "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK";
import { IM_UIKIT_VERSION } from "./constants";
let uiKitStore = null;
let nim = null;
/**
 * 初始化NIM SDK实例和UI Kit Store
 * @returns {Object} 包含NIM实例和Store的对象
 * @property {Object} nim - V2NIM SDK实例
 * @property {Object} store - UI Kit状态管理Store
 * @throws {Error} 当SDK初始化失败时抛出错误
 */
export const initIMUIKit = (appkey) => {
  nim = V2NIM.getInstance(
    {
      appkey,
      needReconnect: true,
      debugLevel: "debug",
      apiVersion: "v2",
      enableV2CloudConversation: false,
    },
    {
      V2NIMLoginServiceConfig: {
        lbsUrls: ["https://lbs.netease.im/lbs/webconf.jsp"],
        linkUrl: "weblink.netease.im",
      },
    }
  );

  uiKitStore = new RootStore(
    // @ts-ignore
    nim,
    {
      // 添加好友是否需要验证
      addFriendNeedVerify: false,
      // 是否需要显示 p2p 消息、p2p会话列表消息已读未读，默认 false
      p2pMsgReceiptVisible: true,
      // 是否需要显示群组消息已读未读，默认 false
      teamMsgReceiptVisible: true,
      // 群组被邀请模式，默认需要验证
      teamAgreeMode:
        V2NIMConst.V2NIMTeamAgreeMode.V2NIM_TEAM_AGREE_MODE_NO_AUTH,
      // 是否展示群管理员
      teamManagerVisible: true,
      // 发送消息前回调, 可对消息体进行修改，添加自定义参数
      aiVisible: false,
      sendMsgBefore: async (options) => {
        return { ...options };
      },
    },
    "Web"
  );
  console.log("Web IMUIKit Vue2 Init", IM_UIKIT_VERSION);

  return {
    nim,
    store: uiKitStore,
  };
};

export { uiKitStore, nim };
