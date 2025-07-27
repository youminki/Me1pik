// Service Worker for Melpik
const CACHE_NAME = 'melpik-v1.0.0';
const STATIC_CACHE = 'melpik-static-v1.0.0';
const DYNAMIC_CACHE = 'melpik-dynamic-v1.0.0';

// 캐시할 정적 리소스들
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/fonts/woff2/NanumSquareNeo-Variable.woff2',
  '/fonts/OTF/NanumSquareB.otf',
  '/fonts/OTF/NanumSquareEB.otf',
  '/src/assets/favicon.svg',
];

// 캐시할 API 엔드포인트들
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.stylewh\.com\/products/,
  /^https:\/\/api\.stylewh\.com\/brands/,
  /^https:\/\/api\.stylewh\.com\/user\/me/,
];

// 설치 시 정적 리소스 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 활성화 시 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== CACHE_NAME
            );
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 정적 리소스 캐시 전략
  if (request.method === 'GET' && isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // API 캐시 전략
  if (request.method === 'GET' && isApiRequest(request.url)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // 기본 네트워크 전략
  event.respondWith(networkOnly(request));
});

// 정적 자산인지 확인
function isStaticAsset(url) {
  return (
    url.includes('/fonts/') ||
    url.includes('/assets/') ||
    url.includes('/favicon') ||
    url.endsWith('.css') ||
    url.endsWith('.js') ||
    url.endsWith('.woff2') ||
    url.endsWith('.woff') ||
    url.endsWith('.ttf') ||
    url.endsWith('.otf')
  );
}

// API 요청인지 확인
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

// 캐시 우선 전략
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // 오프라인 시 기본 페이지 반환
    if (request.destination === 'document') {
      return cache.match('/index.html');
    }
    throw error;
  }
}

// 네트워크 우선 전략
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// 네트워크만 사용
async function networkOnly(request) {
  return fetch(request);
}

// 백그라운드 동기화 (선택적)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // 백그라운드에서 수행할 작업들
  console.log('백그라운드 동기화 수행');
}

// 푸시 알림 처리 (선택적)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/src/assets/favicon.svg',
    badge: '/src/assets/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/src/assets/favicon.svg',
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/src/assets/favicon.svg',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('Melpik', options));
});
