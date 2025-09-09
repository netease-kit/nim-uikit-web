<template>
  <Modal
    :visible="visible"
    :title="t('setText')"
    :confirmText="t('okText')"
    :cancelText="t('cancelText')"
    :width="420"
    :height="200"
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
            @change="onChangeEnableV2CloudConversation"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import Modal from "../../../components/NEUIKit/CommonComponents/Modal.vue";
import { t } from "../../../components/NEUIKit/utils/i18n";
import { ref, onMounted, getCurrentInstance } from "vue";
import { showToast } from "../../../components/NEUIKit/utils/toast";
import Switch from "../../../components/NEUIKit/CommonComponents/Switch.vue";
const enableV2CloudConversation = ref(false);
const switchToEnglishFlag = ref(false);
const { proxy } = getCurrentInstance()!;
const store = proxy?.$UIKitStore;

onMounted(() => {
  const storedCloudConv = sessionStorage.getItem("enableV2CloudConversation");
  const storedLanguage = sessionStorage.getItem("switchToEnglishFlag");
  enableV2CloudConversation.value = storedCloudConv === "on";
  switchToEnglishFlag.value = storedLanguage === "en";
});
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

const emit = defineEmits<Emits>();

const onConfirm = () => {};

const handleClose = () => {
  emit("close");
};

const onChangeEnableV2CloudConversation = (value) => {
  enableV2CloudConversation.value = value;
  sessionStorage.setItem("enableV2CloudConversation", value ? "on" : "off");
  showToast({
    message: "切换后刷新页面生效",
    type: "warning",
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
  padding: 16px;
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
