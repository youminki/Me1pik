/**
 * AdminModal 테스트 파일
 *
 * - AdminModal 컴포넌트의 기능을 검증하는 테스트 케이스들
 * - 렌더링, 이벤트 핸들링, 유효성 검사, 폼 제출 등 테스트
 * - Jest + React Testing Library를 사용한 단위 테스트
 */

// jest-environment jsdom
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminModal from './AdminModal';

/**
 * 기본 props 설정
 * - 테스트에서 공통으로 사용하는 기본 props
 */
const defaultProps = {
  mode: 'create' as const,
  onSubmit: jest.fn(),
  onClose: jest.fn(),
};

/**
 * 모달 렌더링 테스트
 * - 모달이 정상적으로 렌더링되는지 확인
 */
describe('AdminModal', () => {
  it('모달이 정상적으로 렌더링된다', () => {
    render(<AdminModal {...defaultProps} />);
    expect(screen.getByText('관리자 등록')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('아이디')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이름')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
    expect(screen.getByText('등록')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  /**
   * 취소 버튼 테스트
   * - 취소 버튼 클릭 시 onClose 콜백 호출 확인
   */
  it('취소 버튼 클릭 시 onClose가 호출된다', () => {
    const onClose = jest.fn();
    render(<AdminModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('취소'));
    expect(onClose).toHaveBeenCalled();
  });

  /**
   * 유효성 검사 테스트
   * - 필수 입력값이 없을 때 alert 호출 확인
   */
  it('필수 입력값이 없으면 alert가 호출된다', () => {
    window.alert = jest.fn();
    render(<AdminModal {...defaultProps} />);
    fireEvent.click(screen.getByText('등록'));
    expect(window.alert).toHaveBeenCalledWith('모든 필드를 입력해주세요.');
  });

  /**
   * 폼 제출 테스트
   * - 모든 필드 입력 후 onSubmit 콜백 호출 확인
   */
  it('모든 필드를 입력하면 onSubmit이 호출된다', () => {
    const onSubmit = jest.fn();
    render(<AdminModal {...defaultProps} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('아이디'), { target: { value: 'admin1' } });
    fireEvent.change(screen.getByPlaceholderText('이름'), { target: { value: '홍길동' } });
    fireEvent.change(screen.getByPlaceholderText('이메일'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), { target: { value: 'pw1234' } });
    fireEvent.click(screen.getByText('등록'));
    expect(onSubmit).toHaveBeenCalledWith({
      id: 'admin1',
      name: '홍길동',
      email: 'test@example.com',
      password: 'pw1234',
      role: '멤버',
      status: 'active',
    });
  });
});
