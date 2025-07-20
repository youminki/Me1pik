import { css, DefaultTheme } from 'styled-components';

/**
 * Melpik 디자인 시스템 theme
 *
 * theme.colors: 주요 색상 팔레트 (primary, error, gray 등)
 * theme.fonts: 텍스트 스타일(타이틀, 본문 등)
 * theme.spacing: 여백 단위(xs~xl)
 * theme.shadow: 그림자 스타일(base, modal 등)
 * theme.zIndex: z-index 계층(header, modal 등)
 * theme.breakpoints: 반응형 단위(mobile, tablet, desktop)
 *
 * 컴포넌트에서는 styled-components의 theme prop으로 접근
 * 예: ${({ theme }) => theme.colors.primary}
 */
export const theme: DefaultTheme = {
  colors: {
    primary: '#222',
    error: '#ff4d4f',
    disabledBg: '#f5f5f5',
    inputBg: '#fff',
    border: '#dadada',
    label: '#222',
    placeholder: '#b0b8c1',
    readOnlyText: '#888',
    gray: '#B1B1B1',
    gray0: '#f5f5f5',
    gray1: '#cccccc',
    gray2: '#999999',
    gray3: '#DDDDDD',
    gray4: '#eeeeee',
    gray5: '#F5F5F5',
    lightgray: '#F4F4F4',
    black: '#000000',
    white: '#FFFFFF',
    blue: '#004DFF',
    yellow: '#F6AE24',
    yellow0: '#fcbb51',
    yellow1: '#FFc875',
    yellow2: '#ffd697',
    yellow3: '#ffe3ba',
    yellow4: '#fff1dc',
    yellow5: '#FAF8F1',
    WhiteBrown1: '#f7e9e3',
    WhiteBrown2: '#eed4c8',
    WhiteBrown3: '#e5bfae',
    WhiteBrown4: '#daaa94',
    WhiteBrown5: '#cf967b',
    WhiteBrown6: '#c38262',
    DarkBrown1: '#a06b51',
    DarkBrown2: '#7e5542',
    DarkBrown3: '#5e4032',
    DarkBrown4: '#3f2c23',
    DarkBrown5: '#231a16',
    DarkBrown6: '#000000',
    PinkBrown1: '#d19482',
    PinkBrown2: '#dda89f',
    PinkBrown3: '#e8bdba',
    PinkBrown4: '#f1d2d3',
    PinkBrown5: '#f9e8ea',
    Black1: '#1D1D1B',
    red1: '#B37371',
    red2: '#CD9191',
    red3: '#EECBCA',
    pink1: '#FDEFEE',
    pink2: '#F7A29D',
    pink3: '#F77770',
    pink4: '#F85959',
    pink5: '#E93C3C',
  },
  fonts: {
    mainTitle: css`
      font-weight: 600;
      font-size: 28px;
      line-height: 1.2;
    `,
    heading: css`
      font-weight: 500;
      font-size: 18px;
      line-height: 1.3;
    `,
    default: css`
      font-weight: 400;
      font-size: 14px;
      line-height: 1.5;
    `,
    default0: css`
      font-weight: 800;
      font-size: 10px;
      line-height: 11px;
    `,
    default1: css`
      font-weight: 800;
      font-size: 16px;
      line-height: 18px;
    `,
    default2: css`
      font-weight: 400;
      font-size: 12px;
      line-height: 13px;
    `,
    default3: css`
      font-weight: 400;
      font-size: 12px;
      line-height: 13px;
    `,
    helperText: css`
      font-weight: 400;
      font-size: 12px;
      line-height: 1.4;
    `,
    BigButton: css`
      font-weight: 600;
      font-size: 16px;
      line-height: 1.2;
    `,
    SmallButton: css`
      font-weight: 800;
      font-size: 14px;
      line-height: 1.2;
    `,
    subTitle: css`
      font-weight: 600;
      font-size: 18px;
      line-height: 24px;
    `,
  },
  breakpoints: {
    mobile: '1000px',
    tablet: '768px',
    desktop: '1024px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  shadow: {
    base: '0 2px 8px rgba(0,0,0,0.08)',
    modal: '0 4px 24px rgba(0,0,0,0.16)',
  },
  zIndex: {
    modal: 1000,
    dropdown: 900,
    header: 800,
  },
  radius: {
    sm: '4px',
    md: '6px',
    lg: '12px',
  },
  transition: {
    base: 'all 0.2s ease',
    fast: 'all 0.1s ease',
  },
};
