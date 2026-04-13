<template>
  <div class="chat-page-container">
    <div class="header-wrap">
      <div class="left">
        <span class="symbol">#</span>
        <span class="name">{{ curChannel?.name }}</span>
        <span class="divider"></span>
        <span class="title">{{ curChannel?.topic }}</span>
      </div>
      <div class="right" :class="{ active: membersVisible }">
        <IconFont type="icon-chengyuan" @click="handleClick" />
      </div>
    </div>
    <div class="content-wrap" ref="contentRef">
      <div class="main">
        <ChatRoom />
      </div>
      <div class="members-wrap" v-if="membersVisible">
        <div
          class="mask"
          :class="{ expand: visible }"
          @click="unSetCurMember()"
        >
          <div class="mask-content" @scroll="handleScroll" @click.stop>
            <List
              item-layout="horizontal"
              :data-source="serverMembers"
              :split="false"
            >
              <template #loadMore>
                <Spin v-if="loadingMore" :indicator="indicator"></Spin>
              </template>
              <template #renderItem="{ item }">
                <ListItem>
                  <div
                    class="member-item"
                    :class="{ selected: item.accid === curMember?.accid }"
                    @click.stop="setCurMember(item)"
                  >
                    <div class="avatar">
                      <CommonAvatar
                        :avatar="item.avatar"
                        :nick="item.nick"
                        :accid="item.accid"
                        :width="36"
                        :border="0"
                      ></CommonAvatar>
                    </div>
                    <div class="nick-name">
                      <Text
                        :style="{ maxWidth: '120px' }"
                        :content="item.nick || item.accid"
                        :ellipsis="{ tooltip: item.nick || item.accid }"
                      >
                      </Text>
                    </div>
                    <div class="owner" v-if="!!item.type">
                      <IconFont type="icon-chuangjianzhe" />
                    </div>
                  </div>
                </ListItem>
              </template>
            </List>

            <!-- 用Modal替换原来的固定位置弹窗 -->
            <Modal
              v-model:open="visible"
              :title="null"
              :footer="null"
              :closable="true"
              width="300px"
              centered
              @cancel="unSetCurMember"
            >
              <div class="member-detail-wrap" v-if="curMember">
                <div class="header-background"></div>
                <div class="body-wrap">
                  <CommonAvatar
                    :avatar="curMember.avatar"
                    :nick="curMember.nick"
                    :accid="curMember.accid"
                    :width="70"
                    :border="4"
                  ></CommonAvatar>
                  <div class="name-wrap" v-if="curMember.nick">
                    <Paragraph
                      :style="{ maxWidth: '260px', color: '#262626' }"
                      :content="curMember.nick"
                      :ellipsis="{ tooltip: curMember.nick, rows: 2 }"
                    >
                    </Paragraph>
                  </div>
                  <div class="accid-wrap">
                    <Text
                      :style="{ maxWidth: '260px', color: '#8c8c8c' }"
                      :content="'#' + curMember.accid"
                      :ellipsis="{ tooltip: '#' + curMember.accid }"
                    >
                    </Text>
                  </div>
                  <div class="divider"></div>
                  <div class="roles-title">{{ $t("身份组") }}</div>
                  <div class="roles-wrap">
                    <div
                      class="role-item"
                      v-for="role in curMemberRoles || []"
                      :key="role.roleId"
                    >
                      {{ role.name }}
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref, watch, h } from "vue";
import { useStore } from "vuex";
import { List, Spin, Typography, Modal } from "ant-design-vue";
import { LoadingOutlined } from "@ant-design/icons-vue";
import { MemberInfo } from "../types/v2-compat";
import { QChatServerRole } from "../types/v2-compat";
import { getColorByAccid } from "../utils/index";
import ChatRoom from "./ChatRoom/index.vue";
import CommonAvatar from "./CommonAvatar.vue";
import IconFont from "./IconFont";

