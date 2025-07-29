// src/styles/theme.ts

export const theme = {
  colors: {
    primary: '#3071B2',
    success: '#4AA361',
    danger: '#CD5542',
    gray: '#6c757d',
    black: '#000000',
    white: '#ffffff',
    border: '#dddddd',
    bg: '#ffffff',
    tableHeader: '#eeeeee',
    tableHover: '#f8f9fa',
  },
  fontSize: {
    small: '12px',
    medium: '14px',
    large: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
  },
};

export type ThemeType = typeof theme;
