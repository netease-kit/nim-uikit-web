<template>
  <div class="input-root">
    <Popover
      v-model="mentionPopoverVisible"
      trigger="manual"
      placement="top"
      :disabled="
        props.conversationType !==
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
      "
      :align="'left'"
      :offset="30"
      :bodyStyle="{
        width: '300px',
      }"
    >
      <div class="msg-input-wrapper" ref="inputWrapperRef">
        <!-- 当回复消息时，输入框上需要展示被回复的消息-->
        <div v-if="isReplyMsg" class="reply-message-wrapper">
          <div class="reply-message-close" @click="removeReplyMsg">
            <Icon color="#929299" :size="13" type="icon-guanbi" />
          </div>
          <div class="reply-line">｜</div>
          <div class="reply-title">{{ t("replyText") }}</div>
          <div v-if="replyMsg" class="reply-to">
            <Appellation
              :account="replyMsg.senderId"
              :team-id="
                props.conversationType ===
                V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
                  ? to
                  : ''
              "
              color="#929299"
              :fontSize="13"
            />
          </div>
          <div class="reply-to-colon">:</div>
          <div
            v-if="replyMsg && replyMsg.messageClientId === 'noFind'"
            class="reply-noFind"
          >
            {{ t("replyNotFindText") }}
          </div>
          <div class="reply-message" v-else>
            <MessageOneLine
              v-if="
                replyMsg &&
                replyMsg.messageType ===
                  V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_TEXT
              "
              :text="replyMsg.text"
            />
            <div v-else>
              {{
                replyMsg?.messageType
                  ? `[${
                      REPLY_MSG_TYPE_MAP[replyMsg.messageType] ||
                      t("unknownMsgText")
                    }]`
                  : "[Unknown]"
              }}
            </div>
          </div>
        </div>

        <div class="msg-input-container">
          <Textarea
            id="msg-input"
            ref="msgInputRef"
            class="msg-textarea"
            :placeholder="isTeamMute ? t('teamMuteText') : inputPlaceholder"
            v-model="inputText"
            :disabled="isTeamMute"
            :focus="isFocus"
            :autoResize="true"
            :minRows="1"
            :maxRows="4"
            @confirm="handleSendTextMsg"
            @blur="handleInputBlur"
            @focus="handleInputFocus"
            @input="handleInputChange"
          >
          </Textarea>

          <div class="msg-input-icons">
            <div class="input-icon">
              <Popover
                ref="emojiPopoverRef"
                trigger="click"
                placement="top"
                :disabled="isTeamMute"
                v-model="emojiPopoverVisible"
                :offset="30"
              >
                <Icon :size="20" type="icon-biaoqing" />
                <template #content>
                  <Face @emojiClick="handleEmoji" />
                </template>
              </Popover>
            </div>
            <div class="input-icon">
              <Popover
                trigger="hover"
                placement="top"
                maxWidth="80px"
                :disabled="isTeamMute"
                :bodyStyle="{ padding: '4px', width: '80px' }"
              >
                <Icon :size="20" type="icon-tupian" />
                <template #content>
                  <div class="img-popover-menu">
                    <div
                      class="img-popover-item"
                      @click="() => handleImgActionItemClick('img')"
                    >
                      <input
                        type="file"
                        ref="imageInput"
                        accept="image/*"
                        class="file-input-overlay"
                        @change="onImageSelected"
                      />
                      <Icon type="icon-tupian" :size="15"></Icon>
                      <span class="action-name">{{ t("imgText") }}</span>
                    </div>
                    <div
                      class="img-popover-item"
                      @click="() => handleImgActionItemClick('video')"
                    >
                      <input
                        type="file"
                        ref="videoInput"
                        accept="video/*"
                        class="file-input-overlay"
                        @change="onVideoSelected"
                      />
                      <Icon type="icon-shipin8" :size="15"></Icon>
                      <span class="action-name">{{ t("videoText") }}</span>
                    </div>
                  </div>
                </template>
              </Popover>
            </div>
            <div class="input-icon">
              <input
                type="file"
                ref="fileInput"
                accept="*"
                class="file-input-overlay"
                @change="onFileSelected"
              />
              <Icon @click="handleSendFileMsg" :size="19" type="icon-file" />
            </div>
            <div class="input-icon">
              <Icon
                v-if="!inputText.length"
                :size="20"
                type="icon-send-default"
              />
              <Icon
                v-else
                @click="handleSendTextMsg"
                :size="20"
                type="icon-send-selected"
              />
            </div>
          </div>
        </div>
      </div>
      <template #content>
        <MentionChooseList
          :teamId="to"
          :allowAtAll="allowAtAll"
          @handleMemberClick="handleMentionSelect"
          @item-click="handleMentionSelect"
          @close-popup="handleCloseMention"
        />
      </template>
    </Popover>
  </div>
