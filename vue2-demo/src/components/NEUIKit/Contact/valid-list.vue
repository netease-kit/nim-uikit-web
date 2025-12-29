<template>
  <div class="valid-list-container">
    <div class="valid-list-content">
      <Empty
        v-if="validMsg.length === 0"
        :text="t('validEmptyText')"
        :emptyStyle="{
          marginTop: '100px',
        }"
      />
      <template v-else>
        <div class="valid-item" v-for="msg in validMsg" :key="msg.timestamp">
          <!-- 好友申请 已同意 -->
          <template
            v-if="
              msg.status ===
              V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_AGREED
            "
          >
            <div class="valid-item-left">
              <Avatar :account="msg.applicantAccountId" />
              <div class="valid-name-container">
                <div class="valid-name">
                  <Appellation :account="msg.applicantAccountId" />
                </div>
                <div class="valid-action">{{ t("applyFriendText") }}</div>
              </div>
            </div>
            <div class="valid-state">
              <Icon type="icon-yidu" />
              <span class="valid-state-text">{{ t("acceptResultText") }}</span>
            </div>
          </template>
          <!--好友申请 已拒绝 -->
          <template
            v-else-if="
              msg.status ===
              V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_REJECTED
            "
          >
            <template v-if="isMeApplicant(msg)">
              <div class="valid-item-left">
                <Avatar :account="msg.recipientAccountId" />
                <div class="valid-name-container">
                  <div class="valid-name">
                    <Appellation :account="msg.recipientAccountId" />
                  </div>
                  <div class="valid-action">{{ t("beRejectResultText") }}</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="valid-item-left">
                <Avatar :account="msg.applicantAccountId" />
                <div class="valid-name-container">
                  <div class="valid-name">
                    <Appellation :account="msg.applicantAccountId" />
                  </div>
                  <div class="valid-action">{{ t("applyFriendText") }}</div>
                </div>
              </div>
              <div class="valid-state">
                <Icon type="icon-shandiao" />
                <span class="valid-state-text">{{
                  t("rejectResultText")
                }}</span>
              </div>
            </template>
          </template>
          <!-- 好友申请 未处理 -->
          <template
            v-else-if="
              msg.status ===
              V2NIMFriendAddApplicationStatus.V2NIM_FRIEND_ADD_APPLICATION_STATUS_INIT
            "
          >
            <template v-if="!isMeApplicant(msg)">
              <div class="valid-item-left">
                <Avatar :account="msg.applicantAccountId" />
                <div class="valid-name-container">
                  <div class="valid-name">
                    <Appellation :account="msg.applicantAccountId" />
                  </div>
                  <div class="valid-action">{{ t("applyFriendText") }}</div>
                </div>
              </div>
              <div class="valid-buttons">
                <div
                  class="valid-button button-reject"
                  @click="handleRejectApplyFriendClick(msg)"
                  :loading="applyFriendLoading"
                >
                  {{ t("rejectText") }}
                </div>
                <div
                  class="valid-button button-accept"
                  @click="handleAcceptApplyFriendClick(msg)"
                  :loading="applyFriendLoading"
                >
                  {{ t("acceptText") }}
                </div>
              </div>
            </template>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { autorun } from "mobx";
import Empty from "../CommonComponents/Empty.vue";
import Avatar from "../CommonComponents/Avatar.vue";
import Icon from "../CommonComponents/Icon.vue";
import { t } from "../utils/i18n";
import Appellation from "../CommonComponents/Appellation.vue";
import { toast } from "../utils/toast";
import { nim, uiKitStore } from "../utils/init";
import { V2NIMConst } from "nim-web-sdk-ng/dist/esm/nim";
export default {
  name: "ValidList",
  components: { Empty, Avatar, Icon, Appellation },
  props: {},
  data() {
    return {
      store: uiKitStore,
      validMsg: [],
      applyFriendLoading: false,
      uninstallValidMsgWatch: null,
      V2NIMFriendAddApplicationStatus:
        V2NIMConst.V2NIMFriendAddApplicationStatus,
    };
  },
  methods: {
    t,
    isMeApplicant(data) {
      const myId =
        this.store && this.store.userStore && this.store.userStore.myUserInfo
          ? this.store.userStore.myUserInfo.accountId
          : "";
      return data && data.applicantAccountId === myId;
    },
    async handleRejectApplyFriendClick(msg) {
      this.applyFriendLoading = true;
      try {
        await this.store.friendStore.rejectAddApplicationActive(msg);
        toast.info(t("rejectedText"));
      } catch (error) {
        toast.info(t("rejectFailedText"));
      } finally {
        this.applyFriendLoading = false;
      }
    },
    async handleAcceptApplyFriendClick(msg) {
      this.applyFriendLoading = true;
      try {
        try {
          await this.store.friendStore.acceptAddApplicationActive(msg);
          toast.success(t("acceptedText"));
        } catch (error) {
          toast.info(t("acceptFailedText"));
        }
        const textMsg = nim.V2NIMMessageCreator.createTextMessage(
          t("passFriendAskText")
        );
        await this.store.msgStore.sendMessageActive({
          msg: textMsg,
          conversationId: nim.V2NIMConversationIdUtil.p2pConversationId(
            msg.operatorAccountId
          ),
        });
      } catch (error) {
        console.error("handleAcceptApplyFriendClick error", error);
      } finally {
        this.applyFriendLoading = false;
      }
    },
  },
  mounted() {
    this.uninstallValidMsgWatch = autorun(() => {
      const list = [...(this.store?.sysMsgStore.friendApplyMsgs || [])].sort();
      this.validMsg = list;
      (this.store?.sysMsgStore.friendApplyMsgs || []).forEach((item) => {
        this.store?.userStore.getUserActive(item.applicantAccountId);
      });
    });
  },
  beforeDestroy() {
    if (typeof this.uninstallValidMsgWatch === "function") {
      try {
        this.uninstallValidMsgWatch();
      } catch (e) {
        console.error("uninstallValidMsgWatch error", e);
      }
      this.uninstallValidMsgWatch = null;
    }
  },
};
</script>

<style scoped>
.valid-list-container {
  height: 100%;
  overflow: auto;
}

.valid-list-content {
  padding: 0;
}

.valid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid #f5f8fc;
  transition: background-color 0.2s ease;
}

.valid-item:hover {
  background-color: #f8f9fa;
}

.valid-item:last-child {
  border-bottom: none;
}

.valid-name-container {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  flex: 1;
  padding-right: 20px;
}

.valid-name {
  font-size: 16px;
  color: #000;
  max-width: 35vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.valid-action {
  color: #888;
  font-size: 14px;
  max-width: 40vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.valid-item-left {
  display: flex;
  align-items: center;
}

.valid-buttons {
  display: flex;
  align-items: center;
}

.valid-button {
  margin: 0;
  width: 60px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  text-align: center;
  border-radius: 3px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button-reject {
  color: #000;
  border: 1px solid #d9d9d9;
  margin-right: 10px;
}

.button-accept {
  color: #337eef;
  border: 1px solid #337eef;
}

.button-accept:hover {
  background-color: #337eef;
  color: #fff;
}

.button-reject:hover {
  background-color: #f5f5f5;
}

.valid-state {
  display: flex;
  align-items: center;
}

.valid-state-text {
  margin-left: 10px;
  color: #000;
}
</style>
