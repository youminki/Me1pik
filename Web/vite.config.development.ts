import { mergeConfig } from 'vite';

import baseConfig from './vite.config';

export default mergeConfig(baseConfig, {
  mode: 'development',
  build: {
    sourcemap: true,
    minify: false,
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: true,
    },
  },
  define: {
    __DEV__: true,
  },
});
