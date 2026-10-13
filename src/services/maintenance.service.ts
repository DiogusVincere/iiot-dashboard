import { CONTENTFUL_ENDPOINTS } from '../api/endpoints';
import type { Maintenance, MaintenanceFields } from '../models/maintenance.model';
import type { AxiosError } from 'axios';
import { manutencoesDemo, registrarManutencaoDemo, usarDemo } from '../demo';

// Modo demonstração quando falta qualquer um dos tokens do Contentful ou com
// VITE_DEMO=true. Os clientes da API são importados só quando há tokens, porque
// src/api/client.ts os exige ao ser carregado.
const demoContentful = () =>
  usarDemo('Contentful', import.meta.env.VITE_CONTENTFUL_CDN_TOKEN, import.meta.env.VITE_CONTENTFUL_API_TOKEN);

export const MaintenanceService = {
  async getAll(): Promise<Maintenance[]> {
    if (demoContentful()) {
      return manutencoesDemo.value;
    }
    const { contentfulCdnClient } = await import('../api/client');
    const response = await contentfulCdnClient.get(CONTENTFUL_ENDPOINTS.MAINTENANCE.GET_ALL);
    return response.data.items;
  },

  async getById(id: string): Promise<Maintenance> {
    if (demoContentful()) {
      const manutencao = manutencoesDemo.value.find(m => m.sys.id === id);
      if (!manutencao) throw new Error(`Manutenção ${id} não existe na demonstração`);
      return manutencao;
    }
    const { contentfulCdnClient } = await import('../api/client');
    const response = await contentfulCdnClient.get(CONTENTFUL_ENDPOINTS.MAINTENANCE.GET_SINGLE(id));
    return response.data;
  },

  async create(maintenanceFields: MaintenanceFields): Promise<Maintenance> {
    // Demonstração: nada é enviado; a manutenção entra numa lista em memória.
    if (demoContentful()) {
      return registrarManutencaoDemo(maintenanceFields);
    }
    const { contentfulApiClient } = await import('../api/client');

    const headers = {
      'X-Contentful-Content-Type': 'maintenance'
    };

    const richTextDescription = {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: [
            {
              nodeType: 'text',
              value: maintenanceFields.descricao,
              marks: [],
              data: {}
            }
          ]
        }
      ]
    };

    try {
      const createResponse = await contentfulApiClient.post(
        CONTENTFUL_ENDPOINTS.MAINTENANCE.CREATE,
        {
          fields: {
            device: { 'en-US': maintenanceFields.device },
            devices: {
              'en-US': maintenanceFields.devices.map(id => ({
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: id
                }
              }))
            },
            dataManutencao: { 'en-US': maintenanceFields.dataManutencao },
            descricao: { 'en-US': richTextDescription }
          }
        },
        { headers }
      );

      const entryId = createResponse.data.sys.id;
      const version = createResponse.data.sys.version;

      await contentfulApiClient.put(
        `/entries/${entryId}/published`,
        {},
        {
          headers: {
            'X-Contentful-Version': version,
            'Content-Type': 'application/vnd.contentful.management.v1+json'
          }
        }
      );

      return createResponse.data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error('Erro na API Contentful:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
      } else if (error instanceof Error) {
        console.error('Erro geral:', error.message);
      } else {
        console.error('Erro desconhecido:', error);
      }

      throw new Error('Falha ao criar e publicar a manutenção');
    }
  }
};

function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}
