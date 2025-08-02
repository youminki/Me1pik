import { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>오류가 발생했습니다</ErrorTitle>
          <ErrorMessage>
            죄송합니다. 예상치 못한 오류가 발생했습니다.
            <br />
            페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </ErrorMessage>
          <RetryButton onClick={() => window.location.reload()}>
            페이지 새로고침
          </RetryButton>
          {import.meta.env.DEV && this.state.error && (
            <ErrorDetails>
              <details>
                <summary>개발자 정보</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 1rem;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const ErrorTitle = styled.h2`
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  color: #6c757d;
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 500px;
`;

const RetryButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorDetails = styled.div`
  margin-top: 2rem;
  text-align: left;
  max-width: 600px;
  width: 100%;

  details {
    background-color: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 1rem;
  }

  summary {
    cursor: pointer;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
  }

  pre {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.875rem;
    color: #dc3545;
  }
`;
