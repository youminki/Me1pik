/**
 * 리스트 버튼 상세 헤더(ListButtonDetailSubHeader)
 *
 * - 뒤로가기, 편집, 종료 버튼을 포함한 상세 페이지 헤더
 * - 뒤로가기 시 기본 동작 또는 커스텀 콜백 지원
 * - 편집/종료 버튼의 조건부 렌더링 및 이벤트 처리
 * - 재사용 가능한 공통 컴포넌트
 */

// ListButtonDetailSubHeader.tsx
import React from 'react';
import styled from 'styled-components';

/**
 * 상세 헤더 props
 * - 뒤로가기, 편집, 종료 버튼의 라벨과 콜백 함수들
 */
export interface DetailSubHeaderProps {
  backLabel: string;
  onBackClick?: () => void;
  editLabel: string;
  onEditClick?: () => void;
  endLabel?: string;
  onEndClick?: () => void;
}

const ListButtonDetailSubHeader: React.FC<DetailSubHeaderProps> = ({
  backLabel,
  onBackClick,
  editLabel,
  onEditClick,
  endLabel,
  onEndClick,
}) => {
  /**
   * 뒤로가기 핸들러
   * - 커스텀 콜백이 있으면 실행, 없으면 브라우저 뒤로가기
   */
  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  /**
   * 편집 핸들러
   * - 편집 버튼 클릭 시 커스텀 콜백 실행
   */
  const handleEdit = () => {
    if (onEditClick) {
      onEditClick();
    }
  };

  /**
   * 종료 핸들러
   * - 종료 버튼 클릭 시 커스텀 콜백 실행
   */
  const handleEnd = () => {
    if (onEndClick) {
      onEndClick();
    }
  };

  return (
    <HeaderContainer>
      <LeftButton onClick={handleBack}>
        <BulletIcon />
        {backLabel}
      </LeftButton>
      <RightButtons>
        <EditButton onClick={handleEdit} $single={!endLabel || !onEndClick}>
          {editLabel}
        </EditButton>
        {endLabel && onEndClick && <EndButton onClick={handleEnd}>{endLabel}</EndButton>}
      </RightButtons>
    </HeaderContainer>
  );
};

export default ListButtonDetailSubHeader;

/**
 * 헤더 컨테이너 스타일드 컴포넌트
 * - flex 레이아웃, 배경, 테두리, 패딩 등 스타일링
 */
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  min-width: 1000px;
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
  line-height: 13px;
  text-align: center;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  border-radius: 8px 0 0 8px;
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
 * - 뒤로가기 버튼 오른쪽에 배치
 */
const RightButtons = styled.div`
  display: flex;
  margin-left: auto;
  gap: 0px;
`;

/**
 * 편집 버튼 스타일드 컴포넌트
 * - 단독인 경우 양쪽 모두 둥글게 처리
 */
const EditButton = styled.button<{ $single?: boolean }>`
  width: 100px;
  height: 40px;

  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  border-radius: ${(props) => (props.$single ? '8px' : '8px 0 0 8px')};
  &:hover {
    background-color: #dddddd;
  }
`;

/**
 * 종료 버튼 스타일드 컴포넌트
 * - 종료 버튼 스타일링
 */
const EndButton = styled.button`
  width: 100px;
  height: 40px;

  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  text-align: center;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  border-radius: 0 8px 8px 0;
  &:hover {
    background-color: #dddddd;
  }
`;