</template>

<script lang="ts" setup>
/** 消息输入框 */
import Face from "./face.vue";
import Icon from "../../CommonComponents/Icon.vue";
import {
  ref,
  getCurrentInstance,
  computed,
  onUnmounted,
  onMounted,
  nextTick,
  watch,
} from "vue";
import {
  ALLOW_AT,
  events,
  REPLY_MSG_TYPE_MAP,
  AT_ALL_ACCOUNT,
} from "../../utils/constants";

import { t } from "../../utils/i18n";
import MessageOneLine from "../../CommonComponents/MessageOneLine.vue";
import Appellation from "../../CommonComponents/Appellation.vue";
import { replaceEmoji } from "../../utils";
import { autorun } from "mobx";
import emitter from "../../utils/eventBus";
import Input from "../../CommonComponents/Input.vue";

import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { toast } from "../../utils/toast";
import Popover from "../../CommonComponents/Popover.vue";
import MentionChooseList from "./mention-choose-list.vue";
import type {
  V2NIMTeam,
  V2NIMTeamMember,
} from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";
import type {
  V2NIMMessageForUI,
  YxServerExt,
  YxAitMsg,
} from "@xkit-yx/im-store-v2/dist/types/types";
import Textarea from "../../CommonComponents/Textarea.vue";

const { proxy } = getCurrentInstance()!; // 获取组件实例
const store = proxy?.$UIKitStore;

const props = withDefaults(
  defineProps<{
    conversationType: V2NIMConst.V2NIMConversationType;
    conversationId: string;
    to: string;
    replyMsgsMap?: {
      [key: string]: V2NIMMessageForUI;
    };
    inputPlaceholder?: string;
  }>(),
  {}
);

// 输入框内容
const inputText = ref("");

// 发送更多面板flag
const sendMoreVisible = ref(false);

// 表情面板显示状态
const emojiPopoverVisible = ref(false);

// mention面板显示状态
const mentionPopoverVisible = ref(false);

// 回复消息相关
const isReplyMsg = ref(false);
const isFocus = ref(false);
const replyMsg = ref<V2NIMMessageForUI>();

// 群相关
const team = ref<V2NIMTeam>();
const teamMembers = ref<V2NIMTeamMember[]>([]);
// 是否是群主
const isTeamOwner = ref(false);
// 是否是群管理员
const isTeamManager = ref(false);
// 群禁言状态
const isTeamMute = ref(false);
// 选中@成员
const selectedAtMembers = ref<{ accountId: string; appellation: string }[]>([]);
//输入框ref
const msgInputRef = ref();
const inputWrapperRef = ref();

// @时使用 在现有的 ref 定义附近添加
const cursorPosition = ref(0); // 记录光标位置
const atPosition = ref(0); // 记录@符号的位置

// 发送图片消息 触发图片选择
const imageInput = ref<HTMLInputElement | null>(null);
// 发送视频消息 触发视频选择
const videoInput = ref<HTMLInputElement | null>(null);
// 发送文件消息 触发文件选择
const fileInput = ref<HTMLInputElement | null>(null);

/** 是否允许@ 所有人 */
const allowAtAll = computed(() => {
  let ext: YxServerExt = {};
  try {
    ext = JSON.parse((team.value || {}).serverExtension || "{}");
  } catch (error) {
    //
  }
  if (ext[ALLOW_AT] === "manager") {
    return isTeamOwner.value || isTeamManager.value;
  }
  return true;
});

// 更新群禁言
const updateTeamMute = (teamMute) => {
  // 群主或者群管理员在群禁言时，可以发送消息
  if (isTeamOwner.value || isTeamManager.value) {
    isTeamMute.value = false;
    return;
  }

  if (
    teamMute ===
    V2NIMConst.V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
  ) {
    isTeamMute.value = false;
    return;
  }

  isTeamMute.value = true;
  inputText.value = "";
  return;
};

// 发送图片和视频消息
const handleImgActionItemClick = (key: string) => {
  if (isTeamMute.value) return;
  if (key === "img") {
    imageInput.value?.click();
  } else if (key === "video") {
    videoInput.value?.click();
  }
};

