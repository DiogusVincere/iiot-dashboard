/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENTFUL_SPACE_ID: string
  readonly VITE_CONTENTFUL_ENVIRONMENT: string
  readonly VITE_CONTENTFUL_CDN_TOKEN: string
  readonly VITE_CONTENTFUL_API_TOKEN: string
  readonly VITE_QUBITRO_API_TOKEN: string
  // 'true' força o modo demonstração (dados gravados em src/demo, sem chamar as APIs)
  readonly VITE_DEMO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
