/** Formatação em pt-BR: números com vírgula e horas no padrão 24 h. */

const formatadores = new Map<number, Intl.NumberFormat>()

function formatador(casas: number): Intl.NumberFormat {
  let f = formatadores.get(casas)
  if (!f) {
    f = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
    formatadores.set(casas, f)
  }
  return f
}

/** 66.123 → "66,1" */
export function numero(valor: number, casas = 1): string {
  return formatador(casas).format(valor)
}

/** Variação com sinal: +0,6 / −0,3 / 0,0 (sinal de menos tipográfico). */
export function comSinal(valor: number, casas = 1): string {
  if (Math.abs(valor) < Math.pow(10, -casas) / 2) return numero(0, casas)
  return (valor > 0 ? '+' : '−') + numero(Math.abs(valor), casas)
}

function paraData(data: Date | string): Date {
  return typeof data === 'string' ? new Date(data) : data
}

/** "14:08:26", ou "14:08" sem os segundos. */
export function hora(data: Date | string, comSegundos = true): string {
  const opcoes: Intl.DateTimeFormatOptions = comSegundos
    ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
    : { hour: '2-digit', minute: '2-digit' }
  return paraData(data).toLocaleTimeString('pt-BR', opcoes)
}

/** "13/10/2026 às 14:30" */
export function dataHora(data: Date | string): string {
  const d = paraData(data)
  return `${d.toLocaleDateString('pt-BR')} às ${hora(d, false)}`
}
