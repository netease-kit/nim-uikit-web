<template>
  <div class="setting-content-wrap">
    <div class="title">{{ titletext.title }}</div>
    <div class="server-info">
      <div class="server-icon-container">
        <div class="title-p">
          <div class="member-count">{{ memberAndRoleList.length }}人</div>
          <div class="select-wrap">
            <span class="selector-label">显示身份组：</span>
            <a-select
              v-if="ifCanEdit"
              ref="select"
              v-model:value="selectedKey"
              placeholder="选择身份组"
              @focus="focus"
              @change="handleTabChange(selectedKey)"
            >
              <a-select-option
                v-for="item in roleList"
                :key="item.roleId"
                :value="item"
                :label="item.name"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <a-select
              v-else
              disabled
              ref="select"
              v-model:value="selectedKey"
              placeholder="选择身份组"
              @focus="focus"
            >
              <a-select-option
                v-for="item in roleList"
                :key="item.roleId"
                :value="item"
                :label="item.name"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <UserAddOutlined
              v-if="ifCanEdit"
              class="add-members-btn"
              @click="getSeverMembers"
            />
          </div>
        </div>

        <div class="role-members-container">
          <!-- 空状态 -->
          <div v-if="memberAndRoleList.length === 0" class="role-members-empty">
            <div class="empty-icon">👥</div>
            <div class="empty-text">暂无成员</div>
          </div>

          <!-- 成员列表 -->
          <div
            v-for="item in memberAndRoleList"
            :key="item.memberInfo.accid"
            class="role-member-item"
          >
            <div class="member-info">
              <CommonAvatar
                :avatar="item.memberInfo.avatar"
                :nick="item.memberInfo.nick"
                :accid="item.memberInfo.accid"
                :width="40"
                :border="0"
              />
            </div>
            <div class="role-member-name">
              <span class="member-nick">{{ item.memberInfo.nick }}</span>
              <span class="member-accid">{{ item.memberInfo.accid }}</span>
            </div>
            <div class="role-member-group">
              <div
                v-for="role in item.roles"
                :key="item.memberInfo.accid + '_' + role.roleId"
                class="member-roles"
              >
                {{ role.name }}
              </div>
            </div>
            <DeleteOutlined
              v-if="ifCanEdit"
              class="role-member-delete"
              @click="handleDeleteMember(item.memberInfo)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <MemberSelectModal
    :visible="addMembersModalVisible"
    :dataSource="memberSelectDataSource"
    :hasMore="memberSelectDataSourceListQueryTag.hasMore"
    @cancel="addMembersModalVisible = false"
    @ok="handleAddMembers"
    @onLoadMore="handelLoadMore"
  />
</template>
<script lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { message, Modal } from "ant-design-vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import MemberSelectModal from "../../Common/MemberSelectModal.vue";
import { QChatServerRole, MemberInfo } from "../../../types/v2-compat";
import CommonAvatar from "../../CommonAvatar.vue";
import { UserAddOutlined, DeleteOutlined } from "@ant-design/icons-vue";

