<template>
  <div class="setting-content-wrap">
    <div class="title">{{ $t("频道权限") }}</div>

    <!-- 内容滚动容器 -->
    <div class="role-group-content">
      <!-- 私密频道设置 -->
      <div class="settings-section">
        <div class="default-role">
          <div class="role-info">
            <a-button class="role-info__icon">
              <LockOutlined class="role-info_lock" />
            </a-button>
            <div class="role-text">
              <div class="role-name">{{ $t("私密频道") }}</div>
              <div class="role-desc">
                {{ $t("将频道设为私密，则只有白名单成员能够查看此频道") }}
              </div>
            </div>
          </div>
          <Switch
            v-if="ifCanChangeViewMode"
            v-model:checked="formState.checked"
            :checkedValue="1"
            :unCheckedValue="0"
            @change="UpdataChannel"
          />
          <Switch
            v-else
            v-model:checked="formState.checked"
            disabled
            :checkedValue="1"
            :unCheckedValue="0"
          />
        </div>
      </div>

      <!-- 高级权限选择器 -->
      <div class="settings-section">
        <div class="advanced-permissions">
          <div class="section-header">
            <h3 class="section-title">{{ $t("高级权限") }}</h3>
            <div class="selector-container">
              <span class="selector-label">身份组/成员：</span>
              <div class="selector-wrapper">
                <Cascader
                  v-if="ifCanEdit"
                  v-model:value="selectedValue"
                  class="role-cascader"
                  multiple
                  placement="bottomRight"
                  max-tag-count="responsive"
                  :options="options"
                  :defaultValue="addValue"
                  placeholder="请选择身份组或成员"
                  @change="handleRoleChange(selectedValue)"
                />
                <Cascader
                  v-else
                  disabled
                  v-model:value="selectedValue"
                  class="role-cascader disabled"
                  multiple
                  placement="bottomRight"
                  max-tag-count="responsive"
                  :options="options"
                  placeholder="请选择身份组或成员"
                />
                <Button
                  v-if="ifCanEdit"
                  class="add-button"
                  @click="createVisible = true"
                  type="text"
                  size="small"
                >
                  <PlusOutlined />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 权限设置区域 -->
      <div class="permissions-container">
        <!-- 通用权限 -->
        <div class="permission-group">
          <div class="group-title">{{ $t("通用权限") }}</div>
          <div class="permission-item">
            <span class="permission-name">{{ $t("管理频道属性") }}</span>
            <div class="permission-controls">
              <Button
                :class="getButtonClass(qChatRoleAuth.manageChannel, 'deny')"
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('manageChannel', 'deny')"
                size="small"
              >
                <CloseOutlined />
              </Button>
              <Button
                :class="getButtonClass(qChatRoleAuth.manageChannel, 'ignore')"
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('manageChannel', 'ignore')"
                size="small"
              >
                <PauseOutlined />
              </Button>
              <Button
                :class="getButtonClass(qChatRoleAuth.manageChannel, 'allow')"
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('manageChannel', 'allow')"
                size="small"
              >
                <CheckOutlined />
              </Button>
            </div>
          </div>
          <div class="permission-item">
            <span class="permission-name">{{ $t("管理频道权限") }}</span>
            <div class="permission-controls">
              <Button
                :class="getButtonClass(qChatRoleAuth.manageRole, 'deny')"
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('manageRole', 'deny')"
                size="small"
              >
                <CloseOutlined />
              </Button>
              <Button
                :class="getButtonClass(qChatRoleAuth.manageRole, 'ignore')"
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('manageRole', 'ignore')"
                size="small"
              >
                <PauseOutlined />
              </Button>
              <Button
                :class="getButtonClass(qChatRoleAuth.manageRole, 'allow')"
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('manageRole', 'allow')"
                size="small"
              >
                <CheckOutlined />
              </Button>
            </div>
          </div>
        </div>

        <!-- 消息权限 -->
        <div class="permission-group">
          <div class="group-title">{{ $t("消息权限") }}</div>
          <div class="permission-item">
            <span class="permission-name">{{ $t("发送消息") }}</span>
            <div class="permission-controls">
              <Button
                :class="getButtonClass(qChatRoleAuth.sendMsg, 'deny')"
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('sendMsg', 'deny')"
                size="small"
              >
                <CloseOutlined />
              </Button>
              <Button
                :class="getButtonClass(qChatRoleAuth.sendMsg, 'ignore')"
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('sendMsg', 'ignore')"
                size="small"
              >
                <PauseOutlined />
              </Button>
              <Button
                :class="getButtonClass(qChatRoleAuth.sendMsg, 'allow')"
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('sendMsg', 'allow')"
                size="small"
              >
                <CheckOutlined />
              </Button>
            </div>
          </div>
        </div>

        <!-- 成员权限 -->
        <div class="permission-group">
          <div class="group-title">{{ $t("成员权限") }}</div>
          <div class="permission-item">
            <span class="permission-name">{{ $t("管理频道名单") }}</span>
            <div class="permission-controls">
              <Button
                :class="
                  getButtonClass(qChatRoleAuth.manageBlackWhiteList, 'deny')
                "
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('manageBlackWhiteList', 'deny')"
                size="small"
              >
                <CloseOutlined />
              </Button>
              <Button
                :class="
                  getButtonClass(qChatRoleAuth.manageBlackWhiteList, 'ignore')
                "
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('manageBlackWhiteList', 'ignore')"
                size="small"
              >
                <PauseOutlined />
              </Button>
              <Button
                :class="
                  getButtonClass(qChatRoleAuth.manageBlackWhiteList, 'allow')
                "
                :disabled="!ifCanEdit"
                @click="settingChannelAuth('manageBlackWhiteList', 'allow')"
                size="small"
              >
                <CheckOutlined />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加身份组模态框 -->
    <Modal
      v-model:visible="createVisible"
      :title="$t('新增')"
      class="light"
      :footer="null"
      :width="400"
    >
      <Cascader
        v-model:value="addValue"
        class="role-cascader"
        multiple
        placement="bottomRight"
        max-tag-count="responsive"
        :options="chanaloptions"
        placeholder="请选择要添加的身份组"
        @change="handleAddRoleChange"
      />
    </Modal>
  </div>
