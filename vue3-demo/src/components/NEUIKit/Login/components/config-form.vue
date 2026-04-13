<template>
  <div>
    <div class="config-form-container">
      <div class="config-title">登录信息</div>
      <div class="config-tips">请输入你的 AppKey、Account 和 Token 信息</div>
      <div class="config-form">
        <FormInput
          className="config-form-input"
          type="text"
          :value="configForm.appkey"
          @updateModelValue="(val) => (configForm.appkey = val)"
          placeholder="请输入 AppKey"
          :allow-clear="true"
          :maxlength="9999"
        />
        <FormInput
          className="config-form-input"
          type="text"
          :value="configForm.account"
          @updateModelValue="(val) => (configForm.account = val)"
          placeholder="请输入 Account"
          :allow-clear="true"
          :maxlength="9999"
        />
        <FormInput
          className="config-form-input"
          type="text"
          :value="configForm.token"
          @updateModelValue="(val) => (configForm.token = val)"
          placeholder="请输入 Token"
          :allow-clear="true"
          :maxlength="9999"
        />
        <FormInput
          className="config-form-input"
          type="text"
          :value="configForm.lbsUrls"
          @updateModelValue="(val) => (configForm.lbsUrls = val)"
          placeholder="请输入 lbsUrls"
          :allow-clear="true"
          :maxlength="9999"
        />
        <FormInput
          className="config-form-input"
          type="text"
          :value="configForm.linkUrl"
          @updateModelValue="(val) => (configForm.linkUrl = val)"
          placeholder="请输入 linkUrl"
          :allow-clear="true"
          :maxlength="9999"
        />
      </div>
    </div>
    <button class="config-btn" @click="submitConfigForm()">保存并初始化</button>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import FormInput from "./form-input.vue";
import { showToast } from "../../utils/toast";
import { initIMUIKit } from "../../utils/init";
import { STORAGE_KEY } from "../../utils/constants";
import { useRouter } from "vue-router";

const router = useRouter();

// 初始化配置表单，如果localStorage中有配置信息则预填充
const initConfigForm = () => {
  const storedConfig = localStorage.getItem(STORAGE_KEY);
  if (storedConfig) {
    try {
      const config = JSON.parse(storedConfig);
      return {
        appkey: config.appkey || "",
        account: config.account || "",
        token: config.token || "",
        lbsUrls: config.lbsUrls || "",
        linkUrl: config.linkUrl || "",
      };
    } catch (error) {
      console.error("解析配置信息失败", error);
    }
  }
  return {
    appkey: "",
    account: "",
    token: "",
    lbsUrls: "",
    linkUrl: "",
  };
};

const configForm = reactive(initConfigForm());

// 保存配置并初始化
async function submitConfigForm() {
  if (
    !configForm.appkey.trim() ||
    !configForm.account.trim() ||
    !configForm.token.trim()
  ) {
    showToast({
      message: "请填写完整的配置信息",
      type: "info",
    });
    return;
  }

  try {
    // 初始化 UIKit
    const { nim } = initIMUIKit(
      configForm.appkey,
      configForm.lbsUrls,
      configForm.linkUrl,
    );

    // 登录 IM
    await nim.V2NIMLoginService.login(
      configForm.account.trim(),
      configForm.token.trim(),
    );

    // 保存配置信息到 localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        appkey: configForm.appkey.trim(),
        account: configForm.account.trim(),
        token: configForm.token.trim(),
        lbsUrls: configForm.lbsUrls.trim(),
        linkUrl: configForm.linkUrl.trim(),
      }),
    );
    showToast({
      message: "初始化成功",
      type: "success",
    });

    // 跳转到聊天页面
    router.push("/chat");
  } catch (error: any) {
    console.error("初始化失败", error);
    let msg =
      error.errMsg ||
      error.msg ||
      error.message ||
      "初始化失败，请检查配置信息";
    if (error.code === 102422) {
      msg = "当前账号已被封禁";
    }
    showToast({
      message: msg,
      type: "error",
    });
    // 初始化失败时，不跳转，继续保持在配置页面让用户重新输入
  }
}
</script>

<style scoped>
.config-form-container {
  padding: 0 30px;
}

.config-title {
  font-size: 22px;
  line-height: 31px;
  color: #000;
  font-weight: bold;
  margin-bottom: 20px;
}

.config-tips {
  font-size: 14px;
  line-height: 20px;
  color: #666666;
  margin-bottom: 20px;
}

.config-form-input {
  margin-bottom: 20px;
  color: #333;
}

.config-btn {
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

.config-btn:hover {
  background: #2968d8;
}
</style>
