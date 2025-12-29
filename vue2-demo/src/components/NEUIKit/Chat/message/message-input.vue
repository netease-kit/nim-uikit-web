<template>
  <div class="input-root">
    <!-- @成员选择弹窗：在群聊输入 @ 时触发，选择成员后回填到输入框 -->
    <Popover
      :modelValue="mentionPopoverVisible"
      @update:modelValue="(v) => (mentionPopoverVisible = v)"
      trigger="manual"
      placement="top"
      :disabled="
        conversationType !==
        V2NIMConversationTypeEnum.V2NIM_CONVERSATION_TYPE_TEAM
      "
      :align="'left'"
      :offset="10"
      :bodyStyle="{
        width: '300px',
      }"
    >
      <div class="msg-input-wrapper" ref="inputWrapperRef">
        <!-- 回复态：输入框顶部展示被回复的消息摘要 -->
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
                conversationType ===
                V2NIMConversationTypeEnum.V2NIM_CONVERSATION_TYPE_TEAM
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
                  V2NIMMessageTypeEnum.V2NIM_MESSAGE_TYPE_TEXT
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
            :autofocus="isFocus"
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
              <!-- 表情弹窗：选择表情后插入到当前光标位置 -->
              <Popover
                ref="emojiPopoverRef"
                trigger="click"
                placement="top"
                :disabled="isTeamMute"
                :modelValue="emojiPopoverVisible"
                @update:modelValue="(v) => (emojiPopoverVisible = v)"
                :offset="10"
              >
                <Icon :size="20" type="icon-biaoqing" />
                <template #content>
                  <Face @emojiClick="handleEmoji" />
                </template>
              </Popover>
            </div>
            <div class="input-icon">
              <!-- 图片/视频入口：悬浮菜单选择图片或视频 -->
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
                      <Icon type="icon-tupian" :size="15"></Icon>
                      <span class="action-name">{{ t("imgText") }}</span>
                    </div>
                    <div
                      class="img-popover-item"
                      @click="() => handleImgActionItemClick('video')"
                    >
                      <Icon type="icon-shipin8" :size="15"></Icon>
                      <span class="action-name">{{ t("videoText") }}</span>
                    </div>
                  </div>
                </template>
              </Popover>
            </div>
            <div class="input-icon">
              <!-- 文件发送：点击图标触发文件选择 -->
              <input
                type="file"
                ref="fileInput"
                accept="*"
                :disabled="isTeamMute"
                class="file-input-overlay"
                @change="onFileSelected"
              />
              <Icon @click="handleSendFileMsg" :size="19" type="icon-file" />
            </div>
            <!-- 图片/视频隐藏选择器：用于复用同一按钮触发系统文件选择框 -->

            <input
              type="file"
              ref="imageInputHidden"
              accept="image/*"
              :disabled="isTeamMute"
              style="display: none"
              @change="onImageSelected"
            />
            <input
              type="file"
              ref="videoInputHidden"
              accept="video/*"
              :disabled="isTeamMute"
              style="display: none"
              @change="onVideoSelected"
            />
            <div class="input-icon">
              <!-- 发送按钮：无内容显示灰色，有内容显示高亮并可点击发送 -->
              <Icon
                v-if="!inputText.length"
                :size="20"
                type="icon-send-default"
              />
              <span v-else @click="handleSendTextMsg">
                <Icon :size="20" type="icon-send-selected" />
              </span>
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

<script>
import Face from "./face.vue";
import Icon from "../../CommonComponents/Icon.vue";
import MessageOneLine from "../../CommonComponents/MessageOneLine.vue";
import Appellation from "../../CommonComponents/Appellation.vue";
import { replaceEmoji } from "../../utils";
import { autorun } from "mobx";
import emitter from "../../utils/eventBus";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { toast } from "../../utils/toast";
import Popover from "../../CommonComponents/Popover.vue";
import MentionChooseList from "./mention-choose-list.vue";
import Textarea from "../../CommonComponents/Textarea.vue";
import { t } from "../../utils/i18n";
import { nim, uiKitStore } from "../../utils/init";
import { events, REPLY_MSG_TYPE_MAP } from "../../utils/constants";

