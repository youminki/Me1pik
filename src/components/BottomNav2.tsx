/* src/components/BottomNav2.tsx */
import React from 'react';
import styled from 'styled-components';
import Theme from '../styles/Theme';

type BottomBarProps = {
  buttonText?: string;
  imageSrc?: string;
  cartOnClick?: () => void;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

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
      {imageSrc && <CartImage src={imageSrc} alt='icon' />}
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
  background-color: ${Theme.colors.gray4};
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
  background-color: ${Theme.colors.gray4};
  border: 1px solid ${Theme.colors.gray};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 21px;
`;
const CartImage = styled.img``;
const OrderButton = styled.button`
  width: 100%;
  height: 56px;
  background-color: ${Theme.colors.black};
  border: none;
  border-radius: 6px;
  color: ${Theme.colors.white};
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  margin-right: 11px;
`;
