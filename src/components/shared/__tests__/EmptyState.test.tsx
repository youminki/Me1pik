import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('메시지가 정상적으로 렌더링된다', () => {
    render(<EmptyState message='데이터가 없습니다.' />);
    expect(screen.getByText('데이터가 없습니다.')).toBeInTheDocument();
  });

  it('icon prop이 있으면 아이콘이 렌더링된다', () => {
    render(
      <EmptyState message='빈 상태' icon={<span data-testid='icon'>🌟</span>} />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('onAction prop이 있으면 버튼이 렌더링되고 클릭 시 콜백이 호출된다', () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        message='빈 상태'
        actionLabel='새로고침'
        onAction={onAction}
      />
    );
    const button = screen.getByRole('button', { name: /새로고침/ });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalled();
  });
});
