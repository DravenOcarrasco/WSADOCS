import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdPlugin from 'vite-plugin-md';

export default defineConfig({
  plugins: [
    react(),
    mdPlugin(),
  ],
  assetsInclude: ['**/*.md'], // Inclua arquivos .md como assets
});
