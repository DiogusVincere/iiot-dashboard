<script setup lang="ts">
/**
 * Cartão de gráfico de um sensor: título à esquerda, últimos valores à direita
 * e a linha do tempo com as opções unificadas de graficos.ts.
 */
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { dadosDoGrafico, opcoesDoGrafico, type EixosY, type RotulosTempo, type Serie } from './graficos'
import { numero } from './formato'

const props = defineProps<{
  titulo: string
  rotulos: RotulosTempo
  series: Serie[]
  eixos: EixosY
}>()

const dados = computed(() => dadosDoGrafico(props.rotulos.curtos, props.series))
const opcoes = computed(() => opcoesDoGrafico(props.rotulos, props.eixos, props.series))

const ultimos = computed(() =>
  props.series.map(serie => {
    const ultimo = serie.dados.length ? serie.dados[serie.dados.length - 1] : null
    const texto = ultimo === null ? '—' : numero(ultimo, serie.casas)
    return {
      rotulo: serie.rotulo,
      cor: serie.cor,
      texto: serie.unidade ? `${texto} ${serie.unidade}` : texto,
    }
  })
)
</script>

<template>
  <article class="cartao grafico-cartao">
    <header class="grafico-topo">
      <h3>{{ titulo }}</h3>
      <dl class="ultimos">
        <div v-for="ultimo in ultimos" :key="ultimo.rotulo" class="ultimo">
          <dt>
            <span class="ponto" :style="{ background: ultimo.cor }" aria-hidden="true"></span>
            <span class="visualmente-oculto">{{ ultimo.rotulo }}</span>
          </dt>
          <dd class="num">{{ ultimo.texto }}</dd>
        </div>
      </dl>
    </header>
    <div class="grafico">
      <Line :data="dados" :options="opcoes" />
    </div>
  </article>
</template>

<style scoped lang="scss">
.grafico-cartao {
  padding: 16px 16px 10px;
  min-width: 0;
}

.grafico-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;

  h3 {
    font-size: 17px;
  }
}

.ultimos {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px 14px;
}

.ultimo {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  dd {
    font-size: 14.5px;
    font-weight: 600;
    white-space: nowrap;
  }
}

.ponto {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.grafico {
  position: relative;
  height: 260px;
}
</style>
