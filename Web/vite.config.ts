// vite.config.ts
import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react()],
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // 최소한의 빌드 설정
      outDir: 'dist',
      emptyOutDir: true,
      // 모든 최적화 비활성화
      minify: false,
      cssCodeSplit: false,
      // 강제 캐시 무효화
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          // 타임스탬프 기반 캐시 무효화
          entryFileNames: `index.[hash:8].js`,
          chunkFileNames: `index.[hash:8].js`,
          assetFileNames: `index.[hash:8].[ext]`,
        },
      },
    },
    server: {
      port: 5173,
      host: true,
    },
    preview: {
      port: 4173,
      host: '0.0.0.0',
      historyApiFallback: true,
    },
  };
});
