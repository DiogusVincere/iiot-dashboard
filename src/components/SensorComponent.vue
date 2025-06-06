<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchPlantData, PlantData } from '../services/api' // ajuste o caminho conforme sua estrutura

const dados = ref<PlantData[]>([])
const carregando = ref(true)
const erro = ref<string | null>(null)

onMounted(async () => {
  try {
    dados.value = await fetchPlantData()
  } catch (e: any) {
    console.error('Erro detalhado:', e?.response ?? e)
    erro.value = `Erro ${e?.response?.status || ''}: ` + (e?.response?.data?.message || e.message)
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div>
    <h2>Dados do Dispositivo Qubitro</h2>

    <div v-if="carregando">Carregando...</div>
    <div v-else-if="erro">{{ erro }}</div>
    <div v-else>
      <div v-for="(item, index) in dados" :key="index" class="sensor-item">
        <p><strong>Data/Hora:</strong> {{ new Date(item.time).toLocaleString() }}</p>
        <ul>
          <li><strong>Plant 1</strong> - HUM: {{ item.plant_1_HUM }} | TEMP: {{ item.plant_1_TEMP }}</li>
          <li><strong>Plant 2</strong> - HUM: {{ item.plant_2_HUM }} | TEMP: {{ item.plant_2_TEMP }}</li>
          <li><strong>Plant 3</strong> - HUM: {{ item.plant_3_HUM }} | TEMP: {{ item.plant_3_TEMP }}</li>
          <li><strong>Plant 4</strong> - HUM: {{ item.plant_4_HUM }} | TEMP: {{ item.plant_4_TEMP }}</li>
          <li><strong>Tanque</strong> - PH: {{ item.tanque_PH }} | TEMP: {{ item.tanque_TEMP }}</li>
        </ul>
        <hr>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sensor-item {
  margin-bottom: 1rem;
}
</style>
