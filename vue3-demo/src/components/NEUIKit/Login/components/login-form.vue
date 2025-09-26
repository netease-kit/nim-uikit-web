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

<script lang="ts" setup>
import { ref, reactive, computed, getCurrentInstance } from "vue";
import i18n from "../i18n/zh-cn";
import { getLoginSmsCode, loginRegisterByCode } from "../utils/api";
import FormInput from "./form-input.vue";
import { showToast } from "../../utils/toast";

import { init } from "../../utils/init";
import { useRouter } from "vue-router";
import { STORAGE_KEY } from "../../utils/constants";
const app = getCurrentInstance();
const router = useRouter();

const mobileInputRule = {
  reg: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
  message: i18n.mobileErrorMsg,
  trigger: "blur",
};
const smsCodeInputRule = {
  reg: /^\d+$/,
  message: i18n.smsErrorMsg,
  trigger: "blur",
};

const smsCount = ref(60);
const loginTabs = reactive({
  active: 0,
  list: [{ key: 0, title: i18n.loginTitle }],
});
const loginForm = reactive({
  mobile: "",
  smsCode: "",
});

const smsText = computed(() => {
  if (smsCount.value > 0 && smsCount.value < 60) {
    return smsCount.value + i18n.smsCodeBtnTitleCount;
  } else {
    return i18n.smsCodeBtnTitle;
  }
});
// 获取验证码
async function startSmsCount() {
  if (!mobileInputRule.reg.test(loginForm.mobile)) {
    showToast({
      message: i18n.mobileErrorMsg,
      type: "info",
    });
    return;
  }
  try {
    await getLoginSmsCode({ mobile: loginForm.mobile });
  } catch (error: any) {
    let msg = error.errMsg || error.msg || error.message || i18n.smsCodeFailMsg;
    if (msg.startsWith("request:fail")) {
      msg = i18n.smsCodeNetworkErrorMsg;
    }
    showToast({
      message: msg,
      type: "info",
    });
    return;
  }

  if (smsCount.value > 0 && smsCount.value < 60) {
    return;
  }
  smsCount.value--;
  const timer = setInterval(() => {
    if (smsCount.value > 0) {
      smsCount.value--;
    } else {
      clearInterval(timer);
      smsCount.value = 60;
    }
  }, 1000);
}

// 登录
async function submitLoginForm() {
  if (
    !mobileInputRule.reg.test(loginForm.mobile) ||
    !smsCodeInputRule.reg.test(loginForm.smsCode)
  ) {
    showToast({
      message: i18n.mobileOrSmsCodeErrorMsg,
      type: "info",
    });
    return;
  }
  try {
    const res = await loginRegisterByCode(loginForm);
    // 存储登录信息到 sessionStorage
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        account: res.imAccid,
        token: res.imToken,
      })
    );

    const { nim, store } = init();
    if (app) {
      app.appContext.app.config.globalProperties.$NIM = nim;
      app.appContext.app.config.globalProperties.$UIKitStore = store;
    }

    nim.V2NIMLoginService.login(res.imAccid, res.imToken)
      .then(() => {
        // IM 登录成功后跳转到聊天页面
        router.push("/chat");
      })
      .catch((error) => {
        if (error.code === 102422) {
          // 账号被封禁
          showToast({
            message: "当前账号已被封禁",
            type: "info",
          });
          // 登录信息无效，清除并跳转到登录页
          sessionStorage.removeItem(STORAGE_KEY);
          router.push("/login");
        }
      });
  } catch (error: any) {
    let msg = error.errMsg || error.msg || error.message || i18n.smsCodeFailMsg;
    if (msg.startsWith("request:fail")) {
      msg = i18n.loginNetworkErrorMsg;
    }
    showToast({
      message: msg,
      type: "info",
    });
  }
}
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
