import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { startPerformanceMonitoring } from './utils/performance.ts';
import { logBuildInfo, setupProductionLogging } from './utils/buildInfo';

import './styles/index.css';

// 빌드 정보 로깅 및 프로덕션 로깅 설정
logBuildInfo();
setupProductionLogging();

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
