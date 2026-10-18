/// <reference types="vite/client" />

declare module 'virtual:asset-manifest' {
  export type AssetEntry = {
    src: string;
    name: string;
    format: string;
    category: string;
    segments: string[];
  };
  const manifest: AssetEntry[];
  export default manifest;
}
