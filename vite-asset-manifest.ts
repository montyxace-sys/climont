import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin } from 'vite';

type AssetEntry = {
  src: string;
  name: string;
  format: string;
  category: string;
  segments: string[];
};

function collectFiles(directory: string, root: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path, root) : [relative(root, path)];
  });
}

function createManifest(publicDir: string): AssetEntry[] {
  return collectFiles(publicDir, publicDir)
    .filter((path) => !path.startsWith('_') && !path.endsWith('.xml') && !path.endsWith('.txt'))
    .map((path) => {
      const normalizedPath = path.split(sep).join('/');
      const segments = normalizedPath.split('/');
      const name = segments[segments.length - 1];
      const extension = name.split('.').pop()?.toUpperCase() ?? '';
      const category = segments[0] === 'brands' ? 'brands' : segments.length === 1 ? 'root' : 'images';

      return {
        src: `/${normalizedPath}`,
        name,
        format: extension,
        category,
        segments,
      };
    });
}

export function assetManifestPlugin(publicDir: string): Plugin {
  return {
    name: 'asset-manifest',
    resolveId(id: string) {
      return id === 'virtual:asset-manifest' ? '\0virtual:asset-manifest' : undefined;
    },
    load(id: string) {
      if (id !== '\0virtual:asset-manifest') return undefined;
      return `export default ${JSON.stringify(createManifest(publicDir))};`;
    },
  };
}
