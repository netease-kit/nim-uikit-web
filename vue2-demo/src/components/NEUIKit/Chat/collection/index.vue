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

<script>
import { debounce } from "@xkit-yx/utils";
import CollectionItem from "./collection-item.vue";
import Empty from "../../CommonComponents/Empty.vue";
import ChatForwardModal from "../message/message-forward-modal.vue";
import { modal } from "../../utils/modal";
import { toast } from "../../utils/toast";
import { t } from "../../utils/i18n";
import { nim, uiKitStore } from "../../utils/init";

export default {
  name: "CollectionList",
  components: { CollectionItem, Empty, ChatForwardModal },
  props: {},
  data() {
    return {
      store: uiKitStore,
      list: [],
      forwardMessage: null,
      noMore: false,
      LIMIT: 20,
    };
  },
  methods: {
    t,
    async getCollectionList(options) {
      try {
        const data = await nim.V2NIMMessageService.getCollectionListExByOption(options);
        const newData = [...this.list, ...(data && data.collectionList)];
        this.list = newData;
        this.noMore = (data && data.collectionList ? data.collectionList.length : 0) < this.LIMIT;
      } catch (error) {
        toast.error(t("getCollectionFailed"));
        console.error("getCollectionList failed: ", error);
      }
    },
    onMenuClick({ key, collection, msg }) {
      switch (key) {
        case "forward":
          this.forwardMessage = msg;
          break;
        case "delete":
          modal.confirm({
            title: t("deleteCollectionText"),
            content: t("deleteCollectionConfirmText"),
            onConfirm: async () => {
              try {
                await nim.V2NIMMessageService.removeCollections([collection]);
                const newData = this.list.filter((item) => item.uniqueId !== collection.uniqueId);
                this.list = newData;
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
      this.$emit("menu-click", { key, collection, msg });
    },
    onScroll: debounce(function () {
      const el = this.$refs && this.$refs.containerRef;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollTop >= scrollHeight - clientHeight - 70) {
        const current = this.list[this.list.length - 1];
        if (current && !this.noMore) {
          this.getCollectionList({
            limit: this.LIMIT,
            collectionType: 0,
            anchorCollection: current,
            direction: 0,
          });
        }
      }
    }, 300),
    handleForwardModalSend() {
      this.forwardMessage = null;
      toast.success(t("forwardSuccessText"));
    },
    handleForwardModalClose() {
      this.forwardMessage = null;
    },
  },
  mounted() {
    this.getCollectionList({ limit: this.LIMIT, collectionType: 0, direction: 0 });
  },
};
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
