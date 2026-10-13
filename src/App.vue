<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { fontesDemo } from './demo'
import { ultimaAtualizacao } from './components/atualizacao'
import { hora } from './components/formato'

// Alguma fonte está servindo dados gravados (src/demo)? Então o pill fica âmbar.
const demo = computed(() => fontesDemo.value.length > 0)
const detalheDemo = computed(
  () => `${fontesDemo.value.join(' e ')} com dados gravados; nada é enviado às APIs.`
)
const atualizado = computed(() => (ultimaAtualizacao.value ? hora(ultimaAtualizacao.value) : ''))
</script>

<template>
  <a class="pular" href="#conteudo">Ir para o conteúdo</a>

  <header class="topo">
    <div class="container topo-linha">
      <RouterLink to="/" class="marca">
        <span class="marca-logo" aria-hidden="true">
          <span class="material-icons-round">sensors</span>
        </span>
        <span class="marca-texto">
          <strong>IIoT Dashboard</strong>
          <small>Monitoramento de plantas e tanque</small>
        </span>
      </RouterLink>

      <nav class="navegacao" aria-label="Principal">
        <RouterLink to="/">Monitoramento</RouterLink>
        <RouterLink to="/manutencao">Manutenção</RouterLink>
      </nav>

      <div class="status">
        <span
          class="chip"
          :class="demo ? 'chip-atencao' : 'chip-ok'"
          role="status"
          :title="demo ? detalheDemo : 'Lendo as APIs do Qubitro e do Contentful'"
        >
          <span class="ponto-status" :class="{ pulsa: !demo }" aria-hidden="true"></span>
          <span class="so-largo">{{ demo ? 'Dados de demonstração' : 'Ao vivo' }}</span>
          <span class="so-estreito">{{ demo ? 'Demonstração' : 'Ao vivo' }}</span>
        </span>
        <span v-if="atualizado" class="atualizado num" :title="`Atualizado às ${atualizado}`">
          <span class="so-largo">Atualizado às </span>{{ atualizado }}
        </span>
      </div>
    </div>
  </header>

  <main id="conteudo" class="conteudo">
    <RouterView />
  </main>

  <footer class="rodape">
    <div class="container rodape-linha">
      <span>IIoT Dashboard · Vue 3, Chart.js, Qubitro e Contentful</span>
      <a href="https://github.com/DiogusVincere/iiot-dashboard" target="_blank" rel="noopener">Código no GitHub</a>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.pular {
  position: absolute;
  top: -100px;
  left: 20px;
  z-index: 20;
  padding: 8px 12px;
  border-radius: var(--raio-medio);
  background: var(--acento);
  color: var(--sobre-acento);
  font-weight: 600;

  &:focus {
    top: 8px;
  }
}

.topo {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(15, 17, 23, 0.82);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--borda);
}

.topo-linha {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 20px;
  min-height: 64px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.marca {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--texto);
  border-radius: var(--raio-medio);

  &:hover {
    text-decoration: none;
  }
}

.marca-logo {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--acento);
  color: var(--sobre-acento);

  .material-icons-round {
    font-size: 22px;
  }
}

.marca-texto {
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  strong {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  small {
    font-size: 12px;
    color: var(--texto2);
  }
}

.navegacao {
  display: flex;
  gap: 4px;
  justify-content: center;

  a {
    padding: 6px 12px;
    border-radius: 999px;
    color: var(--texto2);
    font-size: 14px;
    font-weight: 600;
    transition: color 0.12s, background 0.12s;

    &:hover {
      color: var(--texto);
      text-decoration: none;
    }

    &.router-link-active {
      color: var(--texto);
      background: var(--chip);
      box-shadow: inset 0 0 0 1px var(--borda);
    }
  }
}

.status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 6px 12px;
}

.ponto-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;

  &.pulsa {
    animation: pulsa 2s ease-in-out infinite;
  }
}

@keyframes pulsa {
  50% {
    opacity: 0.35;
  }
}

.atualizado {
  font-size: 13px;
  color: var(--texto2);
  white-space: nowrap;
}

.so-estreito {
  display: none;
}

.conteudo {
  flex: 1;
}

.rodape {
  border-top: 1px solid var(--borda);
  padding: 18px 0 24px;
  color: var(--texto2);
  font-size: 13px;

  a {
    color: var(--texto2);

    &:hover {
      color: var(--texto);
    }
  }
}

.rodape-linha {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 16px;
}

// Telas estreitas: marca e pill na primeira linha, navegação e hora na segunda.
@media (max-width: 820px) {
  .topo-linha {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'marca pill'
      'nav hora';
    gap: 6px 12px;
    min-height: 0;
    padding-top: 8px;
    padding-bottom: 6px;
  }

  .marca {
    grid-area: marca;
  }

  .navegacao {
    grid-area: nav;
    justify-content: flex-start;
    margin-left: -8px;
  }

  .status {
    display: contents;
  }

  .status .chip {
    grid-area: pill;
    justify-self: end;
  }

  .atualizado {
    grid-area: hora;
    align-self: center;
    justify-self: end;
    font-size: 12px;
  }
}

@media (max-width: 560px) {
  .marca-texto small {
    display: none;
  }
}

@media (max-width: 480px) {
  .so-largo {
    display: none;
  }

  .so-estreito {
    display: inline;
  }
}
</style>
