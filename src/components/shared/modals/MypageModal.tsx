// src/components/MypageModal.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';

import MypageBox from '@/assets/MypageBox.svg';
import MystyleBox from '@/assets/MystyleBox.svg';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import { logout } from '@/utils/auth';

type MypageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MypageModal: React.FC<MypageModalProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  const handleOverlayClick = () => {
    setIsClosing(true);
    setTimeout(onClose, 400);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleLogoutOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoutModalOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      console.log('로그아웃 시작');

      // 인스타그램 방식: 웹뷰 통신 스크립트 호출
      if (
        typeof (window as unknown as { handleWebLogout?: () => void })
          .handleWebLogout === 'function'
      ) {
        (
          window as unknown as { handleWebLogout: () => void }
        ).handleWebLogout();
      }

      await logout();
      console.log('로그아웃 완료, 로그인 페이지로 이동');

      setLogoutModalOpen(false);
      onClose();

      // 로그인 페이지로 이동 (무신사 스타일)
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 오류가 발생해도 로그인 페이지로 이동
      setLogoutModalOpen(false);
      onClose();
      navigate('/login', { replace: true });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Overlay onClick={handleOverlayClick}>
        <ModalContainer onClick={handleModalClick} $isClosing={isClosing}>
          <ModalHandle>
            <HandleBar />
          </ModalHandle>

          <ModalHeader>
            <Title>마이페이지</Title>
          </ModalHeader>
          <Divider />

          <ModalContentArea>
            {/* 첫 번째 이미지 클릭 시 /MyInfoList로 이동 */}
            <PlaceholderImage
              src={MypageBox}
              alt='마이페이지 이미지'
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                navigate('/MyInfoList');
              }}
            />

            {/* 두 번째 이미지 클릭 시 /Mystyle로 이동 */}
            <PlaceholderImage
              src={MystyleBox}
              alt='마이스타일 이미지'
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                navigate('/Mystyle');
              }}
            />
          </ModalContentArea>

          <Divider />

          <LogoutButton onClick={handleLogoutOpen}>로그아웃</LogoutButton>
        </ModalContainer>
      </Overlay>

      {isLogoutModalOpen && (
        <ReusableModal
          isOpen={isLogoutModalOpen}
          onClose={() => setLogoutModalOpen(false)}
          onConfirm={handleLogoutConfirm}
          title='알림'
          showConfirmButton={true}
        >
          로그아웃을 하시겠습니까?
        </ReusableModal>
      )}
    </>
  );
};

export default MypageModal;

/* Styled Components */
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`;

const slideDown = keyframes`
  from { transform: translateY(0); }
  to   { transform: translateY(100%); }
`;

interface ModalContainerProps {
  $isClosing: boolean;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 9999;
`;

const ModalContainer = styled.div<ModalContainerProps>`
  position: fixed;
  bottom: 0;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  min-height: 350px;
  padding: 1rem;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;

  animation: ${({ $isClosing }) =>
    $isClosing
      ? css`
          ${slideDown} 0.4s ease-out forwards
        `
      : css`
          ${slideUp} 0.4s ease-out forwards
        `};
`;

const ModalHandle = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 8px;
`;

const HandleBar = styled.div`
  position: fixed;
  top: 6px;
  width: 40px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
`;

const ModalHeader = styled.div`
  margin: 16px;
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: 800;
  line-height: 18px;
  margin: 0;
`;

const Divider = styled.hr`
  width: 100%;
  height: 1px;
  background: #ddd;
  border: none;
  margin: 0;
`;

const ModalContentArea = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 20px;
`;

const PlaceholderImage = styled.img`
  cursor: pointer;
  object-fit: cover;
`;

const LogoutButton = styled.button`
  width: 100%;
  height: 56px;
  margin: 16px auto;
  background: #000;
  color: #fff;
  font-weight: 800;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;
