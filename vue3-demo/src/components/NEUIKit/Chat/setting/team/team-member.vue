<template>
  <div class="team-member-container">
    <!-- 搜索输入框 -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <Icon color="#999" type="icon-sousuo" class="search-icon" />
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          :placeholder="t('searchTeamMemberPlaceholder')"
          @input="handleSearch"
        />
        <Icon
          v-if="searchKeyword"
          color="#999"
          type="icon-shandiao"
          class="clear-icon"
          @click="clearSearch"
        />
      </div>
    </div>

    <div class="member-list-container">
      <RecycleScroller
        v-if="filteredTeamMembers.length > 0"
        class="member-list"
        :items="filteredTeamMembers"
        :item-size="60"
        :buffer="3"
        key-field="accountId"
        v-slot="{ item }"
      >
        <div
          class="team-item"
          :key="item.accountId"
          @mouseenter="setHoverItem(item.accountId)"
          @mouseleave="setHoverItem(null)"
        >
          <div
            class="team-member"
            @click="() => handleTeamMemberClick(item.accountId)"
          >
            <Avatar
              :goto-user-card="true"
              :account="item.accountId"
              size="36"
            />
            <Appellation
              class="user-name"
              :account="item.accountId"
              :team-id="item.teamId"
              :font-size="14"
            />
          </div>
          <div
            v-if="
              item.memberRole ===
              V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
            "
            class="user-tag"
          >
            {{ t("teamOwner") }}
          </div>
          <div
            v-else-if="
              !isHovering(item) &&
              item.memberRole ===
                V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
            "
            class="user-tag"
          >
            {{ t("manager") }}
          </div>
          <div
            v-if="isShowRemoveBtn(item) && isHovering(item)"
            class="btn-remove"
            @click="
              () => {
                removeTeamMember(item.accountId);
              }
            "
          >
            {{ t("removeText") }}
          </div>
        </div>
      </RecycleScroller>

      <Empty v-else :text="t('noTeamMember')" />
    </div>

    <UserCardModal
      v-if="showUserCard"
      :visible="showUserCard"
      :account="selectedAccount"
      @close="showUserCard = false"
    />
  </div>
</template>

<script lang="ts" setup>
/** 群成员列表组件 */
import Avatar from "../../../CommonComponents/Avatar.vue";
import { ref, computed, onUnmounted, onMounted, getCurrentInstance } from "vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { autorun } from "mobx";
import { t } from "../../../utils/i18n";
import Appellation from "../../../CommonComponents/Appellation.vue";
import Icon from "../../../CommonComponents/Icon.vue";
import Empty from "../../../CommonComponents/Empty.vue";
import type {
  V2NIMTeam,
  V2NIMTeamMember,
} from "nim-web-sdk-ng/dist/esm/nim/src/V2NIMTeamService";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { showModal } from "../../../utils/modal";
import { showToast } from "../../../utils/toast";
import UserCardModal from "../../../CommonComponents/UserCardModal.vue";

interface Props {
  teamId: string;
}
const props = defineProps<Props>();

const emit = defineEmits(["onChangeSubPath"]);

const { proxy } = getCurrentInstance()!; // 获取组件实例
const store = proxy?.$UIKitStore;
const teamMembers = ref<V2NIMTeamMember[]>([]);
const team = ref<V2NIMTeam>();
const searchKeyword = ref<string>("");
const filteredTeamMembers = ref<V2NIMTeamMember[]>([]);
const hoveredItemId = ref<string | null>(null);

const showUserCard = ref(false);
const selectedAccount = ref("");

// 搜索功能
const handleSearch = () => {
  filterMembers();
};

const clearSearch = () => {
  searchKeyword.value = "";
  filterMembers();
};

// 监听搜索关键字变化
const filterMembers = () => {
  if (!searchKeyword.value.trim()) {
    filteredTeamMembers.value = teamMembers.value;
    return;
  }

  filteredTeamMembers.value = teamMembers.value.filter((member) => {
    return store?.uiStore
      .getAppellation({ account: member.accountId, teamId: member.teamId })
      .includes(searchKeyword.value);
  });
};

// Hover状态管理
const setHoverItem = (accountId: string | null) => {
  hoveredItemId.value = accountId;
};

