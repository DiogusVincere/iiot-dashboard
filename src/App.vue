<script setup lang="ts">
import { computed } from 'vue';
import { RouterView, useRouter } from 'vue-router'
import { fontesDemo } from './demo'

const router = useRouter();

const buttonRouteLabel = computed(()=>
 router.currentRoute.value.name === 'sensor'?
 'Sensores' : 'Manutenção')

const changePage = ()=> {
  router.currentRoute.value.name === 'sensor'?
    router.push('/manutencao') :
    router.push('/')
}

</script>

<template>
  <!-- Faixa discreta quando alguma fonte está servindo dados gravados (src/demo). -->
  <div v-if="fontesDemo.length" class="faixa-demo" role="status">
    Dados de demonstração — {{ fontesDemo.join(' e ') }} com dados gravados; nada é enviado.
  </div>
  <button @click="changePage">Página {{ buttonRouteLabel }}</button>
  <!-- <RouterLink to="/management"> Gerenciamento  </RouterLink> -->
  <RouterView />
</template>

<style scoped>
.faixa-demo {
  padding: 0.35rem 1rem;
  font-size: 0.85rem;
  text-align: center;
  color: #4a3200;
  background-color: #ffe9a8;
  border-bottom: 1px solid #e6c766;
}
</style>
