import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import SettingsDetailSubHeader, {
  DetailSubHeaderProps,
} from '@components/Header/SettingsDetailSubHeader';
import ShippingTabBar from '@components/TabBar';
import ReusableModal2 from '@components/OneButtonModal';
import PageDetailTopBoxes from '@components/PageDetailTopBoxes';

interface PageDetailProps {
  isCreate?: boolean;
}
interface LinkItem {
  id: number;
  label: string;
}
interface ProductCard {
  id: number;
  image: string;
  brand: string;
  name: string;
}

const PageDetail: React.FC<PageDetailProps> = ({ isCreate = false }) => {
  const navigate = useNavigate();
  const { no } = useParams<{ no: string }>();
  const numericNo = isCreate ? undefined : Number(no);

  // 예시 제품 번호
  const dummyProducts = [{ no: numericNo || 0 }];

  const [season] = useState('2025 / 1분기');
  const [links] = useState<LinkItem[]>([
    { id: 1, label: '링크1: 링크 소개' },
    { id: 2, label: '링크2: 서비스 소개 링크' },
    { id: 3, label: '링크3: 링크 소개' },
    { id: 4, label: '링크4: 서비스 소개 링크' },
    { id: 5, label: '링크5: 링크 소개' },
    { id: 6, label: '링크6: 서비스 소개 링크' },
  ]);

  const [products] = useState<ProductCard[]>([
    { id: 1, image: '', brand: 'SANDRO', name: '린넨 플로럴 머메이드 원피스' },
    { id: 2, image: '', brand: 'ZOOC', name: '풀플리츠 카라 블라우스' },
    { id: 3, image: '', brand: 'MICHAA', name: '레터링 롱 셔츠 코트' },
    { id: 4, image: '', brand: 'SANDRO', name: '린넨 플로럴 머메이드 원피스' },
    { id: 5, image: '', brand: 'ZOOC', name: '풀플리츠 카라 블라우스' },
    { id: 6, image: '', brand: 'MICHAA', name: '레터링 롱 셔츠 코트' },
  ]);

  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <Container>
      <HeaderRow>
        <Title>{isCreate ? '페이지 등록' : `페이지 상세 (${numericNo})`}</Title>
      </HeaderRow>

      <SettingsDetailSubHeader {...detailProps} />

      {/* 제품 번호 */}
      <ProductNumberWrapper>
        <ProductNumberLabel>번호</ProductNumberLabel>
        <ProductNumberValue>{dummyProducts[0].no}</ProductNumberValue>
      </ProductNumberWrapper>

      {/* 사용자 상세 상단 박스 */}
      <PageDetailTopBoxes />

      {/* 구분선 */}
      <DividerDashed />

      {/* 페이지 상세 탭 */}
      <ShippingTabBar tabs={['페이지 상세']} activeIndex={activeTab} onTabClick={setActiveTab} />

      {/* 상세 내용 컨테이너 */}
      <DetailSection>
        {activeTab === 0 && (
          <InfoBox>
            {/* 시즌 진행 & 링크 개수 */}
            <DataRow>
              <DataItem>
                <DataLabel>시즌 진행</DataLabel>
                <DataValue>{season}</DataValue>
              </DataItem>
            </DataRow>

            <Divider />

            {/* 링크 버튼 */}
            <LinkRow>
              <DataItem>
                <DataLabel>링크 등록</DataLabel>
                <DataValue>{links.length}개</DataValue>
              </DataItem>
              {links.map((link) => (
                <LinkButton key={link.id}>{link.label}</LinkButton>
              ))}
            </LinkRow>

            <Divider />

            {/* 등록 제품수 + 상품 카드들을 한 행에 */}
            <DataRow>
              <DataItem>
                <DataLabel>등록 제품수</DataLabel>
                <DataValue>{products.length}개</DataValue>
              </DataItem>
              <ProductRow>
                {products.map((p) => (
                  <Card key={p.id}>
                    <ImageBox />
                    <CardInfo>
                      <Brand>{p.brand}</Brand>
                      <Name>{p.name}</Name>
                    </CardInfo>
                  </Card>
                ))}
              </ProductRow>
            </DataRow>
          </InfoBox>
        )}
      </DetailSection>

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

export default PageDetail;

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
`;

const ProductNumberValue = styled.div`
  font-weight: 900;
  font-size: 12px;
`;

const DividerDashed = styled.hr`
  border: none;
  border-top: 1px dashed #dddddd;
  margin: 30px 0;
`;

const DetailSection = styled.div`
  margin-top: 0;
`;

const InfoBox = styled.div`
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 0 4px 4px 4px;
  padding: 1rem;
  box-sizing: border-box;
`;

/* 데이터를 row로 나열 */
const DataRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
`;

const DataItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 40px;
`;

const DataLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  margin-right: 8px;
  padding: 10px;
`;

const DataValue = styled.span`
  font-size: 12px;
  color: #333333;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #dddddd;
  margin: 12px 0;
`;

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const LinkButton = styled.button`
  padding: 10px 12px;
  font-size: 12px;
  background: #555555;
  border-radius: 8px;
  color: #ffffff;
  border: none;
  cursor: pointer;
`;

const ProductRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 0;
`;

const Card = styled.div`
  width: 140px;
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 4px;
`;

const ImageBox = styled.div`
  width: 140px;
  height: 210px;
  background: #f0f0f0;
`;

const CardInfo = styled.div`
  padding: 8px;
`;

const Brand = styled.div`
  font-size: 10px;
  font-weight: 900;
`;

const Name = styled.div`
  font-size: 12px;
  color: #999999;
`;
