<template>
  <div class="chatroomWrapper">
    <div class="chatroomContent" ref="contentRef" @scroll="scrollHandler">
      <div>
        <div v-if="isNoMore" class="no-more-message">
          {{ $t("没有更多消息了") }}~
        </div>
        <div v-else-if="loadingMore" class="loading-more">
          <LoadingOutlined />
          <span style="margin-left: 10px">{{ $t("正在加载，请稍候") }}</span>
        </div>
      </div>
      <div v-if="msgs.length">
        <ChatCard
          v-for="item in msgs"
          v-bind:key="item.msgIdClient"
          :msg="item"
          :myAvatar="myAvatar"
          :myAccid="myAccid"
          :onResendText="onResendText"
          :onResendImg="onResendImg"
          :onResendFile="onResendFile"
        />
      </div>
      <div v-else class="emptyChatroomContent">
        <div>{{ $t("欢迎来到") }}</div>
        <h1>#{{ channelName }}</h1>
        <div>
          {{ $t("这是") }} #{{ channelName }} {{ $t("的起点") }}。{{ topic }}
        </div>
      </div>
    </div>
    <div class="chatroomControllerWrapper">
      <!-- @ mention popup -->
      <div v-if="mentionVisible" class="mentionPopup">
        <div class="mentionPopup__header">
          {{ $t("选择成员") }}
        </div>
        <div
          class="mentionPopup__list"
          ref="mentionListRef"
          @scroll="mentionScrollHandler"
        >
          <div
            v-if="mentionMembers.length === 0 && !mentionLoading"
            class="mentionPopup__empty"
          >
            {{ $t("暂无成员") }}
          </div>
          <div
            v-for="(member, idx) in mentionMembers"
            :key="member.accid"
            class="mentionPopup__item"
            :class="{ active: mentionActiveIndex === idx }"
            @mousedown.prevent="selectMentionMember(member)"
            @mouseenter="mentionActiveIndex = idx"
          >
            <span class="mentionPopup__nick">{{
              member.nick || member.accid
            }}</span>
            <span class="mentionPopup__accid">{{ member.accid }}</span>
          </div>
          <div v-if="mentionLoading" class="mentionPopup__loading">
            <LoadingOutlined /> {{ $t("加载中...") }}
          </div>
        </div>
      </div>
      <div class="chatroomInputWrapper">
        <Textarea
          id="chatroomInputId"
          class="chatroomInput"
          v-model:value="curText"
          :placeholder="inputPlaceholder"
          :disabled="sendDisabled"
          :auto-size="{ minRows: 1, maxRows: 6 }"
          @input="inputChangeHandler"
          @change="inputChangeHandler"
          @pressEnter="pressEnterHandler"
          @blur="handleInputBlur"
          @keydown="handleMentionKeydown"
        />
        <div class="chatroomController">
          <Popover placement="topRight">
            <template #content>
              <div style="width: 400px">
                <span
                  style="padding: 7px 0 0 7px; font-size: 16px; cursor: pointer"
                  v-for="(value, i) in emjjData"
                  :key="i"
                  @click="insertEmj(i)"
                  >{{ value }}</span
                >
              </div>
            </template>
            <SmileOutlined
              :style="{
                color: '#8c8c8c',
                width: '16px',
                height: '16px',
              }"
            />
          </Popover>
          <Upload
            :before-upload="uploadImgHandler"
            :showUploadList="false"
            accept=".jpg,.png,.jpeg"
            :disabled="sendDisabled"
          >
            <Button
              class="chatroomButton"
              type="text"
              :loading="imgUploading"
              :disabled="sendDisabled"
              :style="{
                width: '24px',
              }"
            >
              <template #icon>
                <IconFont type="icon-tupian" :style="{ color: '#8c8c8c' }" />
              </template>
            </Button>
          </Upload>
          <Upload
            :before-upload="uploadFileHandler"
            :showUploadList="false"
            :disabled="sendDisabled"
          >
            <Button
              class="chatroomButton"
              type="text"
              :loading="fileUploading"
              :disabled="sendDisabled"
              :style="{
                width: '24px',
              }"
            >
              <template #icon>
                <FolderOpenOutlined
                  :style="{ color: '#8c8c8c', width: '16px', height: '16px' }"
                />
              </template>
            </Button>
          </Upload>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { Input, Button, Upload, message, Popover } from "ant-design-vue";
