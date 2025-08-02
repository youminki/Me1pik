/**
 * 접근성 버튼 컴포넌트 (AccessibleButton.tsx)
 *
 * 웹 접근성을 고려한 고급 버튼 컴포넌트를 제공합니다.
 * 키보드 네비게이션, 스크린 리더 지원, ARIA 속성 등을 포함하며,
 * 다양한 스타일과 크기를 지원합니다.
 *
 * @description
 * - 키보드 네비게이션 지원 (Enter, Space)
 * - ARIA 속성 지원 (aria-label, aria-describedby, aria-busy)
 * - 다양한 스타일 변형 (primary, secondary, danger, ghost)
 * - 크기 옵션 (small, medium, large)
 * - 로딩 상태 표시
 * - 포커스 스타일링
 * - 전체 너비 옵션
 */

import React from 'react';
import styled from 'styled-components';

/**
 * 접근성 버튼 속성 인터페이스
 *
 * 접근성 버튼 컴포넌트의 props를 정의합니다.
 *
 * @property children - 버튼 내용
 * @property onClick - 클릭 핸들러 (선택적)
 * @property disabled - 비활성화 여부 (기본값: false)
 * @property loading - 로딩 상태 여부 (기본값: false)
 * @property variant - 버튼 스타일 변형 (기본값: 'primary')
 * @property size - 버튼 크기 (기본값: 'medium')
 * @property fullWidth - 전체 너비 사용 여부 (기본값: false)
 * @property ariaLabel - ARIA 라벨 (선택적)
 * @property ariaDescribedBy - ARIA 설명 ID (선택적)
 * @property type - 버튼 타입 (기본값: 'button')
 * @property className - CSS 클래스명 (선택적)
 */
interface AccessibleButtonProps {
  children: React.ReactNode; // 버튼 내용
  onClick?: () => void; // 클릭 핸들러 (선택적)
  disabled?: boolean; // 비활성화 여부 (기본값: false)
  loading?: boolean; // 로딩 상태 여부 (기본값: false)
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; // 버튼 스타일 변형 (기본값: 'primary')
  size?: 'small' | 'medium' | 'large'; // 버튼 크기 (기본값: 'medium')
  fullWidth?: boolean; // 전체 너비 사용 여부 (기본값: false)
  ariaLabel?: string; // ARIA 라벨 (선택적)
  ariaDescribedBy?: string; // ARIA 설명 ID (선택적)
  type?: 'button' | 'submit' | 'reset'; // 버튼 타입 (기본값: 'button')
  className?: string; // CSS 클래스명 (선택적)
}

/**
 * 접근성 버튼 컴포넌트
 *
 * 웹 접근성을 고려한 버튼을 렌더링하는 컴포넌트입니다.
 * 키보드 네비게이션, ARIA 속성, 로딩 상태 등을 지원하며,
 * 다양한 스타일과 크기를 제공합니다.
 *
 * @param children - 버튼 내용
 * @param onClick - 클릭 핸들러 (선택적)
 * @param disabled - 비활성화 여부 (기본값: false)
 * @param loading - 로딩 상태 여부 (기본값: false)
 * @param variant - 버튼 스타일 변형 (기본값: 'primary')
 * @param size - 버튼 크기 (기본값: 'medium')
 * @param fullWidth - 전체 너비 사용 여부 (기본값: false)
 * @param ariaLabel - ARIA 라벨 (선택적)
 * @param ariaDescribedBy - ARIA 설명 ID (선택적)
 * @param type - 버튼 타입 (기본값: 'button')
 * @param className - CSS 클래스명 (선택적)
 * @returns 접근성 버튼 컴포넌트
 */
const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  ariaLabel,
  ariaDescribedBy,
  type = 'button',
  className,
}) => {
  const handleClick = (event: React.MouseEvent) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled && !loading) {
        onClick?.();
      }
    }
  };

  return (
    <StyledButton
      type={type}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      className={className}
      tabIndex={disabled ? -1 : 0}
    >
      {loading && <LoadingSpinner />}
      <ButtonContent loading={loading}>{children}</ButtonContent>
    </StyledButton>
  );
};

export default AccessibleButton;

const StyledButton = styled.button<{
  variant: string;
  size: string;
  fullWidth: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};

  /* Focus 스타일 */
  &:focus-visible {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  /* 크기별 스타일 */
  ${({ size }) => {
    switch (size) {
      case 'small':
        return `
          padding: 8px 16px;
          font-size: 14px;
          min-height: 36px;
        `;
      case 'large':
        return `
          padding: 16px 32px;
          font-size: 18px;
          min-height: 56px;
        `;
      default:
        return `
          padding: 12px 24px;
          font-size: 16px;
          min-height: 44px;
        `;
    }
  }}

  /* 변형별 스타일 */
  ${({ variant }) => {
    switch (variant) {
      case 'secondary':
        return `
          background-color: #f8f9fa;
          color: #212529;
          border: 1px solid #dee2e6;
          
          &:hover:not(:disabled) {
            background-color: #e9ecef;
            border-color: #adb5bd;
          }
        `;
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #c82333;
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: #007bff;
          
          &:hover:not(:disabled) {
            background-color: rgba(0, 123, 255, 0.1);
          }
        `;
      default:
        return `
          background-color: #007bff;
          color: white;
          
          &:hover:not(:disabled) {
            background-color: #0056b3;
          }
        `;
    }
  }}

  /* 비활성화 스타일 */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #6c757d;
  }
`;

const ButtonContent = styled.span<{ loading: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ loading }) => (loading ? 0.7 : 1)};
  transition: opacity 0.2s ease-in-out;
`;

const LoadingSpinner = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
`;
