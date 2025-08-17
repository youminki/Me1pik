import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { startPerformanceMonitoring } from './utils/performance.ts';

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
