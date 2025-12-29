<template>
  <div>
    <div class="login-form-container">
      <div class="login-tabs">
        <span
          v-for="item in loginTabs.list"
          :key="item.key"
          :class="['login-tab', { active: loginTabs.active === item.key }]"
          @click="loginTabs.active = item.key"
        >
          <span>{{ item.title }}</span>
        </span>
      </div>
      <div class="login-tips">{{ i18n.loginTips }}</div>
      <div class="login-form">
        <FormInput
          className="login-form-input"
          type="tel"
          :value="loginForm.mobile"
          @updateModelValue="(val) => (loginForm.mobile = val)"
          :placeholder="i18n.mobilePlaceholder"
          :allow-clear="true"
          :maxlength="11"
          :rule="mobileInputRule"
        >
          <template #addonBefore>
            <span class="phone-addon-before">+86</span>
          </template>
        </FormInput>
        <FormInput
          className="login-form-input"
          type="tel"
          :value="loginForm.smsCode"
          @updateModelValue="(val) => (loginForm.smsCode = val)"
          :placeholder="i18n.smsCodePlaceholder"
          :rule="smsCodeInputRule"
          :maxlength="8"
        >
          <template #addonAfter>
            <span
              :class="[
                'sms-addon-after',
                { disabled: smsCount > 0 && smsCount < 60 },
              ]"
              @click="startSmsCount()"
              >{{ smsText }}</span
            >
          </template>
        </FormInput>
      </div>
    </div>
    <button class="login-btn" @click="submitLoginForm()">
      {{ i18n.loginBtnTitle }}
    </button>
  </div>
</template>

<script>
import i18n from "../i18n/zh-cn";
import { getLoginSmsCode, loginRegisterByCode } from "../utils/api";
import FormInput from "./form-input.vue";
import { showToast } from "../../utils/toast";
import { STORAGE_KEY } from "../../utils/constants";
import { initIMUIKit } from "../../utils/init";
import { APP_KEY } from "../../utils/constants";
export default {
  name: "LoginForm",
  components: { FormInput },
  data() {
    return {
      mobileInputRule: {
        reg: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
        message: i18n.mobileErrorMsg,
        trigger: "blur",
      },
      smsCodeInputRule: {
        reg: /^\d+$/,
        message: i18n.smsErrorMsg,
        trigger: "blur",
      },
      smsCount: 60,
      loginTabs: { active: 0, list: [{ key: 0, title: i18n.loginTitle }] },
      loginForm: { mobile: "", smsCode: "" },
    };
  },
  computed: {
    i18n() {
      return i18n;
    },
    smsText() {
      return this.smsCount > 0 && this.smsCount < 60
        ? this.smsCount + i18n.smsCodeBtnTitleCount
        : i18n.smsCodeBtnTitle;
    },
  },
  methods: {
    startSmsCount: async function () {
      if (!this.mobileInputRule.reg.test(this.loginForm.mobile)) {
        showToast({ message: i18n.mobileErrorMsg, type: "info" });
        return;
      }
      try {
        await getLoginSmsCode({ mobile: this.loginForm.mobile });
      } catch (error) {
        let msg =
          (error && (error.errMsg || error.msg || error.message)) ||
          i18n.smsCodeFailMsg;
        if (String(msg).startsWith("request:fail")) {
          msg = i18n.smsCodeNetworkErrorMsg;
        }
        showToast({ message: msg, type: "info" });
        return;
      }

      if (this.smsCount > 0 && this.smsCount < 60) {
        return;
      }
      this.smsCount -= 1;
      const timer = setInterval(() => {
        if (this.smsCount > 0) {
          this.smsCount -= 1;
        } else {
          clearInterval(timer);
          this.smsCount = 60;
        }
      }, 1000);
    },
    submitLoginForm: async function () {
      if (
        !this.mobileInputRule.reg.test(this.loginForm.mobile) ||
        !this.smsCodeInputRule.reg.test(this.loginForm.smsCode)
      ) {
        showToast({ message: i18n.mobileOrSmsCodeErrorMsg, type: "info" });
        return;
      }
      try {
        const res = await loginRegisterByCode(this.loginForm);
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ account: res.imAccid, token: res.imToken })
        );
        const { nim } = initIMUIKit(APP_KEY);

        await nim.V2NIMLoginService.login(res.imAccid, res.imToken);
        this.$router.push("/chat");
      } catch (error) {
        const code = error && error.code;
        let msg =
          (error && (error.errMsg || error.msg || error.message)) ||
          i18n.smsCodeFailMsg;
        if (String(msg).startsWith("request:fail")) {
          msg = i18n.loginNetworkErrorMsg;
        }
        if (code === 102422) {
          showToast({ message: "当前账号已被封禁", type: "info" });
          sessionStorage.removeItem(STORAGE_KEY);
          if (this.$route.path !== "/login") {
            this.$router.push("/login");
          }
          return;
        }
        showToast({ message: msg, type: "info" });
      }
    },
  },
};
</script>

<style scoped>
.navigation-bar {
  height: 80px;
}

.login-form-container {
  padding: 0 30px;
}

.login-tab {
  display: inline-block;
  font-size: 22px;
  line-height: 31px;
  color: #666b73;
  margin-right: 20px;
  margin-bottom: 20px;
}

.login-tab.active {
  color: #000;
  font-weight: bold !important;
}

.login-tab-active-line {
  display: block;
  width: 80px;
  height: 2px;
  background: #337eff;
  margin: 5px auto;
  border-radius: 2px;
}

.login-tips {
  font-size: 14px;
  line-height: 20px;
  color: #666666;
  margin-bottom: 20px;
}

.phone-addon-before {
  color: #999999;
  border-right: 1px solid #999999;
  padding: 0 5px;
}

.sms-addon-after {
  color: #337eff;
}

.sms-addon-after.disabled {
  color: #666b73;
}

.login-form-input {
  margin-bottom: 20px;
  color: #333;
}

.login-btn {
  border: none;
  height: 50px;
  width: 90%;
  background: #337eff;
  border-radius: 8px;
  color: #fff;
  margin-top: 54px;
  position: relative;
  font-size: 16px;
  left: 50%;
  cursor: pointer;
  transform: translateX(-50%);
}
</style>
