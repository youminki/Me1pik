/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  getCurrentToken,
  getRefreshToken,
  hasValidToken,
  clearTokens,
  debugTokenStatus,
  saveTokens,
} from '@/utils/auth';

interface TokenInfo {
  accessToken: string | null;
  refreshToken: string | null;
  isValid: boolean;
  expiresAt: string | null;
  payload: Record<string, unknown> | null;
  timeUntilExpiry: string | null;
  storageStatus: {
    localStorage: boolean;
    sessionStorage: boolean;
    cookies: boolean;
  };
}

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: unknown;
  timestamp: string;
}

interface RefreshResult {
  success: boolean;
  beforeToken?: string | null;
  afterToken?: string | null;
  beforeRefresh?: string | null;
  afterRefresh?: string | null;
  message: string;
}

const TestDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshResult, setRefreshResult] = useState<RefreshResult | null>(
    null
  );
  const [autoRefreshInterval, setAutoRefreshInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);

  // 권한 확인 - 완화된 버전
  useEffect(() => {
    const checkAuthorization = async () => {
      setIsAuthorized(true);
    };

    checkAuthorization();
  }, []);

  // 토큰 정보 업데이트
  const updateTokenInfo = useCallback(() => {
    const accessToken = getCurrentToken();
    const refreshTokenValue = getRefreshToken();
    const isValid = hasValidToken();

    let expiresAt = null;
    let payload = null;
    let timeUntilExpiry = null;

    if (accessToken) {
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          payload = JSON.parse(atob(tokenParts[1]));
          expiresAt = new Date(payload.exp * 1000).toLocaleString();

          const currentTime = Date.now() / 1000;
          const timeLeft = payload.exp - currentTime;
          if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = Math.floor(timeLeft % 60);
            timeUntilExpiry = `${minutes}분 ${seconds}초`;
          } else {
            timeUntilExpiry = '만료됨';
          }
        }
      } catch (error) {
        console.error('토큰 파싱 오류:', error);
      }
    }

    const storageStatus = {
      localStorage: !!localStorage.getItem('accessToken'),
      sessionStorage: !!sessionStorage.getItem('accessToken'),
      cookies: !!document.cookie.includes('accessToken'),
    };

    setTokenInfo({
      accessToken,
      refreshToken: refreshTokenValue,
      isValid,
      expiresAt,
      payload,
      timeUntilExpiry,
      storageStatus,
    });
  }, []);

  // 로그인 지속성 테스트
  const runLoginPersistenceTest = useCallback(async () => {
    setIsLoading(true);
    const results: TestResult[] = [];

    try {
      const accessToken = getCurrentToken();
      const refreshToken = getRefreshToken();
      const autoLogin = localStorage.getItem('autoLogin');

      // 1. 현재 로그인 상태 확인
      results.push({
        name: '로그인 상태',
        status: accessToken ? 'success' : 'error',
        message: accessToken
          ? '로그인되어 있습니다'
          : '로그인되어 있지 않습니다',
        details: {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          autoLogin,
        },
        timestamp: new Date().toLocaleString(),
      });

      // 2. 토큰 유효성 검증
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const timeUntilExpiry = payload.exp - currentTime;

          results.push({
            name: '토큰 유효성',
            status: timeUntilExpiry > 0 ? 'success' : 'error',
            message:
              timeUntilExpiry > 0
                ? `토큰이 유효합니다 (${Math.floor(timeUntilExpiry / 60)}분 남음)`
                : '토큰이 만료되었습니다',
            details: {
              expiresAt: new Date(payload.exp * 1000).toLocaleString(),
              timeUntilExpiry: Math.floor(timeUntilExpiry / 60),
            },
            timestamp: new Date().toLocaleString(),
          });
        } catch (error) {
          results.push({
            name: '토큰 유효성',
            status: 'error',
            message: '토큰 파싱에 실패했습니다',
            details: {
              error: error instanceof Error ? error.message : '알 수 없는 오류',
            },
            timestamp: new Date().toLocaleString(),
          });
        }
      }

      // 3. 저장소 동기화 확인
      const storageStatus = {
        localStorage: !!localStorage.getItem('accessToken'),
        sessionStorage: !!sessionStorage.getItem('accessToken'),
        cookies: !!document.cookie.includes('accessToken'),
      };

      const allStoragesHaveToken = Object.values(storageStatus).every(Boolean);
      results.push({
        name: '저장소 동기화',
        status: allStoragesHaveToken ? 'success' : 'warning',
        message: allStoragesHaveToken
          ? '모든 저장소에 토큰이 동기화되어 있습니다'
          : '일부 저장소에 토큰이 없습니다',
        details: storageStatus,
        timestamp: new Date().toLocaleString(),
      });

      // 4. 자동 로그인 설정 확인
      results.push({
        name: '자동 로그인 설정',
        status: autoLogin === 'true' ? 'success' : 'warning',
        message:
          autoLogin === 'true'
            ? '자동 로그인이 활성화되어 있습니다'
            : '자동 로그인이 비활성화되어 있습니다',
        details: { autoLogin },
        timestamp: new Date().toLocaleString(),
      });

      // 5. 실제 API 호출 테스트
      if (accessToken) {
        try {
          const startTime = Date.now();
          const response = await fetch('https://api.stylewh.com/user/my-info', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          const duration = Date.now() - startTime;

          if (response.ok) {
            results.push({
              name: 'API 호출 테스트',
              status: 'success',
              message: `API 호출 성공 (${duration}ms)`,
              details: {
                endpoint: '/user/my-info',
                status: response.status,
                duration,
              },
              timestamp: new Date().toLocaleString(),
            });
          } else if (response.status === 401) {
            results.push({
              name: 'API 호출 테스트',
              status: 'error',
              message: '토큰이 유효하지 않습니다 (401 Unauthorized)',
              details: {
                endpoint: '/user/my-info',
                status: response.status,
                duration,
              },
              timestamp: new Date().toLocaleString(),
            });
          } else {
            results.push({
              name: 'API 호출 테스트',
              status: 'error',
              message: `API 호출 실패 (${response.status})`,
              details: {
                endpoint: '/user/my-info',
                status: response.status,
                duration,
              },
              timestamp: new Date().toLocaleString(),
            });
          }
        } catch (error) {
          results.push({
            name: 'API 호출 테스트',
            status: 'error',
            message: 'API 호출 중 네트워크 오류가 발생했습니다',
            details: {
              error: error instanceof Error ? error.message : '알 수 없는 오류',
            },
            timestamp: new Date().toLocaleString(),
          });
        }
      } else {
        results.push({
          name: 'API 호출 테스트',
          status: 'warning',
          message: '토큰이 없어서 API 호출을 건너뜁니다',
          details: {
            endpoint: '/user/my-info',
            hasToken: false,
          },
          timestamp: new Date().toLocaleString(),
        });
      }
    } catch (error) {
      results.push({
        name: '로그인 지속성 테스트',
        status: 'error',
        message: '테스트 중 오류가 발생했습니다',
        details: {
          error: error instanceof Error ? error.message : '알 수 없는 오류',
        },
        timestamp: new Date().toLocaleString(),
      });
    }

    setTestResults(results);
    setIsLoading(false);
  }, []);

  // 자동 새로고침 토글
  const toggleAutoRefresh = useCallback(() => {
    if (isAutoRefreshEnabled) {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        setAutoRefreshInterval(null);
      }
      setIsAutoRefreshEnabled(false);
    } else {
      const interval = setInterval(() => {
        updateTokenInfo();
        runLoginPersistenceTest();
        console.log('🔄 자동 테스트 업데이트:', new Date().toLocaleString());
      }, 10000); // 10초마다 업데이트
      setAutoRefreshInterval(interval);
      setIsAutoRefreshEnabled(true);
    }
  }, [
    isAutoRefreshEnabled,
    autoRefreshInterval,
    updateTokenInfo,
    runLoginPersistenceTest,
  ]);

  // 실제 토큰 갱신 테스트
  const testTokenRefresh = async () => {
    setIsLoading(true);
    setRefreshResult(null);

    try {
      const beforeToken = getCurrentToken();
      const beforeRefresh = getRefreshToken();

      if (!beforeRefresh) {
        setRefreshResult({
          success: false,
          beforeToken,
          afterToken: beforeToken,
          beforeRefresh,
          afterRefresh: beforeRefresh,
          message: '리프레시 토큰이 없어서 갱신할 수 없습니다',
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://api.stylewh.com/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: beforeRefresh,
          autoLogin: localStorage.getItem('autoLogin') === 'true',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        data;

      saveTokens(newAccessToken, newRefreshToken);

      const afterToken = getCurrentToken();
      const afterRefresh = getRefreshToken();

      setRefreshResult({
        success: true,
        beforeToken,
        afterToken,
        beforeRefresh,
        afterRefresh,
        message: '토큰 갱신이 성공했습니다',
      });

      updateTokenInfo();
    } catch (error) {
      setRefreshResult({
        success: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }
    setIsLoading(false);
  };

  // 브라우저 새로고침 시뮬레이션
  const simulateBrowserRefresh = () => {
    const beforeToken = getCurrentToken();
    const beforeRefresh = getRefreshToken();
    const autoLogin = localStorage.getItem('autoLogin');

    if (beforeToken) {
      sessionStorage.setItem('accessToken', beforeToken);
      sessionStorage.setItem('refreshToken', beforeRefresh || '');
    }

    alert(
      `브라우저 새로고침 시뮬레이션:\n` +
        `- 현재 토큰: ${beforeToken ? '있음' : '없음'}\n` +
        `- 자동 로그인: ${autoLogin === 'true' ? '활성화' : '비활성화'}\n` +
        `- sessionStorage 백업 완료\n\n` +
        `실제 새로고침을 테스트하려면 F5를 누르세요.`
    );
  };

  // 토큰 삭제
  const handleClearTokens = () => {
    clearTokens();
    updateTokenInfo();
    alert('토큰이 삭제되었습니다.');
  };

  // 로그아웃
  const handleLogout = () => {
    clearTokens();
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  // 디버그 정보 출력
  const showDebugInfo = () => {
    debugTokenStatus();
    console.log('🔍 상세 토큰 정보:', tokenInfo);
  };

  useEffect(() => {
    if (isAuthorized) {
      updateTokenInfo();
      runLoginPersistenceTest();
    }
  }, [isAuthorized, updateTokenInfo, runLoginPersistenceTest]);

  // 컴포넌트 언마운트 시 인터벌 정리
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

  if (!isAuthorized) {
    return <LoadingContainer>권한 확인 중...</LoadingContainer>;
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>🔐 로그인 지속성 테스트 대시보드</Title>
          <Subtitle>로그인 상태가 계속 유지되는지 테스트</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <ActionButton
            onClick={toggleAutoRefresh}
            variant={isAutoRefreshEnabled ? 'success' : 'default'}
          >
            {isAutoRefreshEnabled ? '🔄 자동 테스트 ON' : '⏸️ 자동 테스트 OFF'}
          </ActionButton>
          <ActionButton onClick={handleLogout} variant='danger'>
            🚪 로그아웃
          </ActionButton>
        </HeaderActions>
      </Header>

      <DashboardGrid>
        {/* 토큰 정보 섹션 */}
        <DashboardCard>
          <CardHeader>
            <CardTitle>🔑 토큰 정보</CardTitle>
            <CardActions>
              <ActionButton onClick={updateTokenInfo} size='small'>
                🔄 새로고침
              </ActionButton>
              <ActionButton onClick={showDebugInfo} size='small'>
                🐛 디버그
              </ActionButton>
            </CardActions>
          </CardHeader>

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
                  tokenInfo?.timeUntilExpiry === '만료됨' ? 'invalid' : 'valid'
                }
              >
                {tokenInfo?.timeUntilExpiry || '알 수 없음'}
              </Value>
            </InfoRow>
            <InfoRow>
              <Label>저장소 상태:</Label>
              <Value>
                {tokenInfo?.storageStatus ? (
                  <StorageStatus>
                    <StorageItem
                      status={
                        tokenInfo.storageStatus.localStorage
                          ? 'success'
                          : 'error'
                      }
                    >
                      LS: {tokenInfo.storageStatus.localStorage ? '✅' : '❌'}
                    </StorageItem>
                    <StorageItem
                      status={
                        tokenInfo.storageStatus.sessionStorage
                          ? 'success'
                          : 'error'
                      }
                    >
                      SS: {tokenInfo.storageStatus.sessionStorage ? '✅' : '❌'}
                    </StorageItem>
                    <StorageItem
                      status={
                        tokenInfo.storageStatus.cookies ? 'success' : 'error'
                      }
                    >
                      Cookie: {tokenInfo.storageStatus.cookies ? '✅' : '❌'}
                    </StorageItem>
                  </StorageStatus>
                ) : (
                  '알 수 없음'
                )}
              </Value>
            </InfoRow>
          </TokenInfo>

          <ButtonGroup>
            <ActionButton onClick={testTokenRefresh} disabled={isLoading}>
              🔄 토큰 갱신 테스트
            </ActionButton>
            <ActionButton onClick={simulateBrowserRefresh} variant='warning'>
              🔄 새로고침 시뮬레이션
            </ActionButton>
            <ActionButton onClick={handleClearTokens} variant='danger'>
              🗑️ 토큰 삭제
            </ActionButton>
          </ButtonGroup>

          {/* 갱신 결과 표시 */}
          {refreshResult && (
            <RefreshResultBox success={refreshResult.success}>
              <div>
                <b>{refreshResult.message}</b>
              </div>
              <div>
                갱신 전 AccessToken:{' '}
                <code>{refreshResult.beforeToken?.slice(0, 30)}...</code>
              </div>
              <div>
                갱신 후 AccessToken:{' '}
                <code>{refreshResult.afterToken?.slice(0, 30)}...</code>
              </div>
            </RefreshResultBox>
          )}
        </DashboardCard>

        {/* 테스트 결과 섹션 */}
        <DashboardCard>
          <CardHeader>
            <CardTitle>🧪 로그인 지속성 테스트</CardTitle>
            <CardActions>
              <ActionButton
                onClick={runLoginPersistenceTest}
                disabled={isLoading}
                size='small'
              >
                {isLoading ? '테스트 중...' : '🔄 실행'}
              </ActionButton>
            </CardActions>
          </CardHeader>

          <TestResults>
            {testResults.map((result, index) => (
              <TestResult
                key={index}
                status={result.status as 'success' | 'error' | 'warning'}
              >
                <TestHeader>
                  <TestName>{result.name}</TestName>
                  <TestStatus
                    status={result.status as 'success' | 'error' | 'warning'}
                  >
                    {result.status === 'success'
                      ? '✅'
                      : result.status === 'warning'
                        ? '⚠️'
                        : '❌'}
                  </TestStatus>
                </TestHeader>
                <TestMessage>{result.message}</TestMessage>
                <TestTimestamp>{result.timestamp}</TestTimestamp>
                {result.details && typeof result.details === 'object' && (
                  <TestDetails>
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </TestDetails>
                )}
              </TestResult>
            ))}
          </TestResults>
        </DashboardCard>
      </DashboardGrid>
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
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
`;

const DashboardCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f8f9fa;
`;

const CardTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{
  variant?: 'danger' | 'warning' | 'success' | 'default';
  size?: 'small';
}>`
  padding: ${(props) => (props.size === 'small' ? '8px 16px' : '12px 20px')};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: ${(props) => (props.size === 'small' ? '0.85rem' : '0.9rem')};
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => {
    switch (props.variant) {
      case 'danger':
        return '#e74c3c';
      case 'warning':
        return '#f39c12';
      case 'success':
        return '#27ae60';
      default:
        return '#667eea';
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
        case 'success':
          return '#229954';
        default:
          return '#5a6fd8';
      }
    }};
    transform: translateY(-1px);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
  }
`;

const TokenInfo = styled.div`
  margin-bottom: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
`;

const Label = styled.span`
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
`;

const Value = styled.span<{ status?: 'valid' | 'invalid' }>`
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.85rem;
  color: ${(props) =>
    props.status === 'invalid'
      ? '#e74c3c'
      : props.status === 'valid'
        ? '#27ae60'
        : '#333'};
`;

const StorageStatus = styled.div`
  display: flex;
  gap: 8px;
  font-size: 0.8rem;
`;

const StorageItem = styled.span<{ status: 'success' | 'error' }>`
  color: ${(props) => (props.status === 'success' ? '#27ae60' : '#e74c3c')};
  font-weight: 600;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const TestResults = styled.div`
  margin-top: 16px;
`;

const TestResult = styled.div<any>`
  padding: 16px;
  margin-bottom: 12px;
  background: ${(props) => {
    switch (props.status) {
      case 'success':
        return '#d4edda';
      case 'warning':
        return '#fff3cd';
      case 'error':
        return '#f8d7da';
      default:
        return '#f8f9fa';
    }
  }};
  border-radius: 8px;
  border-left: 4px solid
    ${(props) => {
      switch (props.status) {
        case 'success':
          return '#28a745';
        case 'warning':
          return '#ffc107';
        case 'error':
          return '#dc3545';
        default:
          return '#6c757d';
      }
    }};
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const TestName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
`;

const TestStatus = styled.span<any>`
  font-size: 1.1rem;
`;

const TestMessage = styled.div`
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 6px;
`;

const TestTimestamp = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 8px;
`;

const TestDetails = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;

  pre {
    margin: 0;
    font-size: 0.75rem;
    color: #333;
    line-height: 1.3;
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

const RefreshResultBox = styled.div<any>`
  background: ${({ success }) => (success ? '#e8f5e9' : '#ffebee')};
  color: ${({ success }) => (success ? '#2e7d32' : '#c62828')};
  border: 1px solid ${({ success }) => (success ? '#81c784' : '#ef9a9a')};
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0 0 0;
  font-size: 0.95rem;
  code {
    font-size: 0.85em;
    color: #333;
  }
`;