// 处理输入框聚焦
const handleInputFocus = () => {
  isFocus.value = true;
  // 记录当前光标位置
  if (msgInputRef.value && msgInputRef.value.textareaRef) {
    cursorPosition.value = msgInputRef.value.textareaRef.selectionStart || 0;
  }
};

// 处理输入框失焦
const handleInputBlur = () => {
  isFocus.value = false;
  // 记录失焦时的光标位置
  if (msgInputRef.value && msgInputRef.value.textareaRef) {
    cursorPosition.value = msgInputRef.value.textareaRef.selectionStart || 0;
  }
};

// 处理输入框内容变化
const handleInputChange = (event) => {
  // 获取当前光标位置
  if (msgInputRef.value && msgInputRef.value.textareaRef) {
    cursorPosition.value = msgInputRef.value.textareaRef.selectionStart || 0;
  }

  // 当前输入的是@ 展示群成员列表
  if (
    event.data === "@" &&
    props.conversationType ===
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
  ) {
    atPosition.value = cursorPosition.value - 1; // 记录@符号的位置
    mentionPopoverVisible.value = true;
  } else {
    mentionPopoverVisible.value = false;
  }
};

// 处理mention选择
const handleMentionSelect = (member) => {
  const nickInTeam = member.appellation;
  selectedAtMembers.value = [
    ...selectedAtMembers.value.filter(
      (item) => item.accountId !== member.accountId
    ),
    member,
  ];

  // 在@符号位置插入@xxx，而不是追加到末尾
  const currentText = inputText.value;
  const beforeAt = currentText.substring(0, atPosition.value);
  const afterAt = currentText.substring(atPosition.value + 1); // +1 跳过@符号
  const newInputText = beforeAt + "@" + nickInTeam + " " + afterAt;

  // 更新input框的内容
  inputText.value = newInputText;

  handleCloseMention();

  // 设置光标位置到插入内容之后
  nextTick(() => {
    if (msgInputRef.value && msgInputRef.value.textareaRef) {
      const newCursorPos = atPosition.value + nickInTeam.length + 2; // @xxx + 空格
      msgInputRef.value.textareaRef.setSelectionRange(
        newCursorPos,
        newCursorPos
      );
      msgInputRef.value.focus();
    }
  });
};

// 关闭mention弹窗
const handleCloseMention = () => {
  mentionPopoverVisible.value = false;
};

// 滚动到底部
const scrollBottom = () => {
  emitter.emit(events.ON_SCROLL_BOTTOM);
};

// 发送消息失败提示
const handleSendMsgError = (errCode) => {
  switch (errCode) {
    case 102426:
      toast.error(t("sendFailWithInBlackText"));
      break;
    case 104404:
      toast.error(t("sendFailWithDeleteText"));
      break;
    default:
      toast.error(t("sendMsgFailedText"));
      break;
  }
};

/** 处理选中的@ 成员 */
const onAtMembersExtHandler = () => {
  let ext: YxServerExt;
  if (selectedAtMembers.value.length) {
    selectedAtMembers.value
      .filter((member) => {
        if (!allowAtAll.value && member.accountId === AT_ALL_ACCOUNT) {
          return false;
        }
        return true;
      })
      .forEach((member) => {
        const substr = `@${member.appellation}`;
        const positions: number[] = [];
        let pos = inputText.value?.indexOf(substr);
        while (pos !== -1) {
          positions.push(pos);
          pos = inputText.value?.indexOf(substr, pos + 1);
        }
        if (positions.length) {
          if (!ext) {
            ext = {
              yxAitMsg: {
                [member.accountId]: {
                  text: substr,
                  segments: [],
                },
              },
            };
          } else {
            (ext.yxAitMsg as YxAitMsg)[member.accountId] = {
              text: substr,
              segments: [],
            };
          }
          positions.forEach((position) => {
            const start = position;
            (ext?.yxAitMsg as YxAitMsg)[member.accountId].segments.push({
              start,
              end: start + substr.length,
              broken: false,
            });
          });
        }
      });
  }
  // @ts-ignore
  return ext;
};

