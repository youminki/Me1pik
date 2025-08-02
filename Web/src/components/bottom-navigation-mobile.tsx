/**
 * 모바일 하단 네비게이션 컴포넌트 (bottom-navigation-mobile.tsx)
 *
 * 모바일 환경에 최적화된 하단 네비게이션 컴포넌트를 제공합니다.
 * 장바구니 버튼과 주문 버튼을 포함하며, 고정 위치로 표시됩니다.
 * 반응형 디자인으로 모바일 화면에 최적화되어 있습니다.
 *
 * @description
 * - 모바일 최적화 하단 네비게이션
 * - 장바구니 버튼 및 주문 버튼
 * - 고정 위치 표시
 * - 반응형 디자인
 * - 접근성 지원
 */
import React from 'react';
import styled from 'styled-components';

import { theme } from '@/styles/Theme';

/**
 * 모바일 하단 바 속성 인터페이스
 *
 * 모바일 하단 네비게이션 컴포넌트의 props를 정의합니다.
 *
 * @property buttonText - 주문 버튼 텍스트 (기본값: '작성완료')
 * @property imageSrc - 장바구니 버튼 이미지 소스 (선택적)
 * @property cartOnClick - 장바구니 버튼 클릭 핸들러 (선택적)
 * @property onClick - 주문 버튼 클릭 핸들러 (선택적)
 * @property type - 버튼 타입 (기본값: 'button')
 * @property disabled - 버튼 비활성화 여부 (기본값: false)
 */
type BottomBarProps = {
  buttonText?: string; // 주문 버튼 텍스트 (기본값: '작성완료')
  imageSrc?: string; // 장바구니 버튼 이미지 소스 (선택적)
  cartOnClick?: () => void; // 장바구니 버튼 클릭 핸들러 (선택적)
  onClick?: () => void; // 주문 버튼 클릭 핸들러 (선택적)
  type?: 'button' | 'submit' | 'reset'; // 버튼 타입 (기본값: 'button')
  disabled?: boolean; // 버튼 비활성화 여부 (기본값: false)
};

/**
 * 모바일 하단 바 컴포넌트
 *
 * 모바일 환경에 최적화된 하단 네비게이션을 렌더링하는 컴포넌트입니다.
 * 장바구니 버튼과 주문 버튼을 포함하며, 고정 위치로 표시됩니다.
 *
 * @param buttonText - 주문 버튼 텍스트 (기본값: '작성완료')
 * @param imageSrc - 장바구니 버튼 이미지 소스 (선택적)
 * @param cartOnClick - 장바구니 버튼 클릭 핸들러 (선택적)
 * @param onClick - 주문 버튼 클릭 핸들러 (선택적)
 * @param type - 버튼 타입 (기본값: 'button')
 * @param disabled - 버튼 비활성화 여부 (기본값: false)
 * @returns 모바일 하단 바 컴포넌트
 */
const BottomBar: React.FC<BottomBarProps> = ({
  buttonText = '작성완료',
  imageSrc,
  cartOnClick,
  onClick,
  type = 'button',
  disabled = false,
}) => (
  <BottomBarContainer>
    <CartButton onClick={cartOnClick}>
      {imageSrc && <CartImage src={imageSrc} alt='' aria-hidden='true' />}
    </CartButton>
    <OrderButton onClick={onClick} type={type} disabled={disabled}>
      {buttonText}
    </OrderButton>
  </BottomBarContainer>
);

export default BottomBar;

const BottomBarContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: ${theme.colors.gray4};
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: 600px;
  margin: 0 auto;
  padding: 15px 0 34px 0;
  text-align: center;
`;
const CartButton = styled.button`
  width: 75px;
  height: 56px;
  background-color: ${theme.colors.gray4};
  border: 1px solid ${theme.colors.gray};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 21px;
`;
const CartImage = styled.img``;
const OrderButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  height: 56px;
  background-color: ${({ disabled }) =>
    disabled ? theme.colors.gray : theme.colors.black};
  border: none;
  border-radius: 6px;
  color: ${theme.colors.white};
  font-size: 16px;
  font-weight: 800;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  margin-right: 11px;
`;
