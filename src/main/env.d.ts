/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ID: string
  readonly VITE_PRODUCT_NAME: string
  readonly VITE_PUBLISH_OWNER: string
  readonly VITE_PUBLISH_REPO: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
