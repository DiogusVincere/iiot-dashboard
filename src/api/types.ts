export interface ContentfulSys {
  type: string;
  linkType?: string;
  id: string;
}

export interface ContentfulEntry {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    contentType: {
      sys: ContentfulSys;
    };
  };
  fields: Record<string, any>;
}

export interface ContentfulArrayResponse<T> {
  sys: {
    type: 'Array';
  };
  total: number;
  skip: number;
  limit: number;
  items: T[];
}