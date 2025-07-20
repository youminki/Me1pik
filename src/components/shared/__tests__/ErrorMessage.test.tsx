import { render, screen } from '@testing-library/react';

import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('에러 메시지가 정상적으로 렌더링된다', () => {
    render(<ErrorMessage message='에러가 발생했습니다.' />);
    expect(screen.getByText('에러가 발생했습니다.')).toBeInTheDocument();
  });

  it('role=alert로 접근성 속성이 부여된다', () => {
    render(<ErrorMessage message='접근성 테스트' />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('onRetry prop이 있으면 버튼이 렌더링된다', () => {
    const onRetry = jest.fn();
    render(<ErrorMessage message='에러' onRetry={onRetry} />);
    expect(
      screen.getByRole('button', { name: /다시 시도/ })
    ).toBeInTheDocument();
  });
});
