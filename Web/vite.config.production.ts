import { mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default mergeConfig(baseConfig, {
  mode: 'production',
  build: {
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // 프로덕션에서 더 적극적인 청크 분할
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['styled-components'],
          'utils-vendor': ['axios', '@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'validation-vendor': ['yup'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true, // debugger 제거
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true, // Safari 10 호환성
      },
    },
  },
  define: {
    __DEV__: false,
  },
});
