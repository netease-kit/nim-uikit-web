import { t } from "./i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";

// 自定义的一些事件常量
export const events = {
  // 自己发出一条消息
  SEND_MSG: "sendMsg",
  // 发送消息失败
  SEND_MSG_FAILED: "sendMsgFailed",
  // 收到一条消息
  ON_MSG: "onMsg",
  // 加载更多
  ON_LOAD_MORE: "onLoadMore",
  // 首次进入聊天页并获取历史记录
  ON_CHAT_MOUNTED: "onChatMounted",
  // 重新编辑撤回消息
  ON_REEDIT_MSG: "onReEditMsg",
  // 页面触底
  ON_REACH_BOTTOM: "onReachBottom",
  // 页面触顶
  ON_REACH_TOP: "onReactTop",
  // 回复消息
  REPLY_MSG: "replyMsg",
  // input框聚焦
  ON_INPUT_FOCUS_CHANGE: "onInputFocusChange",
  // input框失焦
  ON_INPUT_BLUR: "onInputBlur",
  // 滚动到底部
  ON_SCROLL_BOTTOM: "onScrollBottom",
  // @群成员
  AIT_TEAM_MEMBER: "aitTeamMember",
  // 表情框弹起与收起变化
  EMOJI_AREA_CHANGE: "emojiAreaChange",
  // 获取历史消息
  GET_HISTORY_MSG: "getHistoryMsg",
  // 取消转发消息
  CANCEL_FORWARD_MSG: "cancelForwardMsg",
  // 确认转发消息
  CONFIRM_FORWARD_MSG: "confirmForwardMsg",
  // @消息  @群成员
  HANDLE_AIT_MEMBER: "handleAitMember",
  // 关闭@弹窗
  CLOSE_AIT_POPUP: "closeAitPopup",
  // 表情点击
  EMOJI_CLICK: "emojiClick",
  // 表情删除
  EMOJI_DELETE: "emojiDelete",
  // 表情发送
  EMOJI_SEND: "emojiSend",
  // 好友选择
  FRIEND_SELECT: "friendSelect",
  // 处理滚动穿透
  HANDLE_MOVE_THROUGH: "handleMoveThrough",
  // 关闭表情、语音面板
  CLOSE_PANEL: "closePanel",
  // 语音消息url改变
  AUDIO_URL_CHANGE: "audioUrlChange",
  // 关闭新消息提示tip
  CLOSE_NEW_MSG_TIP: "closeNewMsgTip",
  // 头像点击
  AVATAR_CLICK: "avatarClick",
};

export const HISTORY_LIMIT = 15;

export const MSG_ID_FLAG = "message-item-";

export const AT_ALL_ACCOUNT = "ait_all";

export const ALLOW_AT = "yxAllowAt";

export const REPLY_MSG_TYPE_MAP = {
  [V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_IMAGE]: t("imgMsgText"),
  [V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_AUDIO]: t("audioMsgText"),
  [V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_VIDEO]: t("videoMsgText"),
  [V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_FILE]: t("fileMsgText"),
};

export const STORAGE_KEY = "__yx_im_options_pc_vue2";

export const callTypeMap = {
  audio: "1",
  video: "2",
};

export const g2StatusMap = {
  1: t("callDurationText"),
  2: t("callCancelText"),
  3: t("callRejectedText"),
  4: t("callTimeoutText"),
  5: t("callBusyText"),
};

export const msgRecallTime = 2 * 60 * 1000;

export const APP_KEY = "";
