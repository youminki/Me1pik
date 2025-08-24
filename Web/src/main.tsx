import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
<<<<<<< HEAD
<<<<<<< HEAD
import { logBuildInfo, setupProductionLogging } from './utils/buildInfo';
=======
>>>>>>> parent of ef6bc4f (Add environment config and build info utilities)
=======
>>>>>>> parent of 7da97c6 (Update build process and environment variable handling)
import { startPerformanceMonitoring } from './utils/performance.ts';
import { logBuildInfo, setupProductionLogging } from './utils/buildInfo';

import './styles/index.css';

// 성능 모니터링 시작
if (import.meta.env.DEV) {
  startPerformanceMonitoring();
}

// 네이티브 앱 초기화 코드 제거됨

// Service Worker 등록은 App.tsx에서 통합 관리

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
