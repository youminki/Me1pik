import React from 'react';
import styled from 'styled-components';

interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

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
