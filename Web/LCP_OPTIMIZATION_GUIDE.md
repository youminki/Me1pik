# LCP(Largest Contentful Paint) 최적화 가이드

## 🎯 목표

LCP 값을 3.06초에서 2.5초 이하로 개선

## 📊 현재 상황

- **현재 LCP**: 3.06초 (개선됨, 하지만 여전히 최적화 필요)
- **목표 LCP**: 2.5초 이하 (양호)
- **LCP 요소**: `img.sc-gTRDQs.gaXJNI.loaded` (ItemCard의 첫 번째 이미지)

## 🚀 적용된 최적화

### 1. 이미지 우선순위 설정

```tsx
// 첫 번째 상품 이미지에 우선순위 적용
<Image loading='eager' decoding='sync' src={imageUrl} alt={brand} />
```

### 2. 이미지 프리로드 강화

```javascript
// 첫 번째 상품 이미지 동적 프리로드
if (result.length > 0) {
  const firstImage = result[0].image.split('#')[0];
  if (firstImage && !document.querySelector(`link[href="${firstImage}"]`)) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = firstImage;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
  }
}
```

### 3. 폰트 프리로드

```html
<!-- 중요한 폰트 프리로드 -->
<link
  rel="preload"
  href="/fonts/OTF/NanumSquareB.otf"
  as="font"
  type="font/otf"
  crossorigin
/>
<link
  rel="preload"
  href="/fonts/OTF/NanumSquareEB.otf"
  as="font"
  type="font/otf"
  crossorigin
/>
```

### 4. 이미지 포맷 최적화

- WebP/AVIF 포맷 자동 감지 및 적용
- 브라우저 지원 확인 후 최적 포맷 선택

### 5. 성능 모니터링 강화

- LCP, FCP, FID, CLS 실시간 모니터링
- 이미지 로딩 성능 분석
- 성능 임계값 경고 시스템
- 이미지 크기 및 로딩 시간 분석

### 6. ESLint 오류 수정

- import 순서 최적화
- styled-components transient props 적용

## 🔧 추가 최적화 방안

### 서버 사이드 최적화

1. **이미지 CDN 사용**

   ```javascript
   // 이미지 URL을 CDN으로 변경
   const cdnUrl = `https://your-cdn.com/images/${imageId}?w=${width}&q=${quality}`;
   ```

2. **이미지 리사이징 API**

   ```javascript
   // 동적 이미지 크기 조정
   const optimizedUrl = `${baseUrl}/api/images/${imageId}?w=${width}&h=${height}&q=${quality}`;
   ```

3. **HTTP/2 Server Push**
   ```nginx
   # nginx 설정
   location / {
       http2_push /src/assets/landings/7X5A9526.jpg;
       http2_push /fonts/OTF/NanumSquareB.otf;
   }
   ```

### 클라이언트 사이드 최적화

1. **이미지 지연 로딩 개선**

   ```tsx
   // Intersection Observer 활용
   const { ref, shouldLoad } = useLazyLoad({
     threshold: 0.1,
     rootMargin: '50px 0px',
   });
   ```

2. **이미지 캐싱 전략**

   ```javascript
   // Service Worker를 통한 이미지 캐싱
   const imageCache = new Map();
   ```

3. **프로그레시브 이미지 로딩**
   ```tsx
   // 저해상도 → 고해상도 순차 로딩
   <img src={lowResImage} alt="placeholder" />
   <img src={highResImage} alt="final" onLoad={handleHighResLoad} />
   ```

## 📈 성능 측정 방법

### 개발자 도구

1. **Lighthouse** - 전체 성능 점수 확인
2. **Chrome DevTools Performance** - 상세 성능 분석
3. **Network 탭** - 이미지 로딩 시간 확인

### 코드 측정

```javascript
// LCP 측정
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime);
}).observe({ entryTypes: ['largest-contentful-paint'] });
```

## 🎯 최적화 체크리스트

- [x] 첫 번째 이미지에 `loading="eager"` 적용
- [x] `decoding="sync"` 속성 추가
- [x] 이미지 프리로드 추가
- [x] 폰트 프리로드 추가
- [x] WebP/AVIF 포맷 지원
- [x] 동적 이미지 프리로드
- [x] 성능 모니터링 강화
- [x] ESLint 오류 수정
- [ ] 이미지 CDN 도입
- [ ] 이미지 리사이징 API 구현
- [ ] Service Worker 캐싱
- [ ] HTTP/2 Server Push 설정

## 📊 예상 개선 효과

| 최적화 항목        | 예상 개선 시간 |
| ------------------ | -------------- |
| 이미지 우선순위    | -0.5초         |
| 이미지 프리로드    | -0.3초         |
| 폰트 프리로드      | -0.2초         |
| 이미지 포맷 최적화 | -0.3초         |
| 동적 프리로드      | -0.2초         |
| **총 예상 개선**   | **-1.5초**     |

**목표 LCP**: 3.06초 → 1.56초 (약 49% 추가 개선)

## 🔍 모니터링 지표

- **LCP**: 2.5초 이하 (양호)
- **FCP**: 1.8초 이하 (양호)
- **FID**: 100ms 이하 (양호)
- **CLS**: 0.1 이하 (양호)

## 🚨 현재 문제점 분석

1. **특정 이미지가 LCP 요소**: `img.sc-gTRDQs.gaXJNI.loaded`
2. **이미지 로딩 지연**: 네트워크 지연 또는 이미지 크기 문제
3. **서버 응답 시간**: 이미지 서버의 응답 속도
4. **이미지 크기**: 800px 이상의 큰 이미지

## 🔧 즉시 적용 가능한 최적화

1. **이미지 크기 최적화**
   - 첫 번째 상품 이미지를 적절한 크기로 리사이징
   - WebP 포맷으로 변환

2. **이미지 서버 최적화**
   - CDN 사용
   - 이미지 압축 최적화

3. **캐싱 전략**
   - 브라우저 캐싱 헤더 설정
   - Service Worker를 통한 오프라인 캐싱

## 📝 참고 자료

- [Web.dev LCP 가이드](https://web.dev/lcp/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
