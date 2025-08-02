/**
 * 행 공통 컴포넌트(Row)
 *
 * - 자식 요소들을 가로로 배치하는 flex 컨테이너
 * - 간격, 정렬, 배치 등 다양한 레이아웃 옵션 지원
 * - 재사용 가능한 공통 컴포넌트
 */

import React from 'react';
import styled from 'styled-components';

interface RowProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  gap?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}

/**
 * 행 props
 * - 자식 요소, 스타일, 간격, 정렬, 배치 등
 */
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

/**
 * 행 컴포넌트
 * - 자식 요소들을 가로로 배치하는 flex 컨테이너
 */
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

/**
 * 행 래퍼 스타일드 컴포넌트
 * - flex 레이아웃, 간격, 정렬, 배치 등 스타일링
 */
