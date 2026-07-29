<template>
  <div class="multi-message-operation">
    <div class="operation-list">
      <div class="operation-item" @click="handleForward">
        <div class="icon-wrap">
          <Icon type="icon-forward" :size="20" />
        </div>
        <span class="btn-text">{{ t("mergeForwardText") }}</span>
      </div>
      <div class="operation-item" @click="handleDelete">
        <div class="icon-wrap">
          <Icon type="icon-shanchu" :size="20" />
        </div>
        <span class="btn-text">{{ t("deleteText") }}</span>
      </div>
    </div>
    <div class="close-icon" @click="handleCancel">
      <Icon type="icon-guanbi" :size="16" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from "../../CommonComponents/Icon.vue";
import { t } from "../../utils/i18n";
import { store } from "../../utils/init";

const emit = defineEmits(["cancel", "forward", "delete"]);

const handleCancel = () => {
  store.uiStore.setMultiSelectMode(false);
  emit("cancel");
};

const handleForward = () => {
  emit("forward");
};

const handleDelete = () => {
  emit("delete");
};
</script>

<style scoped>
.multi-message-operation {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background-color: #f6f8fa;
  border-top: 1px solid #e6e6e6;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.close-icon {
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.close-icon:hover {
  background-color: #e0e0e0;
}

.operation-list {
  display: flex;
  align-items: center;
  gap: 40px;
}

.operation-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #333;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  background-color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.operation-item:hover .icon-wrap {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-text {
  font-size: 12px;
  color: #666;
}
</style>
