import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

// 타입 정의
interface UserInfo {
  userId: string;
  userName: string;
  userEmail: string;
}

declare global {
  interface Window {
    PaypleCpayAuthCheck?: (data: unknown) => void;
  }
}

const AddCardPayple: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('토큰이 없습니다. 로그인 후 다시 시도해주세요.');
        return;
      }

      try {
        const res = await fetch('https://api.stylewh.com/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('로그인 정보 요청 실패');

        const data = await res.json();
        setUserInfo({
          userId: String(data.id),
          userName: data.name,
          userEmail: data.email,
        });
      } catch (err: any) {
        console.error('유저 정보 로딩 실패:', err);
        setError('로그인 정보를 불러오는 데 실패했습니다.');
      }
    };

    fetchUserInfo();
  }, []);

  // 카드 등록 요청
  const registerCard = useCallback(async () => {
    if (!userInfo) {
      setError('로그인 정보를 불러올 수 없습니다.');
      return;
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        userId: userInfo.userId,
        userName: userInfo.userName,
        userEmail: userInfo.userEmail,
      }).toString();

      const res = await fetch(
        `https://api.stylewh.com/payple/card-register-data?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
          },
        }
      );
      if (!res.ok) throw new Error('카드 등록 데이터 요청 실패');

      const data = await res.json();
      if (typeof window.PaypleCpayAuthCheck !== 'function') {
        throw new Error('Payple SDK 준비 오류');
      }

      window.PaypleCpayAuthCheck({
        ...data,
        PCD_PAY_WORK: 'CERT',
        PCD_SIMPLE_FLAG: 'Y',
        PCD_PAYER_AUTHTYPE: 'pwd',
        PCD_PAY_GOODS: '카드 등록',
        PCD_PAY_TOTAL: 101,
      });
    } catch (err: any) {
      console.error('카드 등록 오류:', err);
      setError(`카드 등록 중 오류 발생: ${err.message}`);
    }
  }, [userInfo]);

  return (
    <Wrapper>
      <Inner>
        <Title>카드 등록</Title>

        {/* 카드 추가 박스 */}
        <AddCardBox
          onClick={registerCard}
          title={userInfo ? '카드 추가' : '로그인 필요'}
        >
          <PlusWrapper>
            <PlusBox>
              <PlusLineVert />
              <PlusLineHorz />
            </PlusBox>
            <AddText>카드 추가</AddText>
          </PlusWrapper>
        </AddCardBox>

        {error && <Message type='error'>{error}</Message>}
        {/* 카드 등록 버튼 */}
        <ActionButton
          onClick={registerCard}
          disabled={!userInfo}
          title={userInfo ? '카드 등록하기' : '로그인 필요'}
        >
          카드 등록하기
        </ActionButton>
      </Inner>
    </Wrapper>
  );
};

export default AddCardPayple;

// Styled Components
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  background: #ffffff;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 360px;
  padding: 40px 24px;

  border-radius: 8px;

  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 24px;
  font-size: 1.6rem;
  font-weight: 600;
  color: #333;
`;

const ActionButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 16px 0;
  margin-bottom: 24px;
  font-size: 1rem;
  font-weight: 500;
  background: ${({ disabled }) => (disabled ? '#cccccc' : '#fa9a00')};
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.2s;
  &:hover {
    background: ${({ disabled }) => (disabled ? '#cccccc' : '#e08800')};
  }
`;

const AddCardBox = styled.div`
  width: 100%;
  height: 200px;
  margin-bottom: 24px;
  background: #fff8f0;
  border: 2px dashed #fa9a00;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const PlusWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PlusBox = styled.div`
  width: 24px;
  height: 24px;
  position: relative;
  background: #fa9a00;
  border-radius: 50%;
`;

const PlusLineVert = styled.div`
  width: 2px;
  height: 12px;
  position: absolute;
  top: 6px;
  left: 11px;
  background: #ffffff;
`;

const PlusLineHorz = styled.div`
  width: 12px;
  height: 2px;
  position: absolute;
  top: 11px;
  left: 6px;
  background: #ffffff;
`;

const AddText = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #fa9a00;
`;

const Message = styled.p<{ type?: 'error' }>`
  margin-top: 16px;
  color: ${({ type }) => (type === 'error' ? '#d32f2f' : '#2e7d32')};
  font-size: 0.95rem;
  line-height: 1.4;
`;