// 发送文本消息
const handleSendTextMsg = () => {
  if (inputText.value.trim() === "") return;
  if (isTeamMute.value) return;
  let text = replaceEmoji(inputText.value);
  const textMsg = proxy?.$NIM.V2NIMMessageCreator.createTextMessage(text);
  const ext = onAtMembersExtHandler();
  isReplyMsg.value = false;
  store?.msgStore
    .sendMessageActive({
      msg: textMsg,
      conversationId: props.conversationId,
      serverExtension: selectedAtMembers.value.length && (ext as any),

      sendBefore: () => {
        scrollBottom();
      },
    })
    .catch((err) => {
      handleSendMsgError(err?.code);
    })
    .finally(async () => {
      if (!isReplyMsg.value) {
        scrollBottom();
      } else {
        await nextTick();
        scrollBottom();
      }
    });

  inputText.value = "";
};

// 移除回复消息
const removeReplyMsg = () => {
  store?.msgStore.removeReplyMsgActive(
    replyMsg?.value?.conversationId as string
  );
  isReplyMsg.value = false;
};

// 点击表情
const handleEmoji = (emoji: { key: string; type: string }) => {
  if (isTeamMute.value) return;
  // 获取当前光标位置
  let currentCursorPos = cursorPosition.value;

  // 如果能获取到实时光标位置，使用实时位置
  if (msgInputRef.value && msgInputRef.value.textareaRef) {
    currentCursorPos =
      msgInputRef.value.textareaRef.selectionStart || cursorPosition.value;
  }

  // 在光标位置插入表情
  const currentText = inputText.value;
  const beforeCursor = currentText.substring(0, currentCursorPos);
  const afterCursor = currentText.substring(currentCursorPos);
  const newInputText = beforeCursor + emoji.key + afterCursor;

  // 更新输入框内容
  inputText.value = newInputText;

  // 关闭表情弹窗
  emojiPopoverVisible.value = false;

  // 设置光标位置到插入表情之后
  nextTick(() => {
    if (msgInputRef.value && msgInputRef.value.textareaRef) {
      const newCursorPos = currentCursorPos + emoji.key.length;
      msgInputRef.value.textareaRef.setSelectionRange(
        newCursorPos,
        newCursorPos
      );
      msgInputRef.value.focus();
      // 更新记录的光标位置
      cursorPosition.value = newCursorPos;
    }
  });
};

// 发送文件消息
const handleSendFileMsg = () => {
  if (isTeamMute.value) return;
  fileInput.value?.click();
};

// 检查文件大小，如果超过100MB则提示并返回false
const checkFileSize = (file: File): boolean => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    toast.error(t("uploadLimitText"));
    // 清空 input 的值
    if (fileInput.value) {
      fileInput.value.value = "";
    }
    return false; // 文件过大，返回false
  }
  return true; // 文件大小合适，返回true
};

// 发送图片消息使用 获取图片数据
const getImgDataUrl = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };

    reader.onerror = (e) => {
      reject(e);
    };

    reader.readAsDataURL(file);
  });
};

// 获取视频第一帧图片
const getVideoFirstFrameDataUrl = (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    video.onloadeddata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL("image/jpeg");

      resolve(dataURL);
    };

    video.onerror = () => {
      reject(new Error("Failed to load the video"));
    };

    const url = URL.createObjectURL(videoFile);

    video.preload = "auto";
    video.autoplay = true;
    video.muted = true;
    video.src = url;
  });
};

// 文件选择
const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 检查文件大小，如果返回false则中断执行
  const isFileSizeValid = checkFileSize(file);
  if (!isFileSizeValid) {
    return;
  }

  try {
    const fileMsg = proxy?.$NIM.V2NIMMessageCreator.createFileMessage(file);

    await store?.msgStore.sendMessageActive({
      msg: fileMsg,
      conversationId: props.conversationId,
      progress: () => true,
      sendBefore: () => {
        scrollBottom();
      },
    });

    scrollBottom();
  } catch (err: any) {
    scrollBottom();
    handleSendMsgError(err?.code);
  } finally {
    // 清空 input 的值，这样用户可以重复选择同一个文件
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

// 视频选择
const onVideoSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  // 检查文件大小，如果返回false则中断执行
  const isFileSizeValid = checkFileSize(file);
  if (!isFileSizeValid) {
    return;
  }
  const previewImg = await getVideoFirstFrameDataUrl(file);

  try {
    const fileMsg = proxy?.$NIM.V2NIMMessageCreator.createVideoMessage(file);

    await store?.msgStore.sendMessageActive({
      msg: fileMsg,
      conversationId: props.conversationId,
      previewImg,
      progress: () => true,
      sendBefore: () => {
        scrollBottom();
      },
    });

    scrollBottom();
  } catch (err) {
    scrollBottom();
    toast.info(t("sendVideoFailedText"));
  } finally {
    // 清空 input 的值，这样用户可以重复选择同一个文件
    if (Array.isArray(videoInput.value)) {
      videoInput.value[0].value = "";
    } else if (videoInput.value) {
      videoInput.value.value = "";
    }
  }
};

