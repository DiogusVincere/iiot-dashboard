import { createRouter, createWebHistory } from 'vue-router'
import Sensor from '../views/Sensor.vue'
import Manutencao from '../views/Manutencao.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: Sensor,
      path: '/', 
      name: 'sensor'
    },
    {
      component: Manutencao,
      path: '/manutencao',
      name: 'manutencao'
    },
    {
      component: NotFound,
      path: '/:pathMatch(.*)*',
      name: 'not-found'
    },
  ],
})

export default router
