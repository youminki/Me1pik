/**
 * 상태 뱃지(StatusBadge)
 *
 * - 상태 정보를 시각적으로 표시하는 뱃지 컴포넌트
 * - 색상, 배경색, 스타일 커스터마이징 지원
 * - 테마 기반 스타일링으로 일관된 디자인 제공
 */

import React from 'react';
import styled from 'styled-components';

/**
 * 상태 뱃지 props
 * - 색상, 배경색, 자식 요소, 스타일 등
 */
interface StatusBadgeProps {
  color?: string;
  background?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * 상태 뱃지 컴포넌트
 * - 상태 정보를 뱃지 형태로 표시
 * - 색상과 배경색을 커스터마이징 가능
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  color = '#fff',
  background = '#888',
  children,
  style,
}) => <Badge style={{ color, background, ...style }}>{children}</Badge>;

export default StatusBadge;

/**
 * 뱃지 스타일드 컴포넌트
 * - 테마 기반 스타일링, 반응형 디자인, 텍스트 오버플로우 처리 등
 */
const Badge = styled.span`
  display: inline-block;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 0 ${({ theme }) => theme.spacing.sm};
  height: 24px;
  line-height: 24px;
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 800;
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  vertical-align: middle;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 48px;
`;
