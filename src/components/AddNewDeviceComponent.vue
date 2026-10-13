<script setup lang="ts">
/**
 * Formulário de nova manutenção (o nome do arquivo ficou pelo histórico do
 * projeto). Emite `registrar` com exatamente os campos que MaintenanceService
 * .create espera: nome do equipamento, lista com o id dele, data/hora e descrição.
 */
import { computed, ref } from 'vue'
import type { Device } from '../models/device.model'
import type { MaintenanceFields } from '../models/maintenance.model'

const props = defineProps<{
  devices: Device[]
  enviando: boolean
  demo: boolean
}>()

const emit = defineEmits<{
  registrar: [campos: MaintenanceFields]
}>()

/** Agora, no fuso local, no formato que o input datetime-local usa (AAAA-MM-DDTHH:MM). */
function agoraLocal(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const idSelecionado = ref('')
const dataManutencao = ref(agoraLocal())
const descricao = ref('')

const selecionado = computed(() => props.devices.find(d => d.sys.id === idSelecionado.value))

function enviar() {
  const equipamento = selecionado.value
  if (!equipamento) return
  emit('registrar', {
    device: equipamento.fields.name,
    devices: [equipamento.sys.id],
    dataManutencao: dataManutencao.value,
    descricao: descricao.value,
  })
}

/** Volta ao estado inicial; a tela chama depois de registrar com sucesso. */
function limpar() {
  idSelecionado.value = ''
  dataManutencao.value = agoraLocal()
  descricao.value = ''
}

defineExpose({ limpar })
</script>

<template>
  <form class="formulario" @submit.prevent="enviar">
    <div class="campo">
      <label for="equipamento">Equipamento</label>
      <select id="equipamento" v-model="idSelecionado" required :disabled="!devices.length">
        <option value="" disabled>Selecione um equipamento</option>
        <option v-for="device in devices" :key="device.sys.id" :value="device.sys.id">
          {{ device.fields.name }}
        </option>
      </select>
      <small v-if="selecionado" class="ajuda num">
        Será registrado para "{{ selecionado.fields.name }}" (GPIO {{ selecionado.fields.pin }}).
      </small>
    </div>

    <div class="campo">
      <label for="data">Data e hora da manutenção</label>
      <input id="data" v-model="dataManutencao" type="datetime-local" required />
    </div>

    <div class="campo">
      <label for="descricao">Descrição do serviço</label>
      <textarea
        id="descricao"
        v-model="descricao"
        rows="4"
        required
        placeholder="O que foi feito, peças trocadas, observações…"
      ></textarea>
    </div>

    <div class="rodape-formulario">
      <button class="botao botao-principal" type="submit" :disabled="enviando || !devices.length">
        <span class="material-icons-round" aria-hidden="true">{{ enviando ? 'hourglass_top' : 'add_task' }}</span>
        {{ enviando ? 'Registrando…' : 'Registrar manutenção' }}
      </button>
      <p v-if="demo" class="nota-demo">
        Modo demonstração: nada é enviado ao Contentful; a manutenção fica só nesta aba.
      </p>
    </div>
  </form>
</template>

<style scoped lang="scss">
.formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: var(--texto2);
  }
}

select,
input,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--borda);
  border-radius: var(--raio-medio);
  background: var(--fundo);
  color: var(--texto);
  font-size: 14.5px;
  line-height: 1.4;
  transition: border-color 0.12s, box-shadow 0.12s;

  &::placeholder {
    color: var(--texto2);
    opacity: 0.7;
  }

  &:hover:not(:disabled) {
    border-color: var(--borda-forte);
  }

  &:focus {
    outline: none;
    border-color: var(--acento);
    box-shadow: 0 0 0 3px rgba(122, 162, 247, 0.25);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

select {
  appearance: none;
  padding-right: 36px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239aa4b2' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

textarea {
  resize: vertical;
  min-height: 104px;
}

.ajuda {
  font-size: 12px;
  color: var(--texto2);
}

.rodape-formulario {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.nota-demo {
  font-size: 13px;
  color: var(--texto2);
}
</style>
