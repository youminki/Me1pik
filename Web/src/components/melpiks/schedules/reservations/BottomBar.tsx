/**
 * 예약 스케줄 하단 액션 바 컴포넌트 (BottomBar.tsx)
 *
 * 예약 스케줄 페이지의 하단에 고정된 액션 버튼을 제공하는 컴포넌트입니다.
 * 다음 단계로 진행하는 버튼을 포함하며, 비활성화 상태를 지원합니다.
 *
 * @description
 * - 하단 고정 위치
 * - 다음 단계 진행 버튼
 * - 비활성화 상태 지원
 * - 반응형 디자인
 * - 커스텀 버튼 텍스트
 */
// src/components/melpiks/schedules/reservations/BottomBar.tsx

import React from 'react';
import styled from 'styled-components';

/**
 * 하단 액션 바 Props
 *
 * @property onNext - 다음 단계 진행 핸들러
 * @property buttonText - 버튼 텍스트 (기본값: '다음')
 * @property disabled - 버튼 비활성화 여부 (기본값: false)
 */
interface BottomBarProps {
  onNext: () => void;
  buttonText?: string;
  disabled?: boolean;
}

/**
 * 예약 스케줄 하단 액션 바 컴포넌트
 *

 * 예약 스케줄 페이지 하단에 고정된 액션 버튼을 렌더링합니다.
 * 다음 단계로 진행하는 기능을 제공합니다.
 *
 * @param onNext - 다음 단계 진행 핸들러
 * @param buttonText - 버튼 텍스트 (기본값: '다음')
 * @param disabled - 버튼 비활성화 여부 (기본값: false)
 * @returns 하단 액션 바 JSX 요소
 */
const BottomBar: React.FC<BottomBarProps> = ({
  onNext,
  buttonText = '다음',
  disabled = false,
}) => {
  return (
    <BottomBarContainer>
      <ActionButton onClick={onNext} disabled={disabled}>
        {buttonText}
      </ActionButton>
    </BottomBarContainer>
  );
};

export default BottomBar;

/**
 * 하단 액션 바 컨테이너
 *

 * 하단에 고정된 액션 바 컨테이너입니다.
 * 화면 하단에 고정되어 스크롤과 관계없이 표시됩니다.
 */
const BottomBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 10px 34px;
  background-color: #eeeeee;
  z-index: 9999;
`;

/**
 * 액션 버튼
 *

 * 다음 단계로 진행하는 메인 액션 버튼입니다.
 * 비활성화 상태에 따라 스타일이 변경됩니다.
 *
 * @param disabled - 버튼 비활성화 여부
 */
const ActionButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  height: 56px;
  background-color: ${({ disabled }) => (disabled ? '#bdbdbd' : 'black')};
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  margin: 0 21px;
`;
