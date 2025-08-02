import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

import CompleteIcon from '@/assets/completes/CompleteIcon.svg';
import FixedBottomBar from '@/components/fixed-bottom-bar';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';

/**
 * 결제 완료 페이지 컴포넌트 (PaymentComplete.tsx)
 *
 * 결제가 성공적으로 완료되었음을 사용자에게 알리는 페이지를 제공합니다.
 * 완료 아이콘 애니메이션, 성공 메시지, 확인 버튼을 포함합니다.
 *
 * @description
 * - 결제 완료 확인 메시지
 * - 애니메이션 효과 (슬라이드 애니메이션)
 * - 다양한 닫기 방식 지원 (콜백/팝업/라우팅)
 * - 사용자 친화적 UI
 */

/**
 * 결제 완료 페이지 속성 인터페이스
 *
 * 결제 완료 페이지에서 사용되는 속성을 정의합니다.
 * 부모 컴포넌트로부터 전달받는 콜백 함수를 포함합니다.
 *
 * @property onClose - 페이지 닫기 콜백 함수 (선택적)
 */
interface PaymentCompleteProps {
  onClose?: () => void; // 페이지 닫기 콜백 함수 (선택적)
}

const PaymentComplete: React.FC<PaymentCompleteProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      // 부모 컴포넌트에서 전달된 닫기 콜백 실행
      onClose();
    } else if (window.opener) {
      // 브라우저 팝업으로 열렸다면 창 닫기
      window.close();
    } else {
      // SPA 라우팅으로는 홈으로 이동
      navigate('/home');
    }
  };

  return (
    <>
      <UnifiedHeader variant='twoDepth' title='결제완료' />
      <Container>
        <Content>
          <IconWrapper>
            <CompleteImg src={CompleteIcon} alt='결제 완료 아이콘' />
          </IconWrapper>
          <Title>
            결제가 <Strong>완료</Strong> 되었습니다.
          </Title>
          <Subtitle>
            신청하신 제품을 신속하게 준비하여,
            <br />
            빠르게 전달 드리겠습니다.
          </Subtitle>
        </Content>
        <FixedBottomBar text='확인' color='yellow' onClick={handleClose} />
      </Container>
    </>
  );
};

export default PaymentComplete;

/**
 * 슬라이드 애니메이션
 *
 * 완료 아이콘이 화면 왼쪽 밖에서 오른쪽 밖으로 이동하는 애니메이션을 정의합니다.
 * 무한 반복으로 사용자에게 동적인 피드백을 제공합니다.
 */
const slideAcross = keyframes`
  0% {
    left: -80px;
  }
  100% {
    left: calc(100% + 80px);
  }
`;

const Container = styled.div`
  position: fixed;
  inset: 0;
  background: #fff;
  padding-top: 70px;
`;

const Content = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 600px;
  text-align: center;
  padding: 1rem;
  box-sizing: border-box;
`;

const IconWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 80px;
  margin: 0 auto 24px;
  overflow: hidden;
`;

const CompleteImg = styled.img`
  position: absolute;
  top: 0;
  width: 80px;
  height: 80px;
  object-fit: contain;
  animation: ${slideAcross} 4s linear infinite;
`;

const Title = styled.h1`
  font-weight: 400;
  font-size: 24px;
  line-height: 22px;
  color: #000;
  margin-bottom: 22px;
`;

const Strong = styled.span`
  font-weight: 700;
`;

const Subtitle = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 23px;
  text-align: center;
  color: #999999;
`;
