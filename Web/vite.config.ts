// vite.config.ts
import path from 'path';
import { copyFileSync, mkdirSync } from 'fs';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      // _redirects 파일을 빌드 디렉토리에 복사하는 플러그인
      {
        name: 'copy-redirects',
        writeBundle() {
          try {
            mkdirSync('dist', { recursive: true });
            copyFileSync('public/_redirects', 'dist/_redirects');
            console.log('✅ _redirects 파일이 dist 디렉토리에 복사되었습니다.');
          } catch (error) {
            console.warn('Failed to copy _redirects file:', error);
          }
        },
      },
      // 강력한 SPA 라우팅 플러그인
      {
        name: 'spa-routing-optimized',
        configureServer(server) {
          // 개발 서버용 SPA 라우팅
          server.middlewares.use((req, _res, next) => {
            const url = req.url;
            if (!url) return next();

            // 정적 파일이 아닌 경우 index.html로 리다이렉트
            if (!url.includes('.') && !url.startsWith('/assets/')) {
              req.url = '/index.html';
            }
            next();
          });
        },
        configurePreviewServer(server) {
          // 프리뷰 서버용 SPA 라우팅 (새로고침 최적화)
          server.middlewares.use((req, _res, next) => {
            const url = req.url;
            if (!url) return next();

            // 정적 파일 체크 (더 정확한 판단)
            const isStaticFile =
              /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|otf|webp|ico|json|xml|txt)$/i.test(
                url
              );
            const isAssetsPath = url.startsWith('/assets/');

            // 정적 파일이 아닌 경우 index.html로 리다이렉트
            if (!isStaticFile && !isAssetsPath) {
              req.url = '/index.html';
            }
            next();
          });
        },
      },
    ],
    base: '/',
    appType: 'spa',
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash:8].js',
          chunkFileNames: 'assets/[name].[hash:8].js',
          assetFileNames: 'assets/[name].[hash:8].[ext]',
        },
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: true,
      hmr: {
        overlay: false,
      },
    },
    preview: {
      port: 4173,
      host: '0.0.0.0',
      strictPort: true,
      // 프리뷰 서버에서 SPA 라우팅 처리
      middlewareMode: true,
    },
  };
});
