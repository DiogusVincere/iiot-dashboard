<script setup lang="ts">
import type { PlantData } from '../services/api'
import { hora, numero } from './formato'

defineProps<{ leituras: PlantData[] }>()

const PLANTAS = [1, 2, 3, 4] as const

type ChaveNumerica = Exclude<keyof PlantData, 'time'>

function valor(leitura: PlantData, planta: number, campo: 'HUM' | 'TEMP'): number {
  return leitura[`plant_${planta}_${campo}` as ChaveNumerica]
}
</script>

<template>
  <div class="rolagem">
    <table class="tabela num">
      <thead>
        <tr>
          <th scope="col">Hora</th>
          <th v-for="n in PLANTAS" :key="n" scope="col">
            Planta {{ n }}
            <small>umidade · temperatura</small>
          </th>
          <th scope="col">
            Tanque
            <small>pH · temperatura</small>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(leitura, i) in leituras" :key="leitura.time + i">
          <td class="hora">{{ hora(leitura.time) }}</td>
          <td v-for="n in PLANTAS" :key="n">
            <span class="umidade">{{ numero(valor(leitura, n, 'HUM'), 1) }} %</span>
            <span class="separador" aria-hidden="true">·</span>
            <span class="temperatura">{{ numero(valor(leitura, n, 'TEMP'), 1) }} °C</span>
          </td>
          <td>
            <span class="ph">pH {{ numero(leitura.tanque_PH, 2) }}</span>
            <span class="separador" aria-hidden="true">·</span>
            <span class="temperatura-tanque">{{ numero(leitura.tanque_TEMP, 1) }} °C</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.rolagem {
  overflow-x: auto;
  margin: 0 -16px;
  padding: 0 16px;
  -webkit-overflow-scrolling: touch;
}

.tabela {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 8px 10px;
    text-align: left;
    white-space: nowrap;
  }

  th {
    font-size: 12px;
    font-weight: 600;
    color: var(--texto2);
    border-bottom: 1px solid var(--borda);
    vertical-align: bottom;

    small {
      display: block;
      font-size: 11px;
      font-weight: 500;
      color: var(--texto2);
      opacity: 0.8;
    }
  }

  tbody tr {
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  }

  tbody tr:nth-child(even) {
    background: rgba(255, 255, 255, 0.02);
  }

  tbody tr:hover {
    background: rgba(122, 162, 247, 0.06);
  }

  tbody tr:first-child td {
    color: var(--texto);
    font-weight: 600;
  }
}

.hora {
  color: var(--texto);
}

.separador {
  margin: 0 6px;
  color: var(--borda-forte);
}

.umidade {
  color: var(--acento2);
}

.temperatura {
  color: var(--alerta);
}

.ph {
  color: var(--acento);
}

.temperatura-tanque {
  color: var(--atencao);
}
</style>