export default {
  name: "MessageInput",
  components: {
    Face,
    Icon,
    MessageOneLine,
    Appellation,
    Popover,
    MentionChooseList,
    Textarea,
  },
  props: {
    // 会话类型：P2P/群聊，用于控制 @ 功能与禁言逻辑
    conversationType: { type: Number, required: true },
    // 当前会话ID
    conversationId: { type: String, required: true },
    // 目标ID：P2P 为对端账号，群聊为 teamId
    to: { type: String, required: true },
    // 回复消息映射：messageClientId -> msg，用于回填回复态
    replyMsgsMap: { type: Object, default: () => ({}) },
    // 输入框占位文案
    inputPlaceholder: { type: String, default: "" },
  },
  data() {
    return {
      // 输入框内容（TextArea v-model）
      inputText: "",
      // 表情弹窗显隐
      sendMoreVisible: false,
      emojiPopoverVisible: false,
      // @成员弹窗显隐
      mentionPopoverVisible: false,
      // 回复态：是否展示回复消息摘要
      isReplyMsg: false,
      // 输入框是否聚焦（用于自动聚焦/样式）
      isFocus: false,
      // 当前回复的消息
      replyMsg: undefined,
      // 群信息与成员信息（用于禁言/权限/@列表）
      team: undefined,
      teamMembers: [],
      isTeamOwner: false,
      isTeamManager: false,
      isTeamMute: false,
      // 已选择的 @ 成员（用于发送时构建 serverExtension）
      selectedAtMembers: [],
      // 光标位置与 @ 触发位置
      cursorPosition: 0,
      atPosition: 0,
      V2NIMConversationTypeEnum: V2NIMConst.V2NIMConversationType,
      V2NIMMessageTypeEnum: V2NIMConst.V2NIMMessageType,
      store: uiKitStore,
      teamWatchDispose: null,
      REPLY_MSG_TYPE_MAP: REPLY_MSG_TYPE_MAP,
    };
  },
  computed: {
    // 是否允许 @all：由群扩展字段 allow_at 决定（manager 时仅群主/管理员可 @all）
    allowAtAll() {
      let ext = {};
      try {
        ext = JSON.parse((this.team || {}).serverExtension || "{}");
      } catch (error) {
        console.error("parse team serverExtension error", error);
      }
      if (ext["allow_at"] === "manager") {
        return this.isTeamOwner || this.isTeamManager;
      }
      return true;
    },
  },
  watch: {
    conversationId: {
      handler(newConversationId, oldConversationId) {
        if (newConversationId !== oldConversationId) {
          // 切换会话时重置输入状态，并重新监听群信息/成员变化
          this.isTeamMute = false;
          this.isTeamOwner = false;
          this.isTeamManager = false;
          this.team = undefined;
          this.teamMembers = [];
          this.mentionPopoverVisible = false;
          this.inputText = "";
          if (this.teamWatchDispose) this.teamWatchDispose();

          this.teamWatchDispose = autorun(() => {
            if (
              this.conversationType ===
              V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
            ) {
              // 群聊：读取群信息 + 成员列表，并根据权限判断是否禁言
              const _team = this.store?.teamStore.teams.get(this.to);
              this.teamMembers =
                this.store?.teamMemberStore.getTeamMember(this.to) || [];

              const myUser = this.store?.userStore.myUserInfo;
              this.isTeamOwner = _team?.ownerAccountId == myUser?.accountId;
              this.isTeamManager = this.teamMembers
                .filter(
                  (item) =>
                    item.memberRole ===
                    V2NIMConst.V2NIMTeamMemberRole
                      .V2NIM_TEAM_MEMBER_ROLE_MANAGER
                )
                .some(
                  (member) =>
                    member.accountId === (myUser ? myUser.accountId : "")
                );
              this.team = _team;

              this.updateTeamMute(_team?.chatBannedMode);
            }
          });
        }
      },
      immediate: true,
    },
  },
  mounted() {
    // 重新编辑消息：回填旧文本，并在存在回复消息时恢复回复态
    emitter.on(events.ON_REEDIT_MSG, (_msg) => {
      const msg = _msg || {};
      const _replyMsg = (this.replyMsgsMap || {})[msg.messageClientId];
      this.replyMsg = undefined;
      this.isReplyMsg = false;
      this.store?.msgStore.removeReplyMsgActive(msg.conversationId);

      if (_replyMsg && _replyMsg.messageClientId) {
        _replyMsg && this.store?.msgStore.replyMsgActive(_replyMsg);
        this.replyMsg = _replyMsg;
        this.isReplyMsg = true;
      }

      this.inputText = msg?.oldText || "";
      this.isFocus = true;
    });

    // 进入回复态：保存被回复消息并聚焦输入框
    emitter.on(events.REPLY_MSG, async (msg) => {
      this.isReplyMsg = true;
      this.isFocus = true;
      this.replyMsg = msg;
      if (this.$refs.msgInputRef && this.$refs.msgInputRef.focus) {
        this.$refs.msgInputRef.focus();
      }
    });

    // 关闭面板：用于收起更多面板等
    emitter.on(events.CLOSE_PANEL, () => {
      this.sendMoreVisible = false;
    });

    // 外部触发 @成员：将成员追加到 selectedAtMembers，并直接插入到输入框末尾
    emitter.on(events.AIT_TEAM_MEMBER, (member) => {
      const beReplyMember = member || {};
      this.selectedAtMembers = [
        ...this.selectedAtMembers.filter(
          (item) => item.accountId !== beReplyMember.accountId
        ),
        beReplyMember,
      ];
      const newInputText =
        this.inputText + "@" + (beReplyMember.appellation || "") + " ";
      this.inputText = newInputText;
    });
  },
  beforeDestroy() {
    // 清理回复态与监听，避免内存泄漏
    this.removeReplyMsg();
    if (this.teamWatchDispose) this.teamWatchDispose();
    emitter.off("onReeditMsg");
    emitter.off("replyMsg");
    emitter.off("closePanel");
    emitter.off("aitTeamMember");
  },
  methods: {
    t,
    // 群禁言状态更新：非群主/管理员在禁言时禁止输入并清空输入框
    updateTeamMute(teamMute) {
      if (this.isTeamOwner || this.isTeamManager) {
        this.isTeamMute = false;
        return;
      }
      if (
        teamMute ===
        V2NIMConst.V2NIMTeamChatBannedMode.V2NIM_TEAM_CHAT_BANNED_MODE_UNBAN
      ) {
        this.isTeamMute = false;
        return;
      }
      this.isTeamMute = true;
      this.inputText = "";
    },
    // 图片/视频菜单点击：触发对应隐藏 input 的 click
    handleImgActionItemClick(key) {
      if (this.isTeamMute) return;
      if (key === "img") {
        const input = this.$refs.imageInputHidden;
        input && input.click();
      } else if (key === "video") {
        const input = this.$refs.videoInputHidden;
        input && input.click();
      }
    },
    // 输入框聚焦：记录当前光标位置（用于表情插入/@ 替换）
    handleInputFocus() {
      this.isFocus = true;
      if (this.$refs.msgInputRef && this.$refs.msgInputRef.$refs.textareaRef) {
        const el = this.$refs.msgInputRef.$refs.textareaRef;
        this.cursorPosition = el.selectionStart || 0;
      }
    },
    // 输入框失焦：记录当前光标位置
    handleInputBlur() {
      this.isFocus = false;
      if (this.$refs.msgInputRef && this.$refs.msgInputRef.$refs.textareaRef) {
        const el = this.$refs.msgInputRef.$refs.textareaRef;
        this.cursorPosition = el.selectionStart || 0;
      }
    },
    // 输入变化：同步光标位置；在群聊输入 @ 时打开成员选择弹窗
    handleInputChange(event) {
      if (this.$refs.msgInputRef && this.$refs.msgInputRef.$refs.textareaRef) {
        const el = this.$refs.msgInputRef.$refs.textareaRef;
        this.cursorPosition = el.selectionStart || 0;
      }
      if (
        event &&
        event.data === "@" &&
        this.conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
      ) {
        this.atPosition = this.cursorPosition - 1;
        this.mentionPopoverVisible = true;
      } else {
        this.mentionPopoverVisible = false;
      }
    },
    // 选择 @成员：替换 @ 后的占位并恢复光标位置
    handleMentionSelect(member) {
      const nickInTeam = member.appellation;
      this.selectedAtMembers = [
        ...this.selectedAtMembers.filter(
          (item) => item.accountId !== member.accountId
        ),
        member,
      ];
      const currentText = this.inputText;
      const beforeAt = currentText.substring(0, this.atPosition);
      const afterAt = currentText.substring(this.atPosition + 1);
      const newInputText = beforeAt + "@" + nickInTeam + " " + afterAt;
      this.inputText = newInputText;
      this.handleCloseMention();
      this.$nextTick(() => {
        if (
          this.$refs.msgInputRef &&
          this.$refs.msgInputRef.$refs.textareaRef
        ) {
          const el = this.$refs.msgInputRef.$refs.textareaRef;
          const newCursorPos =
            this.atPosition + (nickInTeam ? nickInTeam.length : 0) + 2;
          el.setSelectionRange(newCursorPos, newCursorPos);
          this.$refs.msgInputRef.focus && this.$refs.msgInputRef.focus();
        }
      });
    },
    // 关闭 @成员弹窗
    handleCloseMention() {
      this.mentionPopoverVisible = false;
    },
    // 通知消息列表滚到底部
    scrollBottom() {
      emitter.emit("onScrollBottom");
    },
    // 发送失败统一提示：根据错误码展示更明确的文案
    handleSendMsgError(errCode) {
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
    },
    // 构建 @ 成员扩展字段：提取所有 @xxx 的位置段，供服务端识别 @ 消息
    onAtMembersExtHandler() {
      let ext;
      if (this.selectedAtMembers.length) {
        this.selectedAtMembers
          .filter((member) => {
            if (!this.allowAtAll && member.accountId === "@all") {
              return false;
            }
            return true;
          })
          .forEach((member) => {
            const substr = `@${member.appellation}`;
            const positions = [];
            let pos = (this.inputText || "").indexOf(substr);
            while (pos !== -1) {
              positions.push(pos);
              pos = (this.inputText || "").indexOf(substr, pos + 1);
            }
            if (positions.length) {
              if (!ext) {
                ext = {
                  yxAitMsg: {
                    [member.accountId]: { text: substr, segments: [] },
                  },
                };
              } else {
                ext.yxAitMsg[member.accountId] = { text: substr, segments: [] };
              }
              positions.forEach((position) => {
                const start = position;
                ext.yxAitMsg[member.accountId].segments.push({
                  start,
                  end: start + substr.length,
                  broken: false,
                });
              });
            }
          });
      }
      return ext;
    },
    // 发送文本消息：替换表情关键字；携带 @ 扩展；发送后清空输入框
    handleSendTextMsg() {
      if ((this.inputText || "").trim() === "") return;
      if (this.isTeamMute) return;

      const text = replaceEmoji(this.inputText);
      const textMsg = nim.V2NIMMessageCreator.createTextMessage(text);
      const ext = this.onAtMembersExtHandler();
      this.isReplyMsg = false;
      this.store?.msgStore
        .sendMessageActive({
          msg: textMsg,
          conversationId: this.conversationId,
          serverExtension: this.selectedAtMembers.length && ext,
          sendBefore: () => {
            this.scrollBottom();
          },
        })
        .catch((err) => {
          this.handleSendMsgError(err && err.code);
        })
        .finally(() => {
          this.scrollBottom();
        });
      this.inputText = "";
    },
    // 退出回复态：移除当前会话的回复消息
    removeReplyMsg() {
      const cid = (this.replyMsg && this.replyMsg.conversationId) || "";
      this.store?.msgStore.removeReplyMsgActive(cid);
      this.isReplyMsg = false;
    },
    // 插入表情：在当前光标位置插入表情 key，并恢复光标
    handleEmoji(emoji) {
      if (this.isTeamMute) return;
      let currentCursorPos = this.cursorPosition;
      if (this.$refs.msgInputRef && this.$refs.msgInputRef.$refs.textareaRef) {
        const el = this.$refs.msgInputRef.$refs.textareaRef;
        currentCursorPos = el.selectionStart || this.cursorPosition;
      }
      const currentText = this.inputText || "";
      const beforeCursor = currentText.substring(0, currentCursorPos);
      const afterCursor = currentText.substring(currentCursorPos);
      const newInputText = beforeCursor + (emoji && emoji.key) + afterCursor;
      this.inputText = newInputText;
      this.emojiPopoverVisible = false;
      this.$nextTick(() => {
        if (
          this.$refs.msgInputRef &&
          this.$refs.msgInputRef.$refs.textareaRef
        ) {
          const el = this.$refs.msgInputRef.$refs.textareaRef;
          const newCursorPos =
            currentCursorPos + (emoji && emoji.key ? emoji.key.length : 0);
          el.setSelectionRange(newCursorPos, newCursorPos);
          this.$refs.msgInputRef.focus && this.$refs.msgInputRef.focus();
          this.cursorPosition = newCursorPos;
        }
      });
    },
    // 发送文件入口：触发文件选择框
    handleSendFileMsg() {
      if (this.isTeamMute) return;
      this.$refs.fileInput && this.$refs.fileInput.click();
    },
    // 文件大小校验：默认限制 100MB
    checkFileSize(file) {
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(t("uploadLimitText"));
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = "";
        }
        return false;
      }
      return true;
    },
    // 获取图片 DataURL：用于发送图片消息的预览图
    getImgDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve((e && e.target && e.target.result) || "");
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    },
    // 获取视频首帧 DataURL：用于发送视频消息的预览图
    getVideoFirstFrameDataUrl(videoFile) {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        video.onloadeddata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context &&
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL("image/jpeg");
          resolve(dataURL);
        };
        video.onerror = () => reject(new Error("Failed to load the video"));
        const url = URL.createObjectURL(videoFile);
        video.preload = "auto";
        video.autoplay = true;
        video.muted = true;
        video.src = url;
      });
    },
    // 选择文件后发送：创建文件消息并发送，结束后清空 input value
    onFileSelected(event) {
      if (this.isTeamMute) {
        if (this.$refs.fileInput) this.$refs.fileInput.value = "";
        return;
      }
      const target = event.target;
      const file = target && target.files && target.files[0];
      if (!file) return;
      const isFileSizeValid = this.checkFileSize(file);
      if (!isFileSizeValid) return;
      try {
        const fileMsg = nim.V2NIMMessageCreator.createFileMessage(file);
        this.store?.msgStore
          .sendMessageActive({
            msg: fileMsg,
            conversationId: this.conversationId,
            progress: () => true,
            sendBefore: () => {
              this.scrollBottom();
            },
          })
          .then(() => {
            this.scrollBottom();
          })
          .catch((err) => {
            this.scrollBottom();
            this.handleSendMsgError(err && err.code);
          })
          .finally(() => {
            if (this.$refs.fileInput) this.$refs.fileInput.value = "";
          });
      } catch (err) {
        this.scrollBottom();
      }
    },
    // 选择视频后发送：生成首帧预览并创建视频消息，结束后清空 input value
    onVideoSelected(event) {
      if (this.isTeamMute) {
        if (this.$refs.videoInputHidden) this.$refs.videoInputHidden.value = "";
        return;
      }
      const target = event.target;
      const file = target && target.files && target.files[0];
      if (!file) return;
      const isFileSizeValid = this.checkFileSize(file);
      if (!isFileSizeValid) return;
      this.getVideoFirstFrameDataUrl(file).then((previewImg) => {
        const fileMsg = nim.V2NIMMessageCreator.createVideoMessage(file);
        this.store?.msgStore
          .sendMessageActive({
            msg: fileMsg,
            conversationId: this.conversationId,
            previewImg,
            progress: () => true,
            sendBefore: () => {
              this.scrollBottom();
            },
          })
          .then(() => {
            this.scrollBottom();
          })
          .catch(() => {
            this.scrollBottom();
            toast.info(t("sendVideoFailedText"));
          })
          .finally(() => {
            if (this.$refs.videoInputHidden)
              this.$refs.videoInputHidden.value = "";
          });
      });
    },
    // 选择图片后发送：<=20MB 按图片消息发送；>20MB 直接按文件消息发送
    onImageSelected(event) {
      if (this.isTeamMute) {
        if (this.$refs.imageInputHidden) this.$refs.imageInputHidden.value = "";
        return;
      }
      const target = event.target;
      const file = target && target.files && target.files[0];
      if (!file) return;
      if (!(file.type || "").startsWith("image/")) {
        toast.info(t("selectImageText"));
        if (this.$refs.imageInputHidden) this.$refs.imageInputHidden.value = "";
        return;
      }
      const isFileSizeValid = this.checkFileSize(file);
      if (!isFileSizeValid) {
        if (this.$refs.imageInputHidden) this.$refs.imageInputHidden.value = "";
        return;
      }
      const maxImageSize = 20 * 1024 * 1024;
      if (file.size > maxImageSize) {
        try {
          const fileMsg = nim.V2NIMMessageCreator.createFileMessage(file);
          this.store?.msgStore
            .sendMessageActive({
              msg: fileMsg,
              conversationId: this.conversationId,
              progress: () => true,
              sendBefore: () => {
                this.scrollBottom();
              },
            })
            .then(() => {
              this.scrollBottom();
            })
            .catch((err) => {
              this.scrollBottom();
              this.handleSendMsgError(err && err.code);
            })
            .finally(() => {
              if (this.$refs.imageInputHidden)
                this.$refs.imageInputHidden.value = "";
              this.scrollBottom();
            });
        } catch (err) {
          if (this.$refs.imageInputHidden)
            this.$refs.imageInputHidden.value = "";
          this.scrollBottom();
        }
        return;
      }
      this.getImgDataUrl(file).then((previewImg) => {
        const imgMsg = nim.V2NIMMessageCreator.createImageMessage(file);
        this.store?.msgStore
          .sendMessageActive({
            msg: imgMsg,
            conversationId: this.conversationId,
            previewImg,
            progress: () => true,
            sendBefore: () => {
              this.scrollBottom();
            },
          })
          .then(() => {
            this.scrollBottom();
          })
          .catch((err) => {
            this.handleSendMsgError(err && err.code);
          })
          .finally(() => {
            if (this.$refs.imageInputHidden)
              this.$refs.imageInputHidden.value = "";
            this.scrollBottom();
          });
      });
    },
  },
};
</script>

<style scoped>
.input-root {
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
  min-width: 0;
  /* 关键：允许元素收缩 */
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
  pointer-events: auto;
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
