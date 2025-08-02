/**
 * 에러 메시지 컴포넌트 (ErrorMessage.tsx)
 *
 * 에러 상태를 표시하는 컴포넌트를 제공합니다.
 * 사용자에게 명확한 에러 메시지를 전달하고, 필요시 재시도 버튼을 제공하여
 * 사용자 경험을 개선합니다.
 *
 * @description
 * - 에러 메시지 표시
 * - 아이콘 표시 (선택적)
 * - 재시도 버튼 제공 (선택적)
 * - ARIA 속성 지원 (role='alert', aria-live='assertive')
 * - 시각적 에러 스타일링
 * - 접근성 고려
 */

import React from 'react';
import styled from 'styled-components';

/**
 * 에러 메시지 속성 인터페이스
 *
 * 에러 메시지 컴포넌트의 props를 정의합니다.
 *
 * @property message - 표시할 에러 메시지
 * @property onRetry - 재시도 버튼 클릭 핸들러 (선택적)
 * @property icon - 표시할 아이콘 (선택적)
 * @property className - CSS 클래스명 (선택적)
 */
interface ErrorMessageProps {
  message: string; // 표시할 에러 메시지
  onRetry?: () => void; // 재시도 버튼 클릭 핸들러 (선택적)
  icon?: React.ReactNode; // 표시할 아이콘 (선택적)
  className?: string; // CSS 클래스명 (선택적)
}

/**
 * 에러 메시지 컴포넌트
 *
 * 에러 상태를 표시하는 컴포넌트를 렌더링합니다.
 * 사용자에게 명확한 에러 메시지를 전달하고, 필요시 재시도 버튼을 제공합니다.
 *
 * @param message - 표시할 에러 메시지
 * @param onRetry - 재시도 버튼 클릭 핸들러 (선택적)
 * @param icon - 표시할 아이콘 (선택적)
 * @param className - CSS 클래스명 (선택적)
 * @returns 에러 메시지 컴포넌트
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  icon,
  className,
}) => {
  return (
    <Container className={className} role='alert' aria-live='assertive'>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      <Message>{message}</Message>
      {onRetry && (
        <RetryButton type='button' onClick={onRetry}>
          다시 시도
        </RetryButton>
      )}
    </Container>
  );
};

export default ErrorMessage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: #fff3f3;
  border: 1px solid #ffbdbd;
  border-radius: 8px;
  color: #d32f2f;
  margin: 16px 0;
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  margin-bottom: 8px;
`;

const Message = styled.div`
  font-size: 1.1rem;
  margin-bottom: 8px;
  text-align: center;
`;

const RetryButton = styled.button`
  background: #d32f2f;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
  &:hover {
    background: #b71c1c;
  }
`;
