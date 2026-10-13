<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { isAxiosError } from 'axios'
import { DeviceService } from '../services/device.service'
import { MaintenanceService } from '../services/maintenance.service'
import { emDemo } from '../demo'
import type { Device } from '../models/device.model'
import type { Maintenance, MaintenanceFields } from '../models/maintenance.model'
import { dataHora } from '../components/formato'
import DeviceComponent from '../components/DeviceComponent.vue'
import AddNewDeviceComponent from '../components/AddNewDeviceComponent.vue'

const devices = ref<Device[]>([])
const carregando = ref(true)
const erroCarga = ref('')

const enviando = ref(false)
const sucesso = ref('')
const erroEnvio = ref('')

/** Manutenções registradas nesta aba, da mais nova para a mais antiga. */
const registradas = ref<Maintenance[]>([])

const formulario = ref<InstanceType<typeof AddNewDeviceComponent> | null>(null)

const demo = computed(() => emDemo('Contentful'))
const ligados = computed(() => devices.value.filter(d => d.fields.state).length)

async function carregarEquipamentos() {
  carregando.value = true
  erroCarga.value = ''
  try {
    devices.value = await DeviceService.getAll()
  } catch (err) {
    erroCarga.value = 'Falha ao carregar os equipamentos. Veja o console para mais detalhes.'
    console.error('Erro detalhado:', err)
    if (isAxiosError(err) && err.response?.status === 401) {
      console.error('Problema de autenticação. Verifique:')
      console.error('1. Se o token no .env está correto')
      console.error('2. Se as permissões do token estão corretas no Contentful')
    }
  } finally {
    carregando.value = false
  }
}

onMounted(carregarEquipamentos)

async function registrar(campos: MaintenanceFields) {
  enviando.value = true
  sucesso.value = ''
  erroEnvio.value = ''
  try {
    const criada = await MaintenanceService.create(campos)
    registradas.value = [criada, ...registradas.value]
    sucesso.value = demo.value
      ? 'Manutenção registrada na linha do tempo. Modo demonstração: nada foi enviado.'
      : 'Manutenção registrada com sucesso!'
    formulario.value?.limpar()
  } catch (error) {
    erroEnvio.value = 'Erro ao registrar manutenção.'
    console.error('Erro no envio:', error)
  } finally {
    enviando.value = false
  }
}

// Texto puro do campo rico `descricao` (um ou mais parágrafos).
const textoDaDescricao = (manutencao: Maintenance) =>
  manutencao.fields.descricao['en-US'].content
    .flatMap(paragrafo => paragrafo.content.map(trecho => trecho.value))
    .join(' ')
</script>

