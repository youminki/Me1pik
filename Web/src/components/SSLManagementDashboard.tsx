import React, { useState } from 'react';
import { useSSLMonitor } from '../hooks/useSSLMonitor';
import { SSLCreationRequest } from '../utils/sslManager';

const SSLManagementDashboard: React.FC = () => {
  const [newDomain, setNewDomain] = useState('');
  const [forceRenewal, setForceRenewal] = useState(false);

  const {
    sslStatuses,
    loading,
    error,
    lastUpdated,
    expiringCertificates,
    errorCertificates,
    createSSLCertificate,
    renewSSLCertificate,
    refresh,
  } = useSSLMonitor({
    autoRefresh: true,
    refreshInterval: 60000, // 1분
    domains: ['me1pik.com'],
  });

  const handleCreateSSL = async () => {
    if (!newDomain.trim()) return;

    try {
      const request: SSLCreationRequest = {
        domain: newDomain.trim(),
        forceRenewal,
        waitForCompletion: false, // 비동기 처리
      };

      await createSSLCertificate(request);
      setNewDomain('');
      alert('SSL 인증서 생성 요청이 완료되었습니다. 상태를 확인해주세요.');
    } catch (err) {
      console.error('SSL 생성 실패:', err);
    }
  };

  const handleRenewSSL = async (domain: string) => {
    try {
      await renewSSLCertificate(domain);
      alert(`${domain} SSL 인증서 갱신이 완료되었습니다.`);
    } catch (err) {
      console.error('SSL 갱신 실패:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-red-800 bg-red-200';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'pending':
        return '대기중';
      case 'error':
        return '오류';
      case 'expired':
        return '만료됨';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-6'>
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <h1 className='text-3xl font-bold text-gray-900 mb-6'>
          🔒 SSL 인증서 관리 대시보드
        </h1>

        {/* 상태 요약 */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-blue-50 p-4 rounded-lg'>
            <div className='text-2xl font-bold text-blue-600'>
              {sslStatuses.length}
            </div>
            <div className='text-sm text-blue-600'>전체 도메인</div>
          </div>
          <div className='bg-green-50 p-4 rounded-lg'>
            <div className='text-2xl font-bold text-green-600'>
              {sslStatuses.filter((s) => s.sslStatus === 'active').length}
            </div>
            <div className='text-sm text-green-600'>활성 인증서</div>
          </div>
          <div className='bg-yellow-50 p-4 rounded-lg'>
            <div className='text-2xl font-bold text-yellow-600'>
              {expiringCertificates.length}
            </div>
            <div className='text-sm text-yellow-600'>만료 예정</div>
          </div>
          <div className='bg-red-50 p-4 rounded-lg'>
            <div className='text-2xl font-bold text-red-600'>
              {errorCertificates.length}
            </div>
            <div className='text-sm text-red-600'>오류 상태</div>
          </div>
        </div>

        {/* 새 SSL 인증서 생성 */}
        <div className='bg-gray-50 p-4 rounded-lg mb-6'>
          <h2 className='text-lg font-semibold mb-4'>새 SSL 인증서 생성</h2>
          <div className='flex flex-col md:flex-row gap-4'>
            <input
              type='text'
              placeholder='도메인 입력 (예: example.com)'
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={forceRenewal}
                onChange={(e) => setForceRenewal(e.target.checked)}
                className='mr-2'
              />
              강제 갱신
            </label>
            <button
              onClick={handleCreateSSL}
              disabled={!newDomain.trim() || loading}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? '처리중...' : 'SSL 생성'}
            </button>
          </div>
        </div>

        {/* 새로고침 버튼 */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold'>SSL 인증서 상태</h2>
          <div className='flex items-center gap-4'>
            <span className='text-sm text-gray-500'>
              마지막 업데이트:{' '}
              {lastUpdated ? lastUpdated.toLocaleString('ko-KR') : '없음'}
            </span>
            <button
              onClick={refresh}
              disabled={loading}
              className='px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50'
            >
              새로고침
            </button>
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {/* SSL 상태 테이블 */}
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  도메인
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  상태
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  만료일
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  마지막 확인
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  작업
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {sslStatuses.map((status, index) => (
                <tr key={index} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {status.domain}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status.sslStatus)}`}
                    >
                      {getStatusText(status.sslStatus)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {status.expiresAt
                      ? status.expiresAt.toLocaleDateString('ko-KR')
                      : 'N/A'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {status.lastChecked.toLocaleString('ko-KR')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button
                      onClick={() => handleRenewSSL(status.domain)}
                      disabled={loading || status.sslStatus === 'pending'}
                      className='text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      갱신
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 만료 예정 인증서 경고 */}
        {expiringCertificates.length > 0 && (
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6'>
            <h3 className='text-lg font-semibold text-yellow-800 mb-2'>
              ⚠️ 만료 예정 SSL 인증서
            </h3>
            <ul className='space-y-1'>
              {expiringCertificates.map((cert, index) => (
                <li key={index} className='text-sm text-yellow-700'>
                  {cert.domain} - {cert.expiresAt?.toLocaleDateString('ko-KR')}{' '}
                  만료
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 오류 상태 인증서 경고 */}
        {errorCertificates.length > 0 && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mt-6'>
            <h3 className='text-lg font-semibold text-red-800 mb-2'>
              ❌ 오류 상태 SSL 인증서
            </h3>
            <ul className='space-y-1'>
              {errorCertificates.map((cert, index) => (
                <li key={index} className='text-sm text-red-700'>
                  {cert.domain} - 상태: {getStatusText(cert.sslStatus)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSLManagementDashboard;
