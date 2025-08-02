/**
 * 브랜드/카테고리 컨트롤 섹션 컴포넌트 (ControlSection.tsx)
 *
 * 브랜드/카테고리 페이지에서 정렬 방식 전환 및 검색 기능을 제공하는 컨트롤 UI 컴포넌트입니다.
 *
 * @description
 * - 그룹별/카테고리별 정렬 전환 버튼
 * - 검색 입력창 및 아이콘
 * - 반응형 레이아웃 및 스타일 적용
 */
import React from 'react';
import styled from 'styled-components';

import GroupButtonIcon from '@/assets/bottom-navigations/GroupButtonIcon.svg';
import SearchIconImage from '@/assets/homes/SearchIcon.svg';

/**
 * 컨트롤 섹션 Props
 *
 * @property toggleSort - 정렬 방식 전환 함수
 * @property sortBy - 현재 정렬 방식 ('group' | 'category')
 * @property searchTerm - 검색어 상태
 * @property setSearchTerm - 검색어 상태 변경 함수
 */
interface ControlSectionProps {
  toggleSort: () => void;
  sortBy: 'group' | 'category';
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * 브랜드/카테고리 컨트롤 섹션 컴포넌트
 *
 * 정렬 방식 전환 버튼과 검색 입력창을 제공합니다.
 *
 * @param toggleSort - 정렬 방식 전환 함수
 * @param sortBy - 현재 정렬 방식
 * @param searchTerm - 검색어 상태
 * @param setSearchTerm - 검색어 상태 변경 함수
 * @returns 컨트롤 섹션 JSX 요소
 */
export const ControlSection: React.FC<ControlSectionProps> = ({
  toggleSort,
  sortBy,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <Container>
      <LeftRow>
        <ControlButton onClick={toggleSort}>
          <Icon src={GroupButtonIcon} alt='그룹별 아이콘' />
          {sortBy === 'group' ? '그룹별' : '카테고리별'}
        </ControlButton>
        <ControlText>정렬</ControlText>
      </LeftRow>
      <SearchBar>
        <SearchInput
          placeholder='검색'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <img
          src={SearchIconImage}
          alt='검색'
          style={{ width: 18, height: 18, padding: 8 }}
        />
      </SearchBar>
    </Container>
  );
};

/**
 * 전체 컨테이너
 *
 * 정렬/검색 컨트롤을 감싸는 최상위 컨테이너입니다.
 */
const Container = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 20px;
`;

/**
 * 정렬 전환 버튼
 *
 * 그룹별/카테고리별 전환을 위한 버튼입니다.
 */
const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #f6ae24;
    color: #fff;
  }
`;

/**
 * 정렬 텍스트
 *
 * 정렬 라벨 텍스트입니다.
 */
const ControlText = styled.p`
  font-weight: 700;
  font-size: 14px;
  color: #000;
`;

/**
 * 아이콘 이미지
 *
 * 정렬 버튼 내 아이콘 이미지입니다.
 */
const Icon = styled.img`
  width: 13px;
  height: 16px;
`;

/**
 * 검색 바 컨테이너
 *
 * 검색 입력창과 아이콘을 감싸는 컨테이너입니다.
 */
const SearchBar = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  background: #fff;
`;

/**
 * 검색 입력창
 *
 * 검색어 입력을 위한 input 필드입니다.
 */
const SearchInput = styled.input`
  flex: 1;
  border: none;
  padding: 10px;
`;

/**
 * 왼쪽 정렬 컨테이너
 *
 * 정렬 버튼과 텍스트를 감싸는 컨테이너입니다.
 */
const LeftRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;
