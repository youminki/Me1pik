import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import BackButtonIcon from '../assets/BackButton.svg';

interface BackButtonProps {
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Container>
      <IconButton onClick={handleClick}>
        <Icon src={BackButtonIcon} alt="뒤로 가기" />
      </IconButton>
    </Container>
  );
};

export default BackButton;

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
