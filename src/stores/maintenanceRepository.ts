import { defineStore } from 'pinia'
import type { Device, Maintenance } from '../models/devices'

export type Repository = {
  devices: Device[]
}

export const useDeviceRepository = defineStore('device-repository', {
  state: (): Repository => ({
    devices: []
  }),
  actions: {
    // Adicionar dispositivo
    addDevice(newDevice: Device) {
      const deepCopy = JSON.parse(JSON.stringify(newDevice))
      this.devices.push(deepCopy)
    },

    // Remover dispositivo
    removeDevice(index: number) {
      if (index >= 0) {
        this.devices.splice(index, 1)
      }
    },

    // Adicionar manutenção a um dispositivo
    addMaintenanceToDevice(deviceId: string, newMaintenance: Maintenance) {
      const device = this.devices.find(d => d.id === deviceId)
      if (device) {
        const deepCopy = JSON.parse(JSON.stringify(newMaintenance))
        device.manutencoes.push(deepCopy)
      }
    },

    // Remover manutenção de um dispositivo
    removeMaintenanceFromDevice(deviceId: string, maintenanceIndex: number) {
      const device = this.devices.find(d => d.id === deviceId)
      if (device && maintenanceIndex >= 0 && maintenanceIndex < device.manutencoes.length) {
        device.manutencoes.splice(maintenanceIndex, 1)
      }
    }
  },

  getters: {
    getDeviceById: (state) => (id: string) => {
      return state.devices.find(d => d.id === id)
    },
    getAllMaintenances: (state) => {
      return state.devices.flatMap(d => d.manutencoes)
    }
  }
})
