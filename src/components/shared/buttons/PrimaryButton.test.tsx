import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';

import PrimaryButton from './PrimaryButton';

import { theme } from '@/styles/theme';

describe('PrimaryButton', () => {
  it('renders with theme styles', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <PrimaryButton>확인</PrimaryButton>
      </ThemeProvider>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders yellow style when color is yellow', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <PrimaryButton>노랑</PrimaryButton>
      </ThemeProvider>
    );
    const button = getByRole('button');
    expect(button).toHaveStyle(`background-color: ${theme.colors.yellow}`);
    expect(button).toHaveStyle(` ${theme.shadow.base}`);
    expect(button).toHaveStyle(`padding: ${theme.spacing.md}`);
  });
});
