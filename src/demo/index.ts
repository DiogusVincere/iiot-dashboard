/**
 * Modo demonstração: dados gravados no lugar do Qubitro e do Contentful.
 *
 * Entra em ação quando VITE_DEMO=true (é assim que o build do GitHub Pages é
 * feito, ver .github/workflows/pages.yml) ou quando falta o token da fonte.
 * Assim o painel público funciona sem nenhum token no JavaScript e nada é
 * enviado para fora: as manutenções registradas ficam só na memória desta aba.
 *
 * Os JSON foram gerados por script (senoides com ruído, uma leitura a cada 5 s,
 * como o firmware publica) e têm o mesmo formato que as APIs devolvem.
 */
import { ref } from 'vue'
import type { RawApiData } from '../services/api'
import type { Device } from '../models/device.model'
import type { Maintenance, MaintenanceFields } from '../models/maintenance.model'
import leiturasGravadas from './leituras.json'
import equipamentosGravados from './equipamentos.json'

export type FonteDemo = 'Qubitro' | 'Contentful'

/** VITE_DEMO=true força a demonstração mesmo com tokens no .env. */
export const demoForcado = import.meta.env.VITE_DEMO === 'true'

/** Fontes que estão servindo dados gravados; alimenta a faixa no topo da tela (App.vue). */
export const fontesDemo = ref<FonteDemo[]>(demoForcado ? ['Qubitro', 'Contentful'] : [])

/**
 * Decide se a fonte usa os dados gravados: sim quando a demonstração foi forçada
 * ou quando algum dos tokens dela não foi informado. Registra a fonte na faixa.
 */
export function usarDemo(fonte: FonteDemo, ...tokens: Array<string | undefined>): boolean {
  if (!demoForcado && tokens.every(token => Boolean(token))) return false
  if (!fontesDemo.value.includes(fonte)) fontesDemo.value = [...fontesDemo.value, fonte]
  return true
}

/** A fonte já está em modo demonstração? */
export function emDemo(fonte: FonteDemo): boolean {
  return fontesDemo.value.includes(fonte)
}

/**
 * As leituras gravadas, deslocadas no tempo para a última cair agora. O
 * espaçamento original (5 s) é mantido, então o gráfico sempre parece recente.
 */
export function leiturasDemo(): RawApiData[] {
  const leituras = leiturasGravadas as RawApiData[]
  const ultima = leituras.length ? Date.parse(leituras[leituras.length - 1].time) : NaN
  const agora = Date.now()
  return leituras.map(leitura => {
    const original = Date.parse(leitura.time)
    const deslocado =
      Number.isNaN(original) || Number.isNaN(ultima) ? agora : agora - (ultima - original)
    return { ...leitura, time: new Date(deslocado).toISOString() }
  })
}

/** Equipamentos no formato das entradas `device` da CDN do Contentful. */
export function equipamentosDemo(): Device[] {
  return (equipamentosGravados as Device[]).map(equipamento => ({ ...equipamento }))
}

/** Manutenções registradas nesta sessão: só na memória, somem ao recarregar a página. */
export const manutencoesDemo = ref<Maintenance[]>([])

/** Monta a entrada `maintenance` como a Management API devolveria e a guarda na lista. */
export function registrarManutencaoDemo(campos: MaintenanceFields): Maintenance {
  const agora = new Date().toISOString()
  const entrada: Maintenance = {
    sys: {
      id: `demo-${Date.now().toString(36)}`,
      type: 'Entry',
      createdAt: agora,
      updatedAt: agora,
      contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'maintenance' } },
    },
    fields: {
      device: { 'en-US': campos.device },
      devices: {
        'en-US': campos.devices.map(id => ({
          sys: { type: 'Link' as const, linkType: 'Entry' as const, id },
        })),
      },
      dataManutencao: { 'en-US': campos.dataManutencao },
      descricao: {
        'en-US': {
          nodeType: 'document',
          data: {},
          content: [
            {
              nodeType: 'paragraph',
              data: {},
              content: [{ nodeType: 'text', value: campos.descricao, marks: [], data: {} }],
            },
          ],
        },
      },
    },
  }
  manutencoesDemo.value = [entrada, ...manutencoesDemo.value]
  return entrada
}
