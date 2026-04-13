<template>
  <div class="role-settings">
    <div class="role-settings-list">
      <div class="header">
        <div class="back-btn" @click="back">
          <ArrowLeftOutlined
            :style="{
              color: '#6e6f74',
              marginRight: '10px',
            }"
          />
          <span>{{ $t("返回") }}</span>
        </div>
      </div>
      <div
        class="menu-item"
        :class="{ active: item.roleId === activeRole?.roleId }"
        v-for="item in roleList"
        :key="item.roleId"
        @click="handleRoleChange(item)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="role-settings-container">
      <div class="title">
        {{ activeRole.name }}
      </div>
      <div class="role-settings-content">
        <Tabs
          v-model:activeKey="tabActiveKey"
          class="tabs--dark"
          @change="handleTabChange"
        >
          <TabPane key="1" :tab="$t('名称与权限')">
            <div class="role-details-container">
              <Form
                ref="formRef"
                class="create-form form--dark"
                :hideRequiredMark="true"
                :model="formState"
                layout="vertical"
                :rules="rules"
              >
                <FormItem :label="$t('身份组名称')" name="name">
                  <Input
                    v-model:value="formState.name"
                    :disabled="activeRole.type != 'custom'"
                    :placeholder="$t('请输入身份组名称')"
                  ></Input>
                </FormItem>
                <FormItem :label="$t('通用权限')">
                  <div class="switch-box">
                    <div class="switch-title">{{ $t("管理服务器") }}</div>
                    <Switch
                      checkedValue="allow"
                      unCheckedValue="deny"
                      v-model:checked="formState.auths.manageServer"
                    />
                  </div>
                  <div class="switch-box">
                    <div class="switch-title">{{ $t("管理所有频道属性") }}</div>
                    <Switch
                      checkedValue="allow"
                      unCheckedValue="deny"
                      v-model:checked="formState.auths.manageChannel"
                    />
                  </div>
                  <div class="switch-box">
                    <div class="switch-title">{{ $t("管理角色") }}</div>
                    <Switch
                      checkedValue="allow"
                      unCheckedValue="deny"
                      v-model:checked="formState.auths.manageRole"
                    />
                  </div>
                </FormItem>
                <FormItem :label="$t('消息权限')">
                  <div class="switch-box">
                    <div class="switch-title">{{ $t("发送消息") }}</div>
                    <Switch
                      checkedValue="allow"
                      unCheckedValue="deny"
                      v-model:checked="formState.auths.sendMsg"
                    />
                  </div>
                </FormItem>
                <FormItem :label="$t('成员权限')">
                  <div class="switch-box">
                    <div class="switch-title">
                      {{ $t("邀请他人进入server权限") }}
                    </div>
                    <Switch
                      checkedValue="allow"
                      unCheckedValue="deny"
                      v-model:checked="formState.auths.inviteServer"
                    />
                  </div>
                  <div class="switch-box">
                    <div class="switch-title">
                      {{ $t("踢除他人") }}
                    </div>
                    <Switch
                      checkedValue="allow"
                      unCheckedValue="deny"
                      v-model:checked="formState.auths.kickServer"
                    />
                  </div>
                  <div class="switch-box">
                    <div class="switch-title">
                      {{ $t("管理频道名单") }}
                    </div>
                    <Switch
                      checkedValue="allow"
                      unCheckedValue="deny"
                      v-model:checked="formState.auths.manageBlackWhiteList"
                    />
                  </div>
                </FormItem>
              </Form>
              <div class="button-wrap">
                <Button type="primary" @click="onSubmit">{{
                  $t("保存")
                }}</Button>
              </div>
              <div class="button-wrap">
                <Button class="setting__button" @click="onReset">{{
                  $t("重置")
                }}</Button>
              </div>
            </div>
          </TabPane>
          <TabPane
            key="2"
            :tab="$t('管理成员')"
            v-if="activeRole.type === 'custom'"
          >
            <div class="role-members-container">
              <UserAddOutlined
                v-if="canDeleteMember"
                class="add-members-btn"
                @click="getSeverMembers"
              />
              <p
                class="role-members-empty"
                v-if="membersFromServerRole.length === 0"
              >
                {{ $t("暂无成员请添加") }}
              </p>
              <div
                class="role-member-item"
                v-for="item in membersFromServerRole"
                :key="item.accid"
              >
                <CommonAvatar
                  :avatar="item.avatar"
                  :nick="item.nick"
                  :accid="item.accid"
                  :width="24"
                  :border="0"
                />
                <div class="role-member-name">
                  {{ item.nick || item.accid }}
                </div>
                <div class="role-member-accid">
                  {{ item.accid }}
                </div>
                <CloseCircleFilled
                  v-if="canDeleteMember"
                  class="role-member-delete"
                  @click="handleDeleteMember(item)"
                />
              </div>
            </div>
          </TabPane>
        </Tabs>
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
import {
  Tabs,
  Form,
  Input,
  Switch,
  Button,
  message,
  Modal,
} from "ant-design-vue";
import { useStore } from "vuex";
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  CloseCircleFilled,
} from "@ant-design/icons-vue";
import { useI18n } from "vue-i18n";
import MemberSelectModal from "../../Common/MemberSelectModal.vue";
import { QChatServerRole } from "../../../types/v2-compat";
import { MemberInfo } from "../../../types/v2-compat";
import CommonAvatar from "../../CommonAvatar.vue";
// <user-add-outlined />
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

