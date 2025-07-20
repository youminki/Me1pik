import styled from 'styled-components';

interface BottomBarProps {
  cartIconSrc: string;
  orderButtonLabel: string;
  onCartClick?: () => void;
  onOrderClick?: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({
  cartIconSrc,
  orderButtonLabel,
  onCartClick,
  onOrderClick,
}) => {
  return (
    <BottomBarContainer>
      <CartButton onClick={onCartClick}>
        <CartImage src={cartIconSrc} alt='Shopping Basket' />
      </CartButton>
      <OrderButton onClick={onOrderClick}>{orderButtonLabel}</OrderButton>
    </BottomBarContainer>
  );
};

export default BottomBar;

const BottomBarContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1000px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #eeeeee;
  z-index: 9998;
  padding: 10px 0 34px 0;
  text-align: center;
  gap: 21px;
  max-width: 600px;
`;

const CartButton = styled.button`
  width: 75px;
  height: 56px;
  background-color: #eeeeee;
  border: 1px solid #dddddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 27px;
`;

const CartImage = styled.img`
  width: 41px;
  height: 34px;
`;

const OrderButton = styled.button`
  width: 100%;
  height: 56px;
  background-color: #f6ae24;
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  margin-right: 27px;
`;
