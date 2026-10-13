# IIoT Dashboard (Vue + Qubitro + Contentful)

Painel web em Vue 3 que mostra, em gráficos, as leituras dos sensores de uma plantação enviadas por um ESP32 ao Qubitro, e registra as manutenções dos equipamentos no Contentful.

## Funcionalidades

Lidas de `src/views`, `src/services` e `firmware/`:

- **Monitoramento (rota `/`)**: busca as últimas 75 leituras do dispositivo na API do Qubitro e desenha cinco gráficos de linha (Chart.js): umidade e temperatura das plantas 1 a 4 e pH e temperatura do tanque. Abaixo, cartões com as três leituras mais recentes. Aceita dois formatos de payload (`plant_X_HUM/TEMP` e `sensor_plantacao_X_HUM/PH`).
- **Registro de manutenção (rota `/manutencao`)**: lista os equipamentos cadastrados no Contentful (entradas do tipo `device`), formulário com equipamento, data/hora e descrição; cria uma entrada `maintenance` pela Management API e já a publica.
- Botão no topo alterna entre as duas páginas; qualquer outra rota cai numa página 404.
- **Firmware** (`firmware/`): sketches para ESP32 no Wokwi que leem um DHT22 e publicam temperatura e umidade por MQTT no broker do Qubitro a cada 5 segundos — é a origem dos dados do painel.

## De onde vêm os dados

| Fonte | Uso | Variável de ambiente |
|-------|-----|----------------------|
| Qubitro, `https://api.qubitro.com/v2` | leituras do dispositivo (`/projects/{id}/devices/{id}/data`) | `VITE_QUBITRO_API_TOKEN` |
| Contentful CDN, `https://cdn.contentful.com` | ler `device` e `maintenance` (só leitura) | `VITE_CONTENTFUL_CDN_TOKEN` |
| Contentful Management, `https://api.contentful.com` | criar e publicar `maintenance` | `VITE_CONTENTFUL_API_TOKEN` |

Modelo de conteúdo esperado no Contentful: `device` com `name`, `icon`, `state`, `pin` e `manutencao[]`; `maintenance` com `device`, `devices[]` (links), `dataManutencao` e `descricao` (texto rico).

Importante: em um app Vite, toda variável `VITE_*` vai parar no JavaScript entregue ao navegador. O token da Management API do Contentful (CFPAT) e o do Qubitro dão acesso de escrita e leitura às contas; por isso este painel é para uso local ou em ambiente controlado, e esses tokens nunca devem ir para o repositório (o `.env` está no `.gitignore`).

## Estrutura

```
src/api/            client.ts (axios para CDN e Management do Contentful), endpoints.ts, types.ts
src/services/       api.ts (Qubitro), device.service.ts, maintenance.service.ts, services.config.ts
src/views/          Sensor.vue (gráficos), Manutencao.vue (formulário), NotFound.vue
src/components/     SensorComponent, DeviceComponent, AddNewDeviceComponent
src/models/         tipos de device, maintenance e resposta da API
src/router/         rotas / e /manutencao
src/stores/         repositório Pinia de dispositivos
src/assets/         SCSS global, reset e variáveis
firmware/           firmware.ino e firmwareAluno.ino (ESP32 + DHT22, MQTT para o Qubitro)
docs/               exportações do Insomnia com as chamadas usadas no desenvolvimento
.env.example        variáveis de ambiente documentadas
```

## Como rodar

Pré-requisito: Node.js 18 ou mais novo (Vite 6) com npm.

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
```

Preencha o `.env`:

- `VITE_CONTENTFUL_SPACE_ID`, `VITE_CONTENTFUL_ENVIRONMENT` (normalmente `master`), `VITE_CONTENTFUL_CDN_TOKEN` e `VITE_CONTENTFUL_API_TOKEN`: painel do Contentful, Settings > API keys (o token de Management é o "Personal access token").
- `VITE_QUBITRO_API_TOKEN`: portal do Qubitro, API keys.
- No firmware, troque `TOKEN_DO_DISPOSITIVO_QUBITRO` pela credencial do dispositivo mostrada no Qubitro antes de gravar no ESP32.

```bash
npm run dev        # http://localhost:5173
npm run build      # vue-tsc + vite build, saída em dist/
npm run preview    # serve o build
```

## Demonstração

<!-- prints: adicionar -->

## Licença

MIT — ver [LICENSE](LICENSE).
