/**
 * fixed-bottom-bar 컴포넌트
 *
 * 고정 하단 버튼 바 컴포넌트를 제공합니다.
 * 화면 하단에 고정되어 표시되는 버튼 바입니다.
 * 결제, 확인, 주문 등의 주요 액션에 사용됩니다.
 * 반응형 디자인으로 모바일과 데스크톱 모두에서 최적화되어 있습니다.
 *
 * @description
 * - 화면 하단 고정 위치
 * - 반응형 디자인 지원
 * - 색상 테마 (yellow/black)
 * - HTML 버튼 속성 상속
 */

import React from 'react';
import styled from 'styled-components';

/**
 * FixedBottomBarProps 인터페이스
 *
 * 고정 하단 바 컴포넌트의 props를 정의합니다.
 *
 * @property text - 버튼 텍스트
 * @property color - 버튼 색상 (기본값: black)
 */
interface FixedBottomBarProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string; // 버튼 텍스트
  color?: 'yellow' | 'black'; // 버튼 색상 (기본값: black)
}

/**
 * FixedBottomBar 컴포넌트
 *
 * 고정 하단 바 컴포넌트입니다.
 *
 * @param text - 버튼에 표시할 텍스트
 * @param color - 버튼 색상 (yellow 또는 black)
 * @param buttonProps - HTML 버튼 속성들
 * @returns 고정 하단 바 컴포넌트
 */
const FixedBottomBar: React.FC<FixedBottomBarProps> = ({
  text,
  color = 'black',
  ...buttonProps
}) => {
  return (
    <BottomBar>
      <SettleButton $color={color} {...buttonProps}>
        {text}
      </SettleButton>
    </BottomBar>
  );
};

export default FixedBottomBar;

/**
 * BottomBar 스타일 컴포넌트
 *
 * 하단 바 컨테이너의 스타일을 정의합니다.
 * 화면 하단에 고정되어 표시되는 컨테이너입니다.
 * 반응형 디자인으로 최대 너비를 제한하고 중앙 정렬합니다.
 */
const BottomBar = styled.div`
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: 600px;
  margin: 0 auto;
  background: #eeeeee;
  padding: 15px 0 34px 0;
  text-align: center;
`;

/**
 * SettleButton 스타일 컴포넌트
 *
 * 결제 버튼의 스타일을 정의합니다.
 * transient prop "$color"를 사용하여 색상 테마를 적용합니다.
 * - yellow: 강조 색상 (주문, 결제 등)
 * - black: 기본 색상 (확인, 취소 등)
 *
 * @property $color - 버튼 색상 테마
 */
const SettleButton = styled.button<{ $color: 'yellow' | 'black' }>`
  width: 90%;
  padding: 20px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;

  background-color: ${({ $color }) =>
    $color === 'yellow' ? '#F6AE24' : '#000000'};
  color: #ffffff;
  border: none;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
`;
