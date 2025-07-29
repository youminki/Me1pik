import React from 'react';
import styled from 'styled-components';

interface StatusBadgeProps {
  color?: string;
  background?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  color = '#fff',
  background = '#888',
  children,
  style,
}) => <Badge style={{ color, background, ...style }}>{children}</Badge>;

export default StatusBadge;

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
