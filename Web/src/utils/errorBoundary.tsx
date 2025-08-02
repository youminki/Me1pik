/**
 * errorBoundary 유틸리티 모음
 *
 * React 에러 바운더리 컴포넌트를 제공합니다.
 * 자식 컴포넌트에서 발생한 JavaScript 에러를 포착하고 처리합니다.
 * 에러가 발생했을 때 전체 앱이 크래시되는 것을 방지하고,
 * 사용자 친화적인 에러 화면을 표시합니다.
 *
 * @description
 * - 에러 포착 및 처리
 * - 사용자 친화적 에러 화면
 * - 개발 환경 에러 상세 정보
 * - 에러 복구 기능
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

/**
 * Props 인터페이스
 *
 * 에러 바운더리 컴포넌트의 props를 정의합니다.
 *
 * @property children - 자식 컴포넌트
 * @property fallback - 커스텀 에러 화면 (선택사항)
 * @property onError - 에러 콜백 (선택사항)
 */
interface Props {
  children: ReactNode; // 자식 컴포넌트
  fallback?: ReactNode; // 커스텀 에러 화면 (선택사항)
  onError?: (error: Error, errorInfo: ErrorInfo) => void; // 에러 콜백 (선택사항)
}

/**
 * State 인터페이스
 *
 * 에러 바운더리 컴포넌트의 상태를 정의합니다.
 *
 * @property hasError - 에러 발생 여부
 * @property error - 발생한 에러 객체 (선택사항)
 */
interface State {
  hasError: boolean; // 에러 발생 여부
  error?: Error; // 발생한 에러 객체 (선택사항)
}

/**
 * ErrorBoundary 클래스 컴포넌트
 *
 * React의 에러 바운더리 생명주기 메서드를 구현하여
 * 자식 컴포넌트의 에러를 포착하고 처리합니다.
 */
class ErrorBoundary extends Component<Props, State> {
  /**
   * constructor 메서드
   *
   * 컴포넌트를 초기화합니다.
   *
   * @param props - 컴포넌트 props
   */
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * getDerivedStateFromError 메서드
   *
   * 에러 발생 시 상태를 업데이트합니다.
   *
   * @param error - 발생한 에러 객체
   * @returns 에러 상태로 업데이트된 상태 객체
   */
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * componentDidCatch 메서드
   *
   * 에러 포착 시 호출되는 생명주기 메서드입니다.
   *
   * @param error - 발생한 에러 객체
   * @param errorInfo - 에러 정보 (컴포넌트 스택 등)
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  /**
   * render 메서드
   *
   * 컴포넌트를 렌더링합니다.
   * 에러가 발생한 경우 에러 화면을, 그렇지 않으면 자식 컴포넌트를 렌더링합니다.
   *
   * @returns 렌더링할 React 엘리먼트
   */
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

/**
 * ErrorContainer 스타일 컴포넌트
 *
 * 에러 화면의 컨테이너 스타일을 정의합니다.
 */
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

/**
 * ErrorIcon 스타일 컴포넌트
 *
 * 에러 아이콘의 스타일을 정의합니다.
 */
const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

/**
 * ErrorTitle 스타일 컴포넌트
 *
 * 에러 제목의 스타일을 정의합니다.
 */
const ErrorTitle = styled.h2`
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
`;

/**
 * ErrorMessage 스타일 컴포넌트
 *
 * 에러 메시지의 스타일을 정의합니다.
 */
const ErrorMessage = styled.p`
  color: #6c757d;
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 500px;
`;

/**
 * RetryButton 스타일 컴포넌트
 *
 * 재시도 버튼의 스타일을 정의합니다.
 */
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

/**
 * ErrorDetails 스타일 컴포넌트
 *
 * 에러 상세 정보의 스타일을 정의합니다.
 */
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
