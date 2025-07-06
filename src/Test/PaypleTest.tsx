import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';

declare global {
  interface Window {
    PaypleCpayAuthCheck?: (data: unknown) => void;
    PCD_PAY_CALLBACK?: (result: unknown) => void;
  }
}

// Payple 카드 타입 정의
interface PaypleCard {
  payerId: string;
  cardId: string | number;
  cardName: string;
  cardNumber: string;
  [key: string]: unknown;
}

const PaypleTest: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    userId: string;
    userName: string;
    userEmail: string;
  } | null>(null);
  const [cards, setCards] = useState<PaypleCard[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('토큰이 없습니다.');

        const res = await fetch('https://api.stylewh.com/user/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('로그인 정보 요청 실패');
        const data = await res.json();

        setUserInfo({
          userId: String(data.id),
          userName: data.name,
          userEmail: data.email,
        });
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error('[🔥] 유저 정보 로딩 실패', e);
          setError('로그인 정보를 불러오는 데 실패했습니다. ' + e.message);
        } else {
          setError('로그인 정보를 불러오는 데 실패했습니다.');
        }
      }
    })();
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await fetch('https://api.stylewh.com/card/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('카드 목록 요청 실패');
        const data = await res.json();
        setCards(data.items);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('[🔥] 카드 목록 로딩 실패', err);
        } else {
          console.error('[🔥] 카드 목록 로딩 실패', err);
        }
      }
    };

    fetchCards();
  }, []);

  const registerCard = useCallback(async () => {
    setError(null);
    setSuccessMessage(null);
    if (!userInfo) return setError('로그인 정보를 불러올 수 없습니다.');

    try {
      const params = new URLSearchParams({
        userId: userInfo.userId,
        userName: userInfo.userName,
        userEmail: userInfo.userEmail,
      });

      const res = await fetch(
        `https://api.stylewh.com/payple/card-register-data?${params}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        }
      );
      if (!res.ok) throw new Error('카드 등록 데이터 요청 실패');

      const data = await res.json();
      console.log('[✅ 카드 등록용 데이터]', data);

      if (typeof window.PaypleCpayAuthCheck !== 'function') {
        console.error('[❌ Payple SDK 로딩 실패]');
        throw new Error('Payple SDK 준비 오류');
      }

      window.PaypleCpayAuthCheck({
        ...data,
        PCD_PAY_WORK: 'CERT',
        PCD_SIMPLE_FLAG: 'Y',
        PCD_PAYER_AUTHTYPE: 'pwd',
        PCD_PAY_GOODS: '카드 등록 테스트',
        PCD_PAY_TOTAL: 101,
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('[🔥] 카드 등록 오류:', e);
        setError('카드 등록 중 오류 발생: ' + e.message);
      } else {
        console.error('[🔥] 카드 등록 오류:', e);
        setError('카드 등록 중 오류 발생');
      }
    }
  }, [userInfo]);

  const requestPayPasswordPopup = async (payerId: string) => {
    try {
      console.log('🧾 PAYER_ID to use:', payerId);
      if (!payerId || typeof payerId !== 'string' || payerId.trim() === '') {
        alert('유효한 카드가 없습니다.');
        return;
      }

      const token = localStorage.getItem('accessToken');
      const res = await fetch('https://api.stylewh.com/payple/init-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payerId, goods: '테스트 상품', amount: 102 }),
      });

      const data = await res.json();
      if (typeof window.PaypleCpayAuthCheck !== 'function')
        throw new Error('Payple SDK 준비 오류');
      window.PaypleCpayAuthCheck(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('[🔥] 결제창 호출 실패', e);
        alert('결제창 호출 중 오류 발생');
      } else {
        console.error('[🔥] 결제창 호출 실패', e);
        alert('결제창 호출 중 오류 발생');
      }
    }
  };

  useEffect(() => {
    window.PCD_PAY_CALLBACK = async (result: unknown) => {
      console.log('[✅ Payple 결과 수신]', result);
      if (!userInfo) return setError('로그인 정보를 찾을 수 없습니다.');
      if (
        typeof result === 'object' &&
        result !== null &&
        'PCD_AUTH_KEY' in result &&
        'PCD_PAY_REQKEY' in result &&
        'PCD_PAYER_ID' in result &&
        'PCD_PAY_GOODS' in result &&
        'PCD_PAY_TOTAL' in result
      ) {
        const r = result as {
          PCD_AUTH_KEY: string;
          PCD_PAY_REQKEY: string;
          PCD_PAYER_ID: string;
          PCD_PAY_GOODS: string;
          PCD_PAY_TOTAL: number;
        };
        try {
          const res = await fetch(
            'https://api.stylewh.com/payple/confirm-payment',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                PCD_AUTH_KEY: r.PCD_AUTH_KEY,
                PCD_PAY_REQKEY: r.PCD_PAY_REQKEY,
                PCD_PAYER_ID: r.PCD_PAYER_ID,
                PCD_PAY_GOODS: r.PCD_PAY_GOODS,
                PCD_PAY_TOTAL: r.PCD_PAY_TOTAL,
              }),
            }
          );
          const data = await res.json();
          if (!res.ok || data.PCD_PAY_RST !== 'success') {
            throw new Error(data.PCD_PAY_MSG || '결제 실패');
          }
          setSuccessMessage('✅ 결제 성공: ' + data.PCD_PAY_OID);
        } catch (e: unknown) {
          if (e instanceof Error) {
            console.error('[🔥] 결제 승인 오류:', e);
            setError('결제 승인 실패: ' + e.message);
          } else {
            console.error('[🔥] 결제 승인 오류:', e);
            setError('결제 승인 실패');
          }
        }
      } else {
        setError('Payple 결과 데이터 형식 오류');
      }
    };
    return () => {
      delete window.PCD_PAY_CALLBACK;
    };
  }, [userInfo]);

  return (
    <Container>
      <Title>Payple 카드 등록 및 결제</Title>
      <Button disabled={!userInfo} onClick={registerCard}>
        카드 등록하기
      </Button>

      <Button
        onClick={() => {
          const payerId = cards[0]?.payerId;
          if (!payerId) return alert('카드 없음');

          fetch('https://api.stylewh.com/payple/recurring-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payerId,
              goods: '정기결제 테스트 상품',
              amount: 500, // 500원
            }),
          })
            .then((res) => res.json())
            .then((data) =>
              alert('정기결제 성공! 주문번호: ' + data.PCD_PAY_OID)
            )
            .catch((err: unknown) => {
              if (err instanceof Error) {
                alert('정기결제 실패: ' + err.message);
              } else {
                alert('정기결제 실패');
              }
            });
        }}
      >
        정기결제 테스트
      </Button>
      {cards.length > 0 && (
        <CardSection>
          <h3>등록된 카드 목록</h3>
          {cards.map((card) => (
            <CardBox key={card.cardId}>
              <div>
                {card.cardName} - {card.cardNumber}
              </div>
              <CardButton onClick={() => requestPayPasswordPopup(card.payerId)}>
                이 카드로 결제
              </CardButton>
            </CardBox>
          ))}
        </CardSection>
      )}

      {error && <Message type='error'>{error}</Message>}
      {successMessage && <Message>{successMessage}</Message>}
    </Container>
  );
};

export default PaypleTest;

const Container = styled.div`
  max-width: 480px;
  margin: 60px auto;
  padding: 32px;
  border-radius: 12px;
  background: #fff8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;
const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
`;
const Button = styled.button<{ disabled?: boolean }>`
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 500;
  background: #fa9a00;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #e08800;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;
const CardSection = styled.div`
  margin-top: 32px;
`;
const CardBox = styled.div`
  margin: 12px 0;
  padding: 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
`;
const CardButton = styled.button`
  margin-top: 8px;
  padding: 10px 18px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  &:hover {
    background: #256528;
  }
`;
const Message = styled.p<{ type?: 'error' }>`
  margin-top: 20px;
  font-size: 0.95rem;
  color: ${({ type }) => (type === 'error' ? '#d32f2f' : '#2e7d32')};
  font-weight: 500;
`;
