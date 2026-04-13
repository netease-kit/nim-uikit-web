import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { t } from "./i18n";
import { AT_ALL_ACCOUNT } from "./constants";

const { V2NIMConversationType } = V2NIMConst;

const translate = (key) => {
  const text =
    {
      textMsgText: t("textMsgText"),
      customMsgText: t("customMsgText"),
      audioMsgText: t("audioMsgText"),
      videoMsgText: t("videoMsgText"),
      fileMsgText: t("fileMsgText"),
      callMsgText: t("callMsgText"),
      geoMsgText: t("geoMsgText"),
      imgMsgText: t("imgMsgText"),
      notiMsgText: t("notiMsgText"),
      robotMsgText: t("robotMsgText"),
      tipMsgText: t("tipMsgText"),
      unknownMsgText: t("unknownMsgText"),
    }[key] || "";
  return `[${text}]`;
};

/**
 * 根据消息类型获取提示内容
 *
 * 此函数旨在根据不同的消息类型，返回相应的提示内容
 * 它通过检查消息的类型，并根据类型选择合适的提示信息
 * 如果是文本消息，它会直接返回消息文本，除非文本为空，此时会返回翻译后的默认文本
 * 对于其他类型的消总，如文件、图片等，它会返回相应的翻译后的提示文本
 *
 * @param msg 消息对象，包含消息类型和文本
 * @returns 根据消息类型返回的提示内容
 */
export const getMsgContentTipByType = (msg) => {
  const { messageType, text } = msg;
  switch (messageType) {
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT:
      // 对于文本消息，直接返回文本内容或默认翻译文本
      return text || translate("textMsgText");
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE:
      // 返回文件消息的翻译提示文本
      return translate("fileMsgText");
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE:
      // 返回图片消息的翻译提示文本
      return translate("imgMsgText");
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM:
      // 对于自定义消息，返回自定义文本或默认翻译文本
      return text || translate("customMsgText");
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO:
      // 返回音频消息的翻译提示文本
      return translate("audioMsgText");
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CALL:
      // 返回通话消息的翻译提示文本
      return translate("callMsgText");
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_LOCATION:
      // 返回位置消息的翻译提示文本
      return translate("geoMsgText");
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_NOTIFICATION:
      // 返回通知消息的翻译提示文本
      return translate("notiMsgText");
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_ROBOT:
      // 返回机器人消息的翻译提示文本
      return translate("robotMsgText");
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TIPS:
      // 返回提示消息的翻译提示文本
      return translate("tipMsgText");
    case V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO:
      // 返回视频消息的翻译提示文本
      return translate("videoMsgText");
    default:
      // 对于未知消息类型，返回默认的翻译提示文本
      return translate("unknownMsgText");
  }
};

const formatExtAitToPushInfo = (yxAitMsg, content) => {
  function getForcePushIDsList(obj) {
    return Object.keys(obj).includes(AT_ALL_ACCOUNT)
      ? void 0
      : Object.keys(obj);
  }

  const pushInfo = {
    forcePushAccountIds: getForcePushIDsList(yxAitMsg),
    forcePush: true,
    forcePushContent: content,
  };

  return pushInfo;
};

const parseConversationType = (conversationId) => {
  // 同步方法不该报错
  try {
    if (conversationId) {
      // 正则匹配 conversationId, 接触掉前缀和后缀, 取中间的会话类型
      const strArr = conversationId.split("|");
      return Number(strArr[1]);
    } else {
      this.core.logger.warn(
        `conversationId is not start with ${this.core.account}`
      );
      return V2NIMConversationType.V2NIM_CONVERSATION_TYPE_UNKNOWN;
    }
  } catch (err) {
    return V2NIMConversationType.V2NIM_CONVERSATION_TYPE_UNKNOWN;
  }
};

const parseConversationTargetId = (conversationId) => {
  try {
    if (conversationId) {
      const strArr = conversationId.split("|");
      return {
        to: strArr[2],
        from: strArr[0],
      };
    } else {
      this.core.logger.warn(`parseConversationTargetId error `, conversationId);
      return "";
    }
  } catch (err) {
    return "";
  }
};

