import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface TestResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown>;
}

const TestLogin: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runAutoLoginTest = () => {
    setIsLoading(true);
    const results: TestResult[] = [];

    try {
      // 1. 자동 로그인 설정 확인
      const autoLogin = localStorage.getItem('autoLogin') === 'true';
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      const autoRefreshInterval = localStorage.getItem('autoRefreshInterval');

      results.push({
        name: '자동 로그인 설정',
        status: autoLogin ? 'success' : 'warning',
        message: autoLogin
          ? '✅ 30일 자동 로그인이 활성화되어 있습니다'
          : '⚠️ 30일 자동 로그인이 비활성화되어 있습니다',
        details: {
          autoLogin,
          loginTimestamp: loginTimestamp
            ? new Date(parseInt(loginTimestamp)).toLocaleString()
            : null,
          autoRefreshInterval: !!autoRefreshInterval,
        },
      });

      // 2. 토큰 저장소 확인
      const storageStatus = {
        localStorage: !!localStorage.getItem('accessToken'),
        sessionStorage: !!sessionStorage.getItem('accessToken'),
        cookies: !!document.cookie.includes('accessToken'),
      };

      const persistentCount =
        Object.values(storageStatus).filter(Boolean).length;
      results.push({
        name: '다중 저장소 상태',
        status: persistentCount >= 3 ? 'success' : 'warning',
        message:
          persistentCount >= 3
            ? '✅ 모든 저장소에 토큰이 저장되어 있습니다'
            : `⚠️ ${persistentCount}개 저장소에만 토큰이 저장되어 있습니다`,
        details: storageStatus,
      });

      // 3. 쿠키 확인
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('accessToken=')
      );

      results.push({
        name: '쿠키 지속성',
        status: accessTokenCookie ? 'success' : 'warning',
        message: accessTokenCookie
          ? '✅ 쿠키가 설정되어 있습니다'
          : '⚠️ 쿠키가 설정되지 않았습니다',
        details: {
          hasCookie: !!accessTokenCookie,
          cookieValue: accessTokenCookie
            ? accessTokenCookie.substring(0, 50) + '...'
            : null,
        },
      });

      // 4. 토큰 유효성 확인
      const accessToken =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken') ||
        (document.cookie.match(/accessToken=([^;]+)/) || [])[1];

      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const currentTime = Date.now() / 1000;
          const timeUntilExpiry = payload.exp - currentTime;
          const minutesLeft = Math.floor(timeUntilExpiry / 60);

          results.push({
            name: '토큰 유효성',
            status: timeUntilExpiry > 0 ? 'success' : 'error',
            message:
              timeUntilExpiry > 0
                ? `✅ 토큰이 ${minutesLeft}분 후 만료됩니다`
                : '❌ 토큰이 만료되었습니다',
            details: {
              expiresAt: new Date(payload.exp * 1000).toLocaleString(),
              minutesLeft,
              isExpired: timeUntilExpiry <= 0,
            },
          });
        } catch (error) {
          results.push({
            name: '토큰 유효성',
            status: 'error',
            message: '토큰 파싱에 실패했습니다',
            details: {
              error: error instanceof Error ? error.message : String(error),
            },
          });
        }
      } else {
        results.push({
          name: '토큰 유효성',
          status: 'error',
          message: '토큰이 없습니다',
          details: { hasToken: false },
        });
      }

      // 5. 자동 갱신 인터벌 확인
      const hasAutoRefresh = !!autoRefreshInterval;
      results.push({
        name: '자동 갱신 인터벌',
        status: hasAutoRefresh ? 'success' : 'warning',
        message: hasAutoRefresh
          ? '✅ 자동 갱신 인터벌이 설정되어 있습니다'
          : '⚠️ 자동 갱신 인터벌이 설정되지 않았습니다',
        details: {
          hasInterval: hasAutoRefresh,
          intervalId: autoRefreshInterval,
        },
      });
    } catch (error) {
      results.push({
        name: '테스트 오류',
        status: 'error',
        message: '테스트 실행 중 오류가 발생했습니다',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const setup30DayAutoLogin = () => {
    // 테스트용 토큰 생성 (실제로는 로그인 후 받아야 함)
    const testAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.test';
    const testRefreshToken = 'refresh_token_test_123';

    // 1. 모든 저장소에 토큰 저장
    localStorage.setItem('accessToken', testAccessToken);
    localStorage.setItem('refreshToken', testRefreshToken);
    sessionStorage.setItem('accessToken', testAccessToken);
    sessionStorage.setItem('refreshToken', testRefreshToken);

    // 2. 쿠키에 토큰 저장 (30일 만료)
    const maxAge = 30 * 24 * 60 * 60;
    document.cookie = `accessToken=${testAccessToken}; max-age=${maxAge}; path=/; SameSite=Strict`;
    document.cookie = `refreshToken=${testRefreshToken}; max-age=${maxAge}; path=/; SameSite=Strict`;

    // 3. 자동 로그인 설정
    localStorage.setItem('autoLogin', 'true');
    localStorage.setItem('loginTimestamp', Date.now().toString());

    // 4. 자동 갱신 인터벌 설정
    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 자동 토큰 갱신 체크:', new Date().toLocaleString());
    }, 60000); // 1분마다

    localStorage.setItem('autoRefreshInterval', autoRefreshInterval.toString());

    console.log('🔐 30일 자동 로그인 설정 완료');
    runAutoLoginTest();
  };

  const disable30DayAutoLogin = () => {
    // 자동 로그인 해제
    localStorage.removeItem('autoLogin');
    localStorage.removeItem('loginTimestamp');

    // 자동 갱신 중지
    const intervalId = localStorage.getItem('autoRefreshInterval');
    if (intervalId) {
      clearInterval(parseInt(intervalId));
      localStorage.removeItem('autoRefreshInterval');
    }

    // 쿠키 삭제
    document.cookie =
      'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie =
      'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    console.log('🔓 30일 자동 로그인 해제 완료');
    runAutoLoginTest();
  };

  useEffect(() => {
    runAutoLoginTest();
  }, []);

  return (
    <Container>
      <Header>
        <Title>🔐 30일 자동 로그인 테스트</Title>
        <Subtitle>로그인 상태가 30일간 유지되는지 확인</Subtitle>
      </Header>

      <ButtonGroup>
        <Button onClick={setup30DayAutoLogin} variant='success'>
          🔐 30일 자동 로그인 설정
        </Button>
        <Button onClick={disable30DayAutoLogin} variant='warning'>
          🔓 30일 자동 로그인 해제
        </Button>
        <Button onClick={runAutoLoginTest} disabled={isLoading}>
          {isLoading ? '테스트 중...' : '🔄 상태 확인'}
        </Button>
      </ButtonGroup>

      <TestResults>
        {testResults.map((result, index) => (
          <TestResult key={index} status={result.status}>
            <TestHeader>
              <TestName>{result.name}</TestName>
              <TestStatus status={result.status}>
                {result.status === 'success'
                  ? '✅'
                  : result.status === 'warning'
                    ? '⚠️'
                    : '❌'}
              </TestStatus>
            </TestHeader>
            <TestMessage>{result.message}</TestMessage>
            {result.details && (
              <TestDetails>
                <pre>{String(JSON.stringify(result.details, null, 2))}</pre>
              </TestDetails>
            )}
          </TestResult>
        ))}
      </TestResults>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'NanumSquareNeo', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'success' | 'warning' | 'danger' }>`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: ${(props) => {
    switch (props.variant) {
      case 'success':
        return '#28a745';
      case 'warning':
        return '#ffc107';
      case 'danger':
        return '#dc3545';
      default:
        return '#007bff';
    }
  }};
  color: white;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TestResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TestResult = styled.div<{ status: 'success' | 'warning' | 'error' }>`
  padding: 16px;
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
`;

const TestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const TestName = styled.span`
  font-weight: 600;
  color: #333;
`;

const TestStatus = styled.span<{ status: 'success' | 'warning' | 'error' }>`
  font-size: 1.2rem;
`;

const TestMessage = styled.div`
  color: #555;
  margin-bottom: 8px;
`;

const TestDetails = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 8px;
  margin-top: 8px;

  pre {
    margin: 0;
    font-size: 12px;
    color: #333;
  }
`;

export default TestLogin;
