# IIoT Dashboard (Vue + Qubitro + Contentful)

Painel web em Vue 3 que mostra, em gráficos, as leituras dos sensores de uma plantação enviadas por um ESP32 ao Qubitro, e registra as manutenções dos equipamentos no Contentful.

## Funcionalidades

Lidas de `src/views`, `src/services` e `firmware/`:

- **Monitoramento (rota `/`)**: busca as últimas 75 leituras do dispositivo na API do Qubitro e desenha cinco gráficos de linha (Chart.js): umidade e temperatura das plantas 1 a 4 e pH e temperatura do tanque. Abaixo, cartões com as três leituras mais recentes. Aceita dois formatos de payload (`plant_X_HUM/TEMP` e `sensor_plantacao_X_HUM/PH`).
- **Registro de manutenção (rota `/manutencao`)**: lista os equipamentos cadastrados no Contentful (entradas do tipo `device`), formulário com equipamento, data/hora e descrição; cria uma entrada `maintenance` pela Management API e já a publica.
- **Modo demonstração**: com `VITE_DEMO=true`, ou quando falta o token de uma fonte, os serviços devolvem dados gravados em `src/demo/` (75 leituras e 6 equipamentos) e uma faixa no topo avisa "Dados de demonstração". Registrar manutenção só acrescenta a uma lista em memória e a tela diz que nada é enviado. É assim que a versão pública é publicada, sem nenhum token no JavaScript.
- Botão no topo alterna entre as duas páginas; qualquer outra rota cai numa página 404.
- **Firmware** (`firmware/`): sketches para ESP32 no Wokwi que leem um DHT22 e publicam temperatura e umidade por MQTT no broker do Qubitro a cada 5 segundos — é a origem dos dados do painel.

## De onde vêm os dados

| Fonte | Uso | Variável de ambiente |
|-------|-----|----------------------|
| Qubitro, `https://api.qubitro.com/v2` | leituras do dispositivo (`/projects/{id}/devices/{id}/data`) | `VITE_QUBITRO_API_TOKEN` |
| Contentful CDN, `https://cdn.contentful.com` | ler `device` e `maintenance` (só leitura) | `VITE_CONTENTFUL_CDN_TOKEN` |
| Contentful Management, `https://api.contentful.com` | criar e publicar `maintenance` | `VITE_CONTENTFUL_API_TOKEN` |
| `src/demo/` (gravado) | substitui as duas acima no modo demonstração | `VITE_DEMO=true` ou token ausente |

Modelo de conteúdo esperado no Contentful: `device` com `name`, `icon`, `state`, `pin` e `manutencao[]`; `maintenance` com `device`, `devices[]` (links), `dataManutencao` e `descricao` (texto rico).

Importante: em um app Vite, toda variável `VITE_*` vai parar no JavaScript entregue ao navegador. O token da Management API do Contentful (CFPAT) e o do Qubitro dão acesso de escrita e leitura às contas; por isso, com dados reais, este painel é para uso local ou em ambiente controlado, e esses tokens nunca devem ir para o repositório (o `.env` está no `.gitignore`). A versão pública usa só os dados gravados.

## Demonstração

**https://diogusvincere.github.io/iiot-dashboard/** — publicado pelo workflow `.github/workflows/pages.yml` a cada push na `main`; dados gravados, sem token. (A primeira publicação depende de ligar o Pages no repositório: Settings > Pages > Source: GitHub Actions.)

O que dá para ver: os cinco gráficos com 75 leituras (as datas são deslocadas para terminar no instante em que a página abre), os cartões das três últimas leituras e, em "Página Manutenção", seis equipamentos para escolher e o formulário — ao registrar, a manutenção aparece numa lista abaixo e a tela avisa que nada foi enviado.

Como funciona: `src/demo/index.ts` decide, por fonte, se usa os dados gravados (`VITE_DEMO=true` ou token ausente) e guarda em memória as manutenções registradas; `src/services/api.ts`, `device.service.ts` e `maintenance.service.ts` consultam essa decisão antes de falar com as APIs, e os clientes do Contentful só são carregados quando há tokens. Os JSON em `src/demo/` foram gerados por um script Python (senoides lentas com ruído, uma leitura a cada 5 s, no mesmo formato que as APIs devolvem); para trocar os dados basta editar os JSON mantendo as chaves. O build do Pages roda com `VITE_DEMO=true` e `BASE_PATH=/iiot-dashboard/` (caminho base do Vite, ver `vite.config.ts`).

Para rodar a demonstração localmente, basta não ter `.env` (ou definir `VITE_DEMO=true`):

```bash
npm install
npm run dev        # Windows PowerShell, forçando: $env:VITE_DEMO = "true"; npm run dev
```

<!-- prints: adicionar -->

## Estrutura

```
src/api/            client.ts (axios para CDN e Management do Contentful), endpoints.ts, types.ts
src/services/       api.ts (Qubitro), device.service.ts, maintenance.service.ts, services.config.ts
src/demo/           index.ts (modo demonstração), leituras.json (75 leituras), equipamentos.json (6 equipamentos)
src/views/          Sensor.vue (gráficos), Manutencao.vue (formulário), NotFound.vue
src/components/     SensorComponent, DeviceComponent, AddNewDeviceComponent
src/models/         tipos de device, maintenance e resposta da API
src/router/         rotas / e /manutencao
src/stores/         repositório Pinia de dispositivos
src/assets/         SCSS global, reset e variáveis
firmware/           firmware.ino e firmwareAluno.ino (ESP32 + DHT22, MQTT para o Qubitro)
docs/               exportações do Insomnia com as chamadas usadas no desenvolvimento
.github/workflows/  pages.yml: build com VITE_DEMO=true e publicação no GitHub Pages
.env.example        variáveis de ambiente documentadas
```

## Como rodar com dados reais

Pré-requisito: Node.js 18 ou mais novo (Vite 6) com npm.

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
```

Preencha o `.env`:

- `VITE_CONTENTFUL_SPACE_ID`, `VITE_CONTENTFUL_ENVIRONMENT` (normalmente `master`), `VITE_CONTENTFUL_CDN_TOKEN` e `VITE_CONTENTFUL_API_TOKEN`: painel do Contentful, Settings > API keys (o token de Management é o "Personal access token").
- `VITE_QUBITRO_API_TOKEN`: portal do Qubitro, API keys.
- Deixe `VITE_DEMO` sem valor (ou fora do arquivo). Se algum token faltar, só aquela fonte cai nos dados gravados, e a faixa no topo diz qual.
- No firmware, troque `TOKEN_DO_DISPOSITIVO_QUBITRO` pela credencial do dispositivo mostrada no Qubitro antes de gravar no ESP32.

```bash
npm run dev        # http://localhost:5173
npm run build      # vue-tsc + vite build, saída em dist/
npm run preview    # serve o build
```

## Licença

MIT — ver [LICENSE](LICENSE).
