<template>
  <Modal
    :visible="visible"
    :showDefaultFooter="false"
    :maskClosable="true"
    @close="handleClose"
    @cancel="handleClose"
    :top="100"
    :width="800"
    :height="450"
  >
    <div class="search-container-wrapper">
      <div class="search-input-wrapper">
        <div class="search-icon-wrapper">
          <Icon
            iconClassName="search-icon"
            :size="16"
            color="#A6ADB6"
            type="icon-sousuo"
          ></Icon>
        </div>
        <Input
          class="input"
          :modelValue="searchText"
          :inputStyle="{
            backgroundColor: '#F5F7FA',
          }"
          :focus="inputFocus"
          @input="onInput"
          @focus="onInputFocus"
          @blur="onInputBlur"
          :placeholder="t('searchTitleText')"
        />
      </div>
      <div v-if="searchResult.length > 0" class="search-result-wrapper">
        <RecycleScroller
          class="search-scroller"
          :items="searchResult"
          :item-size="50"
          :buffer="200"
          key-field="renderKey"
          v-slot="{ item }"
        >
          <div :key="item.renderKey">
            <div class="result-title" v-if="item.id == 'friends'">
              {{ t("friendText") }}
            </div>
            <div class="result-title" v-else-if="item.id == 'groups'">
              {{ t("teamText") }}
            </div>
            <div v-else class="search-item-wrapper">
              <SearchResultItem :item="item" @item-click="handleItemClick" />
            </div>
          </div>
        </RecycleScroller>
      </div>
      <div v-if="searchResult.length == 0 && searchText">
        <Empty
          :emptyStyle="{
            marginTop: '70px',
          }"
          :text="t('searchNoResText')"
        />
      </div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { autorun } from "mobx";
import { ref, onUnmounted, computed, onMounted, getCurrentInstance } from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { t } from "../utils/i18n";
import { showToast } from "../utils/toast";
import Icon from "../CommonComponents/Icon.vue";
import SearchResultItem from "./search-result-item.vue";
import Empty from "../CommonComponents/Empty.vue";
import Input from "../CommonComponents/Input.vue";
import Modal from "../CommonComponents/Modal.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";

