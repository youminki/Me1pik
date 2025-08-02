import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import NotFoundIcon from '@/assets/404icon.svg';

/**
 * 404 에러 페이지 컴포넌트 (NotFound.tsx)
 *
 * 존재하지 않는 페이지에 접근했을 때 표시되는 에러 페이지를 제공합니다.
 * 사용자 친화적인 에러 메시지와 홈으로 돌아가는 기능을 포함합니다.
 *
 * @description
 * - 404 에러 페이지
 * - 사용자 친화적 에러 메시지
 * - 홈으로 돌아가기 버튼
 * - 반응형 디자인
 * - 접근성 고려
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Wrapper>
      <IconWrapper>
        <Icon src={NotFoundIcon} alt='404 아이콘' />
      </IconWrapper>
      <ErrorCode>
        <Black>4</Black>
        <Orange>0</Orange>
        <Black>4</Black>
      </ErrorCode>
      <Message>요청하신 페이지를 찾을 수 없습니다.</Message>
      <HomeButton onClick={() => navigate('/')}>홈 돌아가기</HomeButton>
    </Wrapper>
  );
};

export default NotFound;

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
`;

const IconWrapper = styled.div`
  margin-bottom: 24px;
`;

const Icon = styled.img`
  width: 60px;
  height: 60px;
`;

const ErrorCode = styled.div`
  font-size: 80px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 2px;
`;

const Black = styled.span`
  color: #111;
`;

const Orange = styled.span`
  color: #f6ac36;
`;

const Message = styled.div`
  color: #222;
  margin-bottom: 48px;
  font-weight: 400;
  font-size: 16px;
  line-height: 13px;
  text-align: center;
`;

const HomeButton = styled.button`
  border: none;
  background: #000000;
  border-radius: 6px;
  padding: 20px 0;
  width: 80vw;
  max-width: 480px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #222;
  }

  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  /* identical to box height */
  text-align: center;

  color: #ffffff;
`;
