import React from 'react';
import styled from 'styled-components';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

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
