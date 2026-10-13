import { ref } from 'vue'

/**
 * Hora da última carga de leituras bem-sucedida. A tela de monitoramento marca
 * e a barra superior (App.vue) mostra "Atualizado às HH:MM:SS".
 */
export const ultimaAtualizacao = ref<Date | null>(null)

export function marcarAtualizacao(): void {
  ultimaAtualizacao.value = new Date()
}
