import React, { useState, useEffect, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<
    string[]
  >([]);
  const [performanceReport, setPerformanceReport] = useState<string>('');

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

  // 토큰 정보 업데이트
  const updateTokenInfo = useCallback(() => {
    const accessToken = getCurrentToken();
    const refreshTokenValue = getRefreshToken();
    const isValid = hasValidToken();

    let expiresAt = null;
    let payload = null;

    if (accessToken) {
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          payload = JSON.parse(atob(tokenParts[1]));
          expiresAt = new Date(payload.exp * 1000).toLocaleString();
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

  // API 테스트
  const runApiTests = useCallback(async () => {
    setIsLoading(true);
    const results: Array<{
      name: string;
      status: 'success' | 'error';
      response?: unknown;
      error?: string;
    }> = [];

    try {
      // 1. 토큰 유효성 테스트
      const tokenTest = await Axios.get('/api/test/token');
      results.push({
        name: '토큰 유효성 테스트',
        status: 'success',
        response: tokenTest.data,
      });
    } catch (error) {
      results.push({
        name: '토큰 유효성 테스트',
        status: 'error',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
    }

    try {
      // 2. 사용자 정보 조회 테스트
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

    try {
      // 3. 토큰 갱신 테스트
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
    }

    setApiTestResults(results);
    setIsLoading(false);
  }, []);

  // 토큰 갱신
  const handleRefreshToken = async () => {
    try {
      const success = await refreshToken();
      if (success) {
        alert('토큰 갱신 성공!');
        updateTokenInfo();
      } else {
        alert('토큰 갱신 실패');
      }
    } catch (error) {
      alert(
        `토큰 갱신 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      );
    }
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

  useEffect(() => {
    if (isAuthorized) {
      updateTokenInfo();
      collectPerformanceMetrics();
      runApiTests();

      // 성능 최적화 제안 업데이트
      const suggestions = getOptimizationSuggestions();
      setOptimizationSuggestions(suggestions);

      // 성능 리포트 생성
      const report = getPerformanceReport();
      setPerformanceReport(report);
    }
  }, [isAuthorized, updateTokenInfo, collectPerformanceMetrics, runApiTests]);

  if (!isAuthorized) {
    return <LoadingContainer>권한 확인 중...</LoadingContainer>;
  }

  return (
    <Container>
      <Header>
        <Title>🧪 테스트 대시보드</Title>
        <Subtitle>dbalsrl7648@naver.com 전용 테스트 페이지</Subtitle>
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
          </TokenInfo>
          <ButtonGroup>
            <Button onClick={updateTokenInfo}>🔄 토큰 정보 새로고침</Button>
            <Button onClick={handleRefreshToken}>🔄 토큰 갱신</Button>
            <Button onClick={handleClearTokens} variant='danger'>
              🗑️ 토큰 삭제
            </Button>
            <Button onClick={handleLogout} variant='danger'>
              🚪 로그아웃
            </Button>
          </ButtonGroup>
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
  margin: 0;
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

const Value = styled.span<{ status?: 'valid' | 'invalid' }>`
  font-family: monospace;
  color: ${(props) =>
    props.status === 'invalid'
      ? '#e74c3c'
      : props.status === 'valid'
        ? '#27ae60'
        : '#333'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) =>
    props.variant === 'danger' ? '#e74c3c' : '#3498db'};
  color: white;

  &:hover {
    background: ${(props) =>
      props.variant === 'danger' ? '#c0392b' : '#2980b9'};
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
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  background: ${(props) =>
    props.status === 'success' ? '#d4edda' : '#f8d7da'};
  border-radius: 6px;
  border-left: 4px solid
    ${(props) => (props.status === 'success' ? '#28a745' : '#dc3545')};
`;

const TestName = styled.span`
  flex: 1;
  font-weight: bold;
`;

const TestStatus = styled.span<{ status: string }>`
  margin-left: 10px;
  font-size: 1.2rem;
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
