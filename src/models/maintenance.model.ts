import { type ContentfulEntry } from '../api/types';

export interface MaintenanceFields {
  device: string;
  devices: string[]; // IDs dos dispositivos
  dataManutencao: string;
  descricao: string;
}

export interface Maintenance extends ContentfulEntry {
  fields: {
    device: { 'en-US': string };
    devices: {
      'en-US': Array<{
        sys: {
          type: 'Link';
          linkType: 'Entry';
          id: string;
        };
      }>;
    };
    dataManutencao: { 'en-US': string };
    descricao: {
      'en-US': {
        nodeType: string;
        content: Array<{
          nodeType: string;
          content: Array<{
            nodeType: string;
            value: string;
            marks: any[];
            data: object;
          }>;
          data: object;
        }>;
        data: object;
      };
    };
  };
}