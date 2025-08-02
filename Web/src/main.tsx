import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { startPerformanceMonitoring } from './utils/performance.ts';

import './styles/index.css';

/**
 * 애플리케이션 진입점 (main.tsx)
 *
 * React 애플리케이션의 부트스트랩 역할을 수행합니다:
 * - 개발/운영 환경 구분 및 설정
 * - 성능 모니터링 초기화
 * - Service Worker 등록 (PWA 지원)
 * - ReactDOM 렌더링 및 StrictMode 적용
 */

/**
 * 개발 환경에서 성능 모니터링 시작
 *
 * 개발 중에 Core Web Vitals 등 주요 성능 지표를 실시간으로 측정하여
 * 성능 최적화를 위한 데이터를 수집합니다.
 */
if (import.meta.env.DEV) {
  startPerformanceMonitoring();
}

/**
 * Service Worker 등록
 *
 * Progressive Web App (PWA) 기능을 지원하기 위한 Service Worker를 등록합니다:
 * - 오프라인 캐싱 및 네트워크 요청 가로채기
 * - 백그라운드 동기화
 * - 푸시 알림 지원
 * - 자동 업데이트 및 설치
 */
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

/**
 * React 애플리케이션 렌더링
 *
 * ReactDOM을 사용하여 애플리케이션을 DOM에 마운트합니다:
 * - StrictMode로 개발 환경에서 추가 검증 수행
 * - TypeScript 타입 안전성 보장
 * - 루트 엘리먼트에 렌더링
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
