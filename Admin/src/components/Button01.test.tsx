import { render, screen, fireEvent } from '@testing-library/react';
import Button01 from './Button01';

describe('Button01', () => {
  it('children이 정상적으로 렌더링된다', () => {
    render(<Button01>테스트 버튼</Button01>);
    expect(screen.getByText('테스트 버튼')).toBeInTheDocument();
  });

  it('onClick 이벤트가 정상적으로 동작한다', () => {
    const handleClick = jest.fn();
    render(<Button01 onClick={handleClick}>클릭</Button01>);
    fireEvent.click(screen.getByText('클릭'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 속성이 적용되면 클릭이 되지 않는다', () => {
    const handleClick = jest.fn();
    render(
      <Button01 onClick={handleClick} disabled>
        비활성화
      </Button01>,
    );
    const button = screen.getByText('비활성화');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
