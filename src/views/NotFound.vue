<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="container pagina nao-encontrada">
    <section class="cartao caixa">
      <p class="codigo num" aria-hidden="true">404</p>
      <h1>Página não encontrada</h1>
      <p class="lead">O endereço não corresponde a nenhuma tela do painel.</p>
      <RouterLink to="/" class="botao botao-principal">
        <span class="material-icons-round" aria-hidden="true">arrow_back</span>
        Voltar ao monitoramento
      </RouterLink>
    </section>
  </div>
</template>

<style scoped lang="scss">
.nao-encontrada {
  display: grid;
  place-items: center;
  padding-top: 48px;
}

.caixa {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 460px;
  padding: 40px 28px;
  text-align: center;

  h1 {
    font-size: 26px;
  }

  .lead {
    margin: 0 0 12px;
  }
}

.codigo {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--acento);
  line-height: 1;
}

.botao:hover {
  text-decoration: none;
}
</style>