</template>
<script lang="ts">
import { computed, ref, reactive, onBeforeMount, watch } from "vue";
import { useStore } from "vuex";
import { Switch, Cascader, Button, message, Modal } from "ant-design-vue";
import type { CascaderProps } from "ant-design-vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import {
  CloseOutlined,
  LockOutlined,
  PauseOutlined,
  CheckOutlined,
} from "@ant-design/icons-vue";

export default {
  name: "ChannelRole",
  components: {
    LockOutlined,
    PauseOutlined,
    CheckOutlined,
    CloseOutlined,
    Switch,
    Cascader,
    PlusOutlined,
    Modal,
    Button,
  },
  props: {
    canEdit: {
      type: Boolean,
      default: false,
    },
    canChangeViewMode: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const ifCanEdit = computed(() => {
      return props.canEdit;
    });
    const ifCanChangeViewMode = computed(() => {
      return props.canChangeViewMode;
    });
    const roleList = ref<any[]>([]);

    onBeforeMount(() => {
      getChannalRoles();
      getServerRoles();
      getChannalMembers();
      getServerMembers();
    });

    const store = useStore();

    const memberAndRoleList: any = [];

    const channelMemberAndRoleList: any = [];

    const channelroleList: any = [];

    const createVisible = ref<boolean>(false);

    const ChannelData = computed(() => store.state.channel.currentChannel);

    const activeRole = computed(() => store.state.server.curServerRoles);

    const selectedValue = ref<string[]>([]);

    const addValue = ref<(string | number)[][]>([]);

    let selectRoles: string = "";
    let selectMember: string = "";
    const formState = reactive({
      checked: ChannelData.value.viewMode,
    });
    const qChatRoleAuth = ref<any>({
      manageChannel: "",
      manageRole: "",
      sendMsg: "",
      manageBlackWhiteList: "",
    });

    watch(
      ChannelData,
      (newValue, oldValue) => {
        qChatRoleAuth.value = {
          manageChannel: "",
          manageRole: "",
          sendMsg: "",
          manageBlackWhiteList: "",
        };
        selectedValue.value = [];
      },
      { deep: true },
    );

    // 处理身份组切换
    const handleRoleChange = (value) => {
      selectRoles = value.toString().split(",")[0];
      selectMember = value.toString().split(",")[1];
      if (selectMember == undefined) {
        message.error("请选择身份组或者成员");
        return;
      }
      if (selectRoles === "1") {
        qChatRoleAuth.value = {
          manageChannel: "",
          manageRole: "",
          sendMsg: "",
          manageBlackWhiteList: "",
        };
        roleList.value.forEach(function (s) {
          if (s.roleId == selectMember) {
            store.commit("channel/settingChannelRole", s);
            qChatRoleAuth.value = s.auths;
          }
        });
      } else {
        qChatRoleAuth.value = {
          manageChannel: "",
          manageRole: "",
          sendMsg: "",
          manageBlackWhiteList: "",
        };
        memberAndRoleList.forEach((item: any) => {
          if (item.accid == selectMember) {
            store.commit("server/setCurMember", item);
          }
        });
        getMemberAuths();
      }
    };

    const getMemberAuths = () => {
      if (!ifCanEdit.value) {
        return;
      }
      //获取权限
      store
        .dispatch("channel/getMemberRoles", {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          timestamp: new Date().getTime(),
          limit: 100,
        })
        .then((resp) => {
          qChatRoleAuth.value = {
            manageChannel: "ignore",
            manageRole: "ignore",
            sendMsg: "ignore",
            manageBlackWhiteList: "ignore",
          };
          for (let index = 0; index < resp.length; index++) {
            const item = resp[index];
            if (item.accid === selectMember) {
              qChatRoleAuth.value = item.auths;
              break;
            }
          }
        });
    };

    const removeDuplicateObj = (arr) => {
      let obj = {};
      arr = arr.reduce((newArr, next) => {
        obj[next.key] ? "" : (obj[next.key] = true && newArr.push(next));
        return newArr;
      }, []);
      return arr;
    };

    const handleAddRoleChange = (addSelectedValue) => {
      selectRoles = addSelectedValue.toString().split(",")[0];
      selectMember = addSelectedValue.toString().split(",")[1];
      if (selectRoles == "1") {
        store
          .dispatch("server/addChannelRole", {
            serverId: store.state.server.curServer.serverId,
            channelId: store.state.channel.currentChannel.channelId,
            parentRoleId: selectMember,
            roleId: selectMember,
          })
          .then((resp) => {
            createVisible.value = false;
            resp.label = resp.name;
            resp.value = resp.roleId;
            roleList.value.push(resp);
            roleList.value = removeDuplicateObj(roleList.value);
            message.success("身份组添加成功");
          })
          .catch((resp) => {
            createVisible.value = false;
            getChannalRoles();
            message.error("已存在无需新增");
            return;
          });
      } else {
        memberAndRoleList.forEach(function (s: any) {
          if (s.roleId == selectMember) {
            store.commit("channel/settingChannelRole", s);
          }
        });
        getMemberAuths();
      }
    };
    const getServerRoles = () => {
      store
        .dispatch("server/getServerRoles", {
          serverId: store.state.server.curServer.serverId,
        })
        .then((resp) => {
          resp.roles.forEach(function (s) {
            let exists = false;
            if (s.type === "everyone") {
              exists = true;
            } else {
              for (let index = 0; index < roleList.value.length; index++) {
                const role = roleList.value[index];
                if (s.roleId === role.roleId) {
                  exists = true;
                  break;
                }
              }
            }

            if (!exists) {
              s.label = s.name;
              s.value = s.roleId;
              channelroleList.push(s);
            }
          });
        });
    };
    const getChannalRoles = () => {
      if (!ifCanEdit.value) {
        return;
      }
      store
        .dispatch("channel/getChannelRoles", {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
        })
        .then((resp) => {
          resp.forEach(function (s) {
            // if(s.type !== 'everyone'){
            s.label = s.name;
            s.value = s.roleId;
            roleList.value.push(s);
            //  }
          });
        });
    };
    const getChannalMembers = async () => {
      if (!ifCanEdit.value) {
        return;
      }
      store
        .dispatch("channel/getMembersByPage", {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          timestamp: 0,
          limit: 100,
        })
        .then((res) => {
          res.datas.forEach(function (s) {
            if (s.accid !== store.state.user.userProfile.account) {
              s.label = s.nick + "  " + s.accid;
              s.value = s.accid;
              s.prefixCls = true;
              channelMemberAndRoleList.push(s);
            }
          });
        });
    };
    const getServerMembers = async () => {
      const res = await store.dispatch("server/getSeverMembers", {
        serverId: store.state.server.curServer.serverId,
        timestamp: 0,
      });
      res.datas.forEach(function (s) {
        s.label = s.nick + "  " + s.accid;
        s.value = s.accid;
        s.prefixCls = true;
        memberAndRoleList.push(s);
      });
    };

    const settingChannelAuth = async (auth, value) => {
      if (
        selectMember == undefined ||
        selectMember == null ||
        selectMember === ""
      ) {
        message.error("请选择身份组或成员");
        return;
      }
      let authObj = {};
      authObj[auth] = value;
      if (selectRoles == "1") {
        const UpdateChannelRoleOptions = {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          roleId: selectMember,
          auths: authObj,
        };
        store
          .dispatch("channel/updateChannelRole", UpdateChannelRoleOptions)
          .then(() => {
            message.success("设置成功!");
            qChatRoleAuth.value[auth] = value;
          })
          .catch(() => {
            message.error("保存失败，部分权限无法编辑");
          });
      } else if (selectRoles == "2") {
        const checkOption = {
          serverId: store.state.server.curServer.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          accids: [selectMember],
        };
        store
          .dispatch("channel/getExistingAccidsOfMemberRoles", checkOption)
          .then((res) => {
            const UpdateChannelRoleOptions = {
              serverId: store.state.server.curServer.serverId,
              channelId: store.state.channel.currentChannel.channelId,
              accid: selectMember,
              auths: authObj,
            };
            if (res.length > 0) {
              store
                .dispatch("channel/updateMemberRole", UpdateChannelRoleOptions)
                .then(() => {
                  message.success("设置成功!");
                  qChatRoleAuth.value[auth] = value;
                })
                .catch(() => {
                  message.error("保存失败，部分权限无法编辑");
                });
            } else {
              store
                .dispatch("channel/addMemberRole", UpdateChannelRoleOptions)
                .then(() => {
                  store
                    .dispatch(
                      "channel/updateMemberRole",
                      UpdateChannelRoleOptions,
                    )
                    .then(() => {
                      qChatRoleAuth.value[auth] = value;
                      message.success("设置成功!");
                    })
                    .catch(() => {
                      message.error("保存失败，部分权限无法编辑");
                    });
                })
                .catch(() => {
                  message.error("保存失败，部分权限无法编辑");
                });
            }
          });
      }
    };

    const curServerRoles = computed(() => store.state.server.curServerRoles);

    const serverMembers = computed(() => store.state.server.serverMembers);

    const MembersList = computed(() => store.state.server.serverMembers);
    const options: CascaderProps["options"] = [
      {
        label: "身份组",
        value: "1",
        children: roleList.value,
      },
      {
        label: "成员",
        value: "2",
        children: channelMemberAndRoleList,
      },
    ];
    const chanaloptions: CascaderProps["options"] = [
      {
        label: "身份组",
        value: "1",
        children: channelroleList,
      },
    ];
    const UpdataChannel = () => {
      const Channeloptions = {
        serverId: store.state.channel.currentChannel.serverId,
        channelId: store.state.channel.currentChannel.channelId,
        viewMode: formState.checked,
      };
      store
        .dispatch("channel/updateChannel", Channeloptions)
        .then(() => {
          message.success("设置成功!");
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
        })
        .catch(() => {
          message.error("无权限操作");
        });
    };
    const updateChannelRole = () => {
      if (!selectMember) {
        return message.error("请选择身份组或成员");
      } else {
        const UpdateChannelRoleOptions = {
          serverId: store.state.channel.currentChannel.serverId,
          channelId: store.state.channel.currentChannel.channelId,
          roleId: selectMember,
          auths: qChatRoleAuth,
        };
        store
          .dispatch("channel/updateChannelRole", UpdateChannelRoleOptions)
          .then(() => {
            message.success("设置成功!");
          })
          .catch(() => {
            message.error("保存失败，部分权限无法编辑");
          });
      }
    };
    // 获取按钮样式类名的辅助方法
    const getButtonClass = (currentValue: string, targetValue: string) => {
      if (currentValue === targetValue) {
        switch (targetValue) {
          case "deny":
            return "permission-btn deny selected";
          case "ignore":
            return "permission-btn ignore selected";
          case "allow":
            return "permission-btn allow selected";
          default:
            return "permission-btn";
        }
      } else {
        switch (targetValue) {
          case "deny":
            return "permission-btn deny";
          case "ignore":
            return "permission-btn ignore";
          case "allow":
            return "permission-btn allow";
          default:
            return "permission-btn";
        }
      }
    };

    return {
      roleList,
      MembersList,
      channelroleList,
      channelMemberAndRoleList,
      ChannelData,
      activeRole,
      formState,
      getChannalRoles,
      settingChannelAuth,
      curServerRoles,
      getServerRoles,
      getServerMembers,
      getChannalMembers,
      handleRoleChange,
      handleAddRoleChange,
      selectRoles,
      selectMember,
      serverMembers,
      UpdataChannel,
      qChatRoleAuth,
      updateChannelRole,
      options,
      chanaloptions,
      selectedValue,
      addValue,
      createVisible,
      ifCanEdit,
      ifCanChangeViewMode,
      getButtonClass,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.setting-content-wrap {
  flex: 1;
  height: 100%;
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
    .header-bar {
      cursor: pointer;
      display: inline-block;
      text-align: right;
    }
  }
}

.role-group-content {
  padding: 20px 30px;
  height: calc(100% - 80px);
  overflow-y: auto;
}

/* 设置区块样式 */
.settings-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

/* 私密频道设置 */
.default-role {
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .role-info {
    display: flex;
    align-items: center;
    flex: 1;

    .role-info__icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e6f7ff !important;
      border-color: #e6f7ff !important;
      margin-right: 16px;
      display: flex;
      align-items: center;
      justify-content: center;

      .role-info_lock {
        color: #1890ff !important;
        font-size: 18px;
      }
    }

    .role-text {
      flex: 1;

      .role-name {
        font-size: 16px;
        font-weight: 600;
        color: #262626;
        margin-bottom: 4px;
      }

      .role-desc {
        font-size: 14px;
        color: #8c8c8c;
        line-height: 1.4;
      }
    }
  }
}

/* 高级权限区域 */
.advanced-permissions {
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #262626;
      margin: 0;
    }

    .selector-container {
      display: flex;
      align-items: center;
      gap: 12px;

      .selector-label {
        font-size: 14px;
        color: #8c8c8c;
        white-space: nowrap;
      }

      .selector-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;

        .role-cascader {
          min-width: 280px;

          &.disabled {
            background: #f5f5f5 !important;
            border-color: #d9d9d9 !important;
            color: #bfbfbf !important;
          }
        }

        .add-button {
          color: #1890ff;

          &:hover {
            background: #f0f7ff;
          }
        }
      }
    }
  }
}