export interface MemberAndRoles {
  memberInfo: MemberInfo;
  roles: QChatServerRole[];
}
export default {
  name: "RoleSettings",
  components: {
    MemberSelectModal,
    CommonAvatar,
    UserAddOutlined,
    DeleteOutlined,
  },
  mounted() {
    this.getServerRoles();
    this.getMembersBlackWhite();
    this.getServerMembers();
  },
  props: {
    canEdit: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ifCanEdit = computed(() => {
      return props.canEdit;
    });
    const { t: $t } = useI18n();

    let accidnow = "";

    const store = useStore();
    //1: 名称与权限；  2: 管理成员；
    const tabActiveKey = ref("1");

    const membersFromServerRole = ref<MemberInfo[]>([]);

    const membersBlackWhite = ref<any[]>([]);

    const addMembersModalVisible = ref(false);

    const memberAndRoleList = ref<MemberAndRoles[]>([]);

    const memberSelectDataSource = ref<MemberInfo[]>([]);

    const memberSelectDataSourceListQueryTag = reactive({
      hasMore: false,
      nextTimetag: 0,
    });

    const viewMode = computed(
      () => store.state.channel.currentChannel.viewMode,
    );

    let titletext = reactive({
      title: "频道黑名单",
    });

    const roleSelectDataSourceListQueryTag = reactive({
      hasMore: false,
      nextTimetag: 0,
    });

    const formRef = ref();

    const roleList = computed(() => store.state.server.curServerRoles);

    const selectedKey = ref<any>("@everyone");

    const activeRole = computed(
      () => store.state.server.serverMembers?.datas || [],
    );

    const rules = {
      name: [
        {
          required: true,
          message: $t("请输入身份组名称"),
          trigger: "blur",
        },
      ],
    };
    //返回
    const back = () => {
      store.commit("server/setSettingServerRole", null);
    };
    // 处理身份组切换
    const handleRoleChange = (role: QChatServerRole) => {
      store.commit("server/setSettingServerRole", role);
    };

    // 查询某服务器下黑白名单成员列表
    const getMembersBlackWhite = async () => {
      if (!ifCanEdit.value) {
        return;
      }
      store
        .dispatch("channel/getWhiteBlackMembersPage", {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          type: viewMode.value == 1 ? "white" : "black",
          timetag: 0,
          limit: 100,
        })
        .then((res) => {
          membersBlackWhite.value = res.datas;
        });
    };

    // 查询某服务器下黑白名单成员列表
    const getMembersFromServerRole = (selectedRoleId: any) => {
      memberAndRoleList.value = [];
      if (!ifCanEdit.value) {
        return;
      }
      store
        .dispatch("channel/getWhiteBlackMembersPage", {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          type: viewMode.value == 1 ? "white" : "black",
          timetag: 0,
          limit: 100,
        })
        .then((res) => {
          for (let index = 0; index < res.datas.length; index++) {
            const data = res.datas[index];
            store
              .dispatch("server/getServerRolesByAccid", {
                serverId: store.state.server.curServer.serverId,
                timestamp: 0,
                limit: 100,
                accid: data.accid,
              })
              .then((resp) => {
                for (let i = 0; i < resp.length; i++) {
                  const role = resp[i];
                  if (role.roleId === selectedRoleId.roleId) {
                    memberAndRoleList.value.push({
                      memberInfo: data,
                      roles: resp,
                    });
                  }
                }
              });
          }
        });
    };

    const formState = reactive({
      name: activeRole.value.name,
      auths: { ...activeRole.value.auths },
    });

    const onReset = () => {
      if (activeRole.value) {
        formState.name = activeRole.value.name;
        formState.auths = { ...activeRole.value.auths };
      }
    };
    const handleDeleteMember = (member: MemberInfo) => {
      Modal.confirm({
        title: $t(`确认移除 "${member.nick || member.accid}" ？`),
        okText: () => $t("确认"),
        cancelText: () => $t("取消"),
        async onOk() {
          try {
            return await store
              .dispatch("channel/updateWhiteBlackMembers", {
                serverId: store.state.server.curServer.serverId,
                channelId: store.state.channel.currentChannel.channelId,
                type: viewMode.value == 1 ? "white" : "black",
                opeType: "remove",
                toAccids: [member.accid],
              })
              .then(() => {
                message.success($t("移除成功"));
                getServerMembers();
              });
          } catch {
            message.error("保存失败，部分权限无法编辑");
            return console.log("Oops errors!");
          }
        },
      });
    };
    const onSubmit = () => {
      formRef.value.validate().then(() => {
        const options = {
          roleId: activeRole.value.roleId,
          serverId: activeRole.value.serverId,
          name: formState.name,
          auths: formState.auths,
        };
        store
          .dispatch("server/updateServerRole", options)
          .then(() => {
            message.success($t("保存成功"));
          })
          .catch(() => {
            message.error($t("保存失败，部分权限无法编辑"));
          });
      });
    };
    //1: 名称与权限；  2: 管理成员；
    const handleTabChange = (e) => {
      if (e.name === "@everyone") {
        getServerMembers();
      } else {
        getMembersFromServerRole(e);
      }
    };

    const getSeverMembers = async (accid: any) => {
      const res = await store.dispatch("server/getSeverMembers", {
        serverId: store.state.server.curServer.serverId,
        timestamp: 0,
      });
      accidnow = accid;
      memberSelectDataSourceListQueryTag.hasMore = res.listQueryTag.hasMore;
      memberSelectDataSourceListQueryTag.nextTimetag =
        res.listQueryTag.nextTimetag;
      const memberSelect = res.datas.filter(
        (item: MemberInfo) =>
          !membersBlackWhite.value.find((i) => i.accid === item.accid),
      );
      const owner = store.state.server.curServer.owner;
      memberSelectDataSource.value = memberSelect.filter(
        (item: MemberInfo) => !(owner === item.accid),
      );
      addMembersModalVisible.value = true;
    };

    const getServerMembers = async () => {
      memberAndRoleList.value = [];
      if (!ifCanEdit.value) {
        return;
      }
      const res = await store.dispatch("channel/getWhiteBlackMembersPage", {
        serverId: store.state.server.curServer.serverId,
        channelId: store.state.channel.currentChannel.channelId,
        type: viewMode.value == 1 ? "white" : "black",
        timetag: 0,
        limit: 50,
      });
      for (let index = 0; index < res.datas.length; index++) {
        const data = res.datas[index];
        store
          .dispatch("server/getServerRolesByAccid", {
            serverId: store.state.server.curServer.serverId,
            timestamp: 0,
            limit: 100,
            accid: data.accid,
          })
          .then((resp) => {
            memberAndRoleList.value.push({ memberInfo: data, roles: resp });
            store
              .dispatch("channel/getMembersByPage", {
                serverId: store.state.server.curServer.serverId,
                channelId: store.state.channel.currentChannel.channelId,
                timestamp: 0,
                limit: 100,
              })
              .then((res) => {
                store.commit("channel/setChannelMembers", res);
                store.commit("server/setSeverMembers", res);
              });
          });
      }
    };

    const getServerRoles = () => {
      store
        .dispatch("server/getServerRoles", {
          serverId: store.state.server.curServer.serverId,
        })
        .then((resp) => {
          if (viewMode.value === 1) {
            titletext.title = "频道白名单";
          } else {
            titletext.title = "频道黑名单";
          }
        });
    };

    const addSeverMembers = async () => {
      const res = await store.dispatch("server/getSeverMembers", {
        serverId: store.state.server.curServer.serverId,
        timestamp: 0,
      });
      memberSelectDataSourceListQueryTag.hasMore = res.listQueryTag.hasMore;
      memberSelectDataSourceListQueryTag.nextTimetag =
        res.listQueryTag.nextTimetag;
      const memberSelect = res.datas.filter(
        (item: MemberInfo) =>
          !membersBlackWhite.value.find((i) => i.accid === item.accid),
      );
      const owner = store.state.server.curServer.owner;
      memberSelectDataSource.value = memberSelect.filter(
        (item: MemberInfo) => !(owner === item.accid),
      );
      addMembersModalVisible.value = true;
    };

    const handelLoadMore = () => {
      memberSelectDataSourceListQueryTag.hasMore = false;
      store
        .dispatch("server/appendSeverMembers", {
          serverId: store.state.server.curServer.serverId,
          timestamp: memberSelectDataSourceListQueryTag.nextTimetag,
        })
        .then((res) => {
          memberSelectDataSourceListQueryTag.hasMore = res.listQueryTag.hasMore;
          memberSelectDataSourceListQueryTag.nextTimetag =
            res.listQueryTag.nextTimetag;
          memberSelectDataSource.value = [
            ...memberSelectDataSource.value,
            res.datas.filter(
              (item: MemberInfo) =>
                !membersFromServerRole.value.find(
                  (i) => i.accid === item.accid,
                ),
            ),
          ];
        });
    };

    const handleAddMembers = (members: MemberInfo[]) => {
      try {
        store
          .dispatch("channel/updateWhiteBlackMembers", {
            serverId: store.state.server.curServer.serverId,
            channelId: store.state.channel.currentChannel.channelId,
            type: viewMode.value == 1 ? "white" : "black",
            opeType: "add",
            toAccids: members.map((member) => member.accid),
          })
          .then(() => {
            message.success($t("添加成功"));
            getServerMembers();
            addMembersModalVisible.value = false;
          })
          .catch(() => {
            message.error($t("保存失败，部分权限无法编辑"));
          });
      } catch {
        message.error($t("保存失败，部分权限无法编辑"));
      }
    };
    const handleDeleteRoles = (accid: any, roleId: any, indexsum: any) => {
      try {
        store
          .dispatch("server/removeMembersFromServerRole", {
            serverId: store.state.server.curServer.serverId,
            roleId: roleId,
            accids: [accid],
          })
          .then(() => {
            message.success($t("删除成功"));
            getServerMembers();
          })
          .catch(() => {
            message.error($t("保存失败，部分权限无法编辑"));
          });
      } catch {
        message.error($t("保存失败，部分权限无法编辑"));
      }
    };
    const focus = () => {
      // 选择框获得焦点时的处理
    };

    watch(memberAndRoleList, () => {
      onReset();
    });
    return {
      memberAndRoleList,
      rules,
      titletext,
      formState,
      formRef,
      roleList,
      selectedKey,
      tabActiveKey,
      membersFromServerRole,
      addMembersModalVisible,
      memberSelectDataSource,
      memberSelectDataSourceListQueryTag,
      membersBlackWhite,
      getServerRoles,
      viewMode,
      handleTabChange,
      handleRoleChange,
      handelLoadMore,
      back,
      onReset,
      onSubmit,
      addSeverMembers,
      handleAddMembers,
      getServerMembers,
      handleDeleteRoles,
      getSeverMembers,
      handleDeleteMember,
      getMembersBlackWhite,
      focus,
      ifCanEdit,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.role-settings {
  display: flex;
}
.role-settings-list {
  width: 200px;
  height: 650px; /* 固定高度适配弹窗 */
  border-right: 1px solid #f0f0f0;
  padding: 0 16px;
  .header {
    padding: 40px 0 0 0;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  .menu-item {
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    &.active {
      background: #f5f5f5;
    }
  }
}
.server-info {
  padding: 20px 30px;
  height: calc(100% - 80px);
  overflow-y: auto;
}

/* 顶部操作栏 */
.title-p {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;

  .member-count {
    font-size: 14px;
    color: #8c8c8c;
    font-weight: 500;
  }

  .select-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;

    .selector-label {
      font-size: 14px;
      color: #8c8c8c;
      white-space: nowrap;
    }

    .add-members-btn {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: #f0f7ff;
      color: #1890ff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #e6f7ff;
        color: #1675db;
      }
    }
  }
}

/* 选择器样式覆盖 */
.select-wrap :deep(.ant-select) {
  min-width: 180px;
}

.select-wrap :deep(.ant-select-selector) {
  background: #ffffff !important;
  border: 1px solid #d9d9d9 !important;
  border-radius: 6px !important;
  color: #262626 !important;
  height: 32px !important;

  .ant-select-selection-item {
    color: #262626 !important;
    line-height: 30px !important;
  }

  .ant-select-selection-placeholder {
    color: #bfbfbf !important;
    line-height: 30px !important;
  }
}

.select-wrap :deep(.ant-select-arrow) {
  color: #8c8c8c !important;
}

.select-wrap :deep(.ant-select:hover .ant-select-selector) {
  border-color: #40a9ff !important;
}

.select-wrap :deep(.ant-select-focused .ant-select-selector) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
}

/* 成员列表容器 */
.role-members-container {
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  min-height: 400px;

  .role-members-empty {
    padding: 80px 0;
    text-align: center;
    color: #8c8c8c;

    .empty-icon {
      font-size: 48px;
      color: #d9d9d9;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 16px;
      color: #8c8c8c;
    }
  }
}

/* 成员项 */
.role-member-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  background: #ffffff;
  transition: all 0.2s;

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  &:hover {
    background: #f8f9fa;

    .role-member-delete {
      opacity: 1;
      visibility: visible;
    }
  }

  .member-info {
    margin-right: 12px;
  }

  .role-member-name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: #262626;
    margin: 0;

    .member-nick {
      margin-right: 8px;
    }

    .member-accid {
      color: #8c8c8c;
      font-weight: normal;
    }
  }

  .role-member-delete {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #fff2f0;
    color: #ff4d4f;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0;
    visibility: hidden;

    &:hover {
      background: #ff4d4f;
      color: #ffffff;
    }
  }
}
.setting-content-wrap {
  flex: 1;
  height: 650px;
  color: #262626;
  .title {
    padding: 45px 0 16px 30px;
    font-size: 22px;
    border-bottom: 1px solid #f0f0f0;
    line-height: 100%;
    .sub-title {
      font-size: 12px;
      color: #8c8c8c;
    }
  }
}
.role-member-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-left: 12px;

  .member-roles {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    color: #1890ff;
    font-size: 12px;
    border-radius: 16px;
    white-space: nowrap;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;

    &:hover {
      background: #d4edda;
      border-color: #1890ff;
    }
  }
}

/* 删除未使用的样式 */
</style>
