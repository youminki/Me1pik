/**
 * 트리플 버튼 상세 헤더(TripleButtonDetailSubHeader)
 *
 * - 뒤로가기, 저장, 삭제 버튼을 포함한 상세 페이지 헤더
 * - 뒤로가기 시 기본 동작 또는 커스텀 콜백 지원
 * - 저장/삭제 버튼의 이벤트 처리 및 레이아웃
 * - 재사용 가능한 공통 컴포넌트
 */

// src/components/Header/TripleButtonDetailSubHeader.tsx
import React from 'react';
import styled from 'styled-components';

/**
 * 트리플 버튼 상세 헤더 props
 * - 뒤로가기, 저장, 삭제 버튼의 라벨과 콜백 함수들
 */
export interface TripleButtonDetailSubHeaderProps {
  backLabel: string;
  onBackClick?: () => void;
  saveLabel: string;
  onSaveClick?: () => void;
  deleteLabel: string;
  onDeleteClick?: () => void;
}

const TripleButtonDetailSubHeader: React.FC<TripleButtonDetailSubHeaderProps> = ({
  backLabel,
  onBackClick,
  saveLabel,
  onSaveClick,
  deleteLabel,
  onDeleteClick,
}) => {
  /**
   * 뒤로가기 핸들러
   * - 커스텀 콜백이 있으면 실행, 없으면 브라우저 뒤로가기
   */
  const handleBack = () => {
    if (onBackClick) onBackClick();
    else window.history.back();
  };

  return (
    <HeaderContainer>
      <LeftButton onClick={handleBack}>
        <BulletIcon />
        {backLabel}
      </LeftButton>
      <RightButtons>
        <ActionButton onClick={onSaveClick}>{saveLabel}</ActionButton>
        <ActionButton onClick={onDeleteClick}>{deleteLabel}</ActionButton>
      </RightButtons>
    </HeaderContainer>
  );
};

export default TripleButtonDetailSubHeader;

/**
 * 헤더 컨테이너 스타일드 컴포넌트
 * - flex 레이아웃, 배경, 테두리, 패딩 등 스타일링
 */
const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  min-width: 834px;
  min-height: 60px;
  background: #f9f9f9;
  border: 1px solid #dddddd;
  border-radius: 4px;
  padding: 0 10px;
  box-sizing: border-box;
`;

/**
 * 왼쪽 버튼(뒤로가기) 스타일드 컴포넌트
 * - 버튼 스타일, 호버 효과, 아이콘 포함 등 스타일링
 */
const LeftButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 40px;

  font-weight: 700;
  font-size: 12px;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background-color: #eeeeee;
  }
`;

/**
 * 불릿 아이콘 스타일드 컴포넌트
 * - 화살표 모양의 아이콘 스타일링
 */
const BulletIcon = styled.div`
  width: 7px;
  height: 7px;
  margin-right: 5px;
  border-left: 3px solid #f6ae24;
  border-bottom: 3px solid #f6ae24;
  transform: rotate(45deg);
`;

/**
 * 오른쪽 버튼 컨테이너 스타일드 컴포넌트
 * - 저장/삭제 버튼을 오른쪽에 배치
 */
const RightButtons = styled.div`
  display: flex;
  margin-left: auto;
`;

/**
 * 액션 버튼 스타일드 컴포넌트
 * - 저장/삭제 버튼의 공통 스타일링
 */
const ActionButton = styled.button`
  width: 100px;
  height: 40px;

  font-weight: 700;
  font-size: 12px;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  border-left: none;

  &:hover {
    background-color: #dddddd;
  }

  /* 첫 번째 버튼(변경저장)의 왼쪽 모서리 둥글게 */
  &:first-child {
    border-left: 1px solid #dddddd;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  /* 마지막 버튼(삭제)의 오른쪽 모서리 둥글게 */
  &:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;
