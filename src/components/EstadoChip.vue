<script setup lang="ts">
import { computed } from 'vue'
import { ROTULO_ESTADO, type Estado } from './faixas'

const props = defineProps<{ estado: Estado | null }>()

const classe = computed(() => {
  if (props.estado === null) return ''
  return props.estado === 'bom' ? 'chip-ok' : `chip-${props.estado}`
})
const texto = computed(() => (props.estado === null ? 'Sem dados' : ROTULO_ESTADO[props.estado]))
</script>

<template>
  <span class="chip" :class="classe">{{ texto }}</span>
</template>