// 图片选择
const onImageSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.info(t("selectImageText"));
    return;
  }

  try {
    const previewImg = await getImgDataUrl(file);

    const imgMsg = proxy?.$NIM.V2NIMMessageCreator.createImageMessage(file);

    await store?.msgStore.sendMessageActive({
      msg: imgMsg,
      conversationId: props.conversationId,
      previewImg,
      progress: () => true,
      sendBefore: () => {
        scrollBottom();
      },
    });

    // 消息发送成功后再次滚动到底部
    scrollBottom();
  } catch (err: any) {
    handleSendMsgError(err?.code);
  } finally {
    // 清空 input 的值，这样用户可以重复选择同一个文件
    if (Array.isArray(imageInput.value)) {
      imageInput.value[0].value = "";
    } else if (imageInput.value) {
      imageInput.value.value = "";
    }
    scrollBottom();
  }
};

let teamWatch = () => {};

watch(
  () => props.conversationId,
  (newConversationId, oldConversationId) => {
    if (newConversationId !== oldConversationId) {
      // 重置所有状态
      isTeamMute.value = false;
      isTeamOwner.value = false;
      isTeamManager.value = false;
      team.value = undefined;
      teamMembers.value = [];
      mentionPopoverVisible.value = false;
      inputText.value = "";
      teamWatch();

      teamWatch = autorun(() => {
        if (
          props.conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        ) {
          const _team: V2NIMTeam = store?.teamStore.teams.get(
            props.to
          ) as V2NIMTeam;

          teamMembers.value = store?.teamMemberStore.getTeamMember(
            props.to
          ) as V2NIMTeamMember[];

          const myUser = store?.userStore.myUserInfo;
          isTeamOwner.value = _team?.ownerAccountId == myUser?.accountId;
          isTeamManager.value = teamMembers.value
            .filter(
              (item) =>
                item.memberRole ===
                V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
            )
            .some(
              (member) => member.accountId === (myUser ? myUser.accountId : "")
            );
          team.value = _team;

          updateTeamMute(_team?.chatBannedMode);
        }
      });
    }
  },
  { immediate: true }
);

onMounted(() => {
  // 撤回后，重新编辑消息
  emitter.on(events.ON_REEDIT_MSG, (_msg) => {
    const msg = _msg as V2NIMMessageForUI;
    const _replyMsg = props.replyMsgsMap?.[msg.messageClientId];
    // 此处将 replyMsg.value 置空是为了解决：撤回普通消息1，撤回回复消息2，重新编辑消息2，再重新编辑消息1，输入框上方依然显示消息2的引用，消息1发送出去消息消息2的引用消息
    replyMsg.value = undefined;
    isReplyMsg.value = false;
    store?.msgStore.removeReplyMsgActive(msg.conversationId);
    // 如果重新编辑的是回复消息，则需要将回复消息展示在输入框上方
    if (_replyMsg?.messageClientId) {
      _replyMsg && store?.msgStore.replyMsgActive(_replyMsg);
      replyMsg.value = _replyMsg;
      isReplyMsg.value = true;
    }

    inputText.value = msg?.oldText || "";
    isFocus.value = true;
  });

  // 回复消息
  emitter.on(events.REPLY_MSG, async (msg) => {
    isReplyMsg.value = true;
    isFocus.value = true;
    replyMsg.value = msg as V2NIMMessageForUI;

    if (msgInputRef.value && msgInputRef.value.focus) {
      msgInputRef.value.focus();
    }
  });

  // 关闭表情、语音、发送更多面板
  emitter.on(events.CLOSE_PANEL, () => {
    sendMoreVisible.value = false;
  });

  // @提及成员
  emitter.on(events.AIT_TEAM_MEMBER, (member) => {
    const beReplyMember = member as { accountId: string; appellation: string };
    selectedAtMembers.value = [
      ...selectedAtMembers.value.filter(
        (item) => item.accountId !== beReplyMember.accountId
      ),
      beReplyMember,
    ];
    const newInputText =
      inputText.value + "@" + beReplyMember.appellation + " ";
    /** 更新input框的内容 */
    inputText.value = newInputText;
  });
});

