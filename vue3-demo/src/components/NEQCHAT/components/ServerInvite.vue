<template>
  <Modal
    :visible="visible"
    class="light"
    :width="520"
    title="邀请好友加入服务器"
    :footer="null"
    @cancel="handleClose"
  >
    <div class="invite-box">
      <div class="invite-form">
        <label class="invite-label">{{ $t("用户 ID") }}</label>
        <Input
          v-model:value="accid"
          :placeholder="$t('请输入好友的账号 ID')"
          :maxlength="64"
          @pressEnter="handleInvite"
        ></Input>
      </div>
      <div class="invite-actions">
        <Button
          type="primary"
          :loading="loading"
          :disabled="!accid.trim()"
          @click="handleInvite"
        >
          {{ $t("邀请") }}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { Modal, Button, Input, message } from "ant-design-vue";
import { ref } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { emptyFunc } from "../utils/index.js";

export default {
  name: "SeverInvite",
  components: {
    Modal,
    Button,
    Input,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: "",
    },
    modalClose: {
      type: Function,
      default: emptyFunc,
    },
  },
  setup(props) {
    const store = useStore();
    const { t: $t } = useI18n();
    const accid = ref("");
    const loading = ref(false);

    const handleInvite = async () => {
      const trimmed = accid.value.trim();
      if (!trimmed) {
        return;
      }
      loading.value = true;
      try {
        const res = await store.dispatch("server/inviteServerMembers", {
          serverId: props.id,
          accids: [trimmed],
          ps: "",
        });
        if (res.failByOverAccids && res.failByOverAccids.length > 0) {
          message.warning($t("邀请失败：用户服务器数量超限"));
        } else if (res.failByBanAccids && res.failByBanAccids.length > 0) {
          message.warning($t("邀请失败：用户已被服务器封禁"));
        } else {
          message.success($t("邀请已发送"));
          accid.value = "";
          props.modalClose();
        }
      } catch (err: any) {
        console.error(err);
        message.error($t("邀请失败，请检查用户 ID 是否正确"));
      } finally {
        loading.value = false;
      }
    };

    const handleClose = () => {
      accid.value = "";
      props.modalClose();
    };

    return {
      accid,
      loading,
      handleInvite,
      handleClose,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.invite-box {
  .invite-form {
    margin-bottom: 16px;
    .invite-label {
      display: block;
      margin-bottom: 8px;
      color: #8c8c8c;
      font-size: 14px;
    }
  }
  .invite-actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
