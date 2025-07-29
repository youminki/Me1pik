import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button01 from './Button01';

expect.extend(toHaveNoViolations);

describe('Button01 접근성', () => {
  it('기본 버튼이 접근성 위반 없이 렌더링된다', async () => {
    const { container } = render(<Button01>테스트</Button01>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
