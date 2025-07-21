import React from 'react';
import styled from 'styled-components';

import LandingLogoIcon from '@/assets/landings/LandingLogoIcon.svg';
import ShareIcon from '@/assets/landings/ShareIcon.svg';

const Header: React.FC = () => {
  const handleShare = async () => {
    const shareUrl = 'https://me1pik.com';
    if (navigator.share) {
      try {
        await navigator.share({
          url: shareUrl,
        });
      } catch (error) {
        console.error('공유 중 에러 발생:', error);
      }
    } else {
      alert('이 브라우저는 공유 기능을 지원하지 않습니다.');
    }
  };

  return (
    <HeaderContainer>
      <Logo src={LandingLogoIcon} alt='Landing Logo' />
      <ShareButton onClick={handleShare}>
        <Icons src={ShareIcon} alt='Share Icon' />
      </ShareButton>
    </HeaderContainer>
  );
};

export default Header;

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1000px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  z-index: 1000;
  border-bottom: 1px solid #eee;
`;

const Logo = styled.img`
  height: 24px;
  width: auto;
`;

const ShareButton = styled.button`
  position: absolute;
  right: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const Icons = styled.img`
  height: 20px;
  width: auto;
`;
