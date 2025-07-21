import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import FailIcon from '../../assets/completes/FailIcon.svg';
import FixedBottomBar from '../../components/fixed-bottom-bar';

import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';

interface PaymentFailProps {
  onClose?: () => void;
}

const PaymentFail: React.FC<PaymentFailProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      // 부모 컴포넌트에서 전달된 닫기 콜백 실행
      onClose();
    } else if (window.opener) {
      // 팝업으로 열렸다면 창 닫기
      window.close();
    } else {
      // SPA 라우팅으로 홈으로 이동
      navigate('/home');
    }
  };

  // 예시: 공통 에러 컴포넌트 사용
  // return <CommonErrorMessage message="결제에 실패했습니다. 서비스팀에 문의해 주세요." />;

  return (
    <>
      <UnifiedHeader variant='twoDepth' title='결제실패' />
      <Container>
        <Content>
          <IconWrapper>
            <CompleteImg src={FailIcon} alt='결제 실패 아이콘' />
          </IconWrapper>
          <Title>
            결제가 <Strong>실패</Strong> 되었습니다.
          </Title>
          <Subtitle>
            처리 중 문제가 발생 하였습니다.
            <br />
            서비스팀에서 신속히 처리 드리겠습니다.
          </Subtitle>
        </Content>
        <FixedBottomBar text='확인' color='black' onClick={handleClose} />
      </Container>
    </>
  );
};

export default PaymentFail;

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
  position: relative;
  top: 0;
  width: 80px;
  height: 80px;
  object-fit: contain;
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
