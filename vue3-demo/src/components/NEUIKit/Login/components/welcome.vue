<template>
  <div>
    <img
      src="https://yx-web-nosdn.netease.im/common/da126b0fcc419b142224ced81456e179/yx-welcome.png"
      class="welcome-img"
    />
    <button class="login-btn" @click="onSmsLogin">注册/登录</button>
    <button class="config-login-btn" @click="onConfigLogin">账号登录</button>
    <div class="bottom-box">
      <img
        src="https://yx-web-nosdn.netease.im/common/9303d9be2ea5f90c48397326ae5dfd45/welcome-bottom.png"
        class="welcome-img-bottom"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import emitter from "../../utils/eventBus";

const onSmsLogin = () => {
  emitter.emit("login");
};

const onConfigLogin = () => {
  emitter.emit("configLogin");
};
</script>

<style scoped>
.welcome-img {
  width: 120px;
  height: 154px;
  display: block;
  margin: 20px auto 0;
}

.login-btn {
  height: 50px;
  width: 90%;
  background: #337eff;
  border-radius: 8px;
  color: #fff;
  margin-top: 80px;
  border: none;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
}

.config-login-btn {
  height: 50px;
  width: 90%;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  color: #666;
  margin-top: 16px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  cursor: pointer;
}

.config-login-btn:hover {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.bottom-box {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}
.welcome-img-bottom {
  width: 82px;
  height: 20px;
}
</style>
