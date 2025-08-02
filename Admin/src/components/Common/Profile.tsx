/**
 * 프로필 관련 공통 컴포넌트(Profile)
 *
 * - 계정 정보, 프로필 이미지, 텍스트 등 프로필 관련 UI 컴포넌트
 * - React.memo로 최적화된 스타일드 컴포넌트들
 * - 재사용 가능한 공통 컴포넌트
 */
import React from 'react';
import styled from 'styled-components';

/**
 * 계정 컨테이너
 * - 프로필 정보를 가로로 배치하는 컨테이너
 */
export const AccountContainer = React.memo(styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
`);
/**
 * 프로필 원형 이미지
 * - 사용자 프로필 이미지를 원형으로 표시
 */
export const ProfileCircle = React.memo(styled.div`
  width: 26px;
  height: 26px;
  min-width: 26px;
  min-height: 26px;
  border-radius: 50%;
  background-color: #cccccc;
  flex-shrink: 0;
`);
/**
 * 계정 텍스트
 * - 클릭 가능한 계정명 텍스트, 호버 효과 지원
 */
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

/**
 * 인스타그램 관련 별칭
 * - 기존 컴포넌트의 재사용을 위한 별칭 정의
 */
export const InstaContainer = AccountContainer;
export const Avatar = ProfileCircle;
export const InstaText = AccountText;
