import React from 'react';
import styled from 'styled-components';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

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
