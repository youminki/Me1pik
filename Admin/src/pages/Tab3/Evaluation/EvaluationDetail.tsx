// src/pages/Evaluation/EvaluationDetail.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import SettingsDetailSubHeader, {
  DetailSubHeaderProps,
} from '@components/Header/SettingsDetailSubHeader';
import ShippingTabBar from '@components/TabBar';
import ReusableModal2 from '@components/OneButtonModal';
import EvaluationDetailTopBoxes from '@components/EvaluationDetailTopBoxes';
import { FaStar, FaRegStar } from 'react-icons/fa';

interface EvaluationDetailProps {
  isCreate?: boolean;
}

const EvaluationDetail: React.FC<EvaluationDetailProps> = ({ isCreate = false }) => {
  const navigate = useNavigate();
  const { no } = useParams<{ no: string }>();
  const numericNo = isCreate ? undefined : Number(no);

  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 더미 데이터
  const regDate = '2025-11-15';
  const productRating = 4;
  const serviceRating = 5;
  const reviewText = `예쁘긴 하나 66사이즈인 저에게는 좀 작아요. 반짝반짝하니 얼굴에 조명 효과를 주나 봅니다.\n유독 예쁘보인다는 소리를 듣습니다. 줌이 좀 넉넉하면 좋았겠다는 아쉬움이 남습니다.`;

  const handleBack = () => navigate(-1);
  const handleSave = () => setIsModalOpen(true);
  const handleDelete = () => setIsModalOpen(true);
  const handleConfirm = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  const detailProps: DetailSubHeaderProps = {
    backLabel: '뒤로',
    onBackClick: handleBack,
    editLabel: isCreate ? '등록' : '저장',
    onEditClick: handleSave,
    endLabel: isCreate ? '취소' : '삭제',
    onEndClick: handleDelete,
  };

  // 별점 렌더링 헬퍼
  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= count ? (
          <FaStar key={i} style={{ marginRight: 4 }} />
        ) : (
          <FaRegStar key={i} style={{ marginRight: 4 }} />
        ),
      );
    }
    return stars;
  };

  return (
    <Container>
      <HeaderRow>
        <Title>{isCreate ? '평가 등록' : `평가 상세 (${numericNo})`}</Title>
      </HeaderRow>

      <SettingsDetailSubHeader {...detailProps} />

      {/* 번호 표시 추가 */}
      <ProductNumberWrapper>
        <ProductNumberLabel>번호</ProductNumberLabel>
        <ProductNumberValue>{numericNo}</ProductNumberValue>
      </ProductNumberWrapper>

      <EvaluationDetailTopBoxes />

      <DividerDashed />

      <ShippingTabBar tabs={['평가상세']} activeIndex={activeTab} onTabClick={setActiveTab} />

      {activeTab === 0 && (
        <DetailSection>
          <FieldTable>
            <tbody>
              <TableRow>
                <FieldName>등록일자</FieldName>
                <FieldValue>{regDate}</FieldValue>
              </TableRow>
              <TableRow>
                <FieldName>제품상태</FieldName>
                <FieldValue>
                  <Stars>{renderStars(productRating)}</Stars>
                  <Score>({productRating}점)</Score>
                </FieldValue>
              </TableRow>
              <TableRow>
                <FieldName>서비스 품질</FieldName>
                <FieldValue>
                  <Stars>{renderStars(serviceRating)}</Stars>
                  <Score>({serviceRating}점)</Score>
                </FieldValue>
              </TableRow>
              <TableRow>
                <FieldName>제품후기</FieldName>
                <FieldValue>
                  {reviewText.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </FieldValue>
              </TableRow>
            </tbody>
          </FieldTable>
        </DetailSection>
      )}

      <ReusableModal2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="확인"
      >
        저장하시겠습니까?
      </ReusableModal2>
    </Container>
  );
};

export default EvaluationDetail;

/* ===== styled-components ===== */

const Container = styled.div`
  width: 100%;
  height: 100%;
  max-width: 100vw;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  overflow: hidden;
  padding: 12px 8px 0 8px;

  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 4px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: 700;
`;

const ProductNumberWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 16px 0;
`;

const ProductNumberLabel = styled.div`
  font-weight: 700;
  font-size: 12px;
  text-align: center;
`;

const ProductNumberValue = styled.div`
  font-weight: 900;
  font-size: 12px;
  text-align: center;
`;

const DividerDashed = styled.hr`
  border: none;
  border-top: 1px dashed #dddddd;
  margin: 30px 0;
`;

const DetailSection = styled.div`
  overflow-x: auto;
`;

const FieldTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border: 1px solid #dddddd;
`;

const TableRow = styled.tr`
  height: 44px;
  &:nth-child(even) {
    background: #f8f9fa;
  }
  &:hover {
    background-color: #e3f2fd;
    cursor: pointer;
  }
`;

const FieldName = styled.td`
  width: 150px;
  padding: 12px;
  font-weight: 700;
  font-size: 12px;
  border: 1px solid #dddddd;

  text-align: center;
  vertical-align: middle;
`;

const FieldValue = styled.td`
  padding: 12px;
  font-size: 12px;
  border: 1px solid #dddddd;

  p {
    margin: 4px 0;
    line-height: 1.5;
  }
`;

const Stars = styled.span`
  display: inline-flex;
  color: #f5a623;
  vertical-align: middle;
`;

const Score = styled.span`
  margin-left: 8px;
  font-size: 12px;
  color: #666666;
`;
