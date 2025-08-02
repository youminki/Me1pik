/**
 * 마이페이지 모달 컴포넌트 (MypageModal.tsx)
 *
 * 사용자의 마이페이지 기능을 제공하는 하단 슬라이드 모달입니다.
 * 마이정보, 마이스타일, 로그아웃 기능을 포함하며, 부드러운 애니메이션을 제공합니다.
 *
 * @description
 * - 하단에서 슬라이드 업되는 모달 디자인
 * - 마이정보 및 마이스타일 페이지 이동
 * - 로그아웃 기능 및 확인 모달
 * - 웹뷰 통신 스크립트 지원
 * - 부드러운 애니메이션 효과
 * - 반응형 디자인 지원
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';

import MypageBox from '@/assets/MypageBox.svg';
import MystyleBox from '@/assets/MystyleBox.svg';
import ReusableModal from '@/components/shared/modals/ReusableModal';
import { logout } from '@/utils/auth';

/**
 * 마이페이지 모달 프로퍼티 인터페이스
 *
 * @property isOpen - 모달 열림/닫힘 상태
 * @property onClose - 모달 닫기 콜백 함수
 */
interface MypageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 마이페이지 모달 컴포넌트
 *
 * 사용자의 마이페이지 기능을 제공하는 하단 슬라이드 모달입니다.
 * 마이정보, 마이스타일 페이지로의 이동과 로그아웃 기능을 포함합니다.
 *
 * @param isOpen - 모달 열림/닫힘 상태
 * @param onClose - 모달 닫기 콜백 함수
 * @returns 마이페이지 모달 JSX 요소
 */
const MypageModal: React.FC<MypageModalProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  /**
   * 모달 열림 상태 변경 시 닫기 애니메이션 초기화
   */
  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  /**
   * 오버레이 클릭 핸들러
   *
   * 모달 외부 영역 클릭 시 닫기 애니메이션을 시작합니다.
   */
  const handleOverlayClick = () => {
    setIsClosing(true);
    setTimeout(onClose, 400);
  };

  /**
   * 모달 내부 클릭 핸들러
   *
   * 모달 내부 클릭 시 이벤트 전파를 차단합니다.
   */
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  /**
   * 로그아웃 모달 열기 핸들러
   *
   * 로그아웃 버튼 클릭 시 확인 모달을 엽니다.
   */
  const handleLogoutOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoutModalOpen(true);
  };

  /**
   * 로그아웃 확인 핸들러
   *
   * 웹뷰 통신 스크립트를 호출하고 로그아웃 처리를 수행합니다.
   * 성공/실패와 관계없이 로그인 페이지로 이동합니다.
   */
  const handleLogoutConfirm = async () => {
    try {
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

      setLogoutModalOpen(false);
      onClose();

      // 로그인 페이지로 이동 (무신사 스타일)
      navigate('/login', { replace: true });
    } catch {
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

/**
 * 슬라이드 업 애니메이션
 *
 * 모달이 하단에서 위로 슬라이드되는 애니메이션을 정의합니다.
 */
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
`;

/**
 * 슬라이드 다운 애니메이션
 *
 * 모달이 위에서 아래로 슬라이드되는 애니메이션을 정의합니다.
 */
const slideDown = keyframes`
  from { transform: translateY(0); }
  to   { transform: translateY(100%); }
`;

/**
 * 모달 컨테이너 프로퍼티 인터페이스
 *
 * @property $isClosing - 닫기 애니메이션 상태
 */
interface ModalContainerProps {
  $isClosing: boolean;
}

/**
 * 모달 오버레이 스타일드 컴포넌트
 *
 * 모달의 배경 오버레이를 제공하며, 클릭 시 모달을 닫습니다.
 */
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

/**
 * 모달 컨테이너 스타일드 컴포넌트
 *
 * 하단에서 슬라이드되는 모달의 메인 컨테이너입니다.
 * 애니메이션 상태에 따라 슬라이드 방향이 결정됩니다.
 */
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

/**
 * 모달 핸들 컨테이너
 *
 * 모달 상단의 드래그 핸들을 포함하는 컨테이너입니다.
 */
const ModalHandle = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 8px;
`;

/**
 * 모달 핸들 바
 *

 * 모달 상단의 드래그 가능한 핸들 바입니다.
 * 시각적 피드백을 제공합니다.
 */
const HandleBar = styled.div`
  position: fixed;
  top: 6px;
  width: 40px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
`;

/**
 * 모달 헤더
 *

 * 모달의 제목을 포함하는 헤더 영역입니다.
 */
const ModalHeader = styled.div`
  margin: 16px;
`;

/**
 * 모달 제목
 *

 * 모달의 메인 제목을 표시하는 스타일드 컴포넌트입니다.
 */
const Title = styled.h2`
  font-size: 16px;
  font-weight: 800;
  line-height: 18px;
  margin: 0;
`;

/**
 * 구분선
 *

 * 모달 내부의 섹션을 구분하는 수평선입니다.
 */
const Divider = styled.hr`
  width: 100%;
  height: 1px;
  background: #ddd;
  border: none;
  margin: 0;
`;

/**
 * 모달 컨텐츠 영역
 *

 * 모달의 메인 컨텐츠를 포함하는 영역입니다.
 * 마이페이지와 마이스타일 이미지를 배치합니다.
 */
const ModalContentArea = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 20px;
`;

/**
 * 플레이스홀더 이미지
 *

 * 클릭 가능한 이미지 요소로, 마이페이지와 마이스타일로 이동합니다.
 */
const PlaceholderImage = styled.img`
  cursor: pointer;
  object-fit: cover;
`;

/**
 * 로그아웃 버튼
 *

 * 로그아웃 기능을 실행하는 버튼입니다.
 * 검은색 배경과 흰색 텍스트를 사용합니다.
 */
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
