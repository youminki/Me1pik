import React, { useState, useEffect } from 'react';
import { sslManager } from '../utils/sslManager';

const SSLTest: React.FC = () => {
  const [domain, setDomain] = useState('me1pik.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [tokenConfigured, setTokenConfigured] = useState(false);

  useEffect(() => {
    // 토큰 설정 상태 확인
    setTokenConfigured(sslManager.isTokenConfigured());
  }, []);

  const testSSLCreation = async () => {
    if (!tokenConfigured) {
      setError(
        'Vercel API 토큰이 설정되지 않았습니다.\n' +
          sslManager.getTokenSetupGuide()
      );
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      // SSL 인증서 생성 테스트 (비동기)
      const response = await sslManager.createSSLCertificate({
        domain: domain.trim(),
        forceRenewal: false,
        waitForCompletion: false,
      });

      setResult(
        `SSL 인증서 생성 요청 성공!\n요청 ID: ${response.requestId}\n상태: ${response.status}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const testSSLStatus = async () => {
    if (!tokenConfigured) {
      setError(
        'Vercel API 토큰이 설정되지 않았습니다.\n' +
          sslManager.getTokenSetupGuide()
      );
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const status = await sslManager.checkSSLStatus(domain.trim());
      setResult(
        `SSL 상태 확인 성공!\n도메인: ${status.domain}\n상태: ${status.sslStatus}\n마지막 확인: ${status.lastChecked.toLocaleString('ko-KR')}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const testSSLRenewal = async () => {
    if (!tokenConfigured) {
      setError(
        'Vercel API 토큰이 설정되지 않았습니다.\n' +
          sslManager.getTokenSetupGuide()
      );
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await sslManager.renewSSLCertificate(domain.trim());
      setResult(
        `SSL 인증서 갱신 요청 성공!\n요청 ID: ${response.requestId}\n상태: ${response.status}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const testAllDomains = async () => {
    if (!tokenConfigured) {
      setError(
        'Vercel API 토큰이 설정되지 않았습니다.\n' +
          sslManager.getTokenSetupGuide()
      );
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const allStatuses = await sslManager.checkAllDomainsSSL();
      const statusText = allStatuses
        .map(
          (status) =>
            `${status.domain}: ${status.sslStatus} (${status.lastChecked.toLocaleString('ko-KR')})`
        )
        .join('\n');

      setResult(`모든 도메인 SSL 상태:\n${statusText}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const testExpiringCertificates = async () => {
    if (!tokenConfigured) {
      setError(
        'Vercel API 토큰이 설정되지 않았습니다.\n' +
          sslManager.getTokenSetupGuide()
      );
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const expiringCerts = await sslManager.getExpiringCertificates(30);
      if (expiringCerts.length === 0) {
        setResult('30일 이내에 만료되는 SSL 인증서가 없습니다.');
      } else {
        const certText = expiringCerts
          .map(
            (cert) =>
              `${cert.domain}: ${cert.expiresAt?.toLocaleDateString('ko-KR')} 만료`
          )
          .join('\n');
        setResult(`만료 예정 SSL 인증서:\n${certText}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshTokenStatus = () => {
    setTokenConfigured(sslManager.isTokenConfigured());
    setError('');
    setResult('');
  };

  return (
    <div className='min-h-screen bg-gray-100 p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-6'>
            🔒 SSL 인증서 비동기 생성 시스템 테스트
          </h1>

          {/* 토큰 설정 상태 표시 */}
          <div
            className={`p-4 rounded-lg mb-6 ${
              tokenConfigured
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    tokenConfigured ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {tokenConfigured
                    ? '✅ Vercel API 토큰 설정됨'
                    : '❌ Vercel API 토큰 미설정'}
                </h3>
                <p
                  className={`text-sm ${
                    tokenConfigured ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {tokenConfigured
                    ? 'SSL 인증서 관리 기능을 사용할 수 있습니다.'
                    : 'SSL 인증서 관리 기능을 사용하려면 Vercel API 토큰을 설정해야 합니다.'}
                </p>
              </div>
              <button
                onClick={refreshTokenStatus}
                className='px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm'
              >
                상태 새로고침
              </button>
            </div>
          </div>

          {/* 토큰 설정 가이드 */}
          {!tokenConfigured && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
              <h3 className='text-lg font-semibold text-blue-800 mb-2'>
                🔑 Vercel API 토큰 설정 가이드
              </h3>
              <div className='text-sm text-blue-700 space-y-2'>
                <p>
                  <strong>1단계:</strong>{' '}
                  <a
                    href='https://vercel.com/account/tokens'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline'
                  >
                    Vercel 토큰 페이지
                  </a>
                  에서 새 토큰 생성
                </p>
                <p>
                  <strong>2단계:</strong> 토큰 이름 입력 (예: "SSL Management")
                </p>
                <p>
                  <strong>3단계:</strong> 생성된 토큰 복사
                </p>
                <p>
                  <strong>4단계:</strong> Vercel Dashboard → Project Settings →
                  Environment Variables
                </p>
                <p>
                  <strong>5단계:</strong> VERCEL_TOKEN 이름으로 토큰 값 추가
                </p>
                <p>
                  <strong>6단계:</strong> 프로젝트 재배포
                </p>
              </div>
            </div>
          )}

          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              테스트할 도메인
            </label>
            <input
              type='text'
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='도메인 입력 (예: me1pik.com)'
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <button
              onClick={testSSLCreation}
              disabled={!tokenConfigured || loading}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? '테스트 중...' : 'SSL 생성 테스트'}
            </button>

            <button
              onClick={testSSLStatus}
              disabled={!tokenConfigured || loading}
              className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? '테스트 중...' : 'SSL 상태 확인'}
            </button>

            <button
              onClick={testSSLRenewal}
              disabled={!tokenConfigured || loading}
              className='px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? '테스트 중...' : 'SSL 갱신 테스트'}
            </button>

            <button
              onClick={testAllDomains}
              disabled={!tokenConfigured || loading}
              className='px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? '테스트 중...' : '모든 도메인 확인'}
            </button>
          </div>

          <button
            onClick={testExpiringCertificates}
            disabled={!tokenConfigured || loading}
            className='w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed mb-6'
          >
            {loading ? '테스트 중...' : '만료 예정 인증서 확인'}
          </button>

          {/* 결과 표시 */}
          {result && (
            <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-4'>
              <h3 className='text-lg font-semibold text-green-800 mb-2'>
                ✅ 테스트 결과
              </h3>
              <pre className='text-sm text-green-700 whitespace-pre-wrap'>
                {result}
              </pre>
            </div>
          )}

          {/* 에러 표시 */}
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
              <h3 className='text-lg font-semibold text-red-800 mb-2'>
                ❌ 오류 발생
              </h3>
              <pre className='text-sm text-red-700 whitespace-pre-wrap'>
                {error}
              </pre>
            </div>
          )}

          {/* 사용법 안내 */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-blue-800 mb-2'>
              📖 사용법
            </h3>
            <div className='text-sm text-blue-700 space-y-2'>
              <p>
                <strong>1. SSL 생성 테스트:</strong> 새로운 SSL 인증서 생성
                요청을 비동기적으로 처리합니다.
              </p>
              <p>
                <strong>2. SSL 상태 확인:</strong> 특정 도메인의 SSL 인증서
                상태를 확인합니다.
              </p>
              <p>
                <strong>3. SSL 갱신 테스트:</strong> 기존 SSL 인증서 갱신을
                요청합니다.
              </p>
              <p>
                <strong>4. 모든 도메인 확인:</strong> 프로젝트의 모든 도메인 SSL
                상태를 확인합니다.
              </p>
              <p>
                <strong>5. 만료 예정 확인:</strong> 30일 이내에 만료되는 SSL
                인증서를 확인합니다.
              </p>
            </div>
          </div>

          {/* 주의사항 */}
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4'>
            <h3 className='text-lg font-semibold text-yellow-800 mb-2'>
              ⚠️ 주의사항
            </h3>
            <div className='text-sm text-yellow-700 space-y-2'>
              <p>• Vercel API 토큰이 설정되어 있어야 합니다.</p>
              <p>• 도메인에 대한 권한이 있어야 합니다.</p>
              <p>• API 호출 제한을 준수해야 합니다.</p>
              <p>• 테스트 전에 실제 도메인 설정을 확인하세요.</p>
              <p>• 프로덕션 배포 시 환경 변수 설정이 필수입니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSLTest;
