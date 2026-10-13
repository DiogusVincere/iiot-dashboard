/**
 * Chart.js com a cara do painel: registro dos elementos, cores das séries e a
 * fábrica de dados/opções usada por todos os gráficos de linha (SensorComponent).
 */
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartDataset,
  type ChartOptions,
  type ScriptableContext,
  type TooltipItem,
} from 'chart.js'
import { hora, numero } from './formato'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)
ChartJS.defaults.font.family = 'Inter, "Segoe UI", system-ui, sans-serif'
ChartJS.defaults.font.size = 12
ChartJS.defaults.color = '#9aa4b2'

export const CORES = {
  umidade: '#4fd1c5',
  temperatura: '#f7768e',
  ph: '#7aa2f7',
  temperaturaTanque: '#e0af68',
} as const

const COR_GRADE = 'rgba(255, 255, 255, 0.06)'

/** Uma linha do gráfico. */
export interface Serie {
  rotulo: string
  dados: number[]
  cor: string
  eixo: 'esquerda' | 'direita'
  unidade: string
  casas: number
  /** Preenche a área abaixo da linha com um gradiente suave (só a umidade). */
  preenchida?: boolean
}

/** Formatação dos valores de um eixo Y. */
export interface Eixo {
  unidade: string
  casas: number
}

export interface EixosY {
  esquerda: Eixo
  /** Segundo eixo, à direita, quando as grandezas diferem (temperatura). */
  direita?: Eixo
}

/** Rótulos do eixo do tempo: HH:MM:SS para a dica, HH:MM para o eixo. */
export interface RotulosTempo {
  completos: string[]
  curtos: string[]
  /** Índices que recebem rótulo no eixo (no máximo `maximo`). */
  visiveis: Set<number>
}

/**
 * Escolhe quais leituras ganham rótulo no eixo X. As leituras chegam a cada
 * 5 s, então 75 delas cabem em uns 6 minutos: o rótulo HH:MM se repetiria. Em
 * vez de deixar o Chart.js pular rótulos iguais, marca-se a primeira leitura
 * de cada minuto e, se ainda passar do máximo, pula-se minutos em passo fixo.
 */
export function rotulosDeTempo(tempos: string[], maximo = 8): RotulosTempo {
  const datas = tempos.map(t => new Date(t))
  const completos = datas.map(d => hora(d))
  const curtos = datas.map(d => hora(d, false))
  const primeiros: number[] = []
  curtos.forEach((rotulo, i) => {
    if (i === 0 || rotulo !== curtos[i - 1]) primeiros.push(i)
  })
  const passo = Math.max(1, Math.ceil(primeiros.length / maximo))
  const visiveis = new Set(primeiros.filter((_, i) => i % passo === 0))
  return { completos, curtos, visiveis }
}

function comAlfa(hex: string, alfa: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alfa})`
}

/** Gradiente vertical da cor da série até transparente, refeito a cada redimensionamento. */
function gradiente(cor: string) {
  return (contexto: ScriptableContext<'line'>): CanvasGradient | string => {
    const { ctx, chartArea } = contexto.chart
    if (!chartArea) return comAlfa(cor, 0.12)
    const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
    g.addColorStop(0, comAlfa(cor, 0.28))
    g.addColorStop(1, comAlfa(cor, 0))
    return g
  }
}

function comUnidade(valor: number, eixo: Eixo): string {
  const texto = numero(valor, eixo.casas)
  return eixo.unidade ? `${texto} ${eixo.unidade}` : texto
}

export function dadosDoGrafico(rotulos: string[], series: Serie[]): ChartData<'line'> {
  const datasets = series.map((serie): ChartDataset<'line'> => ({
    label: serie.rotulo,
    data: serie.dados,
    borderColor: serie.cor,
    backgroundColor: serie.preenchida ? gradiente(serie.cor) : serie.cor,
    pointBackgroundColor: serie.cor,
    pointBorderColor: serie.cor,
    yAxisID: serie.eixo === 'esquerda' ? 'yEsquerda' : 'yDireita',
    fill: serie.preenchida ? 'origin' : false,
    tension: 0.35,
    pointRadius: 0,
    pointHoverRadius: 4,
    borderWidth: 2,
    spanGaps: true,
  }))
  return { labels: rotulos, datasets }
}

function escalaY(eixo: Eixo, posicao: 'left' | 'right', comGrade: boolean) {
  return {
    type: 'linear' as const,
    position: posicao,
    grid: { color: COR_GRADE, drawOnChartArea: comGrade },
    border: { display: false },
    ticks: {
      maxTicksLimit: 6,
      padding: 6,
      callback: (valor: number | string) => comUnidade(Number(valor), eixo),
    },
  }
}

type Escalas = NonNullable<ChartOptions<'line'>['scales']>

export function opcoesDoGrafico(rotulos: RotulosTempo, eixos: EixosY, series: Serie[]): ChartOptions<'line'> {
  const formatoPorSerie = series.map(s => ({ unidade: s.unidade, casas: s.casas }))

  const scales: Escalas = {
    x: {
      type: 'category',
      grid: { display: false },
      border: { display: false },
      ticks: {
        autoSkip: false,
        maxRotation: 0,
        padding: 6,
        callback: (_valor: number | string, indice: number) =>
          rotulos.visiveis.has(indice) ? rotulos.curtos[indice] : null,
      },
    },
    yEsquerda: escalaY(eixos.esquerda, 'left', true),
  }
  if (eixos.direita) scales.yDireita = escalaY(eixos.direita, 'right', false)

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
          color: '#9aa4b2',
          font: { size: 12 },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1d2331',
        borderColor: '#262c3a',
        borderWidth: 1,
        titleColor: '#e6edf3',
        bodyColor: '#9aa4b2',
        padding: 10,
        cornerRadius: 10,
        usePointStyle: true,
        boxPadding: 4,
        callbacks: {
          title: (itens: TooltipItem<'line'>[]) =>
            itens.length ? rotulos.completos[itens[0].dataIndex] : '',
          label: (item: TooltipItem<'line'>) => {
            const formato = formatoPorSerie[item.datasetIndex]
            const valor = item.parsed.y
            const texto = Number.isFinite(valor) ? comUnidade(valor, formato) : '—'
            return ` ${item.dataset.label ?? ''}: ${texto}`
          },
        },
      },
    },
    scales,
  }
}
