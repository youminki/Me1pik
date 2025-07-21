// src/pages/locker-rooms/my-closets/MyCloset.tsx

import React, { useState, useEffect } from 'react';
import { FaTshirt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { useMyCloset } from '@/api-utils/product-managements/closets/closetApi';
import CancleIconIcon from '@/assets/headers/CancleIcon.svg';
import ItemList, { UIItem } from '@/components/homes/MyclosetItemList';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatsSection from '@/components/stats-section';
import HomeDetail from '@/pages/homes/HomeDetail';
import { hideScrollbar } from '@/styles/CommonStyles';

const salesLabel = '시즌';
const sales = '2025 1분기';
const dateRange = 'SPRING';

const MyCloset: React.FC = () => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  // react-query로 옷장 데이터 패칭
  const { data, isLoading } = useMyCloset();
  const items: UIItem[] =
    data?.items.map((it) => ({
      id: String(it.productId),
      image: it.mainImage,
      brand: it.brand,
      description: it.name,
      price: it.price,
      discount: it.discountRate,
      isLiked: true,
    })) ?? [];

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const handleDelete = () => {};

  const handleOpenDetail = (id: string) => {
    setSelectedItemId(id);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedItemId(null);
  };

  const goToLocker = () => {
    navigate('/home');
  };

  return (
    <>
      <UnifiedHeader variant='oneDepth' />
      <Container>
        <Header>
          <Title>내 옷장</Title>
          <Subtitle>나에게 맞는 스타일을 찾을 때는 멜픽!</Subtitle>
        </Header>

        <StatsSection
          visits={items.length}
          sales={sales}
          dateRange={dateRange}
          visitLabel='담긴 제품들'
          salesLabel={salesLabel}
        />

        <Divider />

        <Content>
          {isLoading ? (
            <LoadingSpinner label='로딩 중...' />
          ) : items.length === 0 ? (
            <EmptyState>
              <EmptyMessage>내옷장에 보관한 옷이 없습니다.</EmptyMessage>
              <AddButton onClick={goToLocker}>
                <FaTshirt size={48} />
                <ButtonText>옷 추가하러 가기</ButtonText>
              </AddButton>
            </EmptyState>
          ) : (
            <ItemList
              items={items}
              onDelete={handleDelete}
              onItemClick={handleOpenDetail}
            />
          )}
        </Content>

        {isModalOpen && selectedItemId && (
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
                <HomeDetail id={selectedItemId} />
              </ModalBody>
            </ModalBox>
          </ModalOverlay>
        )}
      </Container>
    </>
  );
};

export default MyCloset;

// 이하 styled-components 정의 (변경 없음)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  padding: 1rem;
`;

const Header = styled.div`
  width: 100%;
  margin-bottom: 6px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
`;

const Subtitle = styled.p`
  font-size: 12px;
  color: #666;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #ddd;
  margin: 30px 0;
`;

const Content = styled.div`
  width: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 1rem;
`;

const EmptyMessage = styled.p`
  font-size: 16px;
  color: #999;
  margin-bottom: 1.5rem;
`;

const AddButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
`;

const ButtonText = styled.span`
  margin-top: 0.5rem;
  font-size: 14px;
  color: #333;
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

const RightSection = styled.div`
  width: 24px;
`;

const CancelIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;
