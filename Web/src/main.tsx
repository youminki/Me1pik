import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { startPerformanceMonitoring } from './utils/performance.ts';
import {
  isNativeApp,
  isAndroidApp,
  setupStatusBarHeightListener,
  setStatusBarHeight,
} from './utils/nativeApp';

import './styles/index.css';

// 성능 모니터링 시작
if (import.meta.env.DEV) {
  startPerformanceMonitoring();
}

// 네이티브 앱 초기화
if (isNativeApp()) {
  // 상태바 높이 리스너 설정
  setupStatusBarHeightListener();

  // 안드로이드 앱의 경우 초기 상태바 높이 설정
  if (isAndroidApp()) {
    // 기본 안드로이드 상태바 높이 설정
    setStatusBarHeight(24);

    // DOM이 로드된 후 추가 설정
    document.addEventListener('DOMContentLoaded', () => {
      // CSS 변수가 제대로 설정되었는지 확인
      const statusBarHeight = getComputedStyle(
        document.documentElement
      ).getPropertyValue('--status-bar-height');

      if (!statusBarHeight || statusBarHeight === '0px') {
        setStatusBarHeight(24);
      }
    });
  }
}

// Service Worker 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker 등록 성공:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ Service Worker 등록 실패:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
