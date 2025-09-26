import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import RootStore from "@xkit-yx/im-store-v2";
import V2NIM from "nim-web-sdk-ng/dist/v2/NIM_BROWSER_SDK";
import type { V2NIMMessage } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";
export const init = () => {
  // 是否开启云端会话，实际根据您的业务调整
  const enableV2CloudConversation =
    sessionStorage.getItem("enableV2CloudConversation") === "on";
  const nim = V2NIM.getInstance(
    {
      appkey: "",
      needReconnect: true,
      debugLevel: "debug",
      apiVersion: "v2",
      enableV2CloudConversation: enableV2CloudConversation,
    },
    {
      V2NIMLoginServiceConfig: {
        lbsUrls: ["https://lbs.netease.im/lbs/webconf.jsp"],
        linkUrl: "weblink.netease.im",
      },
    }
  );

  const store = new RootStore(
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
      // 发送消息前回调, 可对消息体进行修改，添加自定义参数
      aiVisible: false,
      sendMsgBefore: async (options: {
        msg: V2NIMMessage;
        conversationId: string;
        serverExtension?: Record<string, unknown>;
      }) => {
        return { ...options };
      },
    },
    "Web"
  );
  return {
    nim,
    store,
  };
};
