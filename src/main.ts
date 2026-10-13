import './assets/global.scss';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

console.log('Variáveis de ambiente disponíveis:', {
  ...import.meta.env,
  // Esconde valores reais dos tokens por segurança
  VITE_CONTENTFUL_CDN_TOKEN: import.meta.env.VITE_CONTENTFUL_CDN_TOKEN ? '***PRESENTE***' : 'FALTANDO',
  VITE_CONTENTFUL_API_TOKEN: import.meta.env.VITE_CONTENTFUL_API_TOKEN ? '***PRESENTE***' : 'FALTANDO',
  VITE_QUBITRO_API_TOKEN: import.meta.env.VITE_QUBITRO_API_TOKEN ? '***PRESENTE***' : 'FALTANDO'
});
