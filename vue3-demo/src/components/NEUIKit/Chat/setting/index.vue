<template>
  <div>
    <Drawer
      v-model:visible="drawerVisible"
      placement="right"
      :width="360"
      :showDefaultFooter="false"
      :showHeader="true"
      :offsetRight="52"
      :offsetTop="96"
      :showMask="true"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <template #header>
        <div class="custom-header" @click="onChangeSubPath('team-setting')">
          <Icon v-if="path !== 'team-setting'" type="icon-zuojiantou"></Icon>
          <span class="header-title">{{ title }}</span>
        </div>
      </template>
      <div
        v-if="
          conversationType ==
          V2NIMConst.V2NIMConversationType.V2NIM_CONVERSATION_TYPE_TEAM
        "
        class="chat-setting-content"
      >
        <TeamSetting
          v-if="path === 'team-setting'"
          :teamId="to"
          @onChangeSubPath="onChangeSubPath"
        ></TeamSetting>
        <TeamInfoSetting
          v-else-if="path === 'team-info'"
          :teamId="to"
          @onChangeSubPath="onChangeSubPath"
        ></TeamInfoSetting>
        <TeamMember
          v-else-if="path === 'team-member'"
          :teamId="to"
          @onChangeSubPath="onChangeSubPath"
        ></TeamMember>
      </div>
      <div v-else>
        <P2pSetting :accountId="to"></P2pSetting>
      </div>
    </Drawer>
  </div>
</template>

<script lang="ts" setup>
/** 聊天设置 */
import { ref, computed } from "vue";
import { t } from "../../utils/i18n";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import type { V2NIMConversationType } from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMConversationService";
import TeamSetting from "./team/index.vue";
import TeamInfoSetting from "./team/team-info-setting.vue";
import TeamMember from "./team/team-member.vue";
import Drawer from "../../CommonComponents/Drawer.vue";
import Icon from "../../CommonComponents/Icon.vue";
import P2pSetting from "./p2p/index.vue";
interface Props {
  visible: boolean;
  to: string;
  conversationType: V2NIMConversationType;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

// 抽屉可见性
const drawerVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit("update:visible", value),
});

// 当前路径
const path = ref<"team-setting" | "team-info" | "team-member">("team-setting");

const handleConfirm = () => {
  emit("update:visible", false);
};

const handleCancel = () => {
  emit("update:visible", false);
};

const title = ref(t("setText"));

// 切换子路径
const onChangeSubPath = (
  value: "team-setting" | "team-info" | "team-member"
) => {
  path.value = value;
  if (path.value == "team-setting") {
    title.value = t("setText");
  } else if (path.value == "team-info") {
    title.value = t("teamInfoText");
  } else if (path.value == "team-member") {
    title.value = t("teamMemberText");
  }
};
</script>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
}

.header-title {
  font-size: 16px;
  font-weight: bolder;
  color: #333;
  margin-left: 5px;
}
.chat-setting-content {
  height: 100%;
}
</style>
