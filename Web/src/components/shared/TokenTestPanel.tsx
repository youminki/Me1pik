import React, { useState, useEffect } from 'react';

import { getHeaderInfo } from '@/api-utils/user-managements/users/userApi';
import { debugTokenStatus, refreshToken, clearTokens } from '@/utils/auth';

const ALLOWED_EMAIL = 'dbalsrl7648@naver.com';

const TokenTestPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 사용자 이메일 확인
  useEffect(() => {
    const checkUserAuthorization = async () => {
      try {
        setIsLoading(true);
        const headerInfo = await getHeaderInfo();
        const userEmail = headerInfo.email;

        if (userEmail === ALLOWED_EMAIL) {
          setIsAuthorized(true);
          console.log('🔐 토큰 테스트 패널 접근 권한 확인됨:', userEmail);
        } else {
          setIsAuthorized(false);
          console.log('🚫 토큰 테스트 패널 접근 거부됨:', userEmail);
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuthorization();
  }, []);

  const runTest = async (
    testName: string,
    testFn: () => Promise<void> | void
  ) => {
    setStatus(`🧪 ${testName} 실행 중...`);
    try {
      await testFn();
      setStatus(`✅ ${testName} 완료`);
    } catch (error) {
      setStatus(`❌ ${testName} 실패: ${error}`);
    }
  };

  const testTokenStatus = () => {
    runTest('토큰 상태 확인', () => {
      debugTokenStatus();
    });
  };

  const testManualRefresh = async () => {
    runTest('수동 토큰 갱신', async () => {
      const success = await refreshToken();
      if (!success) {
        throw new Error('토큰 갱신 실패');
      }
    });
  };

  const testClearTokens = () => {
    runTest('토큰 삭제', () => {
      clearTokens();
    });
  };

  const testSimulateExpiry = () => {
    runTest('토큰 만료 시뮬레이션', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).simulateTokenExpiry();
    });
  };

  const testAutoRefresh = async () => {
    runTest('자동 갱신 테스트', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const success = await (window as any).testAutoRefresh();
      if (!success) {
        throw new Error('자동 갱신 테스트 실패');
      }
    });
  };

  // 로딩 중이거나 권한이 없는 경우 렌더링하지 않음
  if (isLoading || !isAuthorized) {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        🔧 토큰 테스트
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#fff',
        border: '2px solid #007bff',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        maxWidth: '300px',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <strong>🔧 토큰 시스템 테스트</strong>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            margin: 0,
            padding: '4px 8px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          fontSize: '10px',
          color: '#666',
          marginBottom: '8px',
          padding: '4px',
          background: '#e8f4fd',
          borderRadius: '4px',
        }}
      >
        👤 {ALLOWED_EMAIL} 전용
      </div>

      <button
        onClick={testTokenStatus}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          margin: '4px',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        토큰 상태 확인
      </button>
      <button
        onClick={testManualRefresh}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          margin: '4px',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        수동 갱신 테스트
      </button>
      <button
        onClick={testAutoRefresh}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          margin: '4px',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        자동 갱신 테스트
      </button>
      <button
        onClick={testSimulateExpiry}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          margin: '4px',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        만료 시뮬레이션
      </button>
      <button
        onClick={testClearTokens}
        style={{
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          margin: '4px',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        토큰 삭제
      </button>

      {status && (
        <div
          style={{
            margin: '8px 0',
            padding: '8px',
            background: '#f8f9fa',
            borderRadius: '4px',
            borderLeft: '3px solid #007bff',
          }}
        >
          {status}
        </div>
      )}

      <div style={{ fontSize: '10px', color: '#666', marginTop: '8px' }}>
        브라우저 콘솔에서 더 자세한 정보를 확인할 수 있습니다.
      </div>
    </div>
  );
};

export default TokenTestPanel;
