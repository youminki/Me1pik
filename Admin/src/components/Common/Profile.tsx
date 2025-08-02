import React from 'react';
import styled from 'styled-components';

export const AccountContainer = React.memo(styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
`);
export const ProfileCircle = React.memo(styled.div`
  width: 26px;
  height: 26px;
  min-width: 26px;
  min-height: 26px;
  border-radius: 50%;
  background-color: #cccccc;
  flex-shrink: 0;
`);
export const AccountText = React.memo(styled.span<{ $clickable?: boolean }>`
  font-size: 12px;
  color: #007bff;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  margin-left: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;
  display: inline-block;
  vertical-align: middle;
  &:hover {
    color: ${({ $clickable }) => ($clickable ? '#0056b3' : '#007bff')};
  }
`);

export const InstaContainer = AccountContainer;
export const Avatar = ProfileCircle;
export const InstaText = AccountText;