// 新增props和emits
interface Props {
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

const emit = defineEmits<{
  close: [];
  "update:visible": [value: boolean];
}>();

const inputFocus = ref(false);
const searchText = ref("");
const searchList = ref<{ id: string; list: any }[]>([]);
const { proxy } = getCurrentInstance()!; // 获取组件实例
const store = proxy?.$UIKitStore;

// 新增关闭处理函数
const handleClose = () => {
  emit("close");
  emit("update:visible", false);
};

const searchListWatch = autorun(() => {
  const friends =
    store?.uiStore.friends
      .filter(
        (item) =>
          !proxy?.$UIKitStore.relationStore.blacklist.includes(item.accountId)
      )
      .map((item) => {
        const user = proxy?.$UIKitStore.userStore.users.get(item.accountId) || {
          accountId: "",
          name: "",
          createTime: Date.now(),
        };

        return {
          ...item,
          ...user,
        };
      }) || [];
  const teamList = store?.uiStore.teamList || [];
  searchList.value = [
    {
      id: "friends",
      list: friends,
    },
    {
      id: "groups",
      list: teamList,
    },
  ].filter((item) => !!item.list.length);
});

const searchResult = computed(() => {
  const handleFinalSections = (finalSections) => {
    const res: { id?: string; renderKey: string }[] = [];
    finalSections.forEach((item) => {
      if (item.id === "friends") {
        res.push({
          id: "friends",
          renderKey: "friends",
        });
        item.list.forEach((item: any) => {
          res.push({
            ...item,
            renderKey: item.accountId,
          });
        });
      } else if (item.id === "groups") {
        res.push({
          id: "groups",
          renderKey: "groups",
        });
        item.list.forEach((item: any) => {
          res.push({
            ...item,
            renderKey: item.teamId,
          });
        });
      }
    });
    return res;
  };
  if (searchText.value) {
    const finalSections = searchList.value
      .map((item) => {
        if (item.id === "friends") {
          return {
            ...item,
            list: item.list?.filter((item: any) => {
              return (
                item.alias?.includes(searchText.value) ||
                item.name?.includes(searchText.value) ||
                item.accountId?.includes(searchText.value)
              );
            }),
          };
        }

        if (item.id === "groups") {
          return {
            ...item,
            list: item.list?.filter((item: any) => {
              return (item.name || item.teamId).includes(searchText.value);
            }),
          };
        }

        return { ...item };
      })
      .filter((item) => !!item.list?.length);

    return handleFinalSections(finalSections);
  } else {
    return handleFinalSections(searchList.value);
  }
});

const onInputBlur = () => {
  inputFocus.value = false;
};

const onInputFocus = () => {
  inputFocus.value = true;
};

const onInput = (event) => {
  searchText.value = event.target.value;
};

/**是否是云端会话 */
const enableV2CloudConversation = store?.sdkOptions?.enableV2CloudConversation;

/** 点击搜索结果 */
const handleItemClick = async (item: any) => {
  try {
    let conversationType;
    let receiverId;
    if (item.accountId) {
      conversationType =
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P;
      receiverId = item.accountId;
    } else if (item.teamId) {
      conversationType =
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM;
      receiverId = item.teamId;
    } else {
      throw Error("unknow scene");
    }
    if (enableV2CloudConversation) {
      await store.conversationStore?.insertConversationActive(
        conversationType,
        receiverId
      );
    } else {
      await store?.localConversationStore?.insertConversationActive(
        conversationType,
        receiverId
      );
    }
  } catch {
    showToast({
      message: t("selectSessionFailText"),
      type: "info",
    });
  }
  handleClose();
};

onMounted(() => {
  inputFocus.value = true;
});

onUnmounted(() => {
  // 移除监听
  searchListWatch();
});
</script>

<style scoped>
.search-container-wrapper {
  height: 100%;
  background-color: #fff;
  overflow: auto;
  box-sizing: border-box;
}
/* 搜索区域样式 */
.search-wrapper {
  padding: 8px 10px;
}

/* 输入框容器 */
.search-input-wrapper {
  height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  background: #f3f5f7;
  border-radius: 5px;
  padding: 8px 10px;
  margin: 20px 16px 10px 10px;
}

/* 搜索图标容器 */
.search-icon-wrapper {
  margin-right: 5px;
  display: flex;
  align-items: center;
}

/* 表单输入项基础样式 */
.form-input-item {
  border-bottom: 1px solid #dcdfe5;
  padding: 10px 10px 5px 0;
  display: flex;
  height: 44px;
  align-items: center;
}

/* 表单输入项聚焦状态 */
.form-input-item.focus {
  border-color: #337eff;
}

/* 表单输入项错误状态 */
.form-input-item.error {
  border-color: #f56c6c;
}

/* 搜索结果标题 */
.result-title {
  height: 30px;
  color: #c0c0c1;
  font-size: 14px;
  border-bottom: 1px solid #c0c0c1;
  display: flex;
  align-items: center;
  padding-left: 10px;
  box-sizing: border-box;
}

/* 输入框 */
.input {
  flex: 1;
  height: 30px;
  border: none;
  outline: none;
}

/* 清除图标 */
.clear-icon {
  width: 40px;
  text-align: right;
}

/* 搜索结果容器 */
.search-result-wrapper {
  padding: 0 10px;
  height: 350px;
  overflow: hidden;
}

.search-scroller {
  height: 100% !important;
  width: 100%;
}

/* 搜索结果标题 */
.result-title {
  height: 50px;
  color: #c0c0c1;
  font-size: 14px;
  border-bottom: 1px solid #c0c0c1;
  display: flex;
  align-items: center;
  padding-left: 10px;
  box-sizing: border-box;
}

.search-item-wrapper {
  height: 50px;
  display: flex;
  align-items: center;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  width: 30px;
  height: 30px;
  color: #999;
  transition: all 0.2s;
}
</style>
