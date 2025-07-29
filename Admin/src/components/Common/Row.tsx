import React from 'react';
import styled from 'styled-components';

interface RowProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  gap?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}

const Row: React.FC<RowProps> = ({
  children,
  style,
  gap = 24,
  align = 'center',
  justify = 'start',
}) => (
  <RowWrapper style={style} gap={gap} align={align} justify={justify}>
    {children}
  </RowWrapper>
);

export default Row;

const RowWrapper = styled.div<{
  gap: number | string;
  align: string;
  justify: string;
}>`
  display: flex;
  flex-direction: row;
  gap: ${({ gap }) => (typeof gap === 'number' ? `${gap}px` : gap)};
  align-items: ${({ align }) => align};
  justify-content: ${({ justify }) => justify};
  width: 100%;
`;
