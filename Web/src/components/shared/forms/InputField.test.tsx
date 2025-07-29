import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';

import InputField from '@/components/shared/forms/InputField';
import { theme } from '@/styles/Theme';

describe('InputField', () => {
  it('renders with theme styles', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <InputField label='닉네임' id='nickname' />
      </ThemeProvider>
    );
    expect(container).toMatchSnapshot();
  });

  it('StyledInput has theme spacing and shadow', () => {
    const { getByLabelText } = render(
      <ThemeProvider theme={theme}>
        <InputField label='닉네임' id='nickname' />
      </ThemeProvider>
    );
    const input = getByLabelText('닉네임');
    expect(input).toHaveStyle(` ${theme.shadow.base}`);
    expect(input).toHaveStyle(`z-index: ${theme.zIndex.header}`);
  });
});
