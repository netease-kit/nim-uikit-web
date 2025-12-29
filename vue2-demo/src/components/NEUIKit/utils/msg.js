import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { t } from "./i18n";
import { useRouter } from "vue-router";

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
