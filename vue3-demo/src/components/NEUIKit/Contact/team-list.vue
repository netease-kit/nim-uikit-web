<template>
  <div class="team-list-container">
    <div class="team-list-content">
      <Empty
        v-if="teamList.length === 0"
        :text="t('teamEmptyText')"
        :emptyStyle="{
          marginTop: '100px',
        }"
      />
      <RecycleScroller
        v-else
        class="team-scroller"
        :items="teamList"
        :item-size="60"
        :buffer="100"
        key-field="teamId"
        v-slot="{ item: team }"
      >
        <div :key="team.teamId" class="team-item" @click="handleClick(team)">
          <Avatar :account="team.teamId" :avatar="team.avatar" />
          <span class="team-name">{{ team.name }}</span>
        </div>
      </RecycleScroller>
    </div>
  </div>
</template>

<script lang="ts" setup>
/** 群列表组件 */
import { autorun } from "mobx";
import { onUnmounted, ref, getCurrentInstance } from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import Empty from "../CommonComponents/Empty.vue";
import Avatar from "../CommonComponents/Avatar.vue";
import { t } from "../utils/i18n";
import type { V2NIMTeam } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";
import RootStore from "@xkit-yx/im-store-v2";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";

const teamList = ref<V2NIMTeam[]>([]);

const { proxy } = getCurrentInstance()!;

const store = proxy?.$UIKitStore as RootStore;

const emit = defineEmits<{
  onGroupItemClick: [];
}>();

const handleClick = async (team: V2NIMTeam) => {
  if (store.sdkOptions?.enableV2CloudConversation) {
    await store.conversationStore?.insertConversationActive(
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
      team.teamId
    );
  } else {
    await store.localConversationStore?.insertConversationActive(
      V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM,
      team.teamId
    );
  }
  emit("onGroupItemClick");
};

/** 群列表监听 */
const teamListWatch = autorun(() => {
  teamList.value = store?.uiStore.teamList;
});

onUnmounted(() => {
  teamListWatch();
});
</script>

<style scoped>
.team-list-container {
  height: 100%;
  overflow: hidden;
}

.team-list-content {
  height: 100%;
  padding: 0;
}

.team-scroller {
  height: 100%;
}

.team-item {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f5f8fc;
}

.team-item:hover {
  background-color: #f8f9fa;
}

.team-item:last-child {
  border-bottom: none;
}

.team-name {
  margin-left: 10px;
  font-size: 14px;
  padding-right: 20px;
  color: #000;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
