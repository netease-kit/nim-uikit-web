import Vue from 'vue'
import VueRouter from 'vue-router'
import IM from '@/views/chat/IM.vue'
import Login from '@/components/NEUIKit/Login/index.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/login', component: Login },
  { path: '/chat', component: IM },
  { path: '/', redirect: '/chat' },
]

const router = new VueRouter({ mode: 'hash', routes })

export default router
