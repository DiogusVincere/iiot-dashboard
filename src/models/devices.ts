/**
 * Modelo local de equipamento, anterior à integração com o Contentful. É o que
 * o repositório Pinia (src/stores/maintenanceRepository.ts) e o DeviceComponent
 * usam; a integração atual usa device.model.ts e maintenance.model.ts.
 */
export interface Maintenance {
  id?: string
  dataManutencao: string
  descricao: string
}

export interface Device {
  id: string
  name: string
  icon: string
  state: boolean
  pin: number
  manutencoes: Maintenance[]
}
