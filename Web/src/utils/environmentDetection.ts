/**
 * 🎯 iOS 환경 감지 함수
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;

  // iOS Safari 감지
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || /ipad/.test(navigator.platform);
};

/**
 * 🎯 네이티브 앱 환경인지 확인
 */
export const isNativeApp = (): boolean => {
  return !!(
    (window as { webkit?: { messageHandlers?: unknown } }).webkit?.messageHandlers ||
    (window as { nativeApp?: unknown }).nativeApp ||
    (window as { ReactNativeWebView?: unknown }).ReactNativeWebView ||
    // iOS WebKit 환경 추가 감지
    (/iPad|iPhone|iPod/.test(navigator.userAgent) && (window as { webkit?: unknown }).webkit)
  );
};

/**
 * 🎯 iOS 앱 환경인지 확인
 */
export const isIOSApp = (): boolean => {
  return !!(
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    (window as { webkit?: { messageHandlers?: unknown } }).webkit?.messageHandlers
  );
};

/**
 * 🎯 Android 앱 환경인지 확인
 */
export const isAndroidApp = (): boolean => {
  return !!(
    /Android/.test(navigator.userAgent) && (window as { ReactNativeWebView?: unknown }).ReactNativeWebView
  );
};

/**
 * 🎯 네트워크 상태 확인
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * 🎯 공개 라우트인지 확인
 */
export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/landing',
    '/findid',
    '/findPassword',
    '/password-change',
    '/ladyLogin',
    '/PersonalLink',
    '/Link',
    '/test-login',
    '/test-dashboard',
    '/test/payple',
    '/test/AddCardPayple',
  ];

  return publicRoutes.includes(pathname);
};

/**
 * 🎯 보호된 라우트인지 확인
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return !isPublicRoute(pathname);
};
