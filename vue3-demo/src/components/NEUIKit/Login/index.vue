<template>
  <div class="page-wrapper">
    <div class="login-card" v-show="step === 0">
      <Welcome />
    </div>
    <div class="login-card" v-show="step === 1">
      <LoginForm />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import LoginForm from "./components/login-form.vue";
import Welcome from "./components/welcome.vue";
import emitter from "../utils/eventBus";

const step = ref(0); // 0: 欢迎页 1: 登录页
onMounted(() => {
  emitter.on("login", () => {
    step.value = 1;
  });
});

onUnmounted(() => {
  emitter.off("login");
});
</script>

<style>
.page-wrapper {
  height: 100%;
  overflow: hidden;
  background-color: #fff;
  background-image: url("./static/bg.png");
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  box-sizing: border-box;
  width: 520px;
  height: 510px;
  background-color: #ffffff;
  border: 1px solid #ebedf0;
  box-shadow: 0px 2px 6px rgba(23, 23, 26, 0.1);
  border-radius: 8px;
  padding: 74px 30px 80px;
  display: flex;
  flex-direction: column;
  margin: auto;
}
</style>