import {
  FolderOpenOutlined,
  LoadingOutlined,
  SmileOutlined,
} from "@ant-design/icons-vue";
import { useStore } from "vuex";
import { emptyFunc, filterStr, isLt } from "../../utils/index";
import { QChatMessage } from "../../types/v2-compat";
import { MemberInfo } from "../../types/v2-compat";
import ChatCard from "./ChatCard.vue";
import IconFont from "../IconFont";
import { useI18n } from "vue-i18n";

const Textarea = Input.TextArea;
const MENTION_PAGE_LIMIT = 20;

export default {
  name: "ChatContent",
  components: {
    Textarea,
    Button,
    Upload,
    FolderOpenOutlined,
    ChatCard,
    IconFont,
    LoadingOutlined,
    SmileOutlined,
    Popover,
  },
  props: {
    msgs: {
      type: Array as () => QChatMessage[],
      default: () => [] as QChatMessage[],
    },
    channelName: {
      type: String,
      default: "频道名称",
    },
    topic: {
      type: String,
      default: "频道主题",
    },
    imgUploading: {
      type: Boolean,
      default: false,
    },
    fileUploading: {
      type: Boolean,
      default: false,
    },
    sendDisabled: {
      type: Boolean,
      default: false,
    },
    isNoMore: {
      type: Boolean,
      default: false,
    },
    myAccid: {
      type: String,
      default: "",
    },
    myAvatar: {
      type: String,
      default: "",
    },
    onSendText: {
      type: Function,
      default: emptyFunc,
    },
    onSendImg: {
      type: Function,
      default: emptyFunc,
    },
    onSendFile: {
      type: Function,
      default: emptyFunc,
    },
    onResendText: {
      type: Function,
      default: emptyFunc,
    },
    onResendImg: {
      type: Function,
      default: emptyFunc,
    },
    onResendFile: {
      type: Function,
      default: emptyFunc,
    },
    onLoadMore: {
      type: Function,
      default: emptyFunc,
    },
  },
  setup(props: {
    msgs: QChatMessage[];
    channelName: string;
    topic: string;
    imgUploading: boolean;
    fileUploading: boolean;
    sendDisabled: boolean;
    isNoMore: boolean;
    myAccid: string;
    myAvatar: string;
    onSendText: (text: string, accids?: string[]) => void;
    onSendImg: (file: File) => void;
    onSendFile: (file: File) => void;
    onResendText: Function;
    onResendImg: Function;
    onResendFile: Function;
    onLoadMore: (time: number) => Promise<void>;
  }) {
    const store = useStore();
    const { t: $t } = useI18n();
    const curText = ref<string>("");
    const cursorIndex = ref<number>(0);
    const contentRef = ref<HTMLElement | null>(null);
    const loadingMore = ref<boolean>(false);

    const mentionVisible = ref(false);
    const mentionMembers = ref<MemberInfo[]>([]);
    const mentionLoading = ref(false);
    const mentionActiveIndex = ref(0);
    const mentionListRef = ref<HTMLElement | null>(null);
    const mentionNextTimetag = ref(0);
    const mentionHasMore = ref(false);
    // Track the cursor position where "@" was typed
    const mentionTriggerIndex = ref(-1);
    // Collected mentions for the current message
    const selectedMentionAccids = ref<string[]>([]);
    // All members (for filtering)
    const allMentionMembers = ref<MemberInfo[]>([]);
    // Current search keyword
    const mentionSearchKeyword = ref("");

    const fetchMentionMembers = async (reset = true) => {
      const curServer = store.state.server.curServer;
      if (!curServer || !curServer.serverId) return;

      mentionLoading.value = true;
      try {
        const timetag = reset ? 0 : mentionNextTimetag.value;
        const res = await store.dispatch("server/getSeverMembers", {
          serverId: curServer.serverId,
          timetag,
          limit: MENTION_PAGE_LIMIT,
        });
        if (res) {
          if (reset) {
            allMentionMembers.value = res.datas || [];
            mentionMembers.value = res.datas || [];
          } else {
            allMentionMembers.value = [
              ...allMentionMembers.value,
              ...(res.datas || []),
            ];
            mentionMembers.value = [...allMentionMembers.value];
          }
          mentionHasMore.value = res.listQueryTag?.hasMore || false;
          mentionNextTimetag.value = res.listQueryTag?.nextTimetag || 0;
        }
      } catch (err) {
        console.error("fetchMentionMembers error:", err);
      } finally {
        mentionLoading.value = false;
      }
    };

    const showMentionPopup = () => {
      mentionVisible.value = true;
      mentionActiveIndex.value = 0;
      fetchMentionMembers(true);
    };

    const hideMentionPopup = () => {
      mentionVisible.value = false;
      mentionMembers.value = [];
      allMentionMembers.value = [];
      mentionActiveIndex.value = 0;
      mentionTriggerIndex.value = -1;
      mentionSearchKeyword.value = "";
    };

    // 根据关键词过滤成员列表
    const filterMentionMembers = (keyword: string) => {
      mentionSearchKeyword.value = keyword;

      console.log(
        "🔍 过滤成员 - 关键词:",
        `'${keyword}'`,
        "总成员数:",
        allMentionMembers.value.length,
      );

      // 如果所有成员列表为空，不做处理（等待加载）
      if (allMentionMembers.value.length === 0) {
        console.log("⚠️ 所有成员列表为空，等待加载...");
        return;
      }

      if (!keyword || keyword.trim() === "") {
        // 如果没有关键词，显示所有成员
        mentionMembers.value = [...allMentionMembers.value];
        mentionActiveIndex.value = 0;
        console.log("✅ 无关键词，显示所有成员:", mentionMembers.value.length);
        return;
      }

      // 过滤：匹配昵称或账号
      const filtered = allMentionMembers.value.filter((member) => {
        const nick = (member.nick || "").toLowerCase();
        const accid = (member.accid || "").toLowerCase();
        const search = keyword.toLowerCase();
        const matches = nick.includes(search) || accid.includes(search);
        if (matches) {
          console.log(`  ✓ 匹配: ${member.nick || member.accid}`);
        }
        return matches;
      });

      mentionMembers.value = filtered;
      mentionActiveIndex.value = 0;

      console.log(`📊 过滤结果: ${filtered.length} 个成员匹配 '${keyword}'`);

      // 如果没有匹配的成员，关闭弹窗
      if (filtered.length === 0) {
        console.log("❌ 没有匹配的成员，关闭@弹窗");
        hideMentionPopup();
      }
    };

    const selectMentionMember = (member: MemberInfo) => {
      const displayName = member.nick || member.accid;
      const triggerIdx = mentionTriggerIndex.value;
      if (triggerIdx < 0) return;

      // Replace text from "@" to cursor with "@nick "
      const before = curText.value.slice(0, triggerIdx);
      const afterCursor = curText.value.slice(cursorIndex.value);
      curText.value = before + "@" + displayName + " " + afterCursor;
      cursorIndex.value = before.length + 1 + displayName.length + 1;

      // Track accid
      if (!selectedMentionAccids.value.includes(member.accid)) {
        selectedMentionAccids.value.push(member.accid);
      }

      hideMentionPopup();

      // Re-focus textarea
      nextTick(() => {
        const textarea = document.getElementById(
          "chatroomInputId",
        ) as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorIndex.value, cursorIndex.value);
        }
      });
    };

    const mentionScrollHandler = (e: Event) => {
      const el = e.target as HTMLElement;
      if (!el) return;

      if (
        el.scrollTop + el.clientHeight >= el.scrollHeight - 10 &&
        mentionHasMore.value &&
        !mentionLoading.value
      ) {
        fetchMentionMembers(false);
      }
    };

    const handleMentionKeydown = (e: KeyboardEvent) => {
      if (!mentionVisible.value) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (mentionActiveIndex.value < mentionMembers.value.length - 1) {
          mentionActiveIndex.value++;
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (mentionActiveIndex.value > 0) {
          mentionActiveIndex.value--;
        }
      } else if (e.key === "Enter" && !e.shiftKey) {
        if (mentionMembers.value.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          selectMentionMember(mentionMembers.value[mentionActiveIndex.value]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        hideMentionPopup();
      }
    };

    const emjjData = [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "☺️",
      "☺",
      "😚",
      "😙",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🤧",
      "🥵",
      "🥶",
      "🥴",
      "😵",
      "🤯",
      "🤠",
      "🥳",
      "😎",
      "🤓",
      "🧐",
      "😕",
      "😟",
      "🙁",
      "☹️",
      "😮",
      "😯",
      "😲",
      "😳",
      "🥺",
      "😦",
      "😧",
      "😨",
      "😰",
      "😥",
      "😢",
      "😭",
      "😱",
      "😖",
      "😣",
      "😞",
      "😓",
      "😩",
      "😫",
      "😤",
      "😡",
      "😠",
      "🤬",
      "😈",
      "👿",
      "💀",
      "☠️",
      "☠",
      "💩",
      "🤡",
      "👹",
      "👺",
      "👻",
      "👽",
      "👾",
      "🤖",
      "😺",
      "😸",
      "😹",
      "😻",
      "😼",
      "😽",
      "🙀",
      "😿",
      "😾",
      "🙈",
      "🙉",
      "🙊",
      "💋",
      "💌",
      "💘",
      "💝",
      "💖",
      "💗",
      "💓",
      "💞",
      "💕",
      "💟",
      "❣️",
      "❣",
      "💔",
      "❤️",
      "❤",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "💯",
      "💢",
      "💥",
      "💫",
      "💦",
      "💨",
      "🕳️",
      "🕳",
      "💣",
      "💬",
      "👁️‍🗨️",
      "👁‍🗨️",
      "👁️‍🗨",
      "👁‍🗨",
      "🗨️",
      "🗨",
      "🗯️",
      "🗯",
      "💭",
      "💤",
      "👋",
    ];

    // 判断是否是自己发送的消息
    const isMyMessage = (msg: QChatMessage | undefined) => {
      if (!msg) return false;
      return (msg as any).fromAccount === props.myAccid;
    };

    watch(
      () => props.msgs,
      (newMsgs: QChatMessage[], oldMsgs: QChatMessage[] | undefined) => {
        nextTick(() => {
          if (!contentRef.value) return;

          // 检查是否是频道切换（消息列表被完全替换）
          const isChannelSwitch =
            oldMsgs &&
            oldMsgs.length > 0 &&
            newMsgs.length > 0 &&
            (oldMsgs[0]?.msgIdServer !== newMsgs[0]?.msgIdServer ||
              oldMsgs[oldMsgs.length - 1]?.msgIdServer !==
                newMsgs[newMsgs.length - 1]?.msgIdServer);

          // 如果是频道切换，直接滚动到底部
          if (
            isChannelSwitch ||
            (oldMsgs?.length === 0 && newMsgs.length > 0)
          ) {
            contentRef.value.scrollTop = contentRef.value.scrollHeight;
            return;
          }

          // 如果有新消息添加，自动滚动到底部
          if (newMsgs.length > (oldMsgs?.length || 0)) {
            const isNearBottom =
              contentRef.value.scrollTop + contentRef.value.clientHeight >=
              contentRef.value.scrollHeight - 100; // 距离底部100px以内视为"接近底部"

            // 如果用户在底部附近，或者是自己发送的消息，自动滚动到底部
            if (isNearBottom || isMyMessage(newMsgs[newMsgs.length - 1])) {
              contentRef.value.scrollTop = contentRef.value.scrollHeight;
            }
          }
        });
      },
      { deep: true },
    );

    return {
      emjjData,
      loadingMore,
      curText,
      contentRef,
      cursorIndex,
      // mention
      mentionVisible,
      mentionMembers,
      mentionLoading,
      mentionActiveIndex,
      mentionListRef,
      selectMentionMember,
      mentionScrollHandler,
      handleMentionKeydown,
      inputPlaceholder: computed(() =>
        props.sendDisabled
          ? $t("您暂无发送消息权限")
          : `${$t("按下 Enter 发送消息给")} #${props.channelName}`,
      ),
      handleInputBlur: (e: Event) => {
        const target = e.target as HTMLTextAreaElement;
        if (target && target.selectionStart !== null) {
          cursorIndex.value = target.selectionStart;
        }
        // Delay hiding to allow mousedown on mention item to fire first
        setTimeout(() => {
          if (mentionVisible.value) {
            hideMentionPopup();
          }
        }, 200);
      },
      insertEmj: (index: number) => {
        const insertVal = emjjData[index];
        const curTextVal =
          curText.value.slice(0, cursorIndex.value) +
          insertVal +
          curText.value.slice(cursorIndex.value);
        curText.value = curTextVal;
        cursorIndex.value = cursorIndex.value + insertVal.length;
      },
      inputChangeHandler: (
        e: Event & { data?: string; target: HTMLTextAreaElement },
      ) => {
        const newValue = e.target.value;
        const selStart = e.target.selectionStart;
        curText.value = newValue;
        cursorIndex.value = selStart; // 确保cursor位置同步更新

        // 使用 InputEvent 的 data 属性检测用户输入的具体字符，这更准确
        const inputData = e.data;
        console.log(
          "输入事件 - data:",
          inputData,
          "value:",
          newValue,
          "selectionStart:",
          selStart,
        );

        // 检测用户刚输入的是否是"@"字符
        if (inputData === "@") {
          // 记录@符号的位置（当前光标位置-1，因为@已经插入）
          mentionTriggerIndex.value = selStart - 1;
          console.log("触发@功能，@位置:", mentionTriggerIndex.value);
          showMentionPopup();
        } else if (mentionVisible.value) {
          // 如果@弹窗可见，处理过滤逻辑
          const triggerIdx = mentionTriggerIndex.value;

          // 情况1：用户删除了"@"符号
          if (
            triggerIdx < 0 ||
            triggerIdx >= newValue.length ||
            newValue[triggerIdx] !== "@"
          ) {
            console.log(
              "隐藏@弹窗 - @符号被删除，triggerIdx:",
              triggerIdx,
              "newValue[triggerIdx]:",
              newValue[triggerIdx],
            );
            hideMentionPopup();
          } else {
            // 情况2：提取@符号后到光标位置之间的搜索词
            const searchKeyword = newValue.slice(triggerIdx + 1, selStart);
            console.log("@搜索关键词:", `'${searchKeyword}'`);

            // 根据搜索词过滤成员列表
            filterMentionMembers(searchKeyword);
          }
        }
      },
      pressEnterHandler: (e: KeyboardEvent) => {
        // If mention popup is visible, Enter selects the member (handled by handleMentionKeydown)
        if (mentionVisible.value) return;

        if (!e.shiftKey) {
          e.preventDefault();
          const text = filterStr(curText.value.trim());
          if (text) {
            const accids =
              selectedMentionAccids.value.length > 0
                ? [...selectedMentionAccids.value]
                : undefined;
            props.onSendText(text, accids);
            curText.value = "";
            selectedMentionAccids.value = [];
          }
        }
      },
      scrollHandler: async (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target) return;

        // 检测滚动到顶部时打印详细调试信息
        if (
          target.scrollTop === 0 &&
          target.scrollHeight - target.clientHeight > 0
        ) {
          const debugInfo = {
            scrollTop: target.scrollTop,
            scrollHeight: target.scrollHeight,
            clientHeight: target.clientHeight,
            timestamp: new Date().toLocaleString(),
            channelName: props.channelName,
            messageCount: props.msgs.length,
            loadingMore: loadingMore.value,
            isNoMore: props.isNoMore,
            hasMessages: props.msgs.length > 0,
          };

          console.log("🔝 圈组聊天页面已滚动到顶部", debugInfo);

          // 检查是否满足加载更多的条件
          const shouldLoadMore =
            !loadingMore.value && !props.isNoMore && props.msgs.length;
          console.log(`📊 加载更多条件检查:`, {
            shouldLoadMore,
            "!loadingMore.value": !loadingMore.value,
            "!props.isNoMore": !props.isNoMore,
            "props.msgs.length > 0": props.msgs.length > 0,
          });

          if (!shouldLoadMore) {
            console.warn("❌ 未触发加载更多，原因:", {
              loadingMore: loadingMore.value ? "正在加载中" : "未在加载",
              isNoMore: props.isNoMore ? "没有更多消息" : "还有更多消息",
              hasMessages: props.msgs.length > 0 ? "有消息" : "没有消息",
            });
          }
        }

        if (
          target.scrollTop === 0 &&
          target.scrollHeight - target.clientHeight > 0 &&
          !loadingMore.value &&
          !props.isNoMore &&
          props.msgs.length
        ) {
          console.log("✅ 开始执行加载更多逻辑");
          loadingMore.value = true;

          // 记录加载前的滚动状态
          const previousScrollHeight = target.scrollHeight;
          const previousScrollTop = target.scrollTop;
          const previousMsgCount = props.msgs.length;

          await props.onLoadMore(props.msgs[0].time);

          // 等待DOM更新后恢复滚动位置
          await nextTick();
          if (contentRef.value && props.msgs.length > previousMsgCount) {
            const newScrollHeight = contentRef.value.scrollHeight;
            const heightDifference = newScrollHeight - previousScrollHeight;

            // 计算目标位置：保持原来的消息位置，然后向上偏移
            const targetScrollTop = previousScrollTop + heightDifference;
            const finalScrollTop = Math.max(0, targetScrollTop);

            // 直接滚动到目标位置，保持用户看到最新加载的消息
            contentRef.value.scrollTop = finalScrollTop;
          }

          loadingMore.value = false;
          store.commit("channel/resetChannelUnReadCount", {}, { root: true });
        }
      },
      uploadImgHandler: (file: File) => {
        // 图片暂不做大小限制
        // if (isLt(file.size, 100)) {
        //   props.onSendImg(file);
        // } else {
        //   message.error("图片大小最大支持100M");
        // }
        props.onSendImg(file);
      },
      uploadFileHandler: (file: File) => {
        if (isLt(file.size, 200)) {
          props.onSendFile(file);
        } else {
          message.info($t("文件大小最大支持200M"));
        }
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.chatroomWrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .chatroomContent {
    flex: 1;
    padding: 20px;
    overflow-y: auto;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #ffffff;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #d9d9d9;
      border-radius: 4px;
      border: 1px solid #ffffff;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #bfbfbf;
    }

    /* 针对Firefox的滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: #d9d9d9 #ffffff;
  }
  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    color: #8c8c8c;
    background-color: #ffffff;
    border-radius: 8px;
    margin-bottom: 8px;
  }
  .no-more-message {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    color: #8c8c8c;
    background-color: #ffffff;
    border-radius: 8px;
    margin-bottom: 8px;
  }
  .emptyChatroomContent {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    padding-bottom: 40px;
    h1 {
      color: #262626;
      margin: 0;
      font-size: 24px;
    }
    div {
      font-size: 16px;
      color: #8c8c8c;
    }
  }
  .chatroomControllerWrapper {
    padding: 24px 20px;
    width: 100%;
    background-color: #ffffff;
    position: relative;

    .mentionPopup {
      position: absolute;
      bottom: 100%;
      left: 20px;
      right: 20px;
      background: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 100;
      margin-bottom: 4px;

      .mentionPopup__header {
        padding: 8px 12px;
        font-size: 12px;
        color: #8c8c8c;
        border-bottom: 1px solid #f0f0f0;
      }

      .mentionPopup__list {
        max-height: 200px;
        overflow-y: auto;
      }

      .mentionPopup__item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover,
        &.active {
          background-color: #e6f7ff;
        }

        .mentionPopup__nick {
          font-size: 14px;
          color: #262626;
        }

        .mentionPopup__accid {
          font-size: 12px;
          color: #8c8c8c;
          margin-left: 8px;
        }
      }

      .mentionPopup__empty {
        padding: 16px 12px;
        text-align: center;
        color: #8c8c8c;
        font-size: 14px;
      }

      .mentionPopup__loading {
        padding: 8px 12px;
        text-align: center;
        color: #8c8c8c;
        font-size: 12px;
      }
    }

    .chatroomInputWrapper {
      border-radius: 8px;
      background-color: #f5f5f5;
      border: 1px solid #e8e8e8;
      display: flex;
      align-items: flex-end;
      width: 100%;
      min-height: 46px;
      padding: 8px 0;
    }

    .chatroomButton {
      display: flex;
      align-items: center;
      justify-content: center;

      /* 移除loading状态下的灰色背景 */
      &.ant-btn-loading {
        background-color: transparent !important;
        background: transparent !important;
      }

      /* 确保按钮在loading状态下保持透明背景 */
      &:not(.ant-btn-primary).ant-btn-loading {
        background-color: transparent !important;
        background: transparent !important;
      }
    }

    .chatroomInput {
      flex: 1;
      min-height: 30px;
      line-height: 1.5;
      border-radius: 8px;
      border: none;
      outline: none;
      resize: none;
      color: #262626;
      background-color: #f5f5f5;
      font-size: 14px;
      padding: 8px 12px;
      &::placeholder {
        color: #8c8c8c;
      }
      &:active,
      &:focus {
        border: none;
        outline: none;
        box-shadow: none;
      }
    }

    .chatroomController {
      display: flex;
      align-items: center;
      padding: 0 15px;
      gap: 8px; /* 统一按钮间距 */

      .ant-popover-open {
        .anticon {
          color: #1890ff !important;
        }
      }

      .ant-btn {
        width: 32px;
        height: 32px;
        border: none;
        box-shadow: none;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;

        &:hover {
          background-color: #f0f7ff;

          .anticon,
          .iconfont {
            color: #1890ff !important;
          }
        }

        &:focus,
        &:active {
          background-color: transparent;
          box-shadow: none;
        }

        &.ant-btn-loading {
          .anticon,
          .iconfont {
            color: #8c8c8c !important;
          }
        }
      }

      .ant-popover-inner-content {
        padding: 0;
      }

      .anticon,
      .iconfont {
        transition: color 0.2s ease;
      }
    }
  }
}
</style>