/* 权限设置容器 */
.permissions-container {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
}

/* 权限组 */
.permission-group {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  .group-title {
    font-size: 16px;
    font-weight: 600;
    color: #8c8c8c;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }
}

/* 权限项 */
.permission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .permission-name {
    font-size: 14px;
    color: #262626;
    font-weight: 500;
  }

  .permission-controls {
    display: flex;
    align-items: center;
    gap: 1px;
  }
}

/* 权限按钮 */
.permission-btn {
  width: 48px;
  height: 32px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  /* 移除按钮圆角，第一个和最后一个除外 */
  border-radius: 0;

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  /* 移除中间按钮的左边框 */
  &:not(:first-child) {
    border-left: none;
  }

  /* 拒绝按钮样式 */
  &.deny {
    color: #ff4d4f;

    &.selected {
      background: #ff4d4f;
      color: #ffffff;
      border-color: #ff4d4f;

      /* 确保选中状态的边框显示 */
      &:not(:first-child) {
        border-left: 1px solid #ff4d4f;
      }
    }

    &:hover:not(:disabled) {
      background: #fff2f0;
      border-color: #ff7875;
    }
  }

  /* 忽略按钮样式 */
  &.ignore {
    color: #8c8c8c;

    &.selected {
      background: #8c8c8c;
      color: #ffffff;
      border-color: #8c8c8c;

      /* 确保选中状态的边框显示 */
      &:not(:first-child) {
        border-left: 1px solid #8c8c8c;
      }
    }

    &:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #bfbfbf;
    }
  }

  /* 允许按钮样式 */
  &.allow {
    color: #52c41a;

    &.selected {
      background: #52c41a;
      color: #ffffff;
      border-color: #52c41a;

      /* 确保选中状态的边框显示 */
      &:not(:first-child) {
        border-left: 1px solid #52c41a;
      }
    }

    &:hover:not(:disabled) {
      background: #f6ffed;
      border-color: #95de64;
    }
  }

  /* 禁用状态 */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background: #ffffff;
      border-color: #d9d9d9;
    }

    &.selected:hover {
      /* 禁用状态下保持选中样式 */
      &.deny {
        background: #ff4d4f;
        border-color: #ff4d4f;
      }

      &.ignore {
        background: #8c8c8c;
        border-color: #8c8c8c;
      }

      &.allow {
        background: #52c41a;
        border-color: #52c41a;
      }
    }
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
.ant-close {
  width: 20px;
}
.role-tips {
  color: #6e6f74;
  margin-top: 20px;
}
.buttons {
  margin-top: 35px;
}
.drag-ghost {
  opacity: 0.5;
}
.drag-class {
  background: #363940;
}
.role-table-thead {
  color: #a3a4a9;
}
.role-table-tbody {
  color: #ffffff;
}
.role-table-row {
  border-bottom: 1px solid #363940;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 55px;
}
.role-table-cell {
  width: 100px;
}
.role-drag-holder {
  cursor: grab;
}
.action-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #373941;
  margin-left: 15px;
  line-height: 32px;
  color: #a3a4a9;
  &:hover {
    cursor: pointer;
    color: #ffffff;
    background: #282a2e;
  }
}

