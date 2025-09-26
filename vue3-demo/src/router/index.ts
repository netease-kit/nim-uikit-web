import { createRouter, createWebHashHistory } from "vue-router";

// 创建路由实例
const router = createRouter({
  // 使用 hash 模式的路由
  history: createWebHashHistory(),
  routes: [
    {
      // 根路径重定向到会话列表页面
      path: "/",
      name: "Chat",
      component: () => import("../views/chat/IM.vue"),
    },
    {
      // 聊天页面路由
      path: "/chat",
      name: "Chat",
      component: () => import("../views/chat/IM.vue"),
    },
  ],
});

export default router;
