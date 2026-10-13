import type { ContentfulEntry } from '../api/types';

/** Ligação para outra entrada, no formato do Contentful. */
export interface EntryLink {
  sys: {
    type: 'Link';
    linkType: 'Entry';
    id: string;
  };
}

/**
 * Campos de um equipamento como a CDN do Contentful os devolve quando se pede
 * um `locale` fixo (é o caso de DeviceService.getAll): valores diretos, sem a
 * chave do idioma. Os dados de demonstração (src/demo) seguem o mesmo formato.
 */
export interface DeviceFields {
  name: string;
  icon: string;
  state: boolean;
  pin: number;
  manutencao?: EntryLink[]; // ligações para as manutenções
}

export interface Device extends ContentfulEntry {
  fields: DeviceFields;
}