.create-form {
  .bottom-button {
    margin: 0 -24px;
    padding: 16px 20px 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    button {
      margin-left: 15px;
    }
  }
}
.switch-box {
  // display: flex;
  position: relative;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  .switch-title {
    color: #262626;
    font-size: 18px;
  }
  .setting_button_wrap {
    position: absolute;
    right: 10px;
    top: 0;
    .setting__buttonC {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      background: #ffffff;
      border-width: 1px 0 1px 1px;
      border-color: #d9d9d9;
      color: #cf5a57;
    }
    .setting__buttonC_selected {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      background: #ff4d4f;
      border-width: 1px 0 1px 1px;
      border-color: #ff4d4f;
      color: #fff;
    }
    .setting__buttonC:hover {
      color: #fff;
      background: #ff4d4f;
      border-color: #ff4d4f;
    }
    .setting__buttonP {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      background: #ffffff;
      border-width: 1px 0 1px 0;
      border-color: #d9d9d9;
      color: #8c8c8c;
    }
    .setting__buttonP_selected {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      background: #8c8c8c;
      border-width: 1px 0 1px 0;
      border-color: #8c8c8c;
      color: #fff;
    }
    .setting__buttonP:hover {
      color: #fff;
      background: #8c8c8c;
      border-color: #8c8c8c;
    }
    .setting__buttonD {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      background: #ffffff;
      border-width: 1px 1px 1px 0;
      border-color: #d9d9d9;
      color: #52c41a;
    }
    .setting__buttonD_selected {
      width: 60px;
      background-size: 50px;
      display: inline-block;
      background: #52c41a;
      border-width: 1px 1px 1px 0;
      border-color: #52c41a;
      color: #fff;
    }
    .setting__buttonD:hover {
      color: #fff;
      background: #52c41a;
      border-color: #52c41a;
    }
  }

  .changge-calss {
    width: 60px;
    background-size: 50px;
    display: inline-block;
    margin-left: 1250px;
    color: #f30606;
    border-color: #030303;
    background-color: rgba(248, 8, 8, 0);
  }
}
.ant-modal-body {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5715;
  word-wrap: break-word;
  height: 200px;
}