onUnmounted(() => {
  removeReplyMsg();
  teamWatch();
  emitter.off(events.ON_REEDIT_MSG);
  emitter.off(events.REPLY_MSG);
  emitter.off(events.CLOSE_PANEL);
  emitter.off(events.AIT_TEAM_MEMBER);
});
</script>

<style scoped>
.input-root {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: fit-content;
  padding: 16px;
}

.msg-input-wrapper {
  width: 100%;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  z-index: 999;
  background: #ffffff;
  border: 1px solid #dde0e5;
  border-radius: 4px;
}

.msg-input-container {
  flex: 1;
  display: flex;
  align-items: center;
}

.msg-input {
  background-color: #fff;
  font-size: 14px;
  border-radius: 6px;
  -webkit-tap-highlight-color: transparent;
  margin-left: 10px;
}

.msg-input-icons {
  display: flex;
}
.input-inner {
  flex: 1;
}

.msg-input-button {
  flex: 1;
}

.msg-input-button.msg-input-loading {
  animation: loadingCircle 1s infinite linear;
  z-index: 1;
  width: 20px;
  height: 20px;
  margin-top: 4px;
}

.msg-input-button.msg-input-loading .loading {
  width: 100%;
  height: 100%;
}

.msg-ext {
  overflow-y: auto;
  width: 100%;
  height: 300px;
  background-color: #eff1f3;
  z-index: 1;
}

.msg-audio-panel {
  overflow-y: hidden;
  width: 100%;
  height: 300px;
  background-color: #eff1f3;
  z-index: 1;
}

.send-more-panel {
  padding: 15px;
  overflow-y: hidden;
  width: 100%;
  height: 300px;
  background-color: #eff1f3;
  z-index: 1;
  flex-wrap: wrap;
  box-sizing: border-box;
}

.send-more-panel-item-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  display: inline-block;
  margin-bottom: 10px;
}

.reply-message-wrapper {
  display: flex;
  font-size: 13px;
  height: 30px;
  align-items: center;
  color: #929299;
  margin: 12px 12px 0 12px;
  max-width: 100%;
  min-width: 0;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #f7f7f7;
  border-radius: 4px;
  overflow: hidden;
  box-sizing: border-box;
}

.reply-message-wrapper .reply-noFind {
  width: fit-content;
}

.reply-message-wrapper .reply-to-colon {
  flex-basis: 3px;
  margin-right: 2px;
}

.reply-title,
.reply-to-colon,
.reply-message-close {
  /* 防止固定内容被压缩 */
  flex-shrink: 0;
}

.reply-message-wrapper .reply-message-close {
  flex-basis: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.reply-message-wrapper .reply-message {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #929299;
  font-size: 13px;
  box-sizing: border-box;
  display: flex;
}

.reply-message {
  min-width: 0; /* 关键：允许元素收缩 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.msg-input-container {
  width: 100%;
  box-sizing: border-box;
}

.reply-message-wrapper .reply-message message-one-line {
  flex: 1;
  font-size: 13px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.reply-message-wrapper .reply-title {
  flex-basis: 30px;
  white-space: nowrap;
  margin-right: 5px;
}

.reply-message-wrapper .reply-to {
  max-width: 120px;
  flex: 0 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.fake-input {
  background-color: #fff;
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  padding: 0 12px;
  border-radius: 6px;
}

.input-icon {
  width: 30px;
  text-align: center;
  height: 45px;
  line-height: 45px;
  position: relative;
  margin: 0 2px;
  cursor: pointer;
}

.input-text {
  white-space: nowrap;
  color: #000;
}

.input-placeholder {
  background-color: #fff;
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  border-radius: 6px;
  color: #c0c4cc;
}

.file-picker-wrapper {
  position: absolute;
  width: 60px;
  height: 60px;
  z-index: 1;
}

.file-picker-wrapper .files-button {
  width: 60px;
  height: 60px;
}

.send-more-panel-item {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  margin: 0 15px;
  justify-content: center;
}

.file-input-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
  pointer-events: none;
}

.img-popover-menu {
  width: 76px;
  max-width: 76px;
  padding: 4px;
  cursor: pointer;
}

.img-popover-item {
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  position: relative;
  cursor: pointer;
}

.img-popover-item:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

.img-popover-item .action-name {
  margin-left: 8px;
  font-size: 14px;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  color: #333;
  z-index: 999999;
}

.msg-textarea {
  display: flex;
  align-items: center;
}
</style>
