import axios from 'axios';

// Solução definitiva para carregamento de variáveis
const loadEnv = () => {
  // Verificação em tempo de desenvolvimento
  if (import.meta.env.DEV) {
    console.log('Modo desenvolvimento - Verificando variáveis...');
  }

  const env = {
    spaceId: import.meta.env.VITE_CONTENTFUL_SPACE_ID || 'tqsnwogyan0s',
    environment: import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || 'master',
    cdnToken: import.meta.env.VITE_CONTENTFUL_CDN_TOKEN,
    apiToken: import.meta.env.VITE_CONTENTFUL_API_TOKEN
  };

  // Validação crítica
  if (!env.cdnToken || !env.apiToken) {
    const missing = [];
    if (!env.cdnToken) missing.push('VITE_CONTENTFUL_CDN_TOKEN');
    if (!env.apiToken) missing.push('VITE_CONTENTFUL_API_TOKEN');
    
    console.error('Variáveis faltando:', missing);
    console.log('Variáveis disponíveis:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
    
    throw new Error(`Variáveis de ambiente necessárias não encontradas: ${missing.join(', ')}`);
  }

  return env;
};

const { spaceId, environment, cdnToken, apiToken } = loadEnv();

export const contentfulCdnClient = axios.create({
  baseURL: `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}`,
  headers: {
    'Authorization': `Bearer ${cdnToken}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export const contentfulApiClient = axios.create({
  baseURL: `https://api.contentful.com/spaces/${spaceId}/environments/${environment}`,
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/vnd.contentful.management.v1+json'
  },
  timeout: 10000
});