export const handlePush = (options) => {
  const pushContent = getMsgContentTipByType({
    text: options.msg.text,
    messageType: options.msg.messageType,
  });
  const yxAitMsg = options.serverExtension
    ? options.serverExtension.yxAitMsg
    : { forcePushIDsList: "[]", needForcePush: false };

  // 如果是 at 消息，需要走离线强推
  // @ts-ignore
  const { forcePushIDsList, needForcePush } = yxAitMsg
    ? // @ts-ignore
      formatExtAitToPushInfo(yxAitMsg, options.msg.text)
    : { forcePushIDsList: "[]", needForcePush: false };

  const { conversationId } = options;
  const sessionType = parseConversationType(conversationId);
  const targetId = parseConversationTargetId(conversationId).to;
  const myAccount = parseConversationTargetId(conversationId).from;
  const sessionId = sessionType === 1 ? myAccount : targetId;

  // 设置离线强推，厂商相关推送在此处配置
  // 具体参考文档 https://doc.yunxin.163.com/messaging2/guide/zc4MTg5MDY?platform=client#%E7%AC%AC%E4%B8%80%E6%AD%A5%E4%B8%8A%E4%BC%A0%E6%8E%A8%E9%80%81%E8%AF%81%E4%B9%A6
  const pushPayload = JSON.stringify({
    pushTitle: "", // 必填，推送消息标题
    notify_effect: "2", //可选项，预定义通知栏消息的点击行为。1：通知栏点击后打开app的Launcher Activity，2：通知栏点击后打开app的任一Activity（开发者还需要传入intent_uri），3：通知栏点击后打开网页（开发者还需要传入web_uri）
    intent_uri: `intent:#Intent;action=com.netease.nimlib.uniapp.push.NotificationClickActivity;component=com.netease.nim.demo/com.netease.nimlib.uniapp.push.NotificationClickActivity;launchFlags=0x04000000;i.sessionType=${sessionType};S.sessionId=${sessionId};end`, //可选项，打开当前app的任一组件。
    hwField: {
      click_action: {
        //必填，消息点击行为
        type: 1, //必填，消息点击行为类型，取值如下：1：打开应用自定义页面 2：点击后打开特定URL 3：点击后打开应用

        intent: `intent:#Intent;action=com.netease.nimlib.uniapp.push.NotificationClickActivity;component=com.netease.nim.demo/com.netease.nimlib.uniapp.push.NotificationClickActivity;launchFlags=0x04000000;i.sessionType=${sessionType};S.sessionId=${sessionId};end`, // 自定义页面中intent的实现，请参见指定intent参数 当type为1时，字段intent和action至少二选一。scheme方式和指定activity方式都可以
      },
      androidConfig: {
        category: "IM", //可选项，标识消息类型，用于标识高优先级透传场景，详见官方文档 AndroidConfig.category
      },
    },
    honorField: {
      notification: {
        // AndroidNotification
        clickAction: {
          //必填，消息点击行为
          type: 1, //必填，消息点击行为类型，取值如下：1：打开应用自定义页面 2：点击后打开特定URL 3：点击后打开应用
          //自定义页面中intent的实现，请参见指定intent参数。当type为1时，字段intent和action至少二选一。
          intent: "",
        },
        importance: "NORMAL", //可选项，Android通知消息分类，决定用户设备消息通知行为，取值如下：LOW：资讯营销类消息 NORMAL：服务与通讯类消息
      },
    },
    vivoField: {
      skipType: "4", //必填，点击跳转类型 1：打开APP首页 2：打开链接 3：自定义 4:打开app内指定页面，默认为1
      skipContent: "",
      classification: "1", //可选项，消息类型 0：运营类消息，1：系统类消息。默认为0
      category: "IM", // 可选项，二级分类
    },
    oppoField: {
      channel_id: "", //可选项，指定下发的通道ID
      category: "IM", //可选项，通道类别名
      notify_level: 2, //通知栏消息提醒等级，1-通知栏；2-通知栏+锁屏；16-通知栏+锁屏+横幅+震动+铃声
      click_action_type: "1", //点击通知栏后触发的动作类型。0（默认0.启动应用；1.跳转指定应用内页（action标签名）；2.跳转网页；4.跳转指定应用内页（全路径类名）；5.跳转Intent scheme URL: "",
      click_action_activity: "",
      action_parameters: "",
    },
    fcmFieldV1: {
      message: {
        android: {
          priority: "",
          data: {
            sessionType: sessionType,
            sessionId: sessionId,
          },
          notification: {
            click_action: "",
          },
        },
      },
    },

    // IOS apns
    sessionId: sessionId,
    sessionType: sessionType,
  });

  // @ts-ignore
  const pushConfig = {
    pushEnabled: true,
    pushNickEnabled: true,
    forcePush: needForcePush,
    forcePushContent: pushContent,
    forcePushAccountIds: forcePushIDsList,
    pushPayload,
    pushContent,
  };

  console.log("=======================", { ...options, pushConfig });

  return { ...options, pushConfig };
};
