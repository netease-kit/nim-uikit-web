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
          @click="handleItemClick(item)"
        >
          <!-- @所有人项 -->
          <template
            v-if="item.accountId === AT_ALL_ACCOUNT && allowAtAllComputed"
          >
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

<script>
import { t } from "../../utils/i18n";
import { autorun } from "mobx";
import Avatar from "../../CommonComponents/Avatar.vue";
import Icon from "../../CommonComponents/Icon.vue";
import { ALLOW_AT, AT_ALL_ACCOUNT } from "../../utils/constants";
import Appellation from "../../CommonComponents/Appellation.vue";
import { RecycleScroller } from "vue-virtual-scroller";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
import { uiKitStore } from "../../utils/init";

export default {
  name: "MentionChooseList",
  components: { Avatar, Icon, Appellation, RecycleScroller },
  props: {
    teamId: { type: String, required: true },
    allowAtAll: { type: Boolean, default: true },
  },
  data() {
    return {
      team: null,
      teamMembers: [],
      teamExt: "",
      AT_ALL_ACCOUNT: AT_ALL_ACCOUNT,
    };
  },
  computed: {
    store() {
      return uiKitStore;
    },
    teamMembersWithoutSelf() {
      const myId = this.store?.userStore.myUserInfo?.accountId;
      return (this.teamMembers || []).filter((item) => item.accountId !== myId);
    },
    isGroupOwner() {
      const myUser = this.store?.userStore.myUserInfo;
      return (
        (this.team ? this.team.ownerAccountId : "") ===
        (myUser ? myUser.accountId : "")
      );
    },
    isGroupManager() {
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
    allowAtAllComputed() {
      let ext = {};
      try {
        ext = JSON.parse(this.teamExt || "{}");
      } catch (error) {
        console.log("ext parse error", error);
      }
      if (ext[ALLOW_AT] === "manager") {
        return this.isGroupOwner || this.isGroupManager;
      }
      return true;
    },
    allMemberItems() {
      const items = [];
      if (this.allowAtAllComputed) {
        items.push({ accountId: AT_ALL_ACCOUNT, appellation: t("teamAll") });
      }
      items.push(...this.teamMembersWithoutSelf);
      return items;
    },
  },
  created() {
    this.teamMemberWatch = autorun(() => {
      if (this.teamId) {
        this.teamMembers = this.sortGroupMembers(
          this.store.teamMemberStore.getTeamMember(this.teamId),
          this.teamId
        );
        const _team = this.store?.teamStore.teams.get(this.teamId);
        if (_team) {
          this.team = _team;
          this.teamExt = _team?.serverExtension || "";
        }
      }
    });
  },
  beforeDestroy() {
    if (this.teamMemberWatch) this.teamMemberWatch();
  },
  methods: {
    t,
    sortGroupMembers(members, teamId) {
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
      return [...owner, ...manager, ...other].map((item) => ({
        ...item,
        name: this.store?.uiStore.getAppellation({
          account: item.accountId,
          teamId,
        }),
      }));
    },
    handleItemClick(member) {
      const _member =
        member.accountId === AT_ALL_ACCOUNT
          ? member
          : {
              accountId: member.accountId,
              appellation: this.store?.uiStore.getAppellation({
                account: member.accountId,
                teamId: member.teamId,
                ignoreAlias: true,
              }),
            };
      this.$emit("handleMemberClick", _member);
    },
  },
};
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
