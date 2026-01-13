import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Use relative paths for Electron
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
});