export default {
  name: "RoleSettings",
  components: {
    Tabs,
    TabPane,
    Form,
    FormItem,
    Input,
    MemberSelectModal,
    Switch,
    Button,
    ArrowLeftOutlined,
    UserAddOutlined,
    CommonAvatar,
    CloseCircleFilled,
  },
  props: {
    ifCanEdit: {
      type: Boolean,
      default: false,
    },
    currentUserMaxRolePriority: {
      type: Number,
      default: null,
    },
  },
  setup(props, context) {
    const maxRolePriority = computed(() => props.currentUserMaxRolePriority);

    const { t: $t } = useI18n();

    const store = useStore();
    //1: 名称与权限；  2: 管理成员；
    const tabActiveKey = ref("1");

    const membersFromServerRole = ref<MemberInfo[]>([]);

    const addMembersModalVisible = ref(false);

    const memberSelectDataSource = ref<MemberInfo[]>([]);

    const memberSelectDataSourceListQueryTag = reactive({
      hasMore: false,
      nextTimetag: 0,
    });

    const formRef = ref();

    const roleList = computed(() => store.state.server.curServerRoles);

    const activeRole = computed(() => store.state.server.settingServerRole);

    const canDeleteMember = computed(() => {
      if (
        store.state.user.userProfile.account ===
        store.state.server.curServer.owner
      ) {
        return props.ifCanEdit;
      } else {
        return (
          props.ifCanEdit &&
          store.state.server.settingServerRole.priority >
            props.currentUserMaxRolePriority
        );
      }
    });

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
    const getMembersFromServerRole = () => {
      membersFromServerRole.value = [];
      if (store.state.server.settingServerRole == undefined) {
        return;
      }
      if (store.state.server.settingServerRole.type != "everyone") {
        store
          .dispatch("server/getMembersFromServerRole", {
            serverId: store.state.server.curServer.serverId,
            roleId: store.state.server.settingServerRole.roleId,
          })
          .then((res) => {
            membersFromServerRole.value = res;
          });
      }
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

    const onSubmit = () => {
      formRef.value.validate().then(() => {
        let options;
        let changeAuths = {};
        let aProps = Object.getOwnPropertyNames(activeRole.value.auths);
        for (let index = 0; index < aProps.length; index++) {
          const e = aProps[index];
          if (activeRole.value.auths[e] !== formState.auths[e]) {
            changeAuths[e] = formState.auths[e];
          }
        }

        if (store.state.server.settingServerRole.type != "everyone") {
          options = {
            roleId: activeRole.value.roleId,
            serverId: activeRole.value.serverId,
            name: formState.name,
            auths: changeAuths,
          };
        } else {
          options = {
            roleId: activeRole.value.roleId,
            serverId: activeRole.value.serverId,
            auths: changeAuths,
          };
        }
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
    const handleTabChange = (key: string) => {
      if (key === "2") {
        getMembersFromServerRole();
      }
    };

    const getSeverMembers = async () => {
      const res = await store.dispatch("server/getSeverMembers", {
        serverId: store.state.server.curServer.serverId,
        timestamp: 0,
      });
      memberSelectDataSourceListQueryTag.hasMore = res.listQueryTag.hasMore;
      memberSelectDataSourceListQueryTag.nextTimetag =
        res.listQueryTag.nextTimetag;
      memberSelectDataSource.value = res.datas.filter(
        (item: MemberInfo) =>
          !membersFromServerRole.value.find((i) => i.accid === item.accid),
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

    const handleAddMembers = async (members: MemberInfo[]) => {
      store
        .dispatch("server/addMembersToServerRole", {
          serverId: activeRole.value.serverId,
          roleId: activeRole.value.roleId,
          accids: members.map((member) => member.accid),
        })
        .then(() => {
          message.success($t("添加成功"));
          getMembersFromServerRole();
          addMembersModalVisible.value = false;
        });
    };

    const handleDeleteMember = (member: MemberInfo) => {
      Modal.confirm({
        title: $t(`确认移除 "${member.nick || member.accid}" ？`),
        okText: () => $t("确认"),
        cancelText: () => $t("取消"),
        async onOk() {
          try {
            return await store
              .dispatch("server/removeMembersFromServerRole", {
                serverId: activeRole.value.serverId,
                roleId: activeRole.value.roleId,
                accids: [member.accid],
              })
              .then(() => {
                getMembersFromServerRole();
                message.success($t("移除成功"));
              });
          } catch {
            return console.log("Oops errors!");
          }
        },
      });
    };

    watch(activeRole, () => {
      onReset();
      if (tabActiveKey.value === "2") {
        getMembersFromServerRole();
      }
    });

    return {
      rules,
      formState,
      formRef,
      roleList,
      activeRole,
      tabActiveKey,
      membersFromServerRole,
      addMembersModalVisible,
      memberSelectDataSource,
      memberSelectDataSourceListQueryTag,
      canDeleteMember,
      maxRolePriority,
      handleTabChange,
      handleRoleChange,
      handelLoadMore,
      back,
      onReset,
      onSubmit,
      getSeverMembers,
      handleAddMembers,
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
.role-settings-container {
  flex: 1;
}
.title {
  height: 80px;
  padding: 40px 0 0 30px;
  text-align: left;
  font-size: 18px;
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
    color: #a3a4a9;
    font-size: 20px;
  }
  .role-members-empty {
    padding: 60px 0;
    color: #6e6f74;
    text-align: center;
  }
  .role-member-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    &:hover {
      background: #363940;
      border-radius: 8px;
      .role-member-delete {
        display: block;
      }
    }
  }
  .role-member-name {
    margin: 0 8px;
    color: #fff;
  }
  .role-member-accid {
    color: #a3a4a9;
  }
  .role-member-delete {
    display: none;
    color: #a3a4a9;
    cursor: pointer;
    font-size: 16px;
    position: absolute;
    right: 20px;
  }
}
</style>
