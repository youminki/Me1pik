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
      padding-top: var(--status-bar-height);
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
    outline: none;
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
    * {
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
`;

export default GlobalStyles;
