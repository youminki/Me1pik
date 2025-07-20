// ProductReview.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import sampleImage from '../../../assets/sample-dress.svg';
import ProductInfoIcon from '../../../assets/baskets/ProductInfoIcon.svg';
import ServiceInfoIcon from '../../../assets/baskets/ServiceInfoIcon.svg';

import FilledStarIcon from '../../../assets/baskets/FilledStarIcon.svg'; // 채워진 별
import EmptyStarIcon from '../../../assets/baskets/EmptyStarIcon.svg'; // 빈 별
import FixedBottomBar from '../../../components/fixed-bottom-bar';
import ReusableModal2 from '../../../common-components/modals/reusable-modal-v2';

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
  rating?: number; // 별점(0~5)
}

const ProductReview: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod] = useState(6);

  // 아이템(예: 1개만 사용)
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
      imageUrl: sampleImage,
      $isSelected: true,
      rentalDays: '대여 (3일)',
      rating: 3,
    },
  ]);

  // 선택된 기간에 따라 아이템 목록 필터링 (예시: 3개월이면 앞 3개, 6개월이면 전체)
  const filteredItems = selectedPeriod === 3 ? items.slice(0, 3) : items;

  // ★ 위쪽에 들어갈 상태 예시 (별점, 후기 텍스트, 사진 업로드)
  const [starRating, setStarRating] = useState(items[0].rating || 0); // 별점
  const [reviewText, setReviewText] = useState(''); // 후기 텍스트
  const [fileName, setFileName] = useState(''); // 업로드 파일명

  // 모달 제어 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 별점 선택
  const handleStarClick = (idx: number) => {
    setStarRating(idx + 1);
  };

  // 후기 작성
  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewText(e.target.value);
  };

  // 파일 업로드
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  // 모달 "예" 클릭 시: 모달 닫고 /product-review로 이동
  const handleConfirmModal = () => {
    setIsModalOpen(false);
    navigate('/product-review');
  };

  return (
    <ProductReviewContainer>
      <Section>
        {/* 기존 ItemList (건들지 말라고 하신 부분) */}
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

                  {/* 진행 서비스 */}
                  {item.type === 'rental' ? (
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
                      </TextContainer>
                    </InfoRowFlex>
                  ) : (
                    <InfoRowFlex>
                      <IconArea>
                        <Icon src={ServiceInfoIcon} alt='Service Info' />
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

                  {/* 제품 정보 */}
                  <InfoRowFlex>
                    <IconArea>
                      <Icon src={ProductInfoIcon} alt='Product Info' />
                    </IconArea>
                    <TextContainer>
                      <RowText>
                        <LabelDetailText>제품 정보</LabelDetailText>
                      </RowText>
                      <AdditionalText>
                        <DetailText>사이즈 - </DetailText>
                        <DetailHighlight>{item.size}</DetailHighlight>
                        <Slash>/</Slash>
                        <DetailText>색상 - </DetailText>
                        <DetailHighlight>{item.color}</DetailHighlight>
                      </AdditionalText>
                    </TextContainer>
                  </InfoRowFlex>
                </ItemDetails>

                <RightSection>
                  <ItemImageContainer>
                    <ItemImage src={item.imageUrl} alt={item.nameCode} />
                  </ItemImageContainer>
                </RightSection>
              </ContentWrapper>
            </Item>
          ))}
        </ItemList>

        {/* 위쪽 추가 섹션: 제품 평가, 후기작성, 후기사진 등록 */}
        <AboveContentContainer>
          {/* 제품 만족도 평가 */}
          <StarSection>
            <SectionTitle>제품 만족도 평가 *</SectionTitle>
            <StarBox>
              <StarBulletArea>
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i < starRating;
                  return (
                    <StarIcon
                      key={i}
                      src={filled ? FilledStarIcon : EmptyStarIcon}
                      alt='별'
                      onClick={() => handleStarClick(i)}
                    />
                  );
                })}
              </StarBulletArea>
            </StarBox>
          </StarSection>

          {/* 후기작성 */}
          <ReviewSection>
            <SectionTitle>후기작성 (100자 내외) *</SectionTitle>
            <TextareaContainer>
              <ReviewTextarea
                maxLength={100}
                placeholder='후기를 작성 해주세요'
                value={reviewText}
                onChange={handleReviewChange}
              />
            </TextareaContainer>
          </ReviewSection>

          {/* 후기사진 등록 */}
          <PhotoSection>
            <SectionTitle>후기사진 등록 (선택)</SectionTitle>
            <PhotoBox>
              <PhotoInputWrapper>
                <PlaceholderText>
                  {fileName ? fileName : '등록할 이미지를 선택해주세요.'}
                </PlaceholderText>
              </PhotoInputWrapper>
              <FileButton htmlFor='fileInput'>파일선택</FileButton>
              <FileInput
                id='fileInput'
                type='file'
                accept='image/*'
                onChange={handleFileChange}
              />
            </PhotoBox>
          </PhotoSection>
        </AboveContentContainer>
      </Section>

      {/* FixedBottomBar 클릭 시 모달을 열어 "리뷰를 등록하시겠습니까?" 메시지를 표시 */}
      <FixedBottomBar
        onClick={() => setIsModalOpen(true)}
        text='평가등록'
        color='yellow'
      />

      {/* ReusableModal2: 모달 내 "예" 선택 시 /product-review로 이동 */}
      <ReusableModal2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmModal}
        title='평가등록'
      >
        리뷰를 등록하시겠습니까?
      </ReusableModal2>
    </ProductReviewContainer>
  );
};

