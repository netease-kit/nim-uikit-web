<template>
  <div class="mention-member-list-wrapper">
    <div class="member-list-content">
      <div style="display: none">{{ teamExt }}</div>

      <!-- 使用虚拟滚动组件 -->
      <RecycleScroller
        ref="scrollerRef"
        class="member-scroller"
        :items="allMemberItems"
        :item-size="40"
        :buffer="5"
        key-field="accountId"
        v-slot="{ item, index }"
      >
        <div
          :key="item.accountId"
          class="member-item"
          :class="{ 'member-item-selected': index === props.selectedIndex }"
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
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
  nextTick,
} from "vue";
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
import { store} from "../../utils/init"

const props = withDefaults(
  defineProps<{
    teamId: string;
    allowAtAll: boolean;
    searchKeyword?: string;
    selectedIndex?: number;
  }>(),
  {
    searchKeyword: "",
    selectedIndex: 0,
  },
);

const emit = defineEmits<{
  close: [];
  handleMemberClick: [member: any];
  "close-popup": [];
  "update:selectedIndex": [index: number];
}>();


const team = ref<V2NIMTeam>();
const teamMembers = ref<V2NIMTeamMember[]>([]);
const teamExt = ref("");
const scrollerRef = ref<any>(null); // 虚拟滚动组件引用

/** 群成员 不包括当前登录用户 */
const teamMembersWithoutSelf = computed(() => {
  return teamMembers.value.filter(
    (item) => item.accountId !== store?.userStore.myUserInfo.accountId,
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
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER,
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
  let items: any[] = [];

  // 添加@所有人选项
  if (allowAtAll.value) {
    items.push({
      accountId: AT_ALL_ACCOUNT,
      appellation: t("teamAll"),
    });
  }

  // 添加成员列表
  items.push(...teamMembersWithoutSelf.value);

  console.log(
    "🔍 mention-choose-list - searchKeyword:",
    props.searchKeyword,
    "初始成员数:",
    items.length,
  );

  // 根据搜索关键词过滤
  if (props.searchKeyword && props.searchKeyword.trim()) {
    const keyword = props.searchKeyword.toLowerCase();
    console.log("  开始过滤，关键词:", keyword);
    items = items.filter((item) => {
      if (item.accountId === AT_ALL_ACCOUNT) {
        // @所有人匹配"所有人"关键词
        return t("teamAll").toLowerCase().includes(keyword);
      }
      // 获取成员昵称
      const appellation =
        store?.uiStore.getAppellation({
          account: item.accountId,
          teamId: props.teamId,
        }) || "";
      // 匹配昵称或账号
      const match =
        appellation.toLowerCase().includes(keyword) ||
        item.accountId.toLowerCase().includes(keyword);
      if (match) {
        console.log("    ✓ 匹配:", appellation || item.accountId);
      }
      return match;
    });
    console.log("  过滤后成员数:", items.length);

    // 如果过滤后没有匹配的成员，通知父组件关闭弹窗
    if (items.length === 0) {
      console.log("  ❌ 没有匹配的成员，关闭弹窗");
      emit("close-popup");
    }
  }

  return items;
});

/** 群成员排序 群主 > 管理员 > 成员 */
const sortGroupMembers = (members: V2NIMTeamMember[], teamId: string) => {
  const owner = members.filter(
    (item) =>
      item.memberRole ===
      V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER,
  );
  const manager = members
    .filter(
      (item) =>
        item.memberRole ===
        V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER,
    )
    .sort((a, b) => a.joinTime - b.joinTime);
  const other = members
    .filter(
      (item) =>
        ![
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_OWNER,
          V2NIMConst.V2NIMTeamMemberRole.V2NIM_TEAM_MEMBER_ROLE_MANAGER,
        ].includes(item.memberRole),
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
      props.teamId,
    );
    const _team: V2NIMTeam = store?.teamStore.teams.get(
      props.teamId,
    ) as V2NIMTeam;

    if (_team) {
      team.value = _team;
      teamExt.value = _team?.serverExtension || "";
    }
  }
});

// 监听selectedIndex变化，确保索引不超出范围并自动滚动到可视区域
watch(
  () => props.selectedIndex,
  (newIndex) => {
    const maxIndex = allMemberItems.value.length - 1;
    if (newIndex > maxIndex && maxIndex >= 0) {
      emit("update:selectedIndex", maxIndex);
      return;
    }

    // 自动滚动到选中项
    nextTick(() => {
      if (scrollerRef.value && newIndex >= 0 && newIndex <= maxIndex) {
        // 获取滚动容器
        const scrollContainer = scrollerRef.value.$el;
        console.log(
          "📜 滚动调试 - scrollContainer:",
          scrollContainer,
          "newIndex:",
          newIndex,
        );

        if (!scrollContainer) {
          console.log("❌ scrollContainer 不存在");
          return;
        }

        // 每个item的高度是40px
        const itemHeight = 40;
        const containerHeight = 180; // 容器高度

        // 计算目标item的位置
        const targetScrollTop = newIndex * itemHeight;
        const currentScrollTop = scrollContainer.scrollTop;

        console.log(
          "  targetScrollTop:",
          targetScrollTop,
          "currentScrollTop:",
          currentScrollTop,
        );

        // 如果目标item在可视区域下方，向下滚动
        if (targetScrollTop + itemHeight > currentScrollTop + containerHeight) {
          const newScrollTop = targetScrollTop - containerHeight + itemHeight;
          console.log("  ⬇️ 向下滚动到:", newScrollTop);
          scrollContainer.scrollTop = newScrollTop;
        }
        // 如果目标item在可视区域上方，向上滚动
        else if (targetScrollTop < currentScrollTop) {
          console.log("  ⬆️ 向上滚动到:", targetScrollTop);
          scrollContainer.scrollTop = targetScrollTop;
        } else {
          console.log("  ✓ 已在可视区域内,无需滚动");
        }
      }
    });
  },
);

// 处理Enter键选中
const handleEnter = (e: KeyboardEvent) => {
  if (e.key === "Enter" && allMemberItems.value.length > 0) {
    e.preventDefault();
    e.stopPropagation();
    const selectedMember = allMemberItems.value[props.selectedIndex];
    if (selectedMember) {
      handleItemClick(selectedMember);
    }
  }
};

// 组件挂载时添加键盘监听
onMounted(() => {
  document.addEventListener("keydown", handleEnter);
});

onUnmounted(() => {
  /** 移除监听 */
  teamMemberWatch();
  document.removeEventListener("keydown", handleEnter);
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
  transition: background-color 0.2s;
}

.member-item-selected {
  background-color: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.member-item:hover {
  background-color: #f5f5f5;
}

.member-item-selected:hover {
  background-color: #d9f0ff;
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
