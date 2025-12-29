<template>
  <div class="search-result-list-item" @click="handleClick">
    <div class="result-item-avatar">
      <Avatar size="36" :account="to" :avatar="teamAvatar" />
    </div>
    <div v-if="!isTeam" class="result-item-title">
      <Appellation :fontSize="14" :account="to" />
    </div>
    <div v-else class="result-item-title">
      {{ teamName }}
    </div>
  </div>
</template>

<script>
import Avatar from "../CommonComponents/Avatar.vue";
import Appellation from "../CommonComponents/Appellation.vue";
import { uiKitStore } from "../utils/init";

export default {
  name: "SearchResultItem",
  components: { Avatar, Appellation },
  props: {
    item: { type: Object, required: true },
  },
  data() {
    return {
      store: uiKitStore,
    };
  },
  computed: {
    teamAvatar() {
      if (this.item && this.item.teamId) return this.item.avatar;
      return undefined;
    },
    to() {
      if (this.item && this.item.teamId) return this.item.teamId;
      return this.item && this.item.accountId;
    },
    isTeam() {
      return !!(this.item && this.item.teamId);
    },
    teamName() {
      if (this.item && this.item.teamId) return this.item.name || "";
      return "";
    },
  },
  methods: {
    handleClick() {
      this.$emit("item-click", this.item);
    },
  },
};
</script>

<style scoped>
.search-result-list-item {
  display: flex;
  align-items: center;
  height: 50px;
  margin: 10px 0;
  width: 100%;
  padding-left: 5px;
}

.search-result-list-item:hover {
  background-color: #f5f7fa;
  cursor: pointer;
  border-radius: 6px;
}

.result-item-avatar {
  width: 42px;
}

.result-item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-left: 10px;
  font-size: 14px;
  color: #000;
}
.result-item-account {
  font-size: 13px;
  color: #b5b6b8;
}
</style>
