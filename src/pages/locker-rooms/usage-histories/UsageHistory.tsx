import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

import {
  getMyRentalSchedule,
  cancelRentalSchedule,
  RentalScheduleItem,
} from '@/api-utils/schedule-managements/rental-schedules/RentalSchedule';
import PriceIcon from '@/assets/baskets/PriceIcon.svg';
import ProductInfoIcon from '@/assets/baskets/ProductInfoIcon.svg';
import ServiceInfoIcon from '@/assets/baskets/ServiceInfoIcon.svg';
import CancleIconIcon from '@/assets/headers/CancleIcon.svg';
import sampleImage from '@/assets/sample-dress.svg';
import PeriodSection from '@/components/period-section';
import EmptyState from '@/components/shared/EmptyState';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatsSection from '@/components/stats-section';
import HomeDetail from '@/pages/homes/HomeDetail';
import { hideScrollbar } from '@/styles/CommonStyles';

// 버튼 확대 애니메이션
const hoverScale = keyframes`
  from { transform: scale(1); }
  to   { transform: scale(1.05); }
`;

interface BasketItem extends RentalScheduleItem {
  type: 'rental' | 'purchase';
  servicePeriod?: string;
  deliveryDate?: string;
  price: number | string;
  imageUrl: string;
  $isSelected: boolean;
  rentalDays?: string;
}

