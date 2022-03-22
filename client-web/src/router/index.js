import Vue from 'vue'
import VueRouter from 'vue-router'
import Landing from '../views/Landing.vue'
import Chat from '../views/Chat.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Landing
  },
  {
    path: '/:name',
    component: Chat
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
