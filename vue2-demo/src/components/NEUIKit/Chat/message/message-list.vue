<template>
  <div class="msg-list-wrapper">
    <div
      id="message-scroll-list"
      scroll-y="true"
      :scroll-top="scrollTop"
      class="message-scroll-list"
      ref="messageListRef"
    >
      <div v-show="loadingMore" class="msg-tip">
        {{ t("loadingText") }}
      </div>
      <div class="msg-tip" v-show="noMore">{{ t("noMoreText") }}</div>
      <div v-for="(item, index) in msgs" :key="item.messageClientId">
        <MessageItem
          :msg="item"
          :index="index"
          :key="item.messageClientId"
          :reply-msgs-map="replyMsgsMap"
        >
        </MessageItem>
      </div>
    </div>
  </div>
</template>

<script>
import MessageItem from "./message-item.vue";
import emitter from "../../utils/eventBus";
import { t } from "../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { autorun } from "mobx";
import { events } from "../../utils/constants";
import { uiKitStore } from "../../utils/init";

export default {
  name: "MessageList",
  components: { MessageItem },
  props: {
    msgs: { default: () => [] },
    conversationType: { type: Number, required: true },
    to: { type: String, required: true },
    loadingMore: { type: Boolean, default: false },
    noMore: { type: Boolean, default: false },
    replyMsgsMap: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      scrollTop: 0,
      scrollTimer: null,
      teamWatchDispose: null,
      store: uiKitStore,
    };
  },
  mounted() {
    this.teamWatchDispose = autorun(() => {
      this.store.teamStore.teams.get(this.to);
    });

    emitter.on(events.ON_SCROLL_BOTTOM, this.scrollToBottom);
    this.$nextTick(() => {
      const el = this.$refs.messageListRef;
      if (el) el.addEventListener("scroll", this.handleScroll);
    });
  },
  beforeDestroy() {
    emitter.off(events.ON_SCROLL_BOTTOM, this.scrollToBottom);
    emitter.off(events.AUDIO_URL_CHANGE);
    if (this.teamWatchDispose) this.teamWatchDispose();
    const el = this.$refs.messageListRef;
    if (el) el.removeEventListener("scroll", this.handleScroll);
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
  },
  methods: {
    t,
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageListRef;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
    handleScroll() {
      const el = this.$refs.messageListRef;
      if (!el) return;
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer);
      }
      this.scrollTimer = setTimeout(() => {
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        const clientHeight = el.clientHeight;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        if (distanceFromBottom !== 0 && distanceFromBottom < 10) {
          emitter.emit(events.ON_SCROLL_BOTTOM);
        }
        if (!this.loadingMore && !this.noMore) {
          const threshold = 100;
          if (scrollTop <= threshold) {
            this.loadMoreMessages();
          }
        }
      }, 150);
    },
    loadMoreMessages() {
      const el = this.$refs.messageListRef;
      if (!el) return;
      const previousScrollHeight = el.scrollHeight;
      const previousScrollTop = el.scrollTop;
      const previousMsgCount = (this.msgs || []).length;
      const msg = (this.msgs || []).filter(
        (item) =>
          !(
            item.messageType ===
              V2NIMConst.V2NIMMessageType.V2NIM_MESSAGE_TYPE_CUSTOM &&
            ["beReCallMsg", "reCallMsg"].includes(item.recallType || "")
          )
      )[0];
      if (msg) {
        emitter.emit(events.GET_HISTORY_MSG, msg);
        const unwatch = this.$watch(
          () => (this.msgs || []).length,
          (newLength) => {
            if (newLength > previousMsgCount) {
              this.$nextTick(() => {
                const el2 = this.$refs.messageListRef;
                if (el2) {
                  const newScrollHeight = el2.scrollHeight;
                  const heightDifference =
                    newScrollHeight - previousScrollHeight;
                  const targetScrollTop =
                    previousScrollTop + heightDifference - 1;
                  const finalScrollTop = Math.max(0, targetScrollTop);
                  el2.scrollTo({ top: finalScrollTop, behavior: "instant" });
                  unwatch && unwatch();
                }
              });
            }
          }
        );
      }
    },
    getScrollInfo() {
      const el = this.$refs.messageListRef;
      if (!el) {
        return {
          height: 0,
          scrollTop: 0,
          scrollHeight: 0,
          clientHeight: 0,
          distanceFromBottom: 0,
        };
      }
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      return {
        height: clientHeight,
        scrollTop,
        scrollHeight,
        clientHeight,
        distanceFromBottom,
      };
    },
  },
};
</script>

<style scoped>
.msg-list-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  height: 100%;
  box-sizing: border-box;
  padding: 0px 0px 5px 0px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  background: #f6f8fa;
}

.msg-tip {
  text-align: center;
  color: #b3b7bc;
  font-size: 14px;
  margin-top: 10px;
  width: 100%;
}

.block {
  width: 100%;
  height: 40px;
}

.message-scroll-list {
  /* 设置滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.message-scroll-list {
  height: 100%;
  box-sizing: border-box;
  padding: 0 10px 10px 10px;
  overflow-y: auto;
  width: 100% !important;
  overflow-x: hidden;
}

.loading-more-text {
  text-align: center;
  color: #b3b7bc;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 8px 0;
}
</style>
