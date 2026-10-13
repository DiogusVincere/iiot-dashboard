<script setup lang="ts">
import { computed } from 'vue'
import { pior, type Metrica } from './faixas'
import { comSinal, numero } from './formato'
import EstadoChip from './EstadoChip.vue'

const props = defineProps<{ titulo: string; metricas: Metrica[] }>()

const estadoGeral = computed(() => pior(props.metricas.map(m => m.estado)))

const linhas = computed(() =>
  props.metricas.map(m => {
    const delta = m.valor !== null && m.anterior !== null ? m.valor - m.anterior : null
    const limiar = Math.pow(10, -m.casas) / 2
    const direcao = delta === null ? null : delta > limiar ? 'subiu' : delta < -limiar ? 'desceu' : 'igual'
    const icone = direcao === 'subiu' ? 'arrow_upward' : direcao === 'desceu' ? 'arrow_downward' : 'remove'
    const unidade = m.unidade ? ` ${m.unidade}` : ''
    return {
      ...m,
      texto: m.valor === null ? '—' : numero(m.valor, m.casas),
      delta,
      icone,
      deltaTexto: delta === null ? '—' : `${comSinal(delta, m.casas)}${unidade}`,
      deltaDescricao:
        delta === null
          ? 'Sem leitura anterior para comparar'
          : direcao === 'igual'
            ? 'Igual à leitura anterior'
            : `${direcao === 'subiu' ? 'Subiu' : 'Desceu'} ${numero(Math.abs(delta), m.casas)}${unidade} em relação à leitura anterior`,
    }
  })
)
</script>

<template>
  <article class="cartao kpi">
    <header class="kpi-topo">
      <h3>{{ titulo }}</h3>
      <EstadoChip :estado="estadoGeral" />
    </header>

    <div class="kpi-metricas">
      <div v-for="linha in linhas" :key="linha.rotulo" class="kpi-metrica">
        <div class="kpi-valor num">
          {{ linha.texto }}<span v-if="linha.unidade" class="kpi-unidade">{{ linha.unidade }}</span>
        </div>
        <div class="kpi-rotulo">
          <span class="ponto" :class="linha.estado ? `ponto-${linha.estado}` : ''" aria-hidden="true"></span>
          {{ linha.rotulo }}
        </div>
        <div class="kpi-delta num" :aria-label="linha.deltaDescricao" :title="linha.deltaDescricao">
          <span v-if="linha.delta !== null" class="material-icons-round" aria-hidden="true">{{ linha.icone }}</span>
          <span aria-hidden="true">{{ linha.deltaTexto }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.kpi {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  min-width: 0;
}

.kpi-topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  h3 {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--texto2);
  }
}

.kpi-metricas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.kpi-metrica {
  min-width: 0;
}

.kpi-valor {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  white-space: nowrap;
}

.kpi-unidade {
  margin-left: 3px;
  font-size: 13px;
  font-weight: 600;
  color: var(--texto2);
  letter-spacing: 0;
}

.kpi-rotulo {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 13px;
  color: var(--texto2);
}

.ponto {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--borda-forte);
  flex: none;

  &.ponto-bom {
    background: var(--ok);
  }

  &.ponto-atencao {
    background: var(--atencao);
  }

  &.ponto-alerta {
    background: var(--alerta);
  }
}

.kpi-delta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-top: 6px;
  font-size: 13px;
  color: var(--texto2);

  .material-icons-round {
    font-size: 15px;
  }
}
</style>