/* 强制覆盖Ant Design组件的暗色样式 */
:deep(.ant-cascader) {
  background: #ffffff !important;
  color: #262626 !important;
  border-color: #d9d9d9 !important;
}

:deep(.ant-cascader-dropdown) {
  background: #ffffff !important;
}

:deep(.ant-cascader-menu) {
  background: #ffffff !important;
}

:deep(.ant-cascader-menu-item) {
  color: #262626 !important;
  background: #ffffff !important;
}

:deep(.ant-cascader-menu-item:hover) {
  background: #f5f5f5 !important;
}

:deep(.ant-cascader-menu-item-active) {
  background: #e6f7ff !important;
  color: #1890ff !important;
}

:deep(.ant-cascader-selection-item) {
  background: #f0f0f0 !important;
  color: #262626 !important;
}

:deep(.ant-select-selector) {
  background: #ffffff !important;
  color: #262626 !important;
  border-color: #d9d9d9 !important;
}

:deep(.ant-select-selection-placeholder) {
  color: #8c8c8c !important;
}

/* 覆盖按钮的全局样式 */
:deep(.ant-btn-primary) {
  background: #1890ff !important;
  border-color: #1890ff !important;
}

:deep(.ant-switch-checked) {
  background-color: #1890ff !important;
}

/* 强制覆盖模态框样式 */
:deep(.ant-modal-content) {
  background: #ffffff !important;
}

:deep(.ant-modal-header) {
  background: #ffffff !important;
  border-bottom: 1px solid #f0f0f0 !important;
}

:deep(.ant-modal-title) {
  color: #262626 !important;
}

:deep(.ant-modal-body) {
  background: #ffffff !important;
  color: #262626 !important;
}
</style>