const ListItem = List.Item;
const Text = Typography.Text;
const Paragraph = Typography.Paragraph;

export default {
  name: "ChatPage",
  components: {
    ChatRoom,
    CommonAvatar,
    List,
    ListItem,
    Spin,
    IconFont,
    Text,
    Paragraph,
    Modal,
  },

  setup() {
    const store = useStore();
    const contentRef = ref<any>(null);
    const membersVisibleRef = ref<boolean>(false);
    const loadingMoreRef = ref<boolean>(false);

    const indicator = h(LoadingOutlined, {
      style: {
        fontSize: "20px",
        marginBottom: "10px",
      },
      spin: true,
    });

    watch(
      () => store.state.server.curServer,
      (server) => {
        if (server && server.serverId) {
          store.dispatch("server/getSeverMembers", {
            serverId: server.serverId,
            timestamp: 0,
          });
        }
      },
      {
        immediate: true,
      },
    );

    watch(
      [() => store.state.server.curMember, () => store.state.server.curServer],
      ([member, server]) => {
        if (member?.accid && server?.serverId)
          store.dispatch("server/getCurMemberRoles", {
            serverId: server.serverId,
            accid: member.accid,
            timestamp: 0,
          });
      },
      {
        immediate: true,
      },
    );

    watch(
      () => store.state.server.serverMembers,
      () => {
        loadingMoreRef.value = false;
      },
      {
        immediate: true,
      },
    );

    return {
      indicator,
      contentRef,
      getColorByAccid,
      curChannel: computed(() => store.state.channel.currentChannel),
      serverMembers: computed(() => store.state.server.serverMembers?.datas),
      curMember: computed(() => store.state.server.curMember),
      curMemberRoles: computed(() => store.state.server.curMemberRoles),
      visible: computed(() => !!store.state.server.curMember),
      membersVisible: computed(() => !!membersVisibleRef.value),
      loadingMore: computed(() => !!loadingMoreRef.value),
      setCurMember: (member: MemberInfo) => {
        store.commit("server/setCurMember", member);
      },
      setCurMemberRoles: (roles: QChatServerRole[]) => {
        store.commit("server/setCurMemberRoles", roles);
      },
      unSetCurMember() {
        store.commit("server/setCurMember", null);
      },
      unSetCurMemberRoles() {
        store.commit("server/setCurMemberRoles", null);
      },
      handleClick() {
        membersVisibleRef.value = !membersVisibleRef.value;
      },
      handleScroll(e: any): void {
        if (
          loadingMoreRef.value ||
          !store.state.server.serverMembers?.listQueryTag?.hasMore
        ) {
          return;
        }
        const hiddenHeight =
          store.state.server.serverMembers.length * 48 -
          e.target.clientHeight -
          e.target.scrollTop;

        if (hiddenHeight >= 100) {
          return;
        }

        loadingMoreRef.value = true;

        store.dispatch("server/appendSeverMembers", {
          serverId: store.state.server.curServer.serverId,
          timestamp:
            store.state.server.serverMembers?.listQueryTag?.nextTimetag || 0,
        });
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.chat-page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;

  .header-wrap {
    display: inline-flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 17px 20px 8px;
    border-bottom: 1px solid #e8e8e8;
    font-size: 16px;
    line-height: 28px;
    vertical-align: top;
    background-color: #ffffff;
    color: #262626;

    .left {
      display: inline-flex;
      flex-direction: row;

      .symbol {
        margin-right: 6px;
        font-size: 28px;
        color: #8c8c8c;
      }

      .name {
        margin-right: 16px;
        color: #262626;
      }

      .divider {
        width: 1px;
        height: 28px;
        margin-right: 16px;
        background: #d9d9d9;
      }

      .title {
        font-size: 14px;
        color: #8c8c8c;
      }
    }

    .right {
      color: #8c8c8c;
      font-size: 26px;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: #1890ff;
      }

      &.active {
        color: #1890ff;
      }
    }
  }

  .content-wrap {
    display: inline-flex;
    flex-direction: row;
    height: calc(100% - 55px);

    .main {
      flex: 1;
      height: 100%;
    }

    .members-wrap {
      position: relative;
      width: 208px;
      height: 100%;
      padding: 2px 0;
      background-color: #ffffff;
      border-left: 1px solid #e8e8e8;

      .mask {
        position: absolute;
        top: 0;
        right: 0;
        width: 208px;
        height: 100%;

        .ant-list-item {
          padding: 0;
        }

        .ant-list-header {
          position: fixed;
        }

        .mask-content {
          position: absolute;
          top: 0;
          right: 0;
          width: 208px;
          max-height: 100%;
          overflow-y: scroll;
          background-color: #ffffff;

          /* 自定义滚动条样式 */
          &::-webkit-scrollbar {
            width: 8px;
          }

          &::-webkit-scrollbar-track {
            background: #ffffff;
            border-radius: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background: #d9d9d9;
            border-radius: 4px;
            border: 1px solid #ffffff;
          }

          &::-webkit-scrollbar-thumb:hover {
            background: #bfbfbf;
          }

          /* 针对Firefox的滚动条样式 */
          scrollbar-width: thin;
          scrollbar-color: #d9d9d9 #ffffff;

          .load-more-wrap {
            padding: 4px 0;
            color: #262626;
            border: 1px solid #d9d9d9;
            text-align: center;
            margin: 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              background-color: #f5f5f5;
              border-color: #1890ff;
              color: #1890ff;
            }
          }

          .member-item {
            display: inline-flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            height: 48px;
            font-size: 14px;
            color: #262626;
            cursor: pointer;
            transition: background-color 0.3s ease;

            &:hover {
              background-color: #f5f5f5;
            }

            &.selected {
              background-color: #e6f7ff;
            }

            .avatar {
              margin-right: 8px;
              margin-left: 14px;
              cursor: pointer;

              &:hover {
                opacity: 0.8;
                transition: opacity 0.2s ease;
              }
            }

            .nick-name {
              margin-right: 8px;

              .ant-typography {
                color: #262626;
              }
            }

            .owner {
              color: #fa8c16;
              font-weight: 500;
            }
          }
        }

        &.expand {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          width: 100vw;
          background-color: rgba(0, 0, 0, 0.3);

          .mask-content {
            top: 55px;
          }
        }
      }
    }
  }
}

/* Modal 中的成员名片样式 */
.member-detail-wrap {
  .header-background {
    width: 100%;
    height: 80px;
    border-radius: 8px 8px 0 0;
    object-fit: cover;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: -24px -24px 0 -24px;
  }

  .body-wrap {
    margin-top: -35px;
    padding: 0 20px 36px;
    color: #262626;

    .name-wrap {
      margin-top: 17px;
      margin-right: 8px;
      font-weight: 500;
      font-size: 24px;
      line-height: 26px;
      color: #262626;
    }

    .accid-wrap {
      margin-top: 6px;
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      color: #8c8c8c;
    }

    .divider {
      height: 1px;
      margin-top: 16px;
      background-color: #f0f0f0;
    }

    .roles-title {
      margin-top: 16px;
      font-size: 14px;
      line-height: 16px;
      color: #8c8c8c;
    }

    .roles-wrap {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      margin-top: 16px;
      color: #262626;

      .role-item {
        padding: 4px 8px;
        margin-right: 6px;
        margin-bottom: 6px;
        border-radius: 8px;
        background-color: #f5f5f5;
        border: 1px solid #e8e8e8;
        font-size: 12px;
      }
    }
  }
}
</style>

<!-- 强制Modal样式 -->
<style>
.ant-modal-mask {
  z-index: 10000 !important;
}

.ant-modal-wrap {
  z-index: 10001 !important;
}

.ant-modal {
  z-index: 10002 !important;
}
</style>