const UsageHistory: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(6);
  const [items, setItems] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

  // 모달 열릴 때 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await getMyRentalSchedule();
        const mapped: BasketItem[] = data.rentals.map(
          (r: RentalScheduleItem) => {
            const isRental = r.serviceType === '대여';
            return {
              ...r,
              type: isRental ? 'rental' : 'purchase',
              servicePeriod: isRental
                ? `${r.startDate} ~ ${r.endDate}`
                : undefined,
              deliveryDate: !isRental ? r.endDate : undefined,
              price: r.ticketName,
              imageUrl: r.mainImage || sampleImage,
              $isSelected: true,
              rentalDays: isRental
                ? `대여 (${calculateDays(r.startDate, r.endDate)}일)`
                : '구매',
            };
          }
        );
        setItems(mapped);
      } catch (err) {
        console.error(err);
        setError('대여/구매 내역을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  // 날짜 차이 계산
  const calculateDays = (start: string, end: string): number => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24) + 1);
  };

  // 취소 요청 / 최종 취소
  const handleCancel = async (item: BasketItem) => {
    const isRequested = item.paymentStatus === '취소요청';
    const confirmMsg = isRequested
      ? '정말 최종 취소하시겠습니까?'
      : '정말 예약을 취소 요청하시겠습니까?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setCancelingId(item.id);
      const result = await cancelRentalSchedule(item.id);
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id
            ? { ...it, paymentStatus: result.paymentStatus }
            : it
        )
      );
      alert(
        isRequested
          ? '최종 취소가 완료되었습니다.'
          : '취소 요청이 완료되었습니다.'
      );
    } catch (err) {
      console.error(err);
      alert(
        isRequested
          ? '최종 취소에 실패했습니다. 다시 시도해주세요.'
          : '취소 요청에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setCancelingId(null);
    }
  };

  // 상세 모달 열기/닫기
  const handleOpenDetail = (productId: number) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };
  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  // 3개월 / 6개월 필터
  const filteredItems = selectedPeriod === 3 ? items.slice(0, 3) : items;

  if (loading)
    return (
      <UsageHistoryContainer>
        <LoadingSpinner label='로딩 중...' />
      </UsageHistoryContainer>
    );
  if (error)
    return (
      <UsageHistoryContainer>
        <ErrorText>{error}</ErrorText>
      </UsageHistoryContainer>
    );

  return (
    <>
      <UnifiedHeader variant='oneDepth' />
      <UsageHistoryContainer>
        <Header>
          <Title>이용 내역</Title>
          <Subtitle>나에게 맞는 스타일을 찾을 때는 멜픽!</Subtitle>
        </Header>

        <StatsSection
          visits={String(items.length)}
          sales={'2025 1분기'}
          dateRange={'SPRING'}
          visitLabel={'담긴 제품들'}
          salesLabel={'시즌'}
        />

        <Divider />

        <Section>
          <PeriodSection
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />

          {filteredItems.length === 0 ? (
            <EmptyState message='이용하신 내역이 없습니다.' />
          ) : (
            <ItemList>
              {filteredItems.map((item) => (
                <Item key={item.id}>
                  <ContentWrapper>
                    <ItemDetails>
                      <Brand>{item.brand}</Brand>
                      <ItemName>
                        <Code>{item.productNum}</Code>
                        <Slash>/</Slash>
                        <Name>{item.category}</Name>
                      </ItemName>

                      <InfoRowFlex>
                        <IconArea>
                          <Icon src={ServiceInfoIcon} alt='Service Info' />
                        </IconArea>
                        <TextContainer>
                          <RowText>
                            <LabelDetailText>진행 서비스 - </LabelDetailText>
                            <DetailHighlight>{item.rentalDays}</DetailHighlight>
                          </RowText>
                          {item.servicePeriod && (
                            <AdditionalText>
                              <DetailText>{item.servicePeriod}</DetailText>
                            </AdditionalText>
                          )}
                          {item.deliveryDate && (
                            <AdditionalText>
                              <DetailText>{item.deliveryDate}</DetailText>
                            </AdditionalText>
                          )}
                        </TextContainer>
                      </InfoRowFlex>

                      <InfoRowFlex>
                        <IconArea>
                          <Icon src={ProductInfoIcon} alt='Product Info' />
                        </IconArea>
                        <TextContainer>
                          <RowText>
                            <LabelDetailText>제품 정보</LabelDetailText>
                          </RowText>
                          <AdditionalText>
                            <DetailText>
                              사이즈 -{' '}
                              <DetailHighlight>{item.size}</DetailHighlight>
                            </DetailText>
                            <Slash>/</Slash>
                          </AdditionalText>
                          <DetailText>
                            색상 -{' '}
                            <DetailHighlight>{item.color}</DetailHighlight>
                          </DetailText>
                        </TextContainer>
                      </InfoRowFlex>

                      <InfoRowFlex>
                        <IconArea>
                          <Icon src={PriceIcon} alt='Price' />
                        </IconArea>
                        <TextContainer>
                          <RowText>
                            <LabelDetailText>결제방식 - </LabelDetailText>
                            <DetailHighlight>
                              {typeof item.price === 'number'
                                ? item.price.toLocaleString()
                                : item.price}
                            </DetailHighlight>
                          </RowText>
                        </TextContainer>
                      </InfoRowFlex>
                    </ItemDetails>

                    <RightSection>
                      <ItemImageContainer>
                        <ItemImage src={item.imageUrl} alt={item.productNum} />
                      </ItemImageContainer>
                    </RightSection>
                  </ContentWrapper>

                  <ButtonContainer>
                    <DeleteButton
                      onClick={() => handleOpenDetail(item.productId)}
                    >
                      제품상세
                    </DeleteButton>
                    <PurchaseButton
                      onClick={() => handleCancel(item)}
                      disabled={
                        cancelingId === item.id ||
                        item.paymentStatus === '취소요청' ||
                        item.paymentStatus === '취소완료'
                      }
                    >
                      {cancelingId === item.id
                        ? '요청중...'
                        : item.paymentStatus === '취소요청'
                          ? '취소요청'
                          : item.paymentStatus === '취소완료'
                            ? '취소완료'
                            : '취소'}
                    </PurchaseButton>
                  </ButtonContainer>
                </Item>
              ))}
            </ItemList>
          )}
        </Section>

        {isModalOpen && selectedProductId !== null && (
          <ModalOverlay>
            <ModalBox>
              <ModalHeaderWrapper>
                <ModalHeaderContainer>
                  <LeftSection>
                    <CancelIcon
                      src={CancleIconIcon}
                      alt='닫기'
                      onClick={handleCloseDetail}
                    />
                  </LeftSection>
                  <CenterSection />
                  <RightSection />
                </ModalHeaderContainer>
              </ModalHeaderWrapper>
              <ModalBody>
                <HomeDetail id={String(selectedProductId)} />
              </ModalBody>
            </ModalBox>
          </ModalOverlay>
        )}
      </UsageHistoryContainer>
    </>
  );
};

