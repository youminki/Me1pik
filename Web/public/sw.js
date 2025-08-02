// Service Worker for Melpik Web App
const CACHE_NAME = 'melpik-v1.0.1';
const STATIC_CACHE_NAME = 'melpik-static-v1.0.1';
const DYNAMIC_CACHE_NAME = 'melpik-dynamic-v1.0.1';

// 캐시할 정적 리소스들
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/fonts/NanumSquareNeo.woff2',
  '/fonts/NanumSquareNeoOTF.otf',
];

// 네트워크 우선, 캐시 폴백 전략을 사용할 API 엔드포인트들
const API_CACHE_PATTERNS = ['/api/products', '/api/categories', '/api/brands'];

// 캐시 우선, 네트워크 폴백 전략을 사용할 리소스들
const CACHE_FIRST_PATTERNS = ['/assets/', '/images/', '/fonts/'];

// 네트워크 우선, 캐시 폴백 전략을 사용할 리소스들
const NETWORK_FIRST_PATTERNS = ['/api/'];

// 설치 이벤트 - 정적 리소스 캐싱
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 설치 중...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 정적 리소스 캐싱 중...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker 설치 완료');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker 설치 실패:', error);
      })
  );
});

// 활성화 이벤트 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker 활성화 중...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            ) {
              console.log('🗑️ 이전 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker 활성화 완료');
        return self.clients.claim();
      })
  );
});

// fetch 이벤트 - 요청 인터셉트 및 캐싱 전략 적용
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 개발 환경에서는 캐싱 비활성화
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // GET 요청이 아닌 경우 캐싱하지 않음
  if (request.method !== 'GET') {
    return;
  }

  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 정적 리소스 처리
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // 동적 리소스 처리
  event.respondWith(handleDynamicRequest(request));
});

// API 요청 처리 (네트워크 우선, 캐시 폴백)
async function handleApiRequest(request) {
  // POST 요청은 캐시하지 않음
  if (
    request.method === 'POST' ||
    request.method === 'PUT' ||
    request.method === 'DELETE'
  ) {
    try {
      return await fetch(request);
    } catch (error) {
      console.log('🌐 API 요청 실패:', request.url);
      return getOfflinePage();
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return getOfflinePage();
  }
}

// 정적 리소스 처리 (캐시 우선, 네트워크 폴백)
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // 백그라운드에서 캐시 업데이트
    fetch(request).then((response) => {
      if (response.ok) {
        caches.open(STATIC_CACHE_NAME).then((cache) => {
          cache.put(request, response);
        });
      }
    });

    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return getOfflinePage();
  }
}

// 동적 리소스 처리 (네트워크 우선, 캐시 폴백)
async function handleDynamicRequest(request) {
  // POST 요청은 캐시하지 않음
  if (
    request.method === 'POST' ||
    request.method === 'PUT' ||
    request.method === 'DELETE'
  ) {
    try {
      return await fetch(request);
    } catch (error) {
      console.log('🌐 동적 요청 실패:', request.url);
      return getOfflinePage();
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return getOfflinePage();
  }
}

// 정적 리소스인지 확인
function isStaticAsset(pathname) {
  return (
    STATIC_ASSETS.some((asset) => pathname.includes(asset)) ||
    CACHE_FIRST_PATTERNS.some((pattern) => pathname.includes(pattern))
  );
}

// 오프라인 페이지 반환
async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const offlineResponse = await cache.match('/offline.html');

  if (offlineResponse) {
    return offlineResponse;
  }

  // 기본 오프라인 응답
  return new Response(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>오프라인 - Melpik</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: 'NanumSquareNeo', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background-color: #f8f9fa;
          color: #333;
        }
        .offline-container {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 400px;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .offline-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #f7c600;
        }
        .offline-message {
          color: #666;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .retry-button {
          background-color: #f7c600;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .retry-button:hover {
          background-color: #e6b800;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📶</div>
        <h1 class="offline-title">오프라인 상태</h1>
        <p class="offline-message">
          인터넷 연결을 확인해주세요.<br>
          일부 기능은 오프라인에서도 사용할 수 있습니다.
        </p>
        <button class="retry-button" onclick="window.location.reload()">
          다시 시도
        </button>
      </div>
    </body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('📱 푸시 알림 수신:', event);

  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/assets/icons/checkmark.png',
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/assets/icons/xmark.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('Melpik', options));
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 알림 클릭:', event);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});

// 백그라운드 동기화 (선택적)
self.addEventListener('sync', (event) => {
  console.log('🔄 백그라운드 동기화:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 백그라운드 동기화 작업
async function doBackgroundSync() {
  try {
    // 오프라인 중에 저장된 데이터를 서버에 전송
    const offlineData = await getOfflineData();

    for (const data of offlineData) {
      await sendToServer(data);
    }

    console.log('✅ 백그라운드 동기화 완료');
  } catch (error) {
    console.error('❌ 백그라운드 동기화 실패:', error);
  }
}

// 오프라인 데이터 가져오기 (IndexedDB 사용)
async function getOfflineData() {
  // IndexedDB에서 오프라인 데이터 조회
  return [];
}

// 서버에 데이터 전송
async function sendToServer(data) {
  const response = await fetch('/api/offline-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.ok;
}

// 메시지 처리 (메인 스크립트와 통신)
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker 메시지 수신:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    event.ports[0].postMessage({
      type: 'CACHE_STATS',
      data: {
        staticCacheSize: STATIC_ASSETS.length,
        // 실제 캐시 크기 계산 로직 추가 가능
      },
    });
  }
});

console.log('🔧 Service Worker 로드됨');
