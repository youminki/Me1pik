import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Axios } from '@/api-utils/Axios';
import { getMembershipInfo } from '@/api-utils/user-managements/users/userApi';
import {
  getCurrentToken,
  getRefreshToken,
  hasValidToken,
  refreshToken,
  clearTokens,
  debugTokenStatus,
  saveTokens,
} from '@/utils/auth';
import {
  startPerformanceMonitoring,
  getPerformanceReport,
  getOptimizationSuggestions,
  startRealTimeMonitoring,
} from '@/utils/performanceMonitor';

interface PerformanceMetrics {
  lcp: number;
  cls: number;
  inp: number;
  fid: number;
  ttfb: number;
}

interface TokenInfo {
  accessToken: string | null;
  refreshToken: string | null;
  isValid: boolean;
  expiresAt: string | null;
  payload: Record<string, unknown> | null;
  timeUntilExpiry: number | null;
  autoLogin: boolean;
}

interface TokenTestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

const TestDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);
  const [apiTestResults, setApiTestResults] = useState<
    Array<{
      name: string;
      status: 'success' | 'error';
      response?: unknown;
      error?: string;
    }>
  >([]);
  const [tokenTestResults, setTokenTestResults] = useState<TokenTestResult[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<
    string[]
  >([]);
  const [performanceReport, setPerformanceReport] = useState<string>('');
  const [autoRefreshInterval, setAutoRefreshInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [testMode, setTestMode] = useState<
    'normal' | 'expiry-simulation' | 'auto-refresh'
  >('normal');
  const [simulationTimer, setSimulationTimer] = useState<number>(0);
  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<string>('');

  // refs for cleanup
  const tokenMonitorRef = useRef<NodeJS.Timeout | null>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 권한 확인
  useEffect(() => {
    const checkAuthorization = async () => {
      const currentUser = localStorage.getItem('userEmail');
      if (currentUser !== 'dbalsrl7648@naver.com') {
        alert('테스트 페이지는 특정 계정으로만 접근 가능합니다.');
        navigate('/login');
        return;
      }
      setIsAuthorized(true);
    };

    checkAuthorization();
  }, [navigate]);

  // 토큰 정보 업데이트 - 더 정확한 파싱
  const updateTokenInfo = useCallback(() => {
    const accessToken = getCurrentToken();
    const refreshTokenValue = getRefreshToken();
    const isValid = hasValidToken();
    const autoLogin = localStorage.getItem('autoLogin') === 'true';

    let expiresAt = null;
    let payload = null;
    let timeUntilExpiry = null;

    if (accessToken) {
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const decodedPayload = atob(tokenParts[1]);
          payload = JSON.parse(decodedPayload);
          const expTime = payload.exp * 1000;
          expiresAt = new Date(expTime).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          timeUntilExpiry = expTime - Date.now();
        }
      } catch (error) {
        console.error('토큰 파싱 오류:', error);
      }
    }

    setTokenInfo({
      accessToken,
      refreshToken: refreshTokenValue,
      isValid,
      expiresAt,
      payload,
      timeUntilExpiry,
      autoLogin,
    });
  }, []);

  // 성능 메트릭 수집
  const collectPerformanceMetrics = useCallback(() => {
    startPerformanceMonitoring();

    // 실시간 모니터링 시작
    startRealTimeMonitoring((metrics) => {
      setPerformanceMetrics({
        lcp: metrics.lcp || 0,
        cls: metrics.cls || 0,
        inp: metrics.inp || 0,
        fid: metrics.fid || 0,
        ttfb: metrics.ttfb || 0,
      });
    });
  }, []);

  // 토큰 테스트 실행 - 개선된 버전
  const runTokenTests = useCallback(async () => {
    const results: TokenTestResult[] = [];
    const timestamp = new Date().toLocaleString('ko-KR');
    setLastTestTime(timestamp);

    try {
      // 1. 토큰 존재 여부 테스트
      const accessToken = getCurrentToken();
      const refreshTokenValue = getRefreshToken();

      results.push({
        name: '액세스 토큰 존재 여부',
        status: accessToken ? 'success' : 'error',
        message: accessToken
          ? '액세스 토큰이 존재합니다'
          : '액세스 토큰이 없습니다',
        timestamp,
        details: {
          hasAccessToken: !!accessToken,
          tokenLength: accessToken?.length || 0,
          tokenPrefix: accessToken?.substring(0, 20) || '',
        },
      });

      results.push({
        name: '리프레시 토큰 존재 여부',
        status: refreshTokenValue ? 'success' : 'warning',
        message: refreshTokenValue
          ? '리프레시 토큰이 존재합니다'
          : '리프레시 토큰이 없습니다',
        timestamp,
        details: {
          hasRefreshToken: !!refreshTokenValue,
          tokenLength: refreshTokenValue?.length || 0,
          tokenPrefix: refreshTokenValue?.substring(0, 20) || '',
        },
      });

      // 2. 토큰 유효성 테스트
      const isValid = hasValidToken();
      results.push({
        name: '토큰 유효성 검증',
        status: isValid ? 'success' : 'error',
        message: isValid ? '토큰이 유효합니다' : '토큰이 유효하지 않습니다',
        timestamp,
        details: { isValid, hasValidToken: isValid },
      });

      // 3. 토큰 만료 시간 테스트 - 개선된 파싱
      if (accessToken) {
        try {
          const tokenParts = accessToken.split('.');
          if (tokenParts.length === 3) {
            const decodedPayload = atob(tokenParts[1]);
            const payload = JSON.parse(decodedPayload);
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = payload.exp - currentTime;
            const minutesUntilExpiry = Math.floor(timeUntilExpiry / 60);
            const secondsUntilExpiry = Math.floor(timeUntilExpiry % 60);

            results.push({
              name: '토큰 만료 시간 확인',
              status: timeUntilExpiry > 0 ? 'success' : 'error',
              message:
                timeUntilExpiry > 0
                  ? `${minutesUntilExpiry}분 ${secondsUntilExpiry}초 후 만료됩니다`
                  : '토큰이 이미 만료되었습니다',
              timestamp,
              details: {
                expiresAt: new Date(payload.exp * 1000).toLocaleString('ko-KR'),
                timeUntilExpiry: Math.floor(timeUntilExpiry / 60),
                secondsUntilExpiry: Math.floor(timeUntilExpiry % 60),
                isExpired: timeUntilExpiry <= 0,
                payloadKeys: Object.keys(payload),
              },
            });
          } else {
            results.push({
              name: '토큰 만료 시간 확인',
              status: 'error',
              message: '토큰 형식이 올바르지 않습니다',
              timestamp,
              details: {
                tokenParts: tokenParts.length,
                expectedParts: 3,
              },
            });
          }
        } catch (error) {
          results.push({
            name: '토큰 만료 시간 확인',
            status: 'error',
            message: '토큰 파싱에 실패했습니다',
            timestamp,
            details: {
              error: error instanceof Error ? error.message : '알 수 없는 오류',
            },
          });
        }
      }

      // 4. 자동 로그인 설정 확인
      const autoLogin = localStorage.getItem('autoLogin') === 'true';
      results.push({
        name: '자동 로그인 설정',
        status: autoLogin ? 'success' : 'warning',
        message: autoLogin
          ? '자동 로그인이 활성화되어 있습니다'
          : '자동 로그인이 비활성화되어 있습니다',
        timestamp,
        details: { autoLogin },
      });

      // 5. 토큰 갱신 테스트 - 개선된 버전
      if (!isTokenRefreshing) {
        setIsTokenRefreshing(true);
        try {
          const refreshSuccess = await refreshToken();
          results.push({
            name: '토큰 갱신 테스트',
            status: refreshSuccess ? 'success' : 'error',
            message: refreshSuccess
              ? '토큰 갱신이 성공했습니다'
              : '토큰 갱신에 실패했습니다',
            timestamp,
            details: { refreshSuccess },
          });
        } catch (error) {
          results.push({
            name: '토큰 갱신 테스트',
            status: 'error',
            message: `토큰 갱신 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            timestamp,
            details: {
              error: error instanceof Error ? error.message : '알 수 없는 오류',
            },
          });
        } finally {
          setIsTokenRefreshing(false);
        }
      } else {
        results.push({
          name: '토큰 갱신 테스트',
          status: 'warning',
          message: '토큰 갱신이 이미 진행 중입니다',
          timestamp,
          details: { isRefreshing: true },
        });
      }

      // 6. 토큰 저장소 확인
      const localToken = localStorage.getItem('accessToken');
      const sessionToken = sessionStorage.getItem('accessToken');
      const cookieToken = document.cookie.includes('accessToken');

      results.push({
        name: '토큰 저장소 확인',
        status:
          localToken || sessionToken || cookieToken ? 'success' : 'warning',
        message: '토큰이 저장소에 저장되어 있습니다',
        timestamp,
        details: {
          localStorage: !!localToken,
          sessionStorage: !!sessionToken,
          cookies: cookieToken,
        },
      });
    } catch (error) {
      results.push({
        name: '토큰 테스트 실행',
        status: 'error',
        message: `테스트 실행 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        timestamp,
        details: {
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        },
      });
    }

    setTokenTestResults(results);
  }, [isTokenRefreshing]);

  // API 테스트 - 개선된 버전
  const runApiTests = useCallback(async () => {
    setIsLoading(true);
    const results: Array<{
      name: string;
      status: 'success' | 'error';
      response?: unknown;
      error?: string;
    }> = [];

    try {
      // 1. 토큰 유효성 테스트 (실제 존재하는 엔드포인트 사용)
      try {
        await Axios.get('/user/me/membership');
        results.push({
          name: '토큰 유효성 테스트',
          status: 'success',
          response: '토큰이 유효합니다',
        });
      } catch (error) {
        results.push({
          name: '토큰 유효성 테스트',
          status: 'error',
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        });
      }

      // 2. 사용자 정보 조회 테스트
      try {
        const userInfo = await getMembershipInfo();
        results.push({
          name: '사용자 정보 조회',
          status: 'success',
          response: userInfo,
        });
      } catch (error) {
        results.push({
          name: '사용자 정보 조회',
          status: 'error',
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        });
      }

      // 3. 토큰 갱신 테스트
      if (!isTokenRefreshing) {
        setIsTokenRefreshing(true);
        try {
          const refreshResult = await refreshToken();
          results.push({
            name: '토큰 갱신 테스트',
            status: refreshResult ? 'success' : 'error',
            response: refreshResult ? '토큰 갱신 성공' : '토큰 갱신 실패',
          });
        } catch (error) {
          results.push({
            name: '토큰 갱신 테스트',
            status: 'error',
            error: error instanceof Error ? error.message : '알 수 없는 오류',
          });
        } finally {
          setIsTokenRefreshing(false);
        }
      } else {
        results.push({
          name: '토큰 갱신 테스트',
          status: 'error',
          error: '토큰 갱신이 이미 진행 중입니다',
        });
      }
    } catch (error) {
      results.push({
        name: 'API 테스트 실행',
        status: 'error',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }

    setApiTestResults(results);
    setIsLoading(false);
  }, [isTokenRefreshing]);

  // 토큰 갱신 - 개선된 버전
  const handleRefreshToken = async () => {
    if (isTokenRefreshing) {
      alert('토큰 갱신이 이미 진행 중입니다.');
      return;
    }

    setIsTokenRefreshing(true);
    try {
      const success = await refreshToken();
      if (success) {
        alert('토큰 갱신 성공!');
        updateTokenInfo();
        runTokenTests();
      } else {
        alert('토큰 갱신 실패');
      }
    } catch (error) {
      alert(
        `토큰 갱신 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    } finally {
      setIsTokenRefreshing(false);
    }
  };

  // 토큰 삭제
  const handleClearTokens = () => {
    clearTokens();
    updateTokenInfo();
    runTokenTests();
    alert('토큰이 삭제되었습니다.');
  };

  // 로그아웃
  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  // 토큰 만료 시뮬레이션 - 개선된 버전
  const simulateTokenExpiry = () => {
    const accessToken = getCurrentToken();
    if (!accessToken) {
      alert('액세스 토큰이 없습니다.');
      return;
    }

    try {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) {
        alert('토큰 형식이 올바르지 않습니다.');
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;

      if (timeUntilExpiry > 0) {
        // 테스트용으로 10초 후 만료로 설정
        const testExpiry = currentTime + 10;
        const testPayload = { ...payload, exp: testExpiry };
        const testToken =
          accessToken.split('.')[0] +
          '.' +
          btoa(JSON.stringify(testPayload)) +
          '.' +
          accessToken.split('.')[2];

        // 테스트 토큰으로 임시 저장
        localStorage.setItem('testAccessToken', testToken);
        localStorage.setItem('originalAccessToken', accessToken);
        localStorage.setItem('simulationStartTime', Date.now().toString());

        // 테스트 토큰으로 교체
        saveTokens(testToken, getRefreshToken() || undefined);

        setTestMode('expiry-simulation');
        alert(
          '토큰이 10초 후 만료되도록 설정되었습니다. 자동 갱신을 확인하세요.'
        );

        // 12초 후 원래 토큰으로 복원
        setTimeout(() => {
          const originalToken = localStorage.getItem('originalAccessToken');
          if (originalToken) {
            saveTokens(originalToken, getRefreshToken() || undefined);
            localStorage.removeItem('testAccessToken');
            localStorage.removeItem('originalAccessToken');
            localStorage.removeItem('simulationStartTime');
            setTestMode('normal');
            updateTokenInfo();
            runTokenTests();
            alert('토큰 만료 시뮬레이션이 완료되었습니다.');
          }
        }, 12000); // 12초 후 복원
      } else {
        alert('토큰이 이미 만료되었습니다.');
      }
    } catch {
      alert('토큰 파싱에 실패했습니다.');
    }
  };

  // 자동 갱신 테스트 시작 - 개선된 버전
  const startAutoRefreshTest = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
      setTestMode('normal');
      alert('자동 갱신 테스트가 중지되었습니다.');
      return;
    }

    const interval = setInterval(() => {
      updateTokenInfo();
      runTokenTests();
      console.log('🔄 자동 갱신 테스트 실행 중...');
    }, 5000); // 5초마다 실행

    setAutoRefreshInterval(interval);
    setTestMode('auto-refresh');
    alert('자동 갱신 테스트가 시작되었습니다. 5초마다 토큰 상태를 확인합니다.');
  };

  // 자동 로그인 토글
  const toggleAutoLogin = () => {
    const currentAutoLogin = localStorage.getItem('autoLogin') === 'true';
    localStorage.setItem('autoLogin', (!currentAutoLogin).toString());
    updateTokenInfo();
    runTokenTests();
    alert(
      `자동 로그인이 ${!currentAutoLogin ? '활성화' : '비활성화'}되었습니다.`
    );
  };

  // 디버그 정보 출력
  const showDebugInfo = () => {
    debugTokenStatus();
    console.log('🔍 브라우저 콘솔에서 다음 함수들을 사용할 수 있습니다:');
    console.log('- window.debugTokenStatus(): 토큰 상태 확인');
    console.log('- window.refreshToken(): 수동 토큰 갱신');
    console.log('- window.simulateTokenExpiry(): 토큰 만료 시뮬레이션');
    console.log('- window.testAutoRefresh(): 자동 갱신 테스트');
  };

  // 초기화 및 정리
  useEffect(() => {
    if (isAuthorized) {
      updateTokenInfo();
      collectPerformanceMetrics();
      runApiTests();
      runTokenTests();

      // 성능 최적화 제안 업데이트
      const suggestions = getOptimizationSuggestions();
      setOptimizationSuggestions(suggestions);

      // 성능 리포트 생성
      const report = getPerformanceReport();
      setPerformanceReport(report);

      // 토큰 상태 모니터링 (1분마다)
      tokenMonitorRef.current = setInterval(() => {
        updateTokenInfo();
      }, 60000);

      return () => {
        if (tokenMonitorRef.current) {
          clearInterval(tokenMonitorRef.current);
        }
        if (autoRefreshInterval) {
          clearInterval(autoRefreshInterval);
        }
        if (simulationTimerRef.current) {
          clearInterval(simulationTimerRef.current);
        }
      };
    }
  }, [
    isAuthorized,
    updateTokenInfo,
    collectPerformanceMetrics,
    runApiTests,
    runTokenTests,
    autoRefreshInterval,
  ]);

  // 시뮬레이션 타이머 관리 - 개선된 버전
  useEffect(() => {
    if (testMode === 'expiry-simulation') {
      const startTime = localStorage.getItem('simulationStartTime');
      if (startTime) {
        simulationTimerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
          const remaining = Math.max(0, 10 - elapsed);
          setSimulationTimer(remaining);

          if (remaining <= 0) {
            if (simulationTimerRef.current) {
              clearInterval(simulationTimerRef.current);
            }
            setSimulationTimer(0);
          }
        }, 1000);

        return () => {
          if (simulationTimerRef.current) {
            clearInterval(simulationTimerRef.current);
          }
        };
      }
    } else {
      setSimulationTimer(0);
    }
  }, [testMode]);

  if (!isAuthorized) {
    return <LoadingContainer>권한 확인 중...</LoadingContainer>;
  }

  return (
    <Container>
      <Header>
        <Title>🧪 고급 토큰 테스트 대시보드</Title>
        <Subtitle>
          dbalsrl7648@naver.com 전용 - 토큰 만료 및 리프레시 정밀 테스트
        </Subtitle>
        <TestModeIndicator mode={testMode}>
          {testMode === 'normal' && '🟢 일반 모드'}
          {testMode === 'expiry-simulation' &&
            `🟡 만료 시뮬레이션 모드 (${simulationTimer}초)`}
          {testMode === 'auto-refresh' && '🟠 자동 갱신 테스트 모드'}
        </TestModeIndicator>
        {lastTestTime && (
          <LastTestTime>마지막 테스트: {lastTestTime}</LastTestTime>
        )}
      </Header>

      <Grid>
        {/* 토큰 관리 섹션 */}
        <Section>
          <SectionTitle>🔐 토큰 관리</SectionTitle>
          <TokenInfo>
            <InfoRow>
              <Label>Access Token:</Label>
              <Value>
                {tokenInfo?.accessToken
                  ? `${tokenInfo.accessToken.substring(0, 20)}...`
                  : '없음'}
              </Value>
            </InfoRow>
            <InfoRow>
              <Label>Refresh Token:</Label>
              <Value>
                {tokenInfo?.refreshToken
                  ? `${tokenInfo.refreshToken.substring(0, 20)}...`
                  : '없음'}
              </Value>
            </InfoRow>
            <InfoRow>
              <Label>유효성:</Label>
              <Value status={tokenInfo?.isValid ? 'valid' : 'invalid'}>
                {tokenInfo?.isValid ? '✅ 유효' : '❌ 무효'}
              </Value>
            </InfoRow>
            <InfoRow>
              <Label>만료 시간:</Label>
              <Value>{tokenInfo?.expiresAt || '알 수 없음'}</Value>
            </InfoRow>
            <InfoRow>
              <Label>남은 시간:</Label>
              <Value
                status={
                  tokenInfo?.timeUntilExpiry && tokenInfo.timeUntilExpiry > 0
                    ? 'valid'
                    : 'invalid'
                }
              >
                {tokenInfo?.timeUntilExpiry
                  ? `${Math.floor(tokenInfo.timeUntilExpiry / 1000 / 60)}분 ${Math.floor((tokenInfo.timeUntilExpiry / 1000) % 60)}초`
                  : '만료됨'}
              </Value>
            </InfoRow>
            <InfoRow>
              <Label>자동 로그인:</Label>
              <Value status={tokenInfo?.autoLogin ? 'valid' : 'warning'}>
                {tokenInfo?.autoLogin ? '✅ 활성화' : '⚠️ 비활성화'}
              </Value>
            </InfoRow>
          </TokenInfo>
          <ButtonGroup>
            <Button onClick={updateTokenInfo}>🔄 토큰 정보 새로고침</Button>
            <Button onClick={handleRefreshToken} disabled={isTokenRefreshing}>
              {isTokenRefreshing ? '🔄 갱신 중...' : '🔄 토큰 갱신'}
            </Button>
            <Button onClick={handleClearTokens} variant='danger'>
              🗑️ 토큰 삭제
            </Button>
            <Button onClick={handleLogout} variant='danger'>
              🚪 로그아웃
            </Button>
          </ButtonGroup>
        </Section>

        {/* 토큰 테스트 섹션 */}
        <Section>
          <SectionTitle>🧪 토큰 테스트</SectionTitle>
          <ButtonGroup>
            <Button onClick={runTokenTests}>🔄 토큰 테스트 실행</Button>
            <Button onClick={simulateTokenExpiry} variant='warning'>
              ⏰ 만료 시뮬레이션
            </Button>
            <Button
              onClick={startAutoRefreshTest}
              variant={testMode === 'auto-refresh' ? 'danger' : 'warning'}
            >
              {testMode === 'auto-refresh'
                ? '⏹️ 자동 테스트 중지'
                : '🔄 자동 테스트 시작'}
            </Button>
            <Button onClick={toggleAutoLogin}>
              {tokenInfo?.autoLogin
                ? '🔒 자동 로그인 비활성화'
                : '🔓 자동 로그인 활성화'}
            </Button>
            <Button onClick={showDebugInfo}>🐛 디버그 정보</Button>
          </ButtonGroup>

          <TestResults>
            {tokenTestResults.map((result, index) => (
              <TestResult key={index} status={result.status}>
                <TestName>{result.name}</TestName>
                <TestStatus status={result.status}>
                  {result.status === 'success'
                    ? '✅'
                    : result.status === 'warning'
                      ? '⚠️'
                      : '❌'}
                </TestStatus>
                <TestMessage>{result.message}</TestMessage>
                {result.details && (
                  <TestDetails>
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </TestDetails>
                )}
              </TestResult>
            ))}
          </TestResults>
        </Section>

        {/* 성능 메트릭 섹션 */}
        <Section>
          <SectionTitle>📊 성능 메트릭</SectionTitle>
          <MetricsGrid>
            <MetricCard>
              <MetricLabel>LCP</MetricLabel>
              <MetricValue>
                {performanceMetrics?.lcp
                  ? `${performanceMetrics.lcp.toFixed(2)}ms`
                  : '측정 중...'}
              </MetricValue>
              <MetricDescription>Largest Contentful Paint</MetricDescription>
            </MetricCard>
            <MetricCard>
              <MetricLabel>CLS</MetricLabel>
              <MetricValue>
                {performanceMetrics?.cls
                  ? performanceMetrics.cls.toFixed(3)
                  : '측정 중...'}
              </MetricValue>
              <MetricDescription>Cumulative Layout Shift</MetricDescription>
            </MetricCard>
            <MetricCard>
              <MetricLabel>INP</MetricLabel>
              <MetricValue>
                {performanceMetrics?.inp
                  ? `${performanceMetrics.inp.toFixed(2)}ms`
                  : '측정 중...'}
              </MetricValue>
              <MetricDescription>Interaction to Next Paint</MetricDescription>
            </MetricCard>
            <MetricCard>
              <MetricLabel>FID</MetricLabel>
              <MetricValue>
                {performanceMetrics?.fid
                  ? `${performanceMetrics.fid.toFixed(2)}ms`
                  : '측정 중...'}
              </MetricValue>
              <MetricDescription>First Input Delay</MetricDescription>
            </MetricCard>
            <MetricCard>
              <MetricLabel>TTFB</MetricLabel>
              <MetricValue>
                {performanceMetrics?.ttfb
                  ? `${performanceMetrics.ttfb.toFixed(2)}ms`
                  : '측정 중...'}
              </MetricValue>
              <MetricDescription>Time to First Byte</MetricDescription>
            </MetricCard>
          </MetricsGrid>
        </Section>

        {/* API 테스트 섹션 */}
        <Section>
          <SectionTitle>🔌 API 테스트</SectionTitle>
          <Button onClick={runApiTests} disabled={isLoading}>
            {isLoading ? '테스트 중...' : '🔄 API 테스트 실행'}
          </Button>
          <TestResults>
            {apiTestResults.map((result, index) => (
              <TestResult key={index} status={result.status}>
                <TestName>{result.name}</TestName>
                <TestStatus status={result.status}>
                  {result.status === 'success' ? '✅' : '❌'}
                </TestStatus>
                {result.error && <TestError>{result.error}</TestError>}
              </TestResult>
            ))}
          </TestResults>
        </Section>

        {/* 토큰 페이로드 섹션 */}
        <Section>
          <SectionTitle>🔍 토큰 페이로드</SectionTitle>
          <PayloadContainer>
            <pre>{JSON.stringify(tokenInfo?.payload, null, 2)}</pre>
          </PayloadContainer>
        </Section>

        {/* 성능 최적화 제안 섹션 */}
        <Section>
          <SectionTitle>💡 성능 최적화 제안</SectionTitle>
          <OptimizationList>
            {optimizationSuggestions.length > 0 ? (
              optimizationSuggestions.map((suggestion, index) => (
                <OptimizationItem key={index}>
                  <OptimizationIcon>💡</OptimizationIcon>
                  <OptimizationText>{suggestion}</OptimizationText>
                </OptimizationItem>
              ))
            ) : (
              <OptimizationItem>
                <OptimizationIcon>✅</OptimizationIcon>
                <OptimizationText>현재 성능이 양호합니다!</OptimizationText>
              </OptimizationItem>
            )}
          </OptimizationList>
        </Section>

        {/* 성능 리포트 섹션 */}
        <Section>
          <SectionTitle>📋 성능 리포트</SectionTitle>
          <ReportContainer>
            <Button
              onClick={() => {
                const report = getPerformanceReport();
                setPerformanceReport(report);
                alert('성능 리포트가 업데이트되었습니다!');
              }}
            >
              🔄 리포트 새로고침
            </Button>
            <ReportContent>
              <pre>{performanceReport}</pre>
            </ReportContent>
          </ReportContainer>
        </Section>
      </Grid>
    </Container>
  );
};

export default TestDashboard;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'NanumSquareNeo', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 15px 0;
`;

const TestModeIndicator = styled.div<{ mode: string }>`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  background: ${(props) => {
    switch (props.mode) {
      case 'expiry-simulation':
        return '#f39c12';
      case 'auto-refresh':
        return '#e67e22';
      default:
        return '#27ae60';
    }
  }};
  color: white;
  margin-bottom: 10px;
`;

const LastTestTime = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
`;

const TokenInfo = styled.div`
  margin-bottom: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const Label = styled.span`
  font-weight: bold;
  color: #555;
`;

const Value = styled.span<{ status?: 'valid' | 'invalid' | 'warning' }>`
  font-family: monospace;
  color: ${(props) => {
    switch (props.status) {
      case 'invalid':
        return '#e74c3c';
      case 'valid':
        return '#27ae60';
      case 'warning':
        return '#f39c12';
      default:
        return '#333';
    }
  }};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const Button = styled.button<{ variant?: 'danger' | 'warning' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => {
    switch (props.variant) {
      case 'danger':
        return '#e74c3c';
      case 'warning':
        return '#f39c12';
      default:
        return '#3498db';
    }
  }};
  color: white;

  &:hover {
    background: ${(props) => {
      switch (props.variant) {
        case 'danger':
          return '#c0392b';
        case 'warning':
          return '#e67e22';
        default:
          return '#2980b9';
      }
    }};
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const MetricCard = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
`;

const MetricLabel = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 5px;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
`;

const MetricDescription = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const TestResults = styled.div`
  margin-top: 20px;
`;

const TestResult = styled.div<{ status: string }>`
  padding: 15px;
  margin-bottom: 15px;
  background: ${(props) => {
    switch (props.status) {
      case 'success':
        return '#d4edda';
      case 'warning':
        return '#fff3cd';
      default:
        return '#f8d7da';
    }
  }};
  border-radius: 6px;
  border-left: 4px solid
    ${(props) => {
      switch (props.status) {
        case 'success':
          return '#28a745';
        case 'warning':
          return '#ffc107';
        default:
          return '#dc3545';
      }
    }};
`;

const TestName = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 5px;
`;

const TestStatus = styled.span<{ status: string }>`
  font-size: 1.2rem;
  margin-right: 10px;
`;

const TestMessage = styled.div`
  margin: 10px 0;
  font-size: 0.9rem;
`;

const TestDetails = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;

  pre {
    margin: 0;
    font-size: 0.8rem;
    color: #333;
  }
`;

const TestError = styled.div`
  margin-top: 5px;
  font-size: 0.9rem;
  color: #721c24;
`;

const PayloadContainer = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;

  pre {
    margin: 0;
    font-size: 0.9rem;
    color: #333;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #666;
`;

const OptimizationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const OptimizationItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
`;

const OptimizationIcon = styled.span`
  font-size: 1.2rem;
  margin-right: 10px;
  margin-top: 2px;
`;

const OptimizationText = styled.span`
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #333;
`;

const ReportContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ReportContent = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;

  pre {
    margin: 0;
    font-size: 0.8rem;
    color: #333;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;