export default ProductReview;

/* ============================= */
/*  스타일 정의 (새로 추가된 부분 + 기존) */
/* ============================= */

/** 기존 스타일 그대로 유지 */
const ProductReviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  background-color: #fff;
  padding: 1rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AboveContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 20px;

  box-sizing: border-box;
  background: #ffffff;
`;

const StarSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.div`
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
  color: #000000;
  margin-bottom: 10px;
`;

const StarBox = styled.div`
  width: 100%;
  height: 57px;
  background: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  box-sizing: border-box;
`;

const StarBulletArea = styled.div`
  display: flex;
  gap: 8px;
`;

const StarIcon = styled.img`
  width: 28px;
  height: 28px;
  cursor: pointer;
`;

/** 후기작성 */
const ReviewSection = styled.div`
  margin-bottom: 20px;
`;

const TextareaContainer = styled.div`
  position: relative;
  width: 100%;

  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 4px;
  margin-top: 10px;
`;

const ReviewTextarea = styled.textarea`
  width: 92%;
  height: 100%;
  min-height: 151px;
  border: none;
  resize: none;
  outline: none;
  padding: 10px;

  scrollbar-width: none;

  font-size: 13px;
  line-height: 18px;
  color: #000000;

  ::placeholder {
    color: #dddddd;
  }
`;

/** 후기사진 등록 */
const PhotoSection = styled.div`
  margin-bottom: 20px;
`;

const PhotoBox = styled.div`
  position: relative;
  width: 100%;
  height: 57px;
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 4px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-sizing: border-box;
  gap: 10px;
`;

const PhotoInputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const PlaceholderText = styled.span`
  font-size: 13px;
  line-height: 14px;
  color: #dddddd;
`;

const FileButton = styled.label`
  width: 69px;
  height: 34px;
  background: #000000;
  border-radius: 5px;

  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  color: #ffffff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const FileInput = styled.input`
  display: none;
`;

/** 이하 기존 코드 유지 */
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
  font-size: 10px;
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
  font-size: 16px;
  line-height: 22px;
  color: #000;
`;

const Slash = styled.span`
  font-weight: 400;
  font-size: 12px;
  line-height: 22px;
  color: #dddddd;
  margin: 0 4px;
`;

const ItemType = styled.span`
  font-weight: 400;
  font-size: 12px;
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
  font-size: 12px;
  line-height: 22px;
  color: #000;
  white-space: nowrap;
`;

const DetailHighlight = styled.span`
  font-weight: 900;
  font-size: 12px;
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

const Icon = styled.img`
  width: 20px;
  height: 20px;
`;

const LabelDetailText = styled.span`
  font-weight: 700;
  font-size: 12px;
  line-height: 22px;
  color: #000000;
  white-space: nowrap;
`;
