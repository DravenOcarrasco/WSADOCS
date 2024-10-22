import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdPlugin from 'vite-plugin-md';

export default defineConfig({
  plugins: [
    react(),
    mdPlugin(),
  ],
  assetsInclude: ['**/*.md'], // Inclua arquivos .md como assets
  build: {
    outDir: 'docs', // Define a pasta de saída para 'docs' em vez de 'dist'
  },
  base: './', // Define o caminho base para relativo, útil para hospedagem em subpastas
});
