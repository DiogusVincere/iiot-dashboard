/**
 * Faixas de operação das grandezas medidas e o estado que cada valor recebe.
 * `bom` é a faixa ideal; `atencao` é a faixa tolerável em volta dela; fora das
 * duas é `alerta`. Os limites são inclusivos.
 */

export type Estado = 'bom' | 'atencao' | 'alerta'
export type Grandeza = 'umidade' | 'temperatura' | 'ph'

interface Faixa {
  bom: [number, number]
  atencao: [number, number]
}

export const FAIXAS: Record<Grandeza, Faixa> = {
  umidade: { bom: [40, 70], atencao: [30, 80] },
  temperatura: { bom: [18, 30], atencao: [15, 34] },
  ph: { bom: [6, 7.5], atencao: [5.5, 8] },
}

export const UNIDADE: Record<Grandeza, string> = { umidade: '%', temperatura: '°C', ph: '' }
export const CASAS: Record<Grandeza, number> = { umidade: 1, temperatura: 1, ph: 2 }

export const ROTULO_ESTADO: Record<Estado, string> = { bom: 'Bom', atencao: 'Atenção', alerta: 'Alerta' }

const PESO: Record<Estado, number> = { bom: 0, atencao: 1, alerta: 2 }

export function estadoDe(grandeza: Grandeza, valor: number): Estado {
  const faixa = FAIXAS[grandeza]
  if (valor >= faixa.bom[0] && valor <= faixa.bom[1]) return 'bom'
  if (valor >= faixa.atencao[0] && valor <= faixa.atencao[1]) return 'atencao'
  return 'alerta'
}

/** O pior entre vários estados (alerta > atenção > bom); `null` é ignorado. */
export function pior(estados: Array<Estado | null>): Estado | null {
  let resultado: Estado | null = null
  for (const estado of estados) {
    if (estado && (resultado === null || PESO[estado] > PESO[resultado])) resultado = estado
  }
  return resultado
}

/** Uma grandeza mostrada num cartão de KPI. */
export interface Metrica {
  rotulo: string
  valor: number | null
  anterior: number | null
  unidade: string
  casas: number
  estado: Estado | null
}