// 是否在hover
const isHovering = (item) => {
  // 如果是普通成员，直接返回false
  if (!isTeamManager.value) {
    return false;
  } else if (
    isTeamManager.value &&
    item.memberRole ===
      V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
  ) {
    return false;
  }

  return hoveredItemId.value === item.accountId;
};

// 移除群成员
const removeTeamMember = (account: string) => {
  showModal({
    title: t("confirmRemoveText"),
    content: t("removeMemberExplain"),
    confirmText: t("removeText"),
    onConfirm: () => {
      store?.teamMemberStore
        .removeTeamMemberActive({
          teamId: props.teamId,
          accounts: [account],
        })
        .then(() => {
          showToast({
            message: t("removeSuccessText"),
            type: "success",
          });
        })
        .catch((error: any) => {
          switch (error?.code) {
            // 没权限
            case 109306:
              showToast({
                message: t("noPermission"),
                type: "error",
              });
              break;
            default:
              showToast({
                message: t("removeFailText"),
                type: "error",
              });
              break;
          }
        });
    },
  });
};

// 检查是否是群主
const isTeamOwner = computed(() => {
  const myUser = store?.userStore.myUserInfo;
  return (
    (team.value ? team.value.ownerAccountId : "") ===
    (myUser ? myUser.accountId : "")
  );
});

// 检查是否是群管理员
const isTeamManager = computed(() => {
  const myUser = store?.userStore.myUserInfo;
  return teamMembers.value
    .filter(
      (item) =>
        item.memberRole ===
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
    )
    .some((member) => member.accountId === (myUser ? myUser.accountId : ""));
});

// 检查是否显示移除按钮
const isShowRemoveBtn = (target: V2NIMTeamMember) => {
  const myAccountId = store?.userStore.myUserInfo?.accountId;
  if (!myAccountId || target.accountId === myAccountId) {
    return false;
  }

  if (isTeamOwner.value) {
    return true;
  }
  if (isTeamManager.value) {
    return (
      target.memberRole !==
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER &&
      target.memberRole !==
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
    );
  }
  return false;
};

// 群成员点击
const handleTeamMemberClick = (accountId: string) => {
  selectedAccount.value = accountId;
  showUserCard.value = true;
};

// 对群成员进行排序，群主在前，管理员在后，其他成员按加入时间排序
const sortTeamMembers = (members: V2NIMTeamMember[]) => {
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
  return [...owner, ...manager, ...other];
};

let teamMembersWatch = () => {};

onMounted(() => {
  teamMembersWatch = autorun(() => {
    team.value = store?.teamStore.teams.get(props.teamId);

    teamMembers.value = sortTeamMembers(
      store?.teamMemberStore.getTeamMember(props.teamId) as V2NIMTeamMember[]
    );
    // 更新过滤后的成员列表
    filterMembers();
  });
});

onUnmounted(() => {
  teamMembersWatch();
});
</script>

<style scoped>
.team-member-container {
  height: 100%;
  background-color: #fff;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.search-container {
  padding: 16px 20px;
  border-bottom: 1px solid #f5f8fc;
  flex-shrink: 0;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 8px 12px;
}

.search-icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.clear-icon {
  margin-left: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.member-list-container {
  flex: 1;
  min-height: 0;
  max-height: 100%; /* 使用 max-height 而不是 height */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.member-list {
  height: 100% !important; /* 强制高度 */
  width: 100%;
  overflow: auto;
}

.team-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 20px;
  padding: 12px 0;
  height: 60px !important; /* 强制高度 */
  box-sizing: border-box;
  border-bottom: 1px solid #f5f8fc;
  flex-shrink: 0;
}

.team-item:last-child {
  border-bottom: none;
}

.user-tag {
  background-color: #d7e4ff;
  padding: 2px 12px;
  border-radius: 4px;
  color: #2a6bf2;
  font-size: 12px;
  margin-left: 8px;
  white-space: nowrap;
  word-break: keep-all;
}

.team-member {
  display: flex;
  align-items: center;
  flex: 1;
}

.user-name {
  margin-left: 12px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-remove {
  padding: 2px 12px;
  font-size: 12px;
  margin-left: 8px;
  color: #2a6bf2;
  background-color: #d7e4ff;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
</style>
