export const CONTENTFUL_ENDPOINTS = {
  DEVICES: {
    GET_ALL: '/entries?content_type=device',
    GET_SINGLE: (id: string) => `/entries/${id}`,
    CREATE: '/entries'
  },
  MAINTENANCE: {
    GET_ALL: '/entries?content_type=maintenance',
    GET_SINGLE: (id: string) => `/entries/${id}`,
    CREATE: '/entries'
  }
};