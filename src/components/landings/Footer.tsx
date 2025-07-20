import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const START_DATE = new Date('2025-03-25T00:00:00');

const TARGET_DATE = new Date('2025-04-19T00:00:00');

const PER_HOUR = 3;
const MAX_PEOPLE = 432;

interface TimeLeft {
  d: number;
  h: number;
  m: number;
  s: number;
}

const Footer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
  });

  const [people, setPeople] = useState(0);

  const navigate = useNavigate();

  const calculateTimeLeft = (): TimeLeft => {
    const now = Date.now();
    const diff = TARGET_DATE.getTime() - now;

    if (diff <= 0) {
      return { d: 0, h: 0, m: 0, s: 0 };
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return { d, h, m, s };
  };

  const calculatePeopleCount = (): number => {
    const now = Date.now();
    const start = START_DATE.getTime();
    const target = TARGET_DATE.getTime();

    if (now >= target) return MAX_PEOPLE;

    if (now <= start) return 0;

    const elapsedHours = (now - start) / (1000 * 60 * 60);
    let count = elapsedHours * PER_HOUR;

    if (count > MAX_PEOPLE) {
      count = MAX_PEOPLE;
    }

    return Math.floor(count);
  };

  useEffect(() => {
    const updateState = () => {
      setTimeLeft(calculateTimeLeft());
      setPeople(calculatePeopleCount());
    };

    updateState();

    const timerId = setInterval(updateState, 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleRegisterClick = () => {
    navigate('/login');
  };

  return (
    <FooterContainer>
      <InfoText>
        전체 5,474명 / 신규{' '}
        <BoldSpan>{people.toString().padStart(2, '0')}명</BoldSpan>의 이용자가
        멜픽했어요
        <br />
        사전예약 마감까지{' '}
        <BoldSpan>
          {timeLeft.d}일 {timeLeft.h.toString().padStart(2, '0')}:
          {timeLeft.m.toString().padStart(2, '0')}:
          {timeLeft.s.toString().padStart(2, '0')}
        </BoldSpan>{' '}
        남았어요!
      </InfoText>

      <RegisterButton onClick={handleRegisterClick}>
        로그인 하러가기
      </RegisterButton>

      <CompanyInfo>
        (주) 팀리프트 . 235-87-01284 . 2020-서울금천-0973
        <br />
        서울 금천구 디지털로9길 41, 1008호
        <br />
        <CopyrightText>© 2024 ME1PIK.</CopyrightText>
      </CompanyInfo>
    </FooterContainer>
  );
};

export default Footer;

const FooterContainer = styled.footer`
  height: 309px;
  margin: 0 auto;

  margin-bottom: 0;
  background: #f5ab35;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const InfoText = styled.div`
  font-weight: 400;
  font-size: 17px;
  line-height: 23px;
  text-align: center;
  color: #ffffff;
  margin-bottom: 20px;
`;

const BoldSpan = styled.span`
  font-weight: 800;
`;

const RegisterButton = styled.button`
  width: 250px;
  height: 45px;
  background: #ffffff;
  border-radius: 20px;
  border: none;

  font-weight: 800;
  font-size: 16px;
  line-height: 18px;
  color: #000000;
  cursor: pointer;
  margin-bottom: 20px;
  transition:
    transform 0.1s ease-in-out,
    background 0.2s ease-in-out;

  &:hover {
    background: #e0e0e0;
  }

  &:active {
    transform: scale(0.97);
  }
`;

const CompanyInfo = styled.div`
  align-self: flex-start;
  margin-left: 42px;

  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: #000000;
  text-align: left;
  margin-top: 20px;
`;

const CopyrightText = styled.div`
  margin-top: 20px;
`;
