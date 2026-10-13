import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// BASE_PATH é o caminho base do build: '/' por padrão e '/iiot-dashboard/' no
// GitHub Pages (definido em .github/workflows/pages.yml). loadEnv lê a variável
// do ambiente ou de um .env sem depender dos tipos do Node (process.env).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'BASE_PATH')
  return {
    base: env.BASE_PATH || '/',
    plugins: [vue()],
  }
})