export default UsageHistory;

// ────────────────────────────────────────────────────────────
// Styled Components
// ────────────────────────────────────────────────────────────

// (이하 기존 스타일 컴포넌트 그대로)

const UsageHistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  padding: 1rem;
`;

/* 이하 스타일 컴포넌트는 변경 없으므로 생략 */

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 6px;
`;

const Title = styled.h1`
  font-weight: 800;
  font-size: 24px;
  line-height: 27px;
  color: #000;
  margin-bottom: 0;
`;

const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: #ccc;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin-top: 30px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 80px;
  margin-top: 30px;
  max-width: 600px;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ddd;
  padding: 30px 0;
  margin-bottom: 15px;
  background-color: #fff;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;
const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Brand = styled.div`
  font-weight: 900;
  font-size: 12px;
  line-height: 11px;
  color: #000000;

  @media (max-width: 480px) {
    margin: 0;
    font-size: 11px;
  }
`;

const ItemName = styled.div`
  display: flex;
  align-items: center;
  margin-top: 6px;
  margin-bottom: 28px;

  @media (max-width: 480px) {
    /* 모바일에선 세로 정렬 */
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 16px;
  }
`;

const Code = styled.span`
  font-weight: 700;
  font-size: 13px;
  color: #999;
  margin-right: 4px;
  @media (max-width: 480px) {
    margin: 0;
    font-size: 13px;
  }
`;
const Slash = styled.span`
  font-weight: 700;
  font-size: 15px;
  color: #000;
  margin: 0 4px;
  @media (max-width: 480px) {
    display: none;
  }
`;
const Name = styled.span`
  font-weight: 700;
  font-size: 15px;
  color: #000;
  @media (max-width: 480px) {
    margin-top: 4px;
    font-size: 14px;
  }
`;

const InfoRowFlex = styled.div`
  display: flex;
  align-items: stretch;
  gap: 5px;
  width: 100%;
`;

const IconArea = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

const TextContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
  @media (max-width: 480px) {
    margin-bottom: 10px;
  }
`;
const RowText = styled.div`
  display: flex;
  gap: 5px;
  white-space: nowrap;
`;

const AdditionalText = styled.div`
  display: flex;
  gap: 5px;
  white-space: nowrap;
`;

const DetailText = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
  white-space: nowrap;
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const DetailHighlight = styled.span`
  font-weight: 900;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 10px;
`;

const ItemImageContainer = styled.div`
  position: relative;
  width: 100%;
  min-width: 140px;
  height: 210px;
  border: 1px solid #ddd;

  @media (min-width: 600px) {
    width: 200px;
    height: auto;
  }
`;
const ItemImage = styled.img`
  width: 100%;
  height: 100%;
`;
const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;

  margin-top: 20px;
  align-self: flex-end;

  @media (max-width: 600px) {
    margin-top: 10px;
  }
`;

const DeleteButton = styled.button`
  background-color: #fff;
  color: #888;
  width: 91px;
  height: 46px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-weight: 800;
  font-size: 14px;

  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    animation: ${hoverScale} 0.2s forwards alternate;
  }

  @media (max-width: 600px) {
    width: 70px;
    height: 40px;
  }
`;

const PurchaseButton = styled.button`
  background-color: #000;
  color: #fff;
  width: 91px;
  height: 46px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    animation: ${hoverScale} 0.2s forwards alternate;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    width: 70px;
    height: 40px;
  }
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
`;

const LabelDetailText = styled.span`
  font-weight: 700;
  font-size: 14px;
  line-height: 22px;
  color: #000000;
  white-space: nowrap;
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const ErrorText = styled.div`
  color: red;
  margin-top: 2rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: #fff;
  width: 100%;
  max-width: 1000px;
  height: 100%;
  position: relative;
  overflow-y: auto;
  ${hideScrollbar}
`;

const ModalHeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  z-index: 3100;
`;

const ModalHeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 1rem;
`;

const ModalBody = styled.div`
  padding-top: 60px;
  padding: 1rem;
`;

const LeftSection = styled.div`
  cursor: pointer;
`;

const CenterSection = styled.div`
  flex: 1;
`;

const CancelIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
