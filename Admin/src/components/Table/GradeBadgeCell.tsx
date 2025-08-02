import React from 'react';

/**
 * 등급 뱃지 셀(GradeBadgeCell)
 *
 * - 사용자 등급을 표시하는 셀 컴포넌트
 * - React.memo로 최적화된 성능 제공
 * - 재사용 가능한 공통 컴포넌트
 */

/**
 * 등급 뱃지 셀 컴포넌트
 * - 사용자 등급을 표시하는 간단한 텍스트 컴포넌트
 */

const GradeBadgeCell: React.FC<{ grade: string }> = ({ grade }) => {
  return <span>{grade}</span>;
};

export default React.memo(GradeBadgeCell);
