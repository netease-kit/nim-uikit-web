<template>
  <Modal
    :visible="visible"
    :title="title"
    :showDefaultFooter="false"
    :width="800"
    :height="680"
    :maskOpacity="0"
    @cancel="handleClose"
  >
    <div class="history-container">
      <div v-if="loading" class="loading-wrapper">
        <Loading />
      </div>
      <div v-else-if="msgs.length === 0" class="empty-wrapper">
        <Empty :text="t('noHistoryText')" />
      </div>
      <div v-else class="msg-list">
        <div
          v-for="(msg, index) in msgs"
          :key="msg.messageClientId || index"
          class="history-item"
        >
          <MessageItem :msg="msg" :index="index" :readonly="true" />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { V2NIMMessageForUI } from "@xkit-yx/im-store-v2/dist/types/src/types";
import Empty from "../../CommonComponents/Empty.vue";
import Loading from "../../CommonComponents/Loading.vue";
import Modal from "../../CommonComponents/Modal.vue";
import { t } from "../../utils/i18n";
import { store } from "../../utils/init";
import { toast } from "../../utils/toast";
import MessageItem from "../message/message-item.vue";
import {
  extractMergeForwardData,
  getMergeForwardUrl,
} from "../../utils/merge-forward-message";

const props = defineProps<{
  visible: boolean;
  msg: V2NIMMessageForUI;
}>();

const emit = defineEmits(["close"]);

const msgs = ref<any[]>([]);
const loading = ref(false);

const title = computed(() => {
  const data = extractMergeForwardData(props.msg);
  const sessionName =
    data.sessionName || data.name || data.sessionId || data.to || "";
  return sessionName
    ? `${sessionName} ${t("chatHistoryText")}`
    : t("chatHistoryText");
});

const handleClose = () => {
  emit("close");
};

watch(
  () => props.visible,
  async (visible) => {
    if (!visible || !props.msg) return;

    loading.value = true;
    msgs.value = [];

    try {
      const url = getMergeForwardUrl(props.msg);

      if (url) {
        const response = await fetch(url);
        const text = await response.text();
        const parsedMsgs = store?.msgStore.deserializeMergeMsgs(text) || [];
        msgs.value = parsedMsgs.map((msg: any) => ({
          ...msg,
          isSelf: false,
        }));
      }
    } catch (error) {
      console.error("Failed to load merge forward history:", error);
      toast.error(t("getMergeForwardFailedText"));
      emit("close");
    } finally {
      loading.value = false;
    }
  },
);
</script>

<style scoped>
.history-container {
  max-height: 600px;
  overflow-y: scroll;
  padding: 20px;
  background: #f6f8fa;
  border-radius: 8px;
}

.loading-wrapper,
.empty-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.msg-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  margin-bottom: 20px;
}
</style>
