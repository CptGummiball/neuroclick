import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // wichtig für korrektes Deployment auf Vercel
  plugins: [react()]
});