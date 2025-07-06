import React from 'react';
import styled from 'styled-components';
import BackButtonIcon from '../assets/Header/BackButton.svg';

interface SimpleHeaderProps {
  title: string;
  onBack?: () => void;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({ title, onBack }) => {
  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <BackButton src={BackButtonIcon} alt='뒤로가기' onClick={handleBack} />
        <Title>{title}</Title>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default SimpleHeader;

const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 1000;
`;

const HeaderContainer = styled.header`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 1rem;
`;

const BackButton = styled.img`
  width: 28px;
  height: 28px;
  cursor: pointer;
`;

const Title = styled.h1`
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #222;
`;
