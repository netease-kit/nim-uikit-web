<template>
  <div
    class="message-avatar"
    :class="{ readonly: props.readonly }"
    @click="handleAvatarClick"
  >
    <Avatar
      v-if="account"
      :account="account"
      size="32"
      :goto-user-card="false"
    />
  </div>
</template>

<script lang="ts" setup>
/** 消息头像 */
import Avatar from "../../CommonComponents/Avatar.vue";
import emitter from "../../utils/eventBus";
import { events } from "../../utils/constants";

const props = withDefaults(
  defineProps<{
    account?: string;
    to?: string;
    readonly?: boolean;
  }>(),
  {
    account: "",
    to: "",
    readonly: false,
  }
);

const handleAvatarClick = (event: Event) => {
  if (props.readonly) return;
  // 阻止事件冒泡，防止触发父容器的事件
  event.stopPropagation();
  event.preventDefault();
  emitter.emit(events.AVATAR_CLICK, props.account);
};
</script>

<style scoped>
.message-avatar {
  cursor: pointer;
}

.message-avatar.readonly {
  cursor: default;
}
</style>
