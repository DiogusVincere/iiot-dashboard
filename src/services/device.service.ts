import { contentfulCdnClient } from '../api/client';
import { AxiosError } from 'axios';

export const DeviceService = {
  async getAll(): Promise<any> {
    try {
      const response = await contentfulCdnClient.get('/entries', {
        params: {
          content_type: 'device',
          locale: 'en-US'
        }
      });
      
      if (!response.data?.items) {
        throw new Error('Formato de resposta inesperado da API');
      }
      
      return response.data.items;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Erro na requisição:', {
          status: error.response?.status,
          message: error.message,
          config: {
            url: error.config?.url,
            headers: error.config?.headers
          }
        });
        
        if (error.response?.status === 401) {
          throw new Error('Falha de autenticação - Verifique seu token de acesso');
        }
      }
      
      throw new Error(`Falha ao obter dispositivos: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};