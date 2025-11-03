<template>
  <div class="collection-list-wrap">
    <!-- 头部 -->
    <div class="collection-list-header">{{ t("collectionText") }}</div>

    <!-- 收藏列表容器 -->
    <div
      class="collection-list-container"
      @scroll="onScroll"
      ref="containerRef"
    >
      <template v-if="list.length">
        <CollectionItem
          v-for="item in list"
          :key="item.uniqueId"
          :collection="item"
          @menu-click="onMenuClick"
        >
        </CollectionItem>
      </template>

      <!-- 空状态 -->
      <template v-else>
        <Empty :style="{ marginTop: '10px' }" :text="t('noCollectionsText')" />
      </template>
    </div>

    <!-- 转发弹窗 -->
    <ChatForwardModal
      :visible="!!forwardMessage"
      :msg="forwardMessage"
      @send="handleForwardModalSend"
      @close="handleForwardModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from "vue";
import { debounce } from "@xkit-yx/utils";
import CollectionItem from "./collection-item.vue";
import Empty from "../../CommonComponents/Empty.vue";
import ChatForwardModal from "../message/message-forward-modal.vue";
import { modal } from "../../utils/modal";
import { toast } from "../../utils/toast";
import { t } from "../../utils/i18n";
import {
  V2NIMCollection,
  V2NIMCollectionOption,
  V2NIMMessage,
} from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMMessageService";
const { proxy } = getCurrentInstance()!;
const nim = proxy?.$NIM;

// 定义事件
const emit = defineEmits<{
  "menu-click": [
    params: { key: string; collection: V2NIMCollection; msg: V2NIMMessage }
  ];
}>();

// 响应式数据
const list = ref<V2NIMCollection[]>([]);
const forwardMessage = ref<V2NIMMessage | undefined>();
const noMore = ref(false);
const containerRef = ref<HTMLElement>();

// 常量
const LIMIT = 20;

// 获取收藏列表
const getCollectionList = async (options: V2NIMCollectionOption) => {
  try {
    const data = await nim.V2NIMMessageService.getCollectionListExByOption(
      options
    );

    const newData = [...list.value, ...data.collectionList];

    list.value = newData;
    noMore.value = data.collectionList.length < LIMIT;
  } catch (error) {
    toast.error(t("getCollectionFailed"));
    console.error("getCollectionList failed: ", error);
  }
};

// 菜单点击处理
const onMenuClick = ({
  key,
  collection,
  msg,
}: {
  key: string;
  collection: V2NIMCollection;
  msg: V2NIMMessage;
}) => {
  switch (key) {
    case "forward":
      forwardMessage.value = msg;
      break;
    case "delete":
      modal.confirm({
        title: t("deleteCollectionText"),
        content: t("deleteCollectionConfirmText"),
        onConfirm: async () => {
          try {
            await nim.V2NIMMessageService.removeCollections([collection]);
            const newData = list.value.filter(
              (item) => item.uniqueId !== collection.uniqueId
            );
            list.value = newData;
            toast.success(t("deleteMsgSuccessText"));
          } catch (error) {
            toast.error(t("deleteMsgFailText"));
            console.error("removeCollections failed: ", error);
          }
        },
      });
      break;
    default:
      break;
  }

  emit("menu-click", { key, collection, msg });
};

// 滚动加载
const onScroll = debounce(() => {
  if (containerRef.value) {
    const { scrollTop, scrollHeight, clientHeight } = containerRef.value;

    if (scrollTop >= scrollHeight - clientHeight - 70) {
      const current = list.value[list.value.length - 1];

      if (current && !noMore.value) {
        getCollectionList({
          limit: LIMIT,
          collectionType: 0,
          anchorCollection: current,
          direction: 0, // V2NIM_QUERY_DIRECTION_ASC - 正序，最新的在最上面
        });
      }
    }
  }
}, 300);

// 转发弹窗处理
const handleForwardModalSend = () => {
  forwardMessage.value = undefined;
  toast.success(t("forwardSuccessText"));
};

const handleForwardModalClose = () => {
  forwardMessage.value = undefined;
};

// 组件挂载时初始化数据
onMounted(() => {
  getCollectionList({
    limit: LIMIT,
    collectionType: 0,
    direction: 0, // V2NIM_QUERY_DIRECTION_ASC - 正序，最新的在最上面
  });
});
</script>

<style scoped>
.collection-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f6f8fa;
}

.collection-list-header {
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  color: #000;
}

.collection-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.collection-list-nomore {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
}
</style>
