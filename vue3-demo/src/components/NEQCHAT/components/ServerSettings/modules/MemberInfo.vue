/* eslint-disable */
<template>
  <div class="setting-content-wrap">
    <div class="title">{{ $t("服务器成员") }}</div>
    <div class="server-info">
      <div class="server-icon-container">
        <div class="title-p">
          <div class="member-count">{{ memberAndRoleList.length }}人</div>
          <div class="filter-section">
            <span class="filter-label">显示身份组：</span>
            <div class="select-wrap">
              <a-select
                ref="select"
                :value="selectedKey"
                @focus="focus"
                @change="getServerRoleMembers"
              >
                <a-select-option
                  class="selectOption"
                  v-for="item in roleList"
                  :key="item.roleId"
                  :value="item.roleId"
                  :label="item.name"
                  >{{ item.name }}</a-select-option
                >
              </a-select>
            </div>
          </div>
        </div>
        <div class="role-members-container">
          <div
            class="role-member-item"
            style="
              height: 60px;
              border-bottom: #6a645d 1px solid;
              padding-top: 10px;
            "
            v-for="item in memberAndRoleList"
            :key="item.memberInfo.accid"
          >
            <div class="member-info">
              <CommonAvatar
                :avatar="item.memberInfo.avatar"
                :nick="item.memberInfo.nick"
                :accid="item.memberInfo.accid"
                :width="33"
                :border="0"
              />
            </div>
            <div class="role-member-name">
              {{ item.memberInfo.nick }}
              {{ item.memberInfo.accid }}
            </div>
            <div class="role-member-group">
              <div
                class="member-roles"
                v-for="role in item.roles"
                :key="item.memberInfo.accid + '_' + role.roleId"
                effect="light"
              >
                <CloseCircleFilled
                  class="role-delete"
                  v-if="ifCanEdit"
                  @click="
                    handleDeleteRoles(
                      item.memberInfo.accid,
                      role.roleId,
                      role.index,
                    )
                  "
                />
                <CloseCircleFilled
                  class="role-delete-disabled"
                  v-if="!ifCanEdit"
                />
                <span class="role-member-title">{{ role.name }}</span>
              </div>
              <PlusCircleOutlined
                v-if="ifCanEdit"
                class="role-member-add"
                @click="getSeverMembers(item)"
              />
              <PlusCircleOutlined v-if="!ifCanEdit" class="role-member-add" />
            </div>
            <DeleteOutlined
              v-if="ifCanEdit"
              class="role-member-delete"
              @click="handleDeleteMember(item.memberInfo)"
            />
            <DeleteOutlined
              v-if="!ifCanEdit"
              class="role-member-delete-disabled"
              @click="handleDeleteMember(item.memberInfo)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <ChannelSelectModal
    :visible="addMembersModalVisible"
    :dataSource="RolesSelectDataSource"
    :hasMore="RolesSelectDataSourceListQueryTag.hasMore"
    @cancel="addMembersModalVisible = false"
    @ok="handleAddMembers"
    @onLoadMore="handelLoadMore"
  />
