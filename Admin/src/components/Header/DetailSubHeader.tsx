// src/components/DetailSubHeader.tsx
import React from 'react';
import styled from 'styled-components';

export interface TabItem {
  label: string;
}

interface DetailSubHeaderProps {
  /** "변경저장", "취소" 두 버튼을 나타내는 배열 */
  tabs: TabItem[];
  /** 버튼 클릭 시 상위로 알려주는 콜백 */
  onTabChange?: (tab: TabItem) => void;
}

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

/* ====================== Styled Components ====================== */

/** 상단 래퍼 */
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

/** 오른쪽 정렬을 위한 버튼 컨테이너 */
const ButtonContainer = styled.div`
  margin-left: auto; /* 오른쪽 정렬 */
  display: flex;
`;

interface ActionButtonProps {
  $isSaveButton: boolean;
  $isFirst?: boolean;
  $isLast?: boolean;
}

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
