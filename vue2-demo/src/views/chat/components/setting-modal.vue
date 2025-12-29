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
          <NEUISwitch
            :checked="enableV2CloudConversation"
            @change="changeEnableV2CloudConversation"
          />
        </div>
      </div>
      <div class="setting-item">
        <div class="item-left">{{ t("teamManagerEnableText") }}</div>
        <div class="item-right">
          <NEUISwitch
            :checked="teamManagerVisible"
            @change="changeTeamManagerVisible"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from "../../../components/NEUIKit/CommonComponents/Modal.vue";
import { t } from "../../../components/NEUIKit/utils/i18n";
import { showToast } from "../../../components/NEUIKit/utils/toast";
import NEUISwitch from "../../../components/NEUIKit/CommonComponents/Switch.vue";

export default {
  name: "NEUIKitSettingModal",
  components: { Modal, NEUISwitch },
  props: {
    visible: { type: Boolean, default: false },
  },
  data() {
    return {
      enableV2CloudConversation: false,
      teamManagerVisible: false,
      switchToEnglishFlag: false,
    };
  },
  mounted() {
    this.teamManagerVisible = sessionStorage.getItem("teamManagerVisible") !== "off";
    this.enableV2CloudConversation = sessionStorage.getItem("enableV2CloudConversation") === "on";
    this.switchToEnglishFlag = sessionStorage.getItem("switchToEnglishFlag") === "en";
  },
  methods: {
    t,
    onConfirm() {},
    handleClose() {
      this.$emit("close");
    },
    onChangeSetting(key, value) {
      sessionStorage.setItem(key, value ? "on" : "off");
      showToast({ message: "切换后刷新页面生效", type: "info" });
      window.location.reload();
      this.$emit("close");
    },
    changeEnableV2CloudConversation(value) {
      this.enableV2CloudConversation = value;
      this.onChangeSetting("enableV2CloudConversation", value);
    },
    changeTeamManagerVisible(value) {
      this.teamManagerVisible = value;
      this.onChangeSetting("teamManagerVisible", value);
    },
  },
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