</template>
<script lang="ts">
import { ref, reactive, computed, watch, onBeforeMount, onMounted } from "vue";
import { message, Modal } from "ant-design-vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import ChannelSelectModal from "../../Common/ChannelSelectModal.vue";
import { QChatServerRole } from "../../../types/v2-compat";
import { MemberInfo } from "../../../types/v2-compat";
import CommonAvatar from "../../CommonAvatar.vue";
import {
  CloseCircleFilled,
  PlusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";

export interface MemberAndRoles {
  memberInfo: MemberInfo;
  roles: QChatServerRole[];
}
export default {
  name: "RoleSettings",
  components: {
    ChannelSelectModal,
    CommonAvatar,
    CloseCircleFilled,
    PlusCircleOutlined,
    DeleteOutlined,
  },

  props: {
    canEdit: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, context) {
    const ifCanEdit = computed(() => {
      return props.canEdit;
    });
    onBeforeMount(() => {
      getServerRoles();
    });
    onMounted(() => {
      setSelectedKey();
      getServerRoleMembers(undefined);
    });

    const { t: $t } = useI18n();

    let accidnow = "";

    const store = useStore();
    //1: 名称与权限；  2: 管理成员；
    const tabActiveKey = ref("1");

    const membersFromServerRole = ref<MemberInfo[]>([]);

    const addMembersModalVisible = ref(false);

    let memberAndRoleList = ref<any[]>([]);

    const RolesSelectDataSource = ref<ChannelInfo[]>([]);

    const RolesSelectDataSourceListQueryTag = reactive({
      hasMore: false,
      nextTimetag: 0,
    });

    const formRef = ref();

    const roleList = computed(() => store.state.server.curServerRoles);

    const selectedKey = ref();

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
    // 查询某服务器下某身份组下的成员列表
    const getMembersFromServerRole = (selectedRoleId: any) => {
      store
        .dispatch("server/getMembersFromServerRole", {
          serverId: store.state.server.curServer.serverId,
          roleId: selectedRoleId,
        })
        .then((res) => {
          membersFromServerRole.value = res;
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
              .dispatch("server/removeMembersFromServer", {
                serverId: store.state.server.curServer.serverId,
                accids: [member.accid],
              })
              .then(() => {
                message.success($t("移除成功"));
                getServerRoleMembers(undefined);
              });
          } catch {
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

    const getSeverMembers = async (item) => {
      const res = await store
        .dispatch("server/getServerRoles", {
          serverId: store.state.server.curServer.serverId,
          timestamp: 0,
        })
        .then((res) => {
          accidnow = item.memberInfo.accid;
          store
            .dispatch("server/getServerRolesByAccid", {
              serverId: store.state.server.curServer.serverId,
              timestamp: 0,
              limit: 100,
              accid: item.memberInfo.accid,
            })
            .then((rsp) => {
              let RolesSelect = res.roles.filter(
                (s) => !(s.name === "@everyone"),
              );
              RolesSelectDataSource.value = RolesSelect.filter(
                (s) => !rsp.find((i) => i.roleId === s.roleId),
              );
            });
        });
      addMembersModalVisible.value = true;
    };

    const setSelectedKey = async () => {
      store
        .dispatch("server/getServerRoles", {
          serverId: store.state.server.curServer.serverId,
        })
        .then((response) => {
          for (let index = 0; index < response.length; index++) {
            const roleInfo = response[index];
            if (
              selectedKey.value == undefined &&
              roleInfo.type === "everyone"
            ) {
              selectedKey.value = roleInfo.roleId;
              break;
            }
          }
        });
    };

    const getServerRoleMembers = (selectedValue) => {
      let role;
      if (selectedValue == undefined || selectedKey.value == undefined) {
        role = { type: "everyone" };
        for (let index = 0; index < roleList.value.length; index++) {
          const item = roleList.value[index];
          if (item.type === "everyone") {
            selectedKey.value = item.roleId;
          }
        }
      } else {
        for (let index = 0; index < roleList.value.length; index++) {
          const item = roleList.value[index];
          if (item.roleId === selectedValue && item.type === "everyone") {
            selectedKey.value = item.roleId;
            role = { type: "everyone" };
          }
        }
        if (role == undefined) {
          role = { type: "custom", roleId: selectedValue };
        }
      }
      memberAndRoleList.value = [];
      store
        .dispatch("server/getSeverMembers", {
          serverId: store.state.server.curServer.serverId,
          timestamp: new Date().getTime(),
          limit: 200,
        })
        .then((resp) => {
          const memberInfos = resp.datas;
          memberInfos.forEach((item) => {
            store
              .dispatch("server/getServerRolesByAccid", {
                serverId: item.serverId,
                timestamp: 0,
                limit: 100,
                accid: item.accid,
              })
              .then((rsp) => {
                if (role.type === "everyone") {
                  memberAndRoleList.value.push({
                    memberInfo: item,
                    roles: rsp,
                  });
                } else {
                  const roles = rsp.filter(
                    (roleInfo) => role.roleId === roleInfo.roleId,
                  );
                  if (roles.length == 1) {
                    memberAndRoleList.value.push({
                      memberInfo: item,
                      roles: roles,
                    });
                  }
                }
              });
          });
        });
    };

    const getServerRoles = () => {
      store.dispatch("server/getServerRoles", {
        serverId: store.state.server.curServer.serverId,
      });
    };

    const handleAddMembers = (roles: QChatServerRole[]) => {
      for (let i = 0; i < roles.length; i++) {
        let item = roles[i];
        store
          .dispatch("server/addMembersToServerRole", {
            serverId: store.state.server.curServer.serverId,
            roleId: item.roleId,
            accids: [accidnow],
          })
          .then(() => {
            message.success($t("添加成功"));
            getServerRoleMembers(undefined);
          });
      }
      addMembersModalVisible.value = false;
    };
    const handleDeleteRoles = (accid: any, roleId: any, indexsum: any) => {
      store
        .dispatch("server/removeMembersFromServerRole", {
          serverId: store.state.server.curServer.serverId,
          roleId: roleId,
          accids: [accid],
        })
        .then(() => {
          message.success($t("删除成功"));
          getServerRoleMembers(undefined);
        });
    };
    watch(memberAndRoleList, () => {
      onReset();
    });
    return {
      memberAndRoleList,
      rules,
      formState,
      formRef,
      roleList,
      tabActiveKey,
      membersFromServerRole,
      addMembersModalVisible,
      RolesSelectDataSource,
      RolesSelectDataSourceListQueryTag,
      selectedKey,
      ifCanEdit,
      getServerRoles,
      handleRoleChange,
      back,
      onReset,
      onSubmit,
      handleAddMembers,
      getServerRoleMembers,
      handleDeleteRoles,
      getSeverMembers,
      handleDeleteMember,
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
  border-right: 1px solid #363940;
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
      background: #363940;
    }
  }
}
.server-info {
  padding: 30px;
  background: #ffffff !important;
  .server-icon {
    display: flex;
    margin-bottom: 30px;
    .icon {
      width: 81px;
      height: 81px;
      border-radius: 50%;
      margin-right: 20px;
    }
    .info {
      p {
        color: #8c8c8c !important;
      }
    }
  }
}
.role-settings-container {
  flex: 1;
}
.title {
  height: 80px;
  padding: 40px 0 0 30px;
  text-align: left;
  font-size: 18px;
}

// 模拟select样式
.select-wrap {
  display: inline-block;
  text-align: right;
  z-index: 1000;
  position: relative;
}
.select-wrap :deep(.ant-select-selector) {
  background-color: #ffffff !important;
  border: 1px solid #e8e8e8 !important;
  font-size: 14px;
  width: 120px;
  color: #262626 !important;
}
.select-wrap :deep(.ant-select-arrow) {
  color: #8c8c8c !important;
}
.select-wrap :deep(.ant-select-selection-item) {
  color: #262626 !important;
}
.select-wrap :deep(.ant-select-dropdown) {
  z-index: 1001 !important;
  background: #ffffff !important;
  border: 1px solid #e8e8e8 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
.select-wrap :deep(.ant-select-item) {
  color: #262626 !important;
  background: #ffffff !important;
}
.select-wrap :deep(.ant-select-item-option-selected) {
  background: #e6f7ff !important;
  color: #1890ff !important;
}
.select-wrap :deep(.ant-select-item-option-active) {
  background: #f5f5f5 !important;
}

.select {
  width: 185pt;
  height: 40pt;
  line-height: 40pt;
  padding-right: 20pt;
  text-indent: 4pt;
  text-align: left;
  vertical-align: middle;
  border: 1px solid #bda3a3;
  -moz-border-radius: 6px;
  -webkit-border-radius: 6px;
  border-radius: 6px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  font-family: SimHei;
  font-size: 12pt;
  font-weight: 500;
  color: RGBA(255, 255, 255, 255);
  cursor: pointer;
  outline: none;
  background: #111111;
}
.title-p {
  height: 80px;
  padding: 40px 20px 20px 20px;
  font-size: 14px;
  margin-top: -45px;
  border-bottom: #f0f0f0 1px solid !important;
  color: #8c8c8c !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.member-count {
  font-size: 14px;
  color: #8c8c8c;
  display: flex;
  align-items: center;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #8c8c8c;
  white-space: nowrap;
}
.role-settings-content {
  padding: 30px;
  max-width: 800px;
}
.back-btn {
  cursor: pointer;
}
.role-details-container {
  width: 380px;
  padding: 5px;
}
.switch-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  .switch-title {
    color: #fff;
  }
}
.button-wrap {
  display: inline-block;
  vertical-align: top;
  margin-right: 16px;
  &:last-child {
    margin-right: 0;
  }
}
.role-members-container {
  position: relative;
  .add-members-btn {
    position: absolute;
    right: 10px;
    top: -45px;
    z-index: 1;
    cursor: pointer;
    color: #8c8c8c !important;
    font-size: 20px;
  }
  .role-members-empty {
    padding: 60px 0;
    color: #8c8c8c !important;
    text-align: center;
  }
  .role-member-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background: #ffffff !important;
    border-bottom: #f0f0f0 1px solid !important;
    min-height: 60px;
    position: relative;
    &:hover {
      background: #f5f5f5 !important;
      border-radius: 8px;
      .role-member-delete {
        display: block !important;
        color: #ff4d4f !important;
        cursor: pointer;
        font-size: 16px;
      }
    }
  }
  .role-member-delete {
    display: none;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    background: #f5f5f5;
    border: 1px solid #e8e8e8;
    &:hover {
      background: #fff2f0 !important;
      border-color: #ff4d4f !important;
    }
  }
  .role-member-delete-disabled {
    display: none;
  }
  .role-member-name {
    margin: 0 8px;
    color: #262626 !important;
    flex: 0 0 200px;
    min-width: 200px;
  }
  .role-member-accid {
    color: #8c8c8c !important;
  }
}
.setting-content-wrap {
  flex: 1;
  height: 100%;
  color: #262626 !important;
  background: #ffffff !important;
  .title {
    padding: 45px 0 16px 30px;
    font-size: 18px;
    border-bottom: 1px solid #f0f0f0 !important;
    line-height: 100%;
    color: #262626 !important;
    .sub-title {
      font-size: 12px;
      color: #8c8c8c !important;
    }
  }
}
.role-member-add {
  color: #1890ff !important;
  font-size: 30px;
  position: marker;
  margin-left: 20px;
  margin-top: 0px;
  vertical-align: middle;
  &:hover {
    color: #40a9ff !important;
  }
}
.role-member-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: 20px;
  flex: 1;
  padding-right: 50px;
  .member-roles {
    height: 32px;
    padding: 0 24px 0 12px;
    display: inline-flex;
    align-items: center;
    position: relative;
    color: #262626 !important;
    border-radius: 4px !important;
    background: #f5f5f5 !important;
    border: 1px solid #e8e8e8 !important;
    .role-delete-disabled {
      color: #bfbfbf !important;
      background: transparent !important;
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
    }
    .role-delete {
      color: #8c8c8c !important;
      background: transparent !important;
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      &:hover {
        color: #ff4d4f !important;
      }
    }
    .role-member-title {
      font-family: "PingFang SC";
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 14px;
      color: #262626 !important;
    }
  }
}

.member-info {
  display: inline-block;
}
.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #6e6f74;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}
.addBtn {
  width: 30px;
  height: 30px;
  border-radius: 10%;
  background-color: #363940;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
  text-align: center;
  color: #6e6f74;
  font-size: 16px;
  font-weight: bolder;
}
</style>
