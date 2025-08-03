import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getHeaderInfo } from '@/api-utils/user-managements/users/userApi';
import {
  debugTokenStatus,
  refreshToken,
  clearTokens,
  getCurrentToken,
  simulateTokenExpiry,
  testAutoRefresh,
} from '@/utils/auth';
import {
  runTokenSystemTest,
  runTokenRefreshTest,
  runMultiStorageTest,
  checkRefreshTokenStatus,
  testRefreshTokenRenewal,
  testRefreshTokenStorage,
} from '@/utils/tokenTest';

const ALLOWED_EMAIL = 'dbalsrl7648@naver.com';

interface TestResult {
  name: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
}

const TokenTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // 권한 확인
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        setIsLoading(true);

        // 1. 토큰 존재 여부 확인
        const token = getCurrentToken();
        if (!token) {
          console.log('🚫 토큰이 없어서 접근 거부됨');
          setIsAuthorized(false);
          return;
        }

        // 2. 사용자 정보 조회
        const headerInfo = await getHeaderInfo();
        const userEmail = headerInfo.email;

        // 3. 이메일 확인
        if (userEmail === ALLOWED_EMAIL) {
          setIsAuthorized(true);
          console.log('🔐 토큰 테스트 페이지 접근 권한 확인됨:', userEmail);
        } else {
          setIsAuthorized(false);
          console.log('🚫 토큰 테스트 페이지 접근 거부됨:', userEmail);
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, []);

  // 테스트 결과 추가 함수
  const addTestResult = (
    name: string,
    status: 'success' | 'error',
    message: string
  ) => {
    const result: TestResult = {
      name,
      status,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTestResults((prev) => [result, ...prev]);
  };

  // 테스트 실행 함수
  const runTest = async (
    testName: string,
    testFn: () => Promise<void> | void
  ) => {
    if (isRunning) return;

    setIsRunning(true);

    try {
      await testFn();
      addTestResult(testName, 'success', '테스트 완료');
    } catch (error) {
      addTestResult(testName, 'error', `테스트 실패: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 기본 토큰 테스트들
  const basicTests = [
    {
      name: '토큰 상태 확인',
      fn: () => debugTokenStatus(),
    },
    {
      name: '수동 토큰 갱신',
      fn: async () => {
        const success = await refreshToken();
        if (!success) throw new Error('토큰 갱신 실패');
      },
    },
    {
      name: '토큰 만료 시뮬레이션',
      fn: () => simulateTokenExpiry(),
    },
    {
      name: '자동 갱신 테스트',
      fn: async () => {
        const success = await testAutoRefresh();
        if (!success) throw new Error('자동 갱신 테스트 실패');
      },
    },
    {
      name: '토큰 삭제',
      fn: () => clearTokens(),
    },
  ];

  // 고급 토큰 테스트들
  const advancedTests = [
    {
      name: '토큰 시스템 종합 테스트',
      fn: () => runTokenSystemTest(),
    },
    {
      name: '토큰 갱신 테스트',
      fn: () => runTokenRefreshTest(),
    },
    {
      name: '다중 저장소 테스트',
      fn: () => runMultiStorageTest(),
    },
    {
      name: '리프레시 토큰 상태 확인',
      fn: () => checkRefreshTokenStatus(),
    },
    {
      name: '리프레시 토큰 갱신 테스트',
      fn: () => testRefreshTokenRenewal(),
    },
    {
      name: '리프레시 토큰 저장 테스트',
      fn: () => testRefreshTokenStorage(),
    },
  ];

  // 로딩 중
  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>권한 확인 중...</div>
      </div>
    );
  }

  // 권한 없음
  if (!isAuthorized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🚫 접근 거부</h2>
        <p>이 페이지에 접근할 권한이 없습니다.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          🔧 토큰 시스템 테스트
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          👤 {ALLOWED_EMAIL} 전용 테스트 페이지
        </p>
        <div
          style={{
            background: '#e8f4fd',
            padding: '10px',
            borderRadius: '4px',
            marginTop: '10px',
            fontSize: '12px',
          }}
        >
          💡 브라우저 콘솔에서 더 자세한 정보를 확인할 수 있습니다.
        </div>
      </div>

      {/* 테스트 섹션들 */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
      >
        {/* 기본 테스트 */}
        <div
          style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginBottom: '15px', color: '#333' }}>
            기본 토큰 테스트
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {basicTests.map((test) => (
              <button
                key={test.name}
                onClick={() => runTest(test.name, test.fn)}
                disabled={isRunning}
                style={{
                  padding: '10px 15px',
                  background: isRunning ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                {test.name}
              </button>
            ))}
          </div>
        </div>

        {/* 고급 테스트 */}
        <div
          style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginBottom: '15px', color: '#333' }}>
            고급 토큰 테스트
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {advancedTests.map((test) => (
              <button
                key={test.name}
                onClick={() => runTest(test.name, test.fn)}
                disabled={isRunning}
                style={{
                  padding: '10px 15px',
                  background: isRunning ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                }}
              >
                {test.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 테스트 결과 */}
      {testResults.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>테스트 결과</h3>
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ fontSize: '14px' }}>{result.name}</strong>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '4px',
                    }}
                  >
                    {result.message}
                  </div>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <span style={{ fontSize: '11px', color: '#999' }}>
                    {result.timestamp}
                  </span>
                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      color: 'white',
                      background:
                        result.status === 'success'
                          ? '#28a745'
                          : result.status === 'error'
                            ? '#dc3545'
                            : '#ffc107',
                    }}
                  >
                    {result.status === 'success'
                      ? '✅'
                      : result.status === 'error'
                        ? '❌'
                        : '⏳'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 하단 버튼들 */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setTestResults([])}
          style={{
            padding: '10px 20px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          결과 초기화
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default TokenTestPage;
