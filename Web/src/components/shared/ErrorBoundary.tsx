import { Component, ErrorInfo, ReactNode } from 'react';
import { FiRefreshCw, FiHome } from 'react-icons/fi';
import styled from 'styled-components';

// Window 타입 확장
declare global {
  interface Window {
    monitoringService?: {
      trackCustomEvent: (event: string, data: Record<string, unknown>) => void;
    };
  }
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;

  text-align: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-family:
    'NanumSquareNeo',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;

const ErrorTitle = styled.h1`
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const ErrorMessage = styled.p`
  color: #495057;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f7c600;
  color: #000;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e6b800;
  }

  &:active {
    background: #d4a800;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const HomeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #000;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #333;
  }

  &:active {
    background: #1a1a1a;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

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

    // 에러 모니터링 서비스로 전송
    if (window.monitoringService) {
      window.monitoringService.trackCustomEvent('error_boundary_caught', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>앗! 문제가 발생했어요</ErrorTitle>
          <ErrorMessage>
            죄송합니다. 예상치 못한 오류가 발생했습니다.
            <br />
            잠시 후 다시 시도해주시거나, 문제가 지속되면 고객센터에
            문의해주세요.
          </ErrorMessage>

          <ActionButtons>
            <RetryButton onClick={this.handleRetry}>
              <FiRefreshCw />
              다시 시도
            </RetryButton>
            <HomeButton onClick={() => (window.location.href = '/')}>
              <FiHome />
              홈으로 이동
            </HomeButton>
          </ActionButtons>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
