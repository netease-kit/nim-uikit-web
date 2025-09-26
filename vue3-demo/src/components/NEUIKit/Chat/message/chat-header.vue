<template>
  <div class="nav-bar-wrapper">
    <div
      :style="{
        cursor:
          props.conversationType ===
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
            ? 'pointer'
            : '',
      }"
      @click="onAvatarClick"
    >
      <Avatar size="36" :account="to" :avatar="avatar" />
    </div>

    <div class="title-container">
      <div class="title">{{ title }}</div>
      <div class="subTitle" v-if="subTitle">{{ subTitle }}</div>
      <slot name="icon"></slot>
    </div>
    <div>
      <slot name="right"></slot>
    </div>

    <!-- UserCardModal 组件 -->
    <UserCardModal
      v-if="showUserCardModal"
      :visible="showUserCardModal"
      :account="to"
      :nick="title"
      @close="handleCloseModal"
    />
  </div>
</template>

<script lang="ts" setup>
// 聊天头组件
import { ref, watch } from "vue";
import Avatar from "../../CommonComponents/Avatar.vue";
import UserCardModal from "../../CommonComponents/UserCardModal.vue";
import { V2NIMConst } from "nim-web-sdk-ng";

const props = withDefaults(
  defineProps<{
    title: string;
    subTitle?: string;
    backgroundColor?: string;
    to: string;
    avatar?: string;
    conversationType: V2NIMConst.V2NIMConversationType;
  }>(),
  {
    subTitle: "",
    backgroundColor: "",
  }
);

const showUserCardModal = ref(false);

const onAvatarClick = () => {
  // 只有在单聊时才打开UserCardModal
  if (
    props.conversationType ===
    V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
  ) {
    showUserCardModal.value = true;
  }
};

const handleCloseModal = () => {
  showUserCardModal.value = false;
};
</script>

<style scoped>
/* 导航栏容器 */
.nav-bar-wrapper {
  display: flex;
  padding: 10px;
  z-index: 9999;
  color: #000;
  font-size: 16px;
  border-bottom: 1px solid #dbe0e8;
  background-color: #f6f8fa;
  height: 60px;
  align-items: center;
}

/* 标题容器 */
.title-container {
  margin-left: 10px;
  width: 500px;
  display: flex;
  align-items: center;
  text-align: left;
}

/* 主标题 */
.title {
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  white-space: nowrap;
  font-weight: 500;
  font-size: 16px;
}

/* 副标题 */
.subTitle {
  white-space: nowrap;
  color: #999999;
}
</style>
