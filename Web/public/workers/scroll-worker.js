// scroll-worker.js
self.onmessage = function (e) {
  const { items, currentVisible, pageSize, totalItems } = e.data;

  // 메인 스레드 블로킹 없이 계산 수행
  const newCount = Math.min(currentVisible + pageSize, totalItems);

  // 결과를 메인 스레드로 전송
  self.postMessage({
    newCount,
    timestamp: Date.now(),
  });
};
