<template>
  <div class="message-avatar" @click="handleAvatarClick">
    <Avatar
      v-if="account"
      :account="account"
      size="32"
      :goto-user-card="false"
    />
  </div>
</template>

<script>
import Avatar from "../../CommonComponents/Avatar.vue";
import emitter from "../../utils/eventBus";
import { events } from "../../utils/constants";

export default {
  name: "MessageAvatar",
  components: { Avatar },
  props: {
    account: { type: String, default: "" },
    to: { type: String, default: "" },
  },
  methods: {
    handleAvatarClick(event) {
      event.stopPropagation();
      event.preventDefault();
      emitter.emit(events.AVATAR_CLICK, this.account);
    },
  },
};
</script>

<style scoped>
.message-avatar {
  cursor: pointer;
}
</style>
