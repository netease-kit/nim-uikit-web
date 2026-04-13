<template>
  <Modal
    :title="null"
    :footer="null"
    :visible="ifVisible"
    @cancel="handleModalCancel"
  >
    <div class="loginWrapper">
      <img class="logo3" src="../assets/logo3.png" />
      <div class="title">{{ $t("圈组 注册/登录") }}</div>
      <Input
        :placeholder="$t('请输入手机号')"
        :allowClear="true"
        :maxlength="20"
        class="inputPhone"
        v-model:value="phone"
        @change="
          (e) => {
            validePhone(e.target.value);
          }
        "
      />
      <div class="smsCodeWrapper">
        <Input
          :placeholder="$t('请输入验证码')"
          :allowClear="true"
          :maxlength="6"
          class="inputCode"
          v-model:value="code"
          @change="
            (e) => {
              valideCode(e.target.value);
            }
          "
        />
        <Button
          class="smsCodeButton"
          :disabled="sendSmsCodeDisabled"
          :loading="sendingSmsCode"
          @click="sendSmsCodeHandler"
          >{{ buttonText }}</Button
        >
      </div>
      <div class="errorMsg">
        {{ phoneErrorMsg || codeErrorMsg || loginErrorMsg || "" }}
      </div>
      <Button class="loginButton" type="primary" @click="loginHandler">{{
        $t("注册/登录")
      }}</Button>
      <div class="privateWrapper">
        {{ $t("登录即表示同意") }}
        <a href="javascript:;">{{ $t("用户协议") }}</a>
        和
        <a href="javascript:;">{{ $t("隐私条款") }}</a>
      </div>
      <img class="logo2" src="../assets/logo2.png" />
    </div>
  </Modal>
</template>

<script lang="ts">
import { Modal, Button, Input } from "ant-design-vue";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { emptyFunc } from "../utils/index";

export default {
  name: "LoginModal",
  components: { Modal, Button, Input },
  props: {
    onLogin: {
      type: Function,
      default: emptyFunc,
    },
    onSend: {
      type: Function,
      default: emptyFunc,
    },
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: any, context: any) {
    const { t: $t } = useI18n();
    const ifVisible = computed(() => {
      return props.visible;
    });
    const phone = ref<string>("");
    const code = ref<string>("");
    const phoneErrorMsg = ref<string>("");
    const codeErrorMsg = ref<string>("");
    const loginErrorMsg = ref<string>("");
    const buttonText = ref<string>($t("获取验证码"));
    const sendingSmsCode = ref<boolean>(false);
    const logining = ref<boolean>(false);
    const validePhone = (value: string) => {
      if (!/^\d{11,}$/.test(value)) {
        phoneErrorMsg.value = $t("请输入正确的手机号");
        return false;
      } else {
        phoneErrorMsg.value = "";
        return true;
      }
    };
    const onCancel = () => {
      logining.value = false;
    };
    const valideCode = (value: string) => {
      if (!/^\d+$/.test(value)) {
        codeErrorMsg.value = $t("请输入正确的验证码");
        return false;
      } else {
        codeErrorMsg.value = "";
        return true;
      }
    };

    return {
      phone,
      code,
      phoneErrorMsg,
      codeErrorMsg,
      loginErrorMsg,
      buttonText,
      sendingSmsCode,
      ifVisible,
      onCancel,
      sendSmsCodeDisabled: computed(
        () => buttonText.value !== $t("获取验证码"),
      ),
      validePhone,
      valideCode,
      async sendSmsCodeHandler() {
        try {
          if (phoneErrorMsg.value) {
            return;
          }
          if (!validePhone(phone.value)) {
            return;
          }
          sendingSmsCode.value = true;
          await props.onSend(phone.value);
          sendingSmsCode.value = false;
          let total = 60;
          buttonText.value = `${total}s`;
          let timer: any = setInterval(() => {
            buttonText.value = `${--total}s`;
            if (total <= 0) {
              buttonText.value = $t("获取验证码");
              clearInterval(timer);
              timer = null;
            }
          }, 1000);
        } catch (error: any) {
          sendingSmsCode.value = false;
          codeErrorMsg.value = error?.msg || $t("获取验证码失败");
          throw error;
        }
      },
      async loginHandler() {
        try {
          if (phoneErrorMsg.value || codeErrorMsg.value) {
            return;
          }
          if (!validePhone(phone.value) || !valideCode(code.value)) {
            return;
          }
          logining.value = true;
          await props.onLogin({
            phone: phone.value,
            code: code.value,
          });
          logining.value = false;
        } catch (error: any) {
          logining.value = true;
          loginErrorMsg.value = error?.msg || $t("登录失败");
          throw error;
        }
      },
      handleModalCancel() {
        context.emit("closeLoginModal");
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.loginWrapper {
  width: 100%;
  height: 510px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 65px;

  .logo2 {
    width: 76px;
    height: 20px;
    margin-top: 30px;
  }

  .logo3 {
    width: 66px;
    height: 66px;
    margin-top: 26px;
  }

  .title {
    font-size: 24px;
    margin-top: 15px;
    color: #333;
    font-weight: 500;
  }

  .inputPhone {
    height: 42px;
    margin-top: 30px;
  }

  .smsCodeWrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    margin-top: 20px;

    .inputCode {
      width: 234px;
      height: 42px;
    }

    .smsCodeButton {
      height: 42px;
      flex: 1;
      margin-left: 10px;
      background-color: #fff;
      border-color: #d9d9d9;
      color: #333;
      &:hover,
      &:focus,
      &:active {
        border-color: #40a9ff;
        color: #40a9ff;
      }
      &[disabled] {
        color: rgba(0, 0, 0, 0.25);
        border-color: #d9d9d9;
        background-color: #f5f5f5;
      }
    }
  }

  .loginButton {
    width: 100%;
    height: 42px;
  }

  .privateWrapper {
    margin-top: 20px;
  }

  .errorMsg {
    margin: 10px 0;
    font-size: 12px;
    color: #e74646;
    width: 100%;
    text-align: left;
    height: 19px;
    line-height: 19px;
  }
}
</style>
