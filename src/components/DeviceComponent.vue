<script setup lang="ts">
/** Cartão de um equipamento cadastrado no Contentful (ou nos dados de demonstração). */
import { computed } from 'vue'
import type { Device } from '../models/device.model'
import { iconeDoEquipamento } from './icones'

const props = defineProps<{ device: Device }>()

const icone = computed(() => iconeDoEquipamento(props.device.fields.icon))
const manutencoes = computed(() => props.device.fields.manutencao?.length ?? 0)
</script>

<template>
  <article class="cartao equipamento">
    <div class="equipamento-icone" aria-hidden="true">
      <span class="material-icons-round">{{ icone }}</span>
    </div>
    <div class="equipamento-corpo">
      <h3>{{ device.fields.name }}</h3>
      <div class="equipamento-meta">
        <span class="chip" :class="{ 'chip-ok': device.fields.state }">
          {{ device.fields.state ? 'Ligado' : 'Desligado' }}
        </span>
        <span class="pino num">GPIO {{ device.fields.pin }}</span>
        <span v-if="manutencoes" class="pino">
          {{ manutencoes }} {{ manutencoes === 1 ? 'manutenção' : 'manutenções' }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.equipamento {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  min-width: 0;
  transition: border-color 0.15s, transform 0.15s;

  &:hover {
    border-color: var(--borda-forte);
    transform: translateY(-1px);
  }
}

.equipamento-icone {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--chip);
  border: 1px solid var(--borda);
  color: var(--acento);

  .material-icons-round {
    font-size: 24px;
  }
}

.equipamento-corpo {
  min-width: 0;

  h3 {
    font-size: 14.5px;
    font-weight: 600;
    margin-bottom: 8px;
    overflow-wrap: anywhere;
  }
}

.equipamento-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
}

.pino {
  font-size: 13px;
  color: var(--texto2);
  white-space: nowrap;
}
</style>
