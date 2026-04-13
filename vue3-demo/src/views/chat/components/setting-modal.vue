<template>
  <Modal
    :visible="visible"
    :title="t('setText')"
    :confirmText="t('okText')"
    :cancelText="t('cancelText')"
    :width="550"
    :height="280"
    :top="100"
    :showDefaultFooter="true"
    @confirm="onConfirm"
    @cancel="handleClose"
  >
    <div class="setting-item-wrapper">
      <div class="setting-item">
        <div class="item-left">{{ t("enableV2CloudConversationText") }}</div>
        <div class="item-right">
          <Switch
            :checked="enableV2CloudConversation"
            @change="
              (value) => {
                enableV2CloudConversation = value;
                onChangeSetting('enableV2CloudConversation', value);
              }
            "
          />
        </div>
      </div>
      <div class="setting-item">
        <div class="item-left">{{ t("teamManagerEnableText") }}</div>
        <div class="item-right">
          <Switch
            :checked="teamManagerVisible"
            @change="
              (value) => {
                teamManagerVisible = value;
                onChangeSetting('teamManagerVisible', value);
              }
            "
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import Modal from "../../../components/NEUIKit/CommonComponents/Modal.vue";
import { t } from "../../../components/NEUIKit/utils/i18n";
import { ref, onMounted } from "vue";
import { showToast } from "../../../components/NEUIKit/utils/toast";
import Switch from "../../../components/NEUIKit/CommonComponents/Switch.vue";

interface Props {
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

// Emits
interface Emits {
  (e: "update:visible", visible: boolean): void;
  (e: "close"): void;
}

const enableV2CloudConversation = ref(false);
const teamManagerVisible = ref(false);
const switchToEnglishFlag = ref(false);

onMounted(() => {
  teamManagerVisible.value =
    localStorage.getItem("teamManagerVisible") !== "off";
  enableV2CloudConversation.value =
    localStorage.getItem("enableV2CloudConversation") === "on";
  switchToEnglishFlag.value =
    localStorage.getItem("switchToEnglishFlag") === "en";
});

const emit = defineEmits<Emits>();

const onConfirm = () => {};

const handleClose = () => {
  emit("close");
};

const onChangeSetting = (key, value) => {
  localStorage.setItem(key, value ? "on" : "off");
  showToast({
    message: "切换后刷新页面生效",
    type: "info",
  });
  window.location.reload();
  emit("close");
};
</script>

<style scoped>
.wrapper {
  background-color: rgb(245, 246, 247);
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

.setting-item-wrapper {
  background: #fff;
  border-radius: 8px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  color: #000;
}

.item-left {
  font-size: 16px;
}

.box-shadow {
  height: 1px;
  background-color: #ebedf0;
  margin: 0 16px;
}
</style>
