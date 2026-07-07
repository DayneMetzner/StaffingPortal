/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_ACCESS_CODE?: string;
  readonly VITE_STAFF_ACCESS_CODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
