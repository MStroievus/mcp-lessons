import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    plugins: [vue()],
    build: { chunkSizeWarningLimit: 600 },
    server: { host: '127.0.0.1', port: 5173, strictPort: true }
});
