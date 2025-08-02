// 제품 상세 정보 컴포넌트 - 원단 정보 및 제품 상세 제공고시 표시
import React from 'react';
import styled from 'styled-components';

// 제품 상세 정보 Props 인터페이스
export interface ProductDetailsProps {
  fabricComposition: Record<'겉감' | '안감' | '배색' | '부속', string>;
  detailsData: Record<string, string>;
}

// 원단 카테고리 키 상수
const CATEGORY_KEYS = ['겉감', '안감', '배색', '부속'] as const;

// 메인 제품 상세 정보 컴포넌트
const ProductDetails: React.FC<ProductDetailsProps> = ({
  fabricComposition,
  detailsData,
}) => {
  return (
    <Container>
      {/* 원단 정보 섹션 */}
      <Section>
        <Title>제품 원단정보</Title>
        <Table>
          <tbody>
            {CATEGORY_KEYS.map((key) => {
              // 원단 정보를 쉼표로 분리하여 태그 형태로 표시
              const parts = (fabricComposition[key] || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              return (
                <Tr key={key}>
                  <TdKey>{key}</TdKey>
                  <TdValue>
                    {parts.length > 0 ? (
                      parts.map((part, i) => <Tag key={i}>{part}</Tag>)
                    ) : (
                      <EmptyTag>-</EmptyTag>
                    )}
                  </TdValue>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </Section>

      {/* 제품 상세 제공고시 섹션 */}
      <DetailSection>
        <Title>제품상세 제공고시</Title>
        <DetailInfo>
          {Object.entries(detailsData).map(([label, value]) => (
            <InfoRow key={label}>
              <InfoLabel>{label}</InfoLabel>
              <InfoValue>{value}</InfoValue>
            </InfoRow>
          ))}
        </DetailInfo>
      </DetailSection>
    </Container>
  );
};

export default ProductDetails;

// 스타일 컴포넌트들
const Container = styled.div`
  position: relative;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e0e0e0;
`;

const Tr = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

const TdKey = styled.td`
  width: 80px;
  padding: 10px;
  font-weight: 700;
  font-size: 12px;
  text-align: center;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
`;

const TdValue = styled.td`
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
  background: #aaa;
  color: #fff;
`;

const EmptyTag = styled(Tag)`
  background: transparent;
  color: #999999;
  font-weight: 400;
`;

const DetailSection = styled.div`
  margin-top: 40px;
  margin-bottom: 40px;
`;

const DetailInfo = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const InfoRow = styled.div`
  display: flex;

  &:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
  }
`;

const InfoLabel = styled.div`
  width: 80px;
  padding: 10px;
  font-weight: 700;
  font-size: 12px;
  text-align: center;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
`;

const InfoValue = styled.div`
  flex: 1;
  padding: 10px;
  font-size: 12px;
`;
