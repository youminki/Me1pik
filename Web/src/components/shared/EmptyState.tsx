/**
 * 빈 상태 컴포넌트 (EmptyState.tsx)
 *
 * 데이터가 없거나 결과가 없을 때 표시하는 빈 상태 컴포넌트를 제공합니다.
 * 사용자에게 명확한 메시지를 전달하고, 필요시 액션 버튼을 제공하여
 * 사용자 경험을 개선합니다.
 *
 * @description
 * - 빈 상태 메시지 표시
 * - 아이콘 표시 (선택적)
 * - 액션 버튼 제공 (선택적)
 * - 중앙 정렬 레이아웃
 * - 반응형 디자인
 * - 접근성 고려
 */

import React from 'react';
import styled from 'styled-components';

/**
 * 빈 상태 속성 인터페이스
 *
 * 빈 상태 컴포넌트의 props를 정의합니다.
 *
 * @property message - 표시할 메시지
 * @property icon - 표시할 아이콘 (선택적)
 * @property actionLabel - 액션 버튼 라벨 (선택적)
 * @property onAction - 액션 버튼 클릭 핸들러 (선택적)
 * @property className - CSS 클래스명 (선택적)
 */
interface EmptyStateProps {
  message: string; // 표시할 메시지
  icon?: React.ReactNode; // 표시할 아이콘 (선택적)
  actionLabel?: string; // 액션 버튼 라벨 (선택적)
  onAction?: () => void; // 액션 버튼 클릭 핸들러 (선택적)
  className?: string; // CSS 클래스명 (선택적)
}

/**
 * 빈 상태 컴포넌트
 *
 * 데이터가 없거나 결과가 없을 때 표시하는 빈 상태를 렌더링하는 컴포넌트입니다.
 * 사용자에게 명확한 메시지를 전달하고, 필요시 액션 버튼을 제공합니다.
 *
 * @param message - 표시할 메시지
 * @param icon - 표시할 아이콘 (선택적)
 * @param actionLabel - 액션 버튼 라벨 (선택적)
 * @param onAction - 액션 버튼 클릭 핸들러 (선택적)
 * @param className - CSS 클래스명 (선택적)
 * @returns 빈 상태 컴포넌트
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <Container className={className}>
      {icon && <IconWrapper>{icon}</IconWrapper>}
      <Message>{message}</Message>
      {actionLabel && onAction && (
        <ActionButton type='button' onClick={onAction}>
          {actionLabel}
        </ActionButton>
      )}
    </Container>
  );
};

export default EmptyState;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #888;
  margin: 16px 0;
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  margin-bottom: 12px;
`;

const Message = styled.div`
  font-size: 1.1rem;
  margin-bottom: 12px;
  text-align: center;
`;

const ActionButton = styled.button`
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.2s;
  &:hover {
    background: #115293;
  }
`;
