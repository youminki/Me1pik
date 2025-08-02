import React from 'react';

/**
 * 계정 셀(AccountCell)
 *
 * - 계정 정보를 표시하는 클릭 가능한 셀 컴포넌트
 * - 클릭 이벤트, 키보드 접근성, 조건부 스타일링 등 지원
 * - React.memo로 최적화된 성능 제공
 * - 재사용 가능한 공통 컴포넌트
 */

const AccountCell: React.FC<{ value: string; onClick?: () => void }> = ({ value, onClick }) => {
  /**
   * 계정 셀 컴포넌트
   * - 계정 정보를 표시하고 클릭 시 상세 페이지 이동이 가능한 컴포넌트
   */
  return (
    <span
      style={{
        color: '#007bff',
        cursor: onClick ? 'pointer' : 'default',

        textDecoration: onClick ? 'underline' : 'none',
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      {value}
    </span>
  );
};

export default React.memo(AccountCell);
