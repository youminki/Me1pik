import { useState, useEffect, useCallback, useRef } from 'react';
import { sslManager, SSLStatus, SSLCreationRequest } from '../utils/sslManager';

export interface UseSSLMonitorOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  domains?: string[];
}

export const useSSLMonitor = (options: UseSSLMonitorOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30초
    domains = ['me1pik.com'],
  } = options;

  const [sslStatuses, setSslStatuses] = useState<SSLStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // SSL 상태 확인
  const checkSSLStatuses = useCallback(
    async (signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const statuses: SSLStatus[] = [];

        for (const domain of domains) {
          if (signal?.aborted) break;

          try {
            const status = await sslManager.checkSSLStatus(domain);
            statuses.push(status);
          } catch (err) {
            console.warn(`도메인 ${domain} SSL 상태 확인 실패:`, err);
            statuses.push({
              domain,
              sslStatus: 'error',
              lastChecked: new Date(),
            });
          }
        }

        if (!signal?.aborted) {
          setSslStatuses(statuses);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!signal?.aborted) {
          setError(err instanceof Error ? err.message : 'SSL 상태 확인 실패');
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [domains]
  );

  // SSL 인증서 생성
  const createSSLCertificate = useCallback(
    async (request: SSLCreationRequest) => {
      try {
        setLoading(true);
        setError(null);

        const result = await sslManager.createSSLCertificate(request);

        // 생성 후 상태 새로고침
        await checkSSLStatuses();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'SSL 인증서 생성 실패';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [checkSSLStatuses]
  );

  // SSL 인증서 갱신
  const renewSSLCertificate = useCallback(
    async (domain: string) => {
      try {
        setLoading(true);
        setError(null);

        const result = await sslManager.renewSSLCertificate(domain);

        // 갱신 후 상태 새로고침
        await checkSSLStatuses();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'SSL 인증서 갱신 실패';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [checkSSLStatuses]
  );

  // 수동 새로고침
  const refresh = useCallback(() => {
    checkSSLStatuses();
  }, [checkSSLStatuses]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        checkSSLStatuses();
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, checkSSLStatuses]);

  // 컴포넌트 마운트 시 초기 로드
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    checkSSLStatuses(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [checkSSLStatuses]);

  // 도메인 변경 시 새로고침
  useEffect(() => {
    refresh();
  }, [domains, refresh]);

  // 만료 예정 인증서 필터링
  const expiringCertificates = sslStatuses.filter(
    (status) =>
      status.expiresAt &&
      status.expiresAt <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일 이내
  );

  // 에러 상태 인증서 필터링
  const errorCertificates = sslStatuses.filter(
    (status) => status.sslStatus === 'error'
  );

  return {
    sslStatuses,
    loading,
    error,
    lastUpdated,
    expiringCertificates,
    errorCertificates,
    createSSLCertificate,
    renewSSLCertificate,
    refresh,
    checkSSLStatuses,
  };
};
