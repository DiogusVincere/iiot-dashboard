<template>
  <div class="maintenance-register">
    <h1>Registro de Manutenção</h1>
    <p v-if="emDemo('Contentful')" class="demo-note">
      Modo demonstração: os equipamentos são gravados e nada é enviado ao Contentful.
    </p>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="device">Equipamento:</label>
        <select 
          id="device" 
          v-model="selectedDeviceId" 
          @change="updateDeviceName"
          required
        >
          <option value="" disabled>Selecione um equipamento</option>
          <option 
            v-for="device in devices" 
            :key="device.sys.id" 
            :value="device.sys.id"
          >
            {{ device.fields.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Nome do Equipamento (automático):</label>
        <input 
          type="text" 
          :value="form.device" 
          readonly
          class="readonly-field"
        >
      </div>

      <div class="form-group">
        <label for="date">Data da Manutenção:</label>
        <input 
          type="datetime-local" 
          id="date" 
          v-model="form.dataManutencao" 
          required
        >
      </div>

      <div class="form-group">
        <label for="description">Descrição do Serviço:</label>
        <textarea 
          id="description" 
          v-model="form.descricao" 
          rows="5" 
          required
        ></textarea>
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Registrando...' : 'Registrar Manutenção' }}
      </button>
    </form>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Em modo demonstração as manutenções ficam só aqui, na memória desta aba. -->
    <section v-if="manutencoesDemo.length" class="demo-list">
      <h2>Manutenções registradas nesta sessão (demonstração)</h2>
      <ul>
        <li v-for="manutencao in manutencoesDemo" :key="manutencao.sys.id">
          <strong>{{ manutencao.fields.device['en-US'] }}</strong>
          — {{ new Date(manutencao.fields.dataManutencao['en-US']).toLocaleString() }}
          <p>{{ textoDaDescricao(manutencao) }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DeviceService } from '../services/device.service';
import { MaintenanceService } from '../services/maintenance.service';
import { emDemo, manutencoesDemo } from '../demo';
import type { Device } from '../models/device.model';
import type { Maintenance, MaintenanceFields } from '../models/maintenance.model';
import type { AxiosError } from 'axios';

const devices = ref<Device[]>([]);
const selectedDeviceId = ref('');
const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const form = ref<MaintenanceFields>({
  device: '', // Será preenchido automaticamente
  devices: [], // Será preenchido automaticamente
  dataManutencao: new Date().toISOString().slice(0, 16),
  descricao: ''
});

// Carrega a lista de dispositivos
onMounted(async () => {
  try {
    devices.value = await DeviceService.getAll();
    console.log('Dispositivos carregados:', devices.value);
  } catch (err) {
    errorMessage.value = 'Falha ao carregar dispositivos. Verifique o console para mais detalhes.';
    console.error('Erro detalhado:', err);
    
    if ((err as AxiosError)?.response?.status === 401) {
      console.error('Problema de autenticação. Verifique:');
      console.error('1. Se o token no .env está correto');
      console.error('2. Se as permissões do token estão corretas no Contentful');
    }
  }
});

// Atualiza o nome do dispositivo quando selecionado
const updateDeviceName = () => {
  console.log('Dispositivo selecionado:', selectedDeviceId.value);
  const selectedDevice = devices.value.find(d => d.sys.id === selectedDeviceId.value);
  if (selectedDevice) {
    form.value.device = selectedDevice.fields.name;
    form.value.devices = [selectedDevice.sys.id];
    console.log('Nome atribuído:', form.value.device);
  } else {
    console.warn('Dispositivo não encontrado');
  }
};

// Texto puro do campo rico `descricao` (um ou mais parágrafos).
const textoDaDescricao = (manutencao: Maintenance) =>
  manutencao.fields.descricao['en-US'].content
    .flatMap(paragrafo => paragrafo.content.map(trecho => trecho.value))
    .join(' ');

const handleSubmit = async () => {
  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    if (!selectedDeviceId.value) {
      throw new Error('Selecione um equipamento');
    }

    await MaintenanceService.create(form.value);

    successMessage.value = emDemo('Contentful')
      ? 'Modo demonstração: nada é enviado. A manutenção ficou só na lista abaixo, na memória desta aba.'
      : 'Manutenção registrada com sucesso!';
    // Reseta o formulário
    selectedDeviceId.value = '';
    form.value = {
      device: '',
      devices: [],
      dataManutencao: new Date().toISOString().slice(0, 16),
      descricao: ''
    };
  } catch (error) {
    errorMessage.value = 'Erro ao registrar manutenção';
    console.error('Erro no envio:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.maintenance-register {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  background-color: #fff;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
  background-color: #fff;
}

input[type="text"],
input[type="datetime-local"],
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  background-color: #fff;
}

/* ✅ Corrigido usando :deep para aplicar estilo às options */
:deep(select option) {
  color: #333;
  background-color: #fff;
}

.readonly-field {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #333;
}

textarea {
  min-height: 120px;
}

button {
  background-color: #42b983;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.success-message {
  color: green;
  margin-top: 20px;
  padding: 10px;
  background-color: #f0fff0;
  border-radius: 4px;
}

.error-message {
  color: red;
  margin-top: 20px;
  padding: 10px;
  background-color: #fff0f0;
  border-radius: 4px;
}

.demo-note {
  margin: 0 0 20px;
  padding: 8px 10px;
  font-size: 14px;
  color: #4a3200;
  background-color: #fff6d6;
  border-left: 4px solid #e6c766;
  border-radius: 4px;
}

.demo-list {
  margin-top: 30px;
}

.demo-list h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.demo-list ul {
  list-style: none;
  padding: 0;
}

.demo-list li {
  padding: 10px;
  margin-bottom: 8px;
  background-color: #f7f7f7;
  border-radius: 4px;
}

.demo-list li p {
  margin: 6px 0 0;
  white-space: pre-wrap;
}
</style>
