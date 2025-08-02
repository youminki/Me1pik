/**
 * 상세 헤더(DetailSubHeader)
 *
 * - 변경저장, 취소 등 액션 버튼을 포함한 상세 페이지 헤더
 * - 버튼 클릭 시 상위 컴포넌트로 콜백 전달
 * - 변경저장/취소 버튼의 조건부 스타일링 및 이벤트 처리
 * - 재사용 가능한 공통 컴포넌트
 */

// src/components/DetailSubHeader.tsx
import React from 'react';
import styled from 'styled-components';

/**
 * 탭 아이템 인터페이스
 * - 버튼 라벨 정보 포함
 */
export interface TabItem {
  label: string;
}

/**
 * 상세 헤더 props
 * - 탭 배열, 탭 변경 콜백 등
 */
interface DetailSubHeaderProps {
  /** "변경저장", "취소" 두 버튼을 나타내는 배열 */
  tabs: TabItem[];
  /** 버튼 클릭 시 상위로 알려주는 콜백 */
  onTabChange?: (tab: TabItem) => void;
}

/**
 * 버튼 클릭 핸들러
 * - 버튼 클릭 시 상위 콜백 호출
 */
const DetailSubHeader: React.FC<DetailSubHeaderProps> = ({ tabs, onTabChange }) => {
  // 버튼 클릭 시 상위 콜백 호출
  const handleClick = (tab: TabItem) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <HeaderContainer>
      <ButtonContainer>
        {tabs.map((tab, index) => {
          // "변경저장"이면 왼쪽 버튼(검정 배경, 좌측 모서리 둥글게)
          // "취소"이면 오른쪽 버튼(흰 배경, 우측 모서리 둥글게)
          const isSaveButton = tab.label === '변경저장';
          return (
            <ActionButton
              key={index}
              $isSaveButton={isSaveButton}
              $isFirst={index === 0}
              $isLast={index === tabs.length - 1}
              onClick={() => handleClick(tab)}
            >
              {tab.label}
            </ActionButton>
          );
        })}
      </ButtonContainer>
    </HeaderContainer>
  );
};

export default DetailSubHeader;

/**
 * 상단 래퍼 스타일드 컴포넌트
 * - flex 레이아웃, 배경, 테두리, 패딩 등 스타일링
 */
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border: 1px solid #dddddd;
  margin-bottom: 34px;
  min-width: 800px;
  border-radius: 4px;
`;

/**
 * 오른쪽 정렬을 위한 버튼 컨테이너 스타일드 컴포넌트
 * - 오른쪽 정렬, flex 레이아웃 등 스타일링
 */
const ButtonContainer = styled.div`
  margin-left: auto; /* 오른쪽 정렬 */
  display: flex;
`;

/**
 * 액션 버튼 props
 * - 저장 버튼 여부, 첫 번째/마지막 버튼 여부 등
 */
interface ActionButtonProps {
  $isSaveButton: boolean;
  $isFirst?: boolean;
  $isLast?: boolean;
}

/**
 * 액션 버튼 스타일드 컴포넌트
 * - 변경저장/취소 버튼의 조건부 스타일링
 */
const ActionButton = styled.button<ActionButtonProps>`
  padding: 10px 20px;

  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  border: none;
  cursor: pointer;
  min-width: 100px;

  /* 왼쪽 버튼(변경저장)인지, 오른쪽 버튼(취소)인지에 따라 스타일 분기 */
  ${({ $isSaveButton }) =>
    $isSaveButton
      ? `
        background-color: #000; 
        color: #fff;
      `
      : `
        background-color: #fff; 
        color: #000;
        border: 1px solid #ddd;
      `}

  /* 좌/우 상하단 둥근 모서리 적용 */
  ${({ $isFirst, $isLast }) =>
    $isFirst
      ? 'border-top-left-radius: 8px; border-bottom-left-radius: 8px;'
      : $isLast
        ? 'border-top-right-radius: 8px; border-bottom-right-radius: 8px;'
        : ''}
`;