<template>
  <div class="container pagina">
    <header class="cabecalho-pagina">
      <div>
        <h1 class="titulo-pagina">Manutenção</h1>
        <p class="lead">
          Equipamentos cadastrados e o registro das manutenções feitas neles. Cada registro vira uma
          entrada no Contentful ligada ao equipamento.
        </p>
      </div>
      <span v-if="devices.length" class="chip">{{ ligados }} de {{ devices.length }} ligados</span>
    </header>

    <section class="bloco" aria-labelledby="titulo-equipamentos">
      <h2 id="titulo-equipamentos" class="titulo-secao">Equipamentos</h2>

      <div v-if="carregando" class="grade-equipamentos" aria-busy="true" aria-label="Carregando equipamentos">
        <div v-for="n in 6" :key="n" class="cartao esqueleto-equipamento">
          <div class="esqueleto quadrado"></div>
          <div class="esqueleto-linhas">
            <div class="esqueleto linha"></div>
            <div class="esqueleto linha curta"></div>
          </div>
        </div>
      </div>

      <div v-else-if="erroCarga" class="cartao estado-vazio" role="alert">
        <span class="material-icons-round" aria-hidden="true">cloud_off</span>
        <h2>Não foi possível carregar os equipamentos</h2>
        <p class="lead">{{ erroCarga }}</p>
        <button class="botao botao-principal" type="button" @click="carregarEquipamentos">Tentar de novo</button>
      </div>

      <div v-else-if="!devices.length" class="cartao estado-vazio">
        <span class="material-icons-round" aria-hidden="true">memory</span>
        <h2>Nenhum equipamento cadastrado</h2>
        <p class="lead">Cadastre entradas do tipo <code>device</code> no Contentful para vê-las aqui.</p>
      </div>

      <div v-else class="grade-equipamentos">
        <DeviceComponent v-for="device in devices" :key="device.sys.id" :device="device" />
      </div>
    </section>

    <div class="colunas">
      <section class="cartao painel" aria-labelledby="titulo-nova">
        <header class="cartao-topo">
          <h2 id="titulo-nova">Nova manutenção</h2>
        </header>
        <AddNewDeviceComponent ref="formulario" :devices="devices" :enviando="enviando" :demo="demo" @registrar="registrar" />
        <p v-if="sucesso" class="mensagem mensagem-ok" role="status">
          <span class="material-icons-round" aria-hidden="true">check_circle</span>{{ sucesso }}
        </p>
        <p v-if="erroEnvio" class="mensagem mensagem-erro" role="alert">
          <span class="material-icons-round" aria-hidden="true">error_outline</span>{{ erroEnvio }}
        </p>
      </section>

      <section class="cartao painel" aria-labelledby="titulo-registradas">
        <header class="cartao-topo">
          <h2 id="titulo-registradas">Registradas nesta sessão</h2>
          <span class="chip">{{ registradas.length }}</span>
        </header>

        <p v-if="!registradas.length" class="lead vazio">
          Nenhuma manutenção registrada ainda. As que você registrar aparecem aqui, da mais recente
          para a mais antiga<template v-if="demo">, e somem ao recarregar a página</template>.
        </p>

        <ol v-else class="linha-tempo">
          <li v-for="manutencao in registradas" :key="manutencao.sys.id">
            <span class="marcador" aria-hidden="true"></span>
            <time class="quando num" :datetime="manutencao.fields.dataManutencao['en-US']">
              {{ dataHora(manutencao.fields.dataManutencao['en-US']) }}
            </time>
            <h3 class="quem">{{ manutencao.fields.device['en-US'] }}</h3>
            <p class="oque">{{ textoDaDescricao(manutencao) }}</p>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bloco {
  margin-bottom: 20px;
}

.titulo-secao {
  font-size: 17px;
  margin-bottom: 12px;
}

.grade-equipamentos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
  gap: 14px;
}

.esqueleto-equipamento {
  display: flex;
  gap: 14px;
  padding: 16px;

  .quadrado {
    flex: none;
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }

  .esqueleto-linhas {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 4px;
  }

  .linha {
    height: 12px;
    width: 70%;
  }

  .curta {
    width: 40%;
  }
}

.colunas {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 16px;
  align-items: start;
}

.painel {
  padding: 18px;
}

.mensagem {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 12px;
  border-radius: var(--raio-medio);
  font-size: 13px;

  .material-icons-round {
    font-size: 18px;
    flex: none;
  }
}

.mensagem-ok {
  color: var(--ok);
  background: rgba(158, 206, 106, 0.1);
  border: 1px solid rgba(158, 206, 106, 0.3);
}

.mensagem-erro {
  color: var(--alerta);
  background: rgba(247, 118, 142, 0.1);
  border: 1px solid rgba(247, 118, 142, 0.3);
}

.vazio {
  margin: 0;
}

code {
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--chip);
  font-size: 13px;
}

// Linha do tempo simples: traço à esquerda e um marcador por registro.
.linha-tempo {
  list-style: none;
  position: relative;
  padding-left: 22px;

  &::before {
    content: '';
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: 5px;
    width: 2px;
    background: var(--borda);
  }

  li {
    position: relative;
    padding-bottom: 18px;

    &:last-child {
      padding-bottom: 0;
    }
  }
}

.marcador {
  position: absolute;
  top: 5px;
  left: -22px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--acento);
  box-shadow: 0 0 0 3px var(--card);
}

.quando {
  display: block;
  font-size: 12px;
  color: var(--texto2);
}

.quem {
  font-size: 14.5px;
  font-weight: 600;
  margin: 2px 0 4px;
}

.oque {
  font-size: 13px;
  color: var(--texto2);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 820px) {
  .colunas {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
