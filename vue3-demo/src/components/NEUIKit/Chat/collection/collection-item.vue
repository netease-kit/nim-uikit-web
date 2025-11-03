<template>
  <div class="collection-item-content">
    <div class="collection-item-content-top">
      <div class="collection-item-content-top-msg">
        <MessageItemContent :msg="msg" />
      </div>
      <div class="collection-item-content-top-icon">
        <Dropdown trigger="click">
          <div class="collection-item-more-btn">...</div>
          <template #overlay>
            <div class="collection-item-menu">
              <div
                v-for="item in menuItems"
                :key="item.key"
                class="collection-item-menu-item"
                @click="handleMenuClick(item.key)"
              >
                <Icon
                  v-if="item.icon"
                  :type="item.icon"
                  class="collection-item-menu-icon"
                />
                <span>{{ item.label }}</span>
              </div>
            </div>
          </template>
        </Dropdown>
      </div>
    </div>
    <div class="collection-item-info">
      <span>{{ collectionData?.senderName }}</span>
      <span>{{
        formatDate(collection.updateTime || collection.createTime)
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, computed } from "vue";
import Dropdown from "../message/message-dropdown.vue";
import Icon from "../../CommonComponents/Icon.vue";
import { t } from "../../utils/i18n";
import { formatDate } from "../../utils/date";
import {
  V2NIMCollection,
  V2NIMMessage,
} from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";
import MessageItemContent from "../message/message-item-content.vue";
interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  show?: number;
  onClick?: (params: {
    collection: V2NIMCollection;
    msg: V2NIMMessage;
  }) => void;
}

interface Props {
  collection: V2NIMCollection;
  menus?: MenuItem[];
}

const props = withDefaults(defineProps<Props>(), {});

const { proxy } = getCurrentInstance()!;
const nim = proxy?.$NIM;
const store = proxy?.$UIKitStore;

// 定义事件
const emit = defineEmits<{
  "menu-click": [
    params: { key: string; collection: V2NIMCollection; msg: V2NIMMessage }
  ];
}>();

// 解析收藏数据
const collectionData = computed(() => {
  let data;
  try {
    data = JSON.parse(props.collection.collectionData || "{}");
  } catch (error) {
    console.log("collection.collectionData", error);
  }
  return data;
});

// 转换消息对象
const msg = computed(() => {
  return nim.V2NIMMessageConverter.messageDeserialization(
    collectionData.value?.message
  );
});

// 菜单项
const menuItems = computed(() => {
  const defaultMenus: MenuItem[] = [
    {
      show: msg.value?.messageType === 2 ? 0 : 1, // V2NIM_MESSAGE_TYPE_AUDIO
      key: "forward",
      label: t("forwardText"),
      icon: "icon-forward",
    },
    {
      show: 1,
      label: t("deleteText"),
      key: "delete",
      icon: "icon-shanchu",
    },
  ];

  return defaultMenus.filter((item) => item.show);
});

// 菜单点击处理
const handleMenuClick = (key: string) => {
  emit("menu-click", {
    key,
    collection: props.collection,
    msg: msg.value,
  });
};
</script>

<style scoped>
.collection-item-content {
  padding: 24px;
  margin: 20px 40px;
  background-color: #ffffff;
  border-radius: 10px;
  box-sizing: border-box;
}

.collection-item-content-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.collection-item-content-top-msg {
  flex: 1;
  margin-right: 12px;
}

.collection-item-content-top-msg :deep(.audio-dur) {
  margin: 0px;
}

.collection-item-content-top-icon {
  flex-shrink: 0;
}

.collection-item-more-btn {
  font-size: 18px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.collection-item-more-btn:hover {
  background-color: #e9ecef;
}

.collection-item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.collection-item-menu {
  background: white;
  border-radius: 6px;
  padding: 4px 0;
  min-width: 70px;
}

.collection-item-menu-item {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #000;
}

.collection-item-menu-item:hover {
  background-color: #f0f0f0;
}

.collection-item-menu-icon {
  margin-right: 8px;
  font-size: 16px;
}

.parse-session {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}
</style>
