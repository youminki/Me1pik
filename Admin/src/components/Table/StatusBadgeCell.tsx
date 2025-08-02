import React from 'react';

/**
 * 상태 뱃지 셀(StatusBadgeCell)
 *
 * - 상태 정보를 표시하는 셀 컴포넌트
 * - React.memo로 최적화된 성능 제공
 * - 재사용 가능한 공통 컴포넌트
 */

/**
 * 상태 뱃지 셀 컴포넌트
 * - 상태 정보를 표시하는 간단한 텍스트 컴포넌트
 */

const StatusBadgeCell: React.FC<{ status: string }> = ({ status }) => {
  return <span>{status}</span>;
};

export default React.memo(StatusBadgeCell);
