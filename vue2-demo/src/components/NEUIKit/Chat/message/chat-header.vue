<template>
  <div class="nav-bar-wrapper">
    <div
      :style="{
        cursor: conversationType === 1 ? 'pointer' : '',
      }"
      @click="onAvatarClick"
      :key="to"
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

<script>
import Avatar from "../../CommonComponents/Avatar.vue";
import UserCardModal from "../../CommonComponents/UserCardModal.vue";
import { V2NIMConst } from "nim-web-sdk-ng";

export default {
  name: "ChatHeader",
  components: { Avatar, UserCardModal },
  props: {
    title: { type: String, required: true },
    subTitle: { type: String, default: "" },
    backgroundColor: { type: String, default: "" },
    to: { type: String, required: true },
    avatar: { type: String, default: "" },
    conversationType: { type: Number, required: true },
    headerUpdateTime: { type: Number, default: 0 },
  },
  /**
   * 控制用户卡片模态框的显示状态
   * @type {boolean}
   */
  data() {
    return {
      showUserCardModal: false,
    };
  },
  methods: {
    onAvatarClick() {
      if (
        this.conversationType ===
        V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_P2P
      ) {
        this.showUserCardModal = true;
      }
    },
    handleCloseModal() {
      this.showUserCardModal = false;
    },
  },
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
  height: 65px;
  box-sizing: border-box;
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
