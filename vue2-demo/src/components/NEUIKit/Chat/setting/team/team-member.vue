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
          :placeholder="
            isDiscussion
              ? t('searchDiscussionMemberPlaceholder')
              : t('searchTeamMemberPlaceholder')
          "
          @input="handleSearch"
        />
        <Icon
          v-if="searchKeyword"
          color="#999"
          type="icon-shandiao"
          class="clear-icon"
          @click.native="clearSearch"
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
                V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER &&
              !isDiscussion
            "
            class="user-tag"
          >
            {{ t("teamOwner") }}
          </div>
          <div
            v-else-if="
              item.memberRole ===
                V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER &&
              !isHovering(item)
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

      <Empty v-else :text="t('searchNoResText')" />
    </div>

    <UserCardModal
      v-if="!!selectedAccount"
      :visible="!!selectedAccount"
      :account="selectedAccount"
      @close="selectedAccount = ''"
    />
  </div>
</template>

<script>
import Avatar from "../../../CommonComponents/Avatar.vue";
import UserCardModal from "../../../CommonComponents/UserCardModal.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { autorun } from "mobx";
import { t } from "../../../utils/i18n";
import Appellation from "../../../CommonComponents/Appellation.vue";
import Icon from "../../../CommonComponents/Icon.vue";
import Empty from "../../../CommonComponents/Empty.vue";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { showModal } from "../../../utils/modal";
import { showToast } from "../../../utils/toast";
import { nim, uiKitStore } from "../../../utils/init";

export default {
  name: "TeamMember",
  components: {
    Avatar,
    UserCardModal,
    RecycleScroller,
    Appellation,
    Icon,
    Empty,
  },
  props: {
    teamId: { type: String, required: true },
    isDiscussion: { type: Boolean, default: false },
  },
  data() {
    return {
      team: null,
      teamMembers: [],
      searchKeyword: "",
      filteredTeamMembers: [],
      hoveredItemId: null,
      selectedAccount: "",
      teamMembersWatch: null,
      V2NIMTeamMemberRole: V2NIMConst.V2NIMTeamMemberRole,
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
    isTeamOwner() {
      const myUser = this.store?.userStore.myUserInfo;
      return (
        (this.team ? this.team.ownerAccountId : "") ===
        (myUser ? myUser.accountId : "")
      );
    },
    isTeamManager() {
      const myUser = this.store?.userStore.myUserInfo;
      return (this.teamMembers || [])
        .filter(
          (item) =>
            item.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
        )
        .some(
          (member) => member.accountId === (myUser ? myUser.accountId : "")
        );
    },
  },
  created() {
    this.teamMembersWatch = autorun(() => {
      this.team = uiKitStore?.teamStore.teams.get(this.teamId);
      const list = uiKitStore?.teamMemberStore.getTeamMember(this.teamId) || [];
      this.teamMembers = this.sortTeamMembers(list);
      this.filterMembers();
    });
  },
  beforeDestroy() {
    if (this.teamMembersWatch) this.teamMembersWatch();
  },
  methods: {
    t,
    handleSearch() {
      this.filterMembers();
    },
    clearSearch() {
      this.searchKeyword = "";
      this.filterMembers();
    },
    filterMembers() {
      const key = (this.searchKeyword || "").trim();
      if (!key) {
        this.filteredTeamMembers = this.teamMembers;
        return;
      }
      this.filteredTeamMembers = (this.teamMembers || []).filter((member) => {
        const name =
          this.store?.uiStore.getAppellation({
            account: member.accountId,
            teamId: member.teamId,
          }) || "";
        return name.includes(key);
      });
    },
    setHoverItem(accountId) {
      this.hoveredItemId = accountId;
    },
    isHovering(item) {
      if (this.isTeamOwner) {
        return this.hoveredItemId === item.accountId;
      }
      if (this.isTeamManager) {
        if (
          item.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER ||
          item.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
        ) {
          return false;
        }
        return this.hoveredItemId === item.accountId;
      }
      return false;
    },
    removeTeamMember(account) {
      showModal({
        title: t("confirmRemoveText"),
        content: t("removeMemberExplain"),
        confirmText: t("removeText"),
        onConfirm: () => {
          this.store?.teamMemberStore
            .removeTeamMemberActive({
              teamId: this.teamId,
              accounts: [account],
            })
            .then(() => {
              showToast({ message: t("removeSuccessText"), type: "success" });
            })
            .catch((error) => {
              switch (error && error.code) {
                case 109306:
                  showToast({ message: t("noPermission"), type: "error" });
                  break;
                default:
                  showToast({ message: t("removeFailText"), type: "error" });
                  break;
              }
            });
        },
      });
    },
    isShowRemoveBtn(target) {
      const myAccountId = this.store?.userStore.myUserInfo?.accountId;
      if (!myAccountId || target.accountId === myAccountId) {
        return false;
      }
      if (this.isTeamOwner) {
        return (
          target.memberRole !==
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
        );
      }
      if (this.isTeamManager) {
        return (
          target.memberRole !==
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER &&
          target.memberRole !==
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
        );
      }
      return false;
    },
    handleTeamMemberClick(accountId) {
      const myUserAccountId = nim.V2NIMLoginService.getLoginUser();
      if (myUserAccountId !== accountId) {
        this.selectedAccount = accountId;
      }
    },
    sortTeamMembers(members) {
      const owner = (members || []).filter(
        (item) =>
          item.memberRole ===
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER
      );
      const manager = (members || [])
        .filter(
          (item) =>
            item.memberRole ===
            V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER
        )
        .sort((a, b) => a.joinTime - b.joinTime);
      const other = (members || [])
        .filter(
          (item) =>
            ![
              V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER,
              V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER,
            ].includes(item.memberRole)
        )
        .sort((a, b) => a.joinTime - b.joinTime);
      return [...owner, ...manager, ...other];
    },
  },
};
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
