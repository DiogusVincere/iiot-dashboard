<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router'

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
  <button @click="changePage">Página {{ buttonRouteLabel }}</button>
  <!-- <RouterLink to="/management"> Gerenciamento  </RouterLink> -->
  <RouterView />
</template>

<style scoped>

</style>
