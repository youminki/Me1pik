import { createGlobalStyle } from 'styled-components';

import { isNativeApp, getStatusBarHeight } from '@/utils/nativeApp';

const GlobalStyles = createGlobalStyle`
  :root {
    /* 기본 CSS 변수들 */
    --header-height: 70px;
    --bottom-nav-height: 60px;
    --status-bar-height: 0px;
    --safe-area-top: 0px;
    --safe-area-bottom: 0px;

    /* 🔧 개선: CSS 변수 네이밍 통일 (AppLayout과 매핑) */
    --header-h: var(--header-h, var(--header-height));
    --bottom-h: var(--bottom-h, var(--bottom-nav-height));
    
    /* 네이티브 앱 환경에서 상태바 높이 설정 */
    ${isNativeApp() ? `--status-bar-height: ${getStatusBarHeight()}px;` : ''}
    ${isNativeApp() ? `--safe-area-top: ${getStatusBarHeight()}px;` : ''}
    
    /* 색상 변수들 */
    --primary-color: #f7c600;
    --secondary-color: #333333;
    --background-color: #ffffff;
    --text-color: #333333;
    --border-color: #e0e0e0;
    --shadow-color: rgba(0, 0, 0, 0.1);
    
    /* 간격 변수들 */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* 폰트 크기 변수들 */
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-md: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-xxl: 24px;
    
    /* 반응형 브레이크포인트 */
    --breakpoint-sm: 576px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 992px;
    --breakpoint-xl: 1200px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    font-family: 'NanumSquareNeo', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--background-color);
    color: var(--text-color);
  }

  #root {
    height: 100%;
  }

  /* 네이티브 앱 환경에서 전체 높이 조정 */
  ${
    isNativeApp()
      ? `
    html, body {
      height: calc(100% - var(--status-bar-height));
      /* 🔧 개선: 상단 safe-area는 헤더에서만 처리, 이중 보정 방지 */
    }
  `
      : ''
  }

  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }



  /* 버튼 기본 스타일 리셋 */
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  /* 링크 기본 스타일 리셋 */
  a {
    text-decoration: none;
    color: inherit;
  }

  /* 입력 필드 기본 스타일 리셋 */
  input, textarea, select {
    font-family: inherit;
    border: none;
  }

  /* 🔧 개선: 포커스 아웃라인 복원 (접근성 향상) */
  :focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* 리스트 기본 스타일 리셋 */
  ul, ol {
    list-style: none;
  }

  /* 이미지 최대 너비 설정 */
  img {
    max-width: 100%;
    height: auto;
  }

  /* 네이티브 앱 환경에서 터치 하이라이트 제거 */
  ${
    isNativeApp()
      ? `
    /* 🔧 개선: user-select none은 필요 요소에만 한정 (본문 텍스트 복사 허용) */
    [data-no-select='true'] {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    input, textarea {
      -webkit-user-select: text;
      -khtml-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
  `
      : ''
  }

  /* 🔧 개선: 접근성 - 스킵 링크 스타일 */
  .sr-only {
    position: absolute !important;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .sr-only:focus {
    position: fixed !important;
    top: calc(var(--header-h, 0px) + 8px);
    left: 8px;
    width: auto;
    height: auto;
    margin: 0;
    padding: 8px 12px;
    clip: auto;
    overflow: visible;
    background: #000;
    color: #fff;
    border-radius: 6px;
    z-index: 1100;
  }
`;

export default GlobalStyles;
