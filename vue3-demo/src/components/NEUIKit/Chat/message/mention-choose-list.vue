<template>
  <div class="mention-member-list-wrapper">
    <div class="member-list-content">
      <div style="display: none">{{ teamExt }}</div>

      <!-- 使用虚拟滚动组件 -->
      <RecycleScroller
        class="member-scroller"
        :items="allMemberItems"
        :item-size="40"
        :buffer="5"
        key-field="accountId"
        v-slot="{ item }"
      >
        <div
          :key="item.accountId"
          class="member-item"
          @click="() => handleItemClick(item)"
        >
          <!-- @所有人项 -->
          <template v-if="item.accountId === AT_ALL_ACCOUNT && allowAtAll">
            <Icon :size="28" type="icon-team2" color="#fff" />
            <span class="member-name">
              {{ t("teamAll") }}
            </span>
          </template>

          <!-- 普通成员项 -->
          <template v-else>
            <Avatar :account="item.accountId" size="28" />
            <div class="member-name">
              <Appellation
                :account="item.accountId"
                :teamId="item.teamId"
              ></Appellation>
            </div>
          </template>
        </div>
      </RecycleScroller>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**@ 列表组件，用于在群里@ 成员列表 */
import { ref, computed, onUnmounted, getCurrentInstance } from "vue";
import { t } from "../../utils/i18n";
import { autorun } from "mobx";
import Avatar from "../../CommonComponents/Avatar.vue";
import Icon from "../../CommonComponents/Icon.vue";
import { ALLOW_AT, AT_ALL_ACCOUNT } from "../../utils/constants";
import Appellation from "../../CommonComponents/Appellation.vue";
import { RecycleScroller } from "vue-virtual-scroller";

import type {
  V2NIMTeam,
  V2NIMTeamMember,
} from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";

import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";

const props = withDefaults(
  defineProps<{
    teamId: string;
    allowAtAll: boolean;
  }>(),
  {}
);

const emit = defineEmits<{
  close: [];
  handleMemberClick: [member: any];
}>();

const { proxy } = getCurrentInstance()!; // 获取组件实例
const store = proxy?.$UIKitStore;

const team = ref<V2NIMTeam>();
const teamMembers = ref<V2NIMTeamMember[]>([]);
const teamExt = ref("");

/** 群成员 不包括当前登录用户 */
const teamMembersWithoutSelf = computed(() => {
  return teamMembers.value.filter(
    (item) => item.accountId !== store?.userStore.myUserInfo.accountId
  );
});

/** 是否是群主 */
const isGroupOwner = computed(() => {
  const myUser = store?.userStore.myUserInfo;
  return (
    (team.value ? team.value.ownerAccountId : "") ===
    (myUser ? myUser.accountId : "")
  );
});

/** 是否是群管理员 */
const isGroupManager = computed(() => {
  const myUser = store?.userStore.myUserInfo;
  return teamMembers.value
    .filter(
      (item) =>
        item.memberRole ===
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
    )
    .some((member) => member.accountId === (myUser ? myUser.accountId : ""));
});

/** 是否允许@ 所有人 */
const allowAtAll = computed(() => {
  let ext: any = {};
  try {
    ext = JSON.parse(teamExt.value || "{}");
  } catch (error) {
    //
  }
  if (ext[ALLOW_AT] === "manager") {
    return isGroupOwner.value || isGroupManager.value;
  }
  return true;
});

/** 构建虚拟滚动所需的数据结构 */
const allMemberItems = computed(() => {
  const items: any[] = [];

  // 添加@所有人选项
  if (allowAtAll.value) {
    items.push({
      accountId: AT_ALL_ACCOUNT,
      appellation: t("teamAll"),
    });
  }

  // 添加成员列表
  items.push(...teamMembersWithoutSelf.value);

  return items;
});

/** 群成员排序 群主 > 管理员 > 成员 */
const sortGroupMembers = (members: V2NIMTeamMember[], teamId: string) => {
  const owner = members.filter(
    (item) =>
      item.memberRole ===
      V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
  );
  const manager = members
    .filter(
      (item) =>
        item.memberRole ===
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
    )
    .sort((a, b) => a.joinTime - b.joinTime);
  const other = members
    .filter(
      (item) =>
        ![
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER,
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER,
        ].includes(item.memberRole)
    )
    .sort((a, b) => a.joinTime - b.joinTime);
  const result = [...owner, ...manager, ...other].map((item) => {
    return {
      ...item,

      name: store?.uiStore.getAppellation({
        account: item.accountId,
        teamId,
      }),
    };
  });
  return result;
};

/**
 * 群成员点击函数
 */
const handleItemClick = (member: V2NIMTeamMember) => {
  const _member =
    member.accountId === AT_ALL_ACCOUNT
      ? member
      : {
          accountId: member.accountId,
          appellation: store?.uiStore.getAppellation({
            account: member.accountId,
            teamId: (member as V2NIMTeamMember).teamId,
            ignoreAlias: true,
          }),
        };

  // 触发 handleMemberClick 事件
  emit("handleMemberClick", _member);
};

/** 监听群成员 */
const teamMemberWatch = autorun(() => {
  if (props.teamId) {
    teamMembers.value = sortGroupMembers(
      //@ts-ignore
      store.teamMemberStore.getTeamMember(props.teamId),
      props.teamId
    );
    const _team: V2NIMTeam = store?.teamStore.teams.get(
      props.teamId
    ) as V2NIMTeam;

    if (_team) {
      team.value = _team;
      teamExt.value = _team?.serverExtension || "";
    }
  }
});

onUnmounted(() => {
  /** 移除监听 */
  teamMemberWatch();
});
</script>

<style scoped>
.mention-member-list-wrapper {
  z-index: 9999999;
  touch-action: none;
  height: 180px;
  overflow: hidden;
}

.member-list-content {
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.member-scroller {
  height: 100%;
  width: 100%;
}

.title {
  text-align: center;
  font-weight: 500;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  height: 60px;
}

.close {
  transform: rotate(90deg);
  margin-left: 15px;
}

.member-item {
  display: flex;
  align-items: center;
  height: 40px;
  min-height: 40px;
  max-height: 40px;
  padding: 4px;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
}

.member-name {
  margin-left: 10px;
  font-size: 14px;
  padding-right: 20px;
  color: #000000;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-item-icon {
  height: 42px;
  width: 42px;
  border-radius: 50%;
  text-align: center;
  line-height: 39px;
  font-size: 20px;
  color: #fff;
  background-color: #53c3f4;
}

.owner,
.manager {
  color: rgb(6, 155, 235);
  background-color: rgb(210, 229, 246);
  height: 24px;
  line-height: 24px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  padding: 2px 4px;
  position: relative;
  right: 10px;
}
</style>
