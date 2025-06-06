<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchPlantData, PlantData } from '../services/api'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale)

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

function createChartData(plantNumber: number) {
  return {
    labels: dados.value.map(d => new Date(d.time).toLocaleTimeString()),
    datasets: [
      {
        label: `Plant ${plantNumber} HUM`,
        data: dados.value.map(d => d[`plant_${plantNumber}_HUM`]),
        borderColor: '#81C784',              
        backgroundColor: 'rgba(129, 199, 132, 0.3)',  
        tension: 0.4,
        fill: true
      },
      {
        label: `Plant ${plantNumber} TEMP`,
        data: dados.value.map(d => d[`plant_${plantNumber}_TEMP`]),
        borderColor: '#FF8A65',              
        backgroundColor: 'rgba(255, 138, 101, 0.3)', 
        tension: 0.4,
        fill: true
      }
    ]
  }
}

const tanqueChartData = computed(() => ({
  labels: dados.value.map(d => new Date(d.time).toLocaleTimeString()),
  datasets: [
    {
      label: 'Tanque PH',
      data: dados.value.map(d => d.tanque_PH),
      borderColor: '#64B5F6',               
      backgroundColor: 'rgba(100, 181, 246, 0.3)',
      tension: 0.4,
      fill: true
    },
    {
      label: 'Tanque TEMP',
      data: dados.value.map(d => d.tanque_TEMP),
      borderColor: '#FFB74D',               
      backgroundColor: 'rgba(255, 183, 77, 0.3)',
      tension: 0.4,
      fill: true
    }
  ]
}))

const chartOptions = (title: string) => ({
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: {
      display: true,
      text: title,
      font: { size: 18, weight: 'bold' }
    }
  }
})
</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <span class="material-icons icon">sensors</span>
      <h2>Monitoramento - Qubitro</h2>
    </header>

    <div v-if="carregando" class="loading">Carregando...</div>
    <div v-else-if="erro" class="error">{{ erro }}</div>
    <div v-else>
      <section class="charts-grid">
        <div class="chart-card" v-for="i in 4" :key="'plant-' + i">
          <Line :data="createChartData(i)" :options="chartOptions(`Planta ${i} - Umidade e Temperatura`)" />
        </div>
        <div class="chart-card">
          <Line :data="tanqueChartData" :options="chartOptions('Tanque - PH e Temperatura')" />
        </div>
      </section>

      <section class="cards-grid">
        <div v-for="(item, index) in dados.slice(-3).reverse()" :key="index" class="data-card">
          <h4>{{ new Date(item.time).toLocaleString() }}</h4>
          <ul>
            <li><strong>Plant 1</strong>: HUM {{ item.plant_1_HUM }} | TEMP {{ item.plant_1_TEMP }}</li>
            <li><strong>Plant 2</strong>: HUM {{ item.plant_2_HUM }} | TEMP {{ item.plant_2_TEMP }}</li>
            <li><strong>Plant 3</strong>: HUM {{ item.plant_3_HUM }} | TEMP {{ item.plant_3_TEMP }}</li>
            <li><strong>Plant 4</strong>: HUM {{ item.plant_4_HUM }} | TEMP {{ item.plant_4_TEMP }}</li>
            <li><strong>Tanque</strong>: PH {{ item.tanque_PH }} | TEMP {{ item.tanque_TEMP }}</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-container {
  padding: 2rem;
  background: linear-gradient(135deg, #121212, #1E1E1E); /* fundo escuro degradê */
  border-radius: 1rem;
  max-width: 1300px;
  margin: 2rem auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #eee; /* texto claro */
}

.dashboard-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  color: #90CAF9; /* azul claro */

  .icon {
    font-size: 2.5rem;
    margin-right: 0.5rem;
    color: #90CAF9;
  }

  h2 {
    font-weight: 600;
    font-size: 1.8rem;
  }
}

.loading,
.error {
  font-size: 1.2rem;
  color: #EF5350; /* vermelho claro para erros */
  text-align: center;
  margin-top: 4rem;
}

.charts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;

  .chart-card {
    background: #222;  /* fundo do card escuro */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
    border-radius: 12px;
    padding: 1rem;
    flex: 1 1 calc(33.333% - 1rem);
    min-width: 280px;
  }
}

.cards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;

  .data-card {
    background: #222;  /* fundo escuro */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.9);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    flex: 1 1 calc(33.333% - 1rem);
    min-width: 280px;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 8px 24px rgba(144, 202, 249, 0.6);
    }

    h4 {
      margin-bottom: 0.75rem;
      color: #64B5F6; /* azul claro */
      font-weight: 600;
    }

    ul {
      list-style: none;
      padding: 0;
      font-size: 0.95rem;
      color: #ccc; /* texto cinza claro */

      li {
        margin-bottom: 0.4rem;
      }
    }
  }
}
</style>
