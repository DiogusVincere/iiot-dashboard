<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { isAxiosError } from 'axios'
import { fetchPlantData, type PlantData } from '../services/api'
import { marcarAtualizacao } from '../components/atualizacao'
import { CASAS, UNIDADE, estadoDe, type Grandeza, type Metrica } from '../components/faixas'
import { CORES, rotulosDeTempo, type EixosY, type Serie } from '../components/graficos'
import { hora } from '../components/formato'
import KpiCard from '../components/KpiCard.vue'
import SensorComponent from '../components/SensorComponent.vue'
import TabelaLeituras from '../components/TabelaLeituras.vue'

const dados = ref<PlantData[]>([])
const carregando = ref(true)
const erro = ref<string | null>(null)

function mensagemDeErro(e: unknown): string {
  if (isAxiosError(e)) {
    const status = e.response?.status
    const corpo = e.response?.data as { message?: string } | undefined
    const mensagem = corpo?.message ?? e.message
    return status ? `Erro ${status}: ${mensagem}` : mensagem
  }
  if (e instanceof Error) return e.message
  return 'Erro desconhecido'
}

async function carregar() {
  carregando.value = true
  erro.value = null
  try {
    dados.value = await fetchPlantData()
    marcarAtualizacao()
  } catch (e: unknown) {
    console.error('Erro detalhado:', e)
    erro.value = mensagemDeErro(e)
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

// ---------------------------------------------------------------------------
// Derivados das leituras
// ---------------------------------------------------------------------------

const PLANTAS = [1, 2, 3, 4]

// Chaves numéricas de PlantData (tudo menos `time`), para montar `plant_N_HUM` com tipo.
type ChaveNumerica = Exclude<keyof PlantData, 'time'>

const chave = (planta: number, campo: 'HUM' | 'TEMP') => `plant_${planta}_${campo}` as ChaveNumerica
const serie = (c: ChaveNumerica) => dados.value.map(d => d[c])

const ultima = computed(() => (dados.value.length ? dados.value[dados.value.length - 1] : null))
const anterior = computed(() => (dados.value.length > 1 ? dados.value[dados.value.length - 2] : null))

const rotulos = computed(() => rotulosDeTempo(dados.value.map(d => d.time)))

const periodo = computed(() => {
  if (!dados.value.length) return ''
  return `${hora(dados.value[0].time, false)} – ${hora(dados.value[dados.value.length - 1].time, false)}`
})

/** As 10 leituras mais recentes, da mais nova para a mais antiga. */
const ultimas = computed(() => dados.value.slice(-10).reverse())

function metrica(rotulo: string, grandeza: Grandeza, c: ChaveNumerica): Metrica {
  const valor = ultima.value ? ultima.value[c] : null
  return {
    rotulo,
    valor,
    anterior: anterior.value ? anterior.value[c] : null,
    unidade: UNIDADE[grandeza],
    casas: CASAS[grandeza],
    estado: valor === null ? null : estadoDe(grandeza, valor),
  }
}

const kpisPlantas = computed(() =>
  PLANTAS.map(n => ({
    titulo: `Planta ${n}`,
    metricas: [
      metrica('Umidade', 'umidade', chave(n, 'HUM')),
      metrica('Temperatura', 'temperatura', chave(n, 'TEMP')),
    ],
  }))
)

const kpiTanque = computed(() => ({
  titulo: 'Tanque',
  metricas: [metrica('pH', 'ph', 'tanque_PH'), metrica('Temperatura', 'temperatura', 'tanque_TEMP')],
}))

const EIXOS_PLANTA: EixosY = {
  esquerda: { unidade: '%', casas: 0 },
  direita: { unidade: '°C', casas: 0 },
}

const EIXOS_TANQUE: EixosY = {
  esquerda: { unidade: '', casas: 1 },
  direita: { unidade: '°C', casas: 0 },
}

const graficosPlantas = computed(() =>
  PLANTAS.map(n => {
    const series: Serie[] = [
      {
        rotulo: 'Umidade',
        dados: serie(chave(n, 'HUM')),
        cor: CORES.umidade,
        eixo: 'esquerda',
        unidade: '%',
        casas: 1,
        preenchida: true,
      },
      {
        rotulo: 'Temperatura',
        dados: serie(chave(n, 'TEMP')),
        cor: CORES.temperatura,
        eixo: 'direita',
        unidade: '°C',
        casas: 1,
      },
    ]
    return { titulo: `Planta ${n}`, series }
  })
)

const seriesTanque = computed((): Serie[] => [
  { rotulo: 'pH', dados: serie('tanque_PH'), cor: CORES.ph, eixo: 'esquerda', unidade: '', casas: 2 },
  {
    rotulo: 'Temperatura',
    dados: serie('tanque_TEMP'),
    cor: CORES.temperaturaTanque,
    eixo: 'direita',
    unidade: '°C',
    casas: 1,
  },
])
</script>

<template>
  <div class="container pagina">
    <header class="cabecalho-pagina">
      <div>
        <h1 class="titulo-pagina">Monitoramento</h1>
        <p class="lead">
          Umidade e temperatura das plantas 1 a 4 e pH e temperatura do tanque, nas últimas
          {{ dados.length || 75 }} leituras.
        </p>
      </div>
      <div class="acoes">
        <span v-if="periodo" class="periodo num">{{ periodo }}</span>
        <button class="botao" type="button" :disabled="carregando" @click="carregar">
          <span class="material-icons-round" aria-hidden="true">refresh</span>
          Atualizar
        </button>
      </div>
    </header>

    <!-- Carregando: esqueletos no lugar dos KPIs e dos gráficos. -->
    <template v-if="carregando">
      <section class="grade-kpi" aria-busy="true" aria-label="Carregando leituras">
        <div v-for="n in 5" :key="n" class="cartao esqueleto-kpi">
          <div class="esqueleto linha"></div>
          <div class="esqueleto bloco"></div>
        </div>
      </section>
      <section class="grade-graficos" aria-hidden="true">
        <div v-for="n in 5" :key="n" class="cartao esqueleto-grafico" :class="{ 'grafico-tanque': n === 5 }">
          <div class="esqueleto linha"></div>
          <div class="esqueleto area"></div>
        </div>
      </section>
    </template>

    <section v-else-if="erro" class="cartao estado-vazio" role="alert">
      <span class="material-icons-round" aria-hidden="true">cloud_off</span>
      <h2>Não foi possível carregar as leituras</h2>
      <p class="lead">{{ erro }}</p>
      <button class="botao botao-principal" type="button" @click="carregar">Tentar de novo</button>
    </section>

    <section v-else-if="!dados.length" class="cartao estado-vazio">
      <span class="material-icons-round" aria-hidden="true">sensors_off</span>
      <h2>Nenhuma leitura disponível</h2>
      <p class="lead">O dispositivo ainda não publicou dados ou a API não respondeu.</p>
      <button class="botao" type="button" @click="carregar">Tentar de novo</button>
    </section>

    <template v-else>
      <section class="grade-kpi" aria-label="Leituras atuais">
        <KpiCard v-for="kpi in kpisPlantas" :key="kpi.titulo" :titulo="kpi.titulo" :metricas="kpi.metricas" />
        <KpiCard :titulo="kpiTanque.titulo" :metricas="kpiTanque.metricas" />
      </section>

      <section class="grade-graficos" aria-label="Gráficos">
        <SensorComponent
          v-for="grafico in graficosPlantas"
          :key="grafico.titulo"
          :titulo="grafico.titulo"
          :series="grafico.series"
          :eixos="EIXOS_PLANTA"
          :rotulos="rotulos"
        />
        <SensorComponent
          class="grafico-tanque"
          titulo="Tanque"
          :series="seriesTanque"
          :eixos="EIXOS_TANQUE"
          :rotulos="rotulos"
        />
      </section>

      <section class="cartao secao-tabela" aria-labelledby="titulo-tabela">
        <header class="cartao-topo">
          <h2 id="titulo-tabela">Últimas leituras</h2>
          <span class="chip">{{ ultimas.length }} de {{ dados.length }}</span>
        </header>
        <TabelaLeituras :leituras="ultimas" />
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.acoes {
  display: flex;
  align-items: center;
  gap: 12px;
}

.periodo {
  font-size: 13px;
  color: var(--texto2);
  white-space: nowrap;
}

.grade-kpi {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.grade-graficos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.grafico-tanque {
  grid-column: 1 / -1;
}

.secao-tabela {
  padding: 16px;
}

// Esqueletos
.esqueleto-kpi {
  padding: 16px;

  .linha {
    width: 40%;
    height: 12px;
    margin-bottom: 18px;
  }

  .bloco {
    height: 54px;
  }
}

.esqueleto-grafico {
  padding: 16px;

  .linha {
    width: 30%;
    height: 14px;
    margin-bottom: 16px;
  }

  .area {
    height: 240px;
  }
}

@media (max-width: 1080px) {
  .grade-kpi {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .grade-graficos {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .grade-kpi {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .grade-kpi {
    grid-template-columns: minmax(0, 1fr);
  }

  .acoes {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
