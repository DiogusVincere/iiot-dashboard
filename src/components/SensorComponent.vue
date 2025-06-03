<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const dados = ref([])
const carregando = ref(true)
const erro = ref(null)

const page = 1
const limit = 50

onMounted(async () => {
  try {
    const resposta = await axios.get(
      'https://api.qubitro.com/v2/projects/61423240-e511-4e83-a8b5-70fd8458503a/devices/92a9c650-9b11-49b5-9fdc-4c3a540bc0c9/data',
      {
        headers: {
          Authorization: 'Bearer ***REMOVIDO***',
        },
        params: {
          limit,
          page,
          period: 'last7d'
        },
      }
    )

    console.log('Resposta recebida:', resposta.data)
    dados.value = resposta.data.data
  } catch (e) {
    console.error('Erro detalhado:', e.response ?? e)
    erro.value = `Erro ${e.response?.status || ''}: ` + (e.response?.data?.message || e.message)
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
          <li v-for="(valor, chave) in item" :key="chave" v-if="chave !== 'time'">
            {{ chave }}: {{ valor }}
          </li>
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
