import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import EmptyStarIcon from '@/assets/baskets/EmptyStarIcon.svg';
import EvaluationIcon from '@/assets/baskets/EvaluationIcon.svg';
import FilledStarIcon from '@/assets/baskets/FilledStarIcon.svg';
import PeriodSection from '@/components/period-section';
import EmptyState from '@/components/shared/EmptyState';
import PageHeader from '@/components/shared/headers/PageHeader';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import StatsSection from '@/components/stats-section';

interface BasketItem {
  id: number;
  brand: string;
  nameCode: string;
  nameType: string;
  type: 'rental' | 'purchase';
  servicePeriod?: string;
  deliveryDate?: string;
  size: string;
  color: string;
  price: number | string;
  imageUrl: string;
  $isSelected: boolean;
  rentalDays?: string;
  rating?: number;
}

const ProductReview: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(6);
  const navigate = useNavigate();

  const [items] = useState<BasketItem[]>([
    {
      id: 1,
      brand: 'SANDRO',
      nameCode: 'SF25S3FRD7699',
      nameType: '원피스',
      type: 'rental',
      servicePeriod: '2025.03.02 (일) ~ 03.05 (수)',
      size: 'M (55)',
      color: '블랙',
      price: 50000,
      imageUrl: '',
      $isSelected: true,
      rentalDays: '대여 (3일)',
      rating: 3,
    },
    {
      id: 2,
      brand: 'SANDRO',
      nameCode: 'SF25S3FRD7699',
      nameType: '원피스',
      type: 'rental',
      servicePeriod: '2025.03.02 (일) ~ 03.05 (수)',
      size: 'M (55)',
      color: '블랙',
      price: '489,000',
      imageUrl: '',
      $isSelected: true,
      rentalDays: '구매',
      rating: 5,
    },
  ]);

  const filteredItems = selectedPeriod === 3 ? items.slice(0, 3) : items;

  if (!filteredItems || filteredItems.length === 0) {
    return <EmptyState message='작성 가능한 리뷰가 없습니다.' />;
  }

  return (
    <>
      <UnifiedHeader variant='oneDepth' />
      <ProductReviewContainer>
        <PageHeader
          title='제품평가'
          subtitle='나에게 맞는 스타일을 찾을 때는 멜픽!'
        />

        <StatsSection
          visits={'999'}
          sales={'2025 1분기'}
          dateRange={'SPRING'}
          visitLabel={'제품 평가수'}
          salesLabel={'시즌'}
        />

        <Divider />

        <Section>
          <PeriodSection
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
          />

          <ItemList>
            {filteredItems.map((item) => (
              <Item key={item.id}>
                <ContentWrapper>
                  <ItemDetails>
                    <Brand>{item.brand}</Brand>
                    <ItemName>
                      <NameCode>{item.nameCode}</NameCode>
                      <Slash>/</Slash>
                      <ItemType>{item.nameType}</ItemType>
                    </ItemName>

                    {item.type === 'rental' ? (
                      <InfoRowFlex>
                        <IconArea>
                          <Icon src={EvaluationIcon} alt='Service Info' />
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
                        </TextContainer>
                      </InfoRowFlex>
                    ) : (
                      <InfoRowFlex>
                        <IconArea>
                          <Icon src={EvaluationIcon} alt='Service Info' />
                        </IconArea>
                        <TextContainer>
                          <RowText>
                            <DetailText>진행 서비스 - 구매</DetailText>
                          </RowText>
                          {item.deliveryDate && (
                            <AdditionalText>
                              <DetailText>{item.deliveryDate}</DetailText>
                            </AdditionalText>
                          )}
                        </TextContainer>
                      </InfoRowFlex>
                    )}

                    <InfoRowFlex>
                      <IconArea>
                        <Icon src={EvaluationIcon} alt='평가' />
                      </IconArea>
                      <TextContainer>
                        <RowText>
                          <LabelDetailText>평가 -</LabelDetailText>
                          <StarRow>
                            {Array.from({ length: 5 }).map((_, i) => {
                              const filled = i < (item.rating || 0);
                              return (
                                <StarIcon
                                  key={i}
                                  src={filled ? FilledStarIcon : EmptyStarIcon}
                                  alt='별'
                                />
                              );
                            })}
                          </StarRow>
                        </RowText>
                      </TextContainer>
                    </InfoRowFlex>
                  </ItemDetails>

                  <RightSection>
                    <ItemImageContainer>
                      {item.imageUrl && (
                        <ItemImage src={item.imageUrl} alt={item.nameCode} />
                      )}
                    </ItemImageContainer>
                  </RightSection>
                </ContentWrapper>

                <ButtonContainer>
                  <DeleteButton onClick={() => navigate(`/item/${item.id}`)}>
                    제품상세
                  </DeleteButton>
                  <PurchaseButton
                    onClick={() => navigate('/payment-review/Write')}
                  >
                    작성
                  </PurchaseButton>
                </ButtonContainer>
              </Item>
            ))}
          </ItemList>
        </Section>
      </ProductReviewContainer>
    </>
  );
};

export default ProductReview;

const ProductReviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: #fff;
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
  margin-top: 20px;
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
  color: #000;
`;

const ItemName = styled.div`
  display: flex;
  align-items: center;
  margin: 6px 0 28px;
`;

const NameCode = styled.span`
  font-weight: 900;
  font-size: 18px;
  line-height: 22px;
  color: #000;
`;

const Slash = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #dddddd;
  margin: 0 4px;
`;

const ItemType = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: #999;
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
  margin-bottom: 16px;
`;

const RowText = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
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
  color: #000;
  white-space: nowrap;
`;

const DetailHighlight = styled.span`
  font-weight: 700;
  font-size: 14px;
  line-height: 22px;
  color: #000;
  white-space: nowrap;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 10px;
`;

const ItemImageContainer = styled.div`
  position: relative;
  width: 140px;
  height: 210px;
`;

const ItemImage = styled.img`
  width: 100%;
  height: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
  align-self: flex-end;
`;

const DeleteButton = styled.button`
  background-color: #fff;
  color: #888;
  width: 91px;
  height: 46px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
`;

const PurchaseButton = styled.button`
  background-color: #000;
  color: #fff;
  width: 91px;
  height: 46px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
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
`;

const StarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StarIcon = styled.img`
  width: 16px;
  height: 16px;
`;
