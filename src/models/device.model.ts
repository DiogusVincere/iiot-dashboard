import type { ContentfulEntry } from '../api/types';

export interface DeviceFields {
  name: string;
  icon: string;
  state: boolean;
  pin: number;
  manutencao?: string[]; // IDs das manutenções
}

export interface Device extends ContentfulEntry {
  fields: {
    name: { 'en-US': string };
    icon: { 'en-US': string };
    state: { 'en-US': boolean };
    pin: { 'en-US': number };
    manutencao?: {
      'en-US': Array<{
        sys: {
          type: 'Link';
          linkType: 'Entry';
          id: string;
        };
      }>;
    };
  };
}