<template>
  <div v-if="visible" class="not-friend-tip">
    <div class="tip-content">
      <Icon type="icon-warning" :size="16" class="warning-icon" />
      <span class="tip-text">
        {{ `${appellation} ${t("strangerTipText")}` }}
      </span>
      <Icon
        type="icon-guanbi"
        :size="14"
        class="close-icon"
        @click="handleClose"
      />
    </div>
  </div>
</template>

<script>
import Icon from "../../CommonComponents/Icon.vue";
import { t } from "../../utils/i18n";

export default {
  name: "NotFriendTip",
  components: { Icon },
  props: {
    visible: { type: Boolean, default: false },
    appellation: { type: String, default: "" },
  },
  methods: {
    t,
    handleClose() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.not-friend-tip {
  background-color: #fffbe6;
  border-radius: 6px;
  margin-bottom: 12px;
  padding: 0;
  overflow: hidden;
}

.tip-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
}

.warning-icon {
  color: #fa8c16;
  flex-shrink: 0;
}

.tip-text {
  flex: 1;
  font-size: 14px;
  color: #000;
  line-height: 1.4;
}

.close-icon {
  color: #d46b08;
  cursor: pointer;
  flex-shrink: 0;
  padding: 2px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.close-icon:hover {
  background-color: rgba(212, 107, 8, 0.1);
}
</style>
