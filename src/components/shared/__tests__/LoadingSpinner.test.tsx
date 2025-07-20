import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('스피너가 정상적으로 렌더링된다', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('label이 있으면 label이 표시된다', () => {
    render(<LoadingSpinner label='로딩 중...' />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('접근성 role=status가 부여된다', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
