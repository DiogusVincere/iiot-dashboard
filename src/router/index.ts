import { createRouter, createWebHistory } from 'vue-router'
import Sensor from '../views/Sensor.vue'
import Manutencao from '../views/Manutencao.vue'
import NotFound from '../views/NotFound.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** Entra no título da aba: "Monitoramento · IIoT Dashboard". */
    titulo?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      component: Sensor,
      path: '/',
      name: 'sensor',
      meta: { titulo: 'Monitoramento' },
    },
    {
      component: Manutencao,
      path: '/manutencao',
      name: 'manutencao',
      meta: { titulo: 'Manutenção' },
    },
    {
      component: NotFound,
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      meta: { titulo: 'Página não encontrada' },
    },
  ],
})

router.afterEach(destino => {
  document.title = destino.meta.titulo ? `${destino.meta.titulo} · IIoT Dashboard` : 'IIoT Dashboard'
})

export default router
