import { useState, useEffect } from 'react';

interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

interface UseOnlineStatusResult {
  isOnline: boolean;
  isOffline: boolean;
}

/**
 * useOnlineStatus 훅
 *
 * 브라우저의 온라인/오프라인 상태를 실시간으로 감지합니다.
 *
 * @returns { isOnline, isOffline }
 */
export const useOnlineStatus = (): UseOnlineStatusResult => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
};

interface NetworkStatus {
  effectiveType: string;
  downlink: number;
  rtt: number;
}

/**
 * useNetworkStatus 훅
 *
 * 네트워크 연결의 품질(속도, RTT 등)을 감지합니다.
 *
 * @returns { effectiveType, downlink, rtt }
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [networkInfo, setNetworkInfo] = useState<NetworkStatus>({
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      const nav = navigator as NavigatorWithConnection;
      if (nav.connection) {
        setNetworkInfo({
          effectiveType: nav.connection.effectiveType || 'unknown',
          downlink: nav.connection.downlink || 0,
          rtt: nav.connection.rtt || 0,
        });
      }
    };

    updateNetworkInfo();

    const nav = navigator as NavigatorWithConnection;
    if (nav.connection) {
      nav.connection.addEventListener('change', updateNetworkInfo);

      return () => {
        nav.connection?.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
};
