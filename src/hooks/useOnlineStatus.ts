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

/**
 * 온라인 상태를 추적하는 훅
 * @returns { isOnline, isOffline }
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

/**
 * 네트워크 상태를 추적하는 훅
 * @returns { effectiveType, downlink, rtt }
 */
export const useNetworkStatus = () => {
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: 'unknown' as string,
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
