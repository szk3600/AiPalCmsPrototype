import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'node', // Admin SDK を使う場合は node が適切
        globals: true,
        setupFiles: ['./tests/setup.ts'], // ここで環境変数をロード
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});