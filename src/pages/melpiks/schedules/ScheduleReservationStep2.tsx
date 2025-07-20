// src/pages/melpiks/schedules/ScheduleReservation2.tsx

import React, { useState, useEffect } from 'react';
import { FaTshirt } from 'react-icons/fa'; // 아이콘 import
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getMyCloset } from '../../../api-utils/product-managements/closets/closetApi';
import checkIcon from '../../../assets/checkIcon.svg';
import { UIItem } from '../../../components/homes/MyclosetItemList';
import BottomBar from '../../../components/melpiks/schedules/reservations/BottomBar';
import Stepper from '../../../components/melpiks/schedules/reservations/Stepper';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';

const MAX_SELECTION = 6;

interface ItemCardProps {
  id: string;
  image: string;
  brand: string;
  description: string;
  onSelect: (id: string) => void;
  $isSelected: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  image,
  brand,
  description,
  onSelect,
  $isSelected,
}) => {
  const handleSelect = () => {
    onSelect(id);
  };

  return (
    <CardContainer>
      <ImageWrapper onClick={handleSelect}>
        <Image src={image} alt={brand} />
        {$isSelected && (
          <SelectionOverlay>
            <CircularSelection>
              <CheckIconImg src={checkIcon} alt='Check Icon' />
            </CircularSelection>
            <SelectText>제품선택</SelectText>
          </SelectionOverlay>
        )}
      </ImageWrapper>
      <Brand>{brand}</Brand>
      <Description>{description}</Description>
    </CardContainer>
  );
};

const truncateText = (text: string, limit: number): string => {
  return text.length > limit ? text.slice(0, limit) + '...' : text;
};

interface ItemListProps {
  HeaderContainer: React.FC;
  items: UIItem[];
  selectedItems: number[];
  onSelect: (id: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  HeaderContainer,
  items,
  selectedItems,
  onSelect,
}) => {
  return (
    <ListContainer>
      <HeaderContainer />
      <ItemsWrapper>
        {items.map((item) => {
          const numericId = Number(item.id);
          const isSel = selectedItems.includes(numericId);
          return (
            <ItemCard
              key={item.id}
              id={item.id}
              image={item.image}
              brand={item.brand}
              description={truncateText(item.description, 12)}
              $isSelected={isSel}
              onSelect={onSelect}
            />
          );
        })}
      </ItemsWrapper>
    </ListContainer>
  );
};

const ScheduleReservation2: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Reservation1에서 전달된 range: location.state가 있을 때 타입 단언
  const prevState = location.state as { range?: [Date, Date] } | null;
  const initialRange = prevState?.range;

  // selectedItems를 number[]로 관리
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [closetItems, setClosetItems] = useState<UIItem[]>([]);
  const [loadingCloset, setLoadingCloset] = useState<boolean>(true);

  // 선택된 날짜 범위가 없다면 이전 페이지로 이동
  useEffect(() => {
    if (!initialRange) {
      navigate('/schedule/reservation1');
    }
  }, [initialRange, navigate]);

  // 내 옷장 아이템 불러오기
  useEffect(() => {
    setLoadingCloset(true);
    getMyCloset()
      .then(
        (res: {
          items: Array<{
            productId: number;
            mainImage: string;
            brand: string;
            description: string;
            price: number;
          }>;
        }) => {
          const items: UIItem[] = res.items.map(
            (it: {
              productId: number;
              mainImage: string;
              brand: string;
              description: string;
              price: number;
            }) => ({
              id: String(it.productId),
              image: it.mainImage,
              brand: it.brand,
              description: it.description,
              price: it.price,
              discount: 0,
              // it.isLiked이 없으므로 기본값으로 할당
              isLiked: true,
            })
          );
          setClosetItems(items);
        }
      )
      .catch((err: Error) => {
        console.error('내 옷장 조회 실패', err);
      })
      .finally(() => {
        setLoadingCloset(false);
      });
  }, []);

  const handleSelect = (id: string) => {
    const numericId = Number(id);
    if (selectedItems.includes(numericId)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== numericId));
    } else if (selectedItems.length < MAX_SELECTION) {
      setSelectedItems([...selectedItems, numericId]);
    } else {
      setIsModalOpen(true);
    }
  };

  const closeWarningModal = () => {
    setIsModalOpen(false);
  };

  const handleBottomClick = () => {
    // Reservation3로 range와 selectedItems 전달 (number[] 그대로)
    navigate('/schedule/reservation3', {
      state: { range: initialRange, selectedItems },
    });
  };

  const ItemContainer: React.FC = () => (
    <CustomHeader>
      <div>
        <Label>
          내 옷장 - 제품목록 <GrayText2>(선택)</GrayText2>
        </Label>
      </div>
    </CustomHeader>
  );

  return (
    <Container>
      <Stepper currentStep={2} />

      <Summary>
        <ScheduleInfo>
          <Label>예약할 제품 목록</Label>
          <InfoText>
            <GrayText>선택 가능한 갯수 {MAX_SELECTION}개</GrayText>
            <GrayDivider>/</GrayDivider>
            선택한 제품 수 {selectedItems.length} 개
          </InfoText>
        </ScheduleInfo>
      </Summary>

      <Content>
        {loadingCloset ? (
          <LoadingSpinner label='로딩 중...' />
        ) : closetItems.length === 0 ? (
          <EmptyState>
            <EmptyMessage>내 옷장에 보관한 옷이 없습니다.</EmptyMessage>
            <AddButton onClick={() => navigate('/home')}>
              <FaTshirt size={48} />
              <ButtonText>옷 추가하러 가기</ButtonText>
            </AddButton>
          </EmptyState>
        ) : (
          <ItemList
            HeaderContainer={ItemContainer}
            items={closetItems}
            selectedItems={selectedItems}
            onSelect={handleSelect}
          />
        )}
      </Content>

      <BottomBar onNext={handleBottomClick} />

      {isModalOpen && (
        <WarningModal>
          <WarningModalContent>
            <ModalHeader>
              <ModalTitle>알림</ModalTitle>
              <GrayLine />
            </ModalHeader>
            <WarningMessage>
              최대 {MAX_SELECTION}개의 제품만 선택 가능합니다.
            </WarningMessage>
            <GrayLine />
            <ButtonRow>
              <CancelButton onClick={closeWarningModal}>닫기</CancelButton>
            </ButtonRow>
          </WarningModalContent>
        </WarningModal>
      )}

      <BeenContainer />
    </Container>
  );
};

export default ScheduleReservation2;

// 색상 코드 예시 (프로젝트 디자인에 맞춰 변경하세요)
const COLOR_GRAY4 = '#bdbdbd';
const COLOR_GRAY3 = '#9e9e9e';
const COLOR_GRAY2 = '#757575';
const COLOR_GRAY1 = '#616161';
const COLOR_GRAY0 = '#e0e0e0';
const COLOR_WHITE = '#ffffff';
const COLOR_BLACK = '#000000';

const Container = styled.div`
  padding: 1rem;
  max-width: 600px;
  margin: auto;
`;

const Label = styled.label`
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
`;

const Summary = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 30px;
`;

const ScheduleInfo = styled.div`
  flex: 1;
`;

const InfoText = styled.div`
  height: 51px;
  padding: 0 10px;
  margin-top: 10px;
  border: 1px solid #000;

  display: flex;
  align-items: center;

  font-weight: 700;
  font-size: 13px;
  line-height: 14px;
`;

const GrayText = styled.span`
  font-weight: 700;
  font-size: 13px;
  line-height: 14px;
  color: ${COLOR_GRAY1};
  margin-right: 5px;
`;

const GrayDivider = styled.span`
  margin: 0 4px;
  color: ${COLOR_GRAY4};
`;

const BeenContainer = styled.div`
  height: 300px;
`;

const Content = styled.div`
  flex: 1;
`;

const CustomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
`;

const GrayText2 = styled.span`
  margin-left: 5px;
  color: ${COLOR_GRAY3};

  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
`;

const ListContainer = styled.div`
  background-color: ${COLOR_WHITE};
  overflow: hidden;
  margin-bottom: 40px;
`;

const ItemsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  overflow-x: scroll;
  scrollbar-width: auto;
  -ms-overflow-style: auto;

  &::-webkit-scrollbar {
    display: block;
    height: 8px;
    background: #eee;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
`;

const Brand = styled.h3`
  font-size: 10px;
  font-weight: 900;
  margin-bottom: 0;
  line-height: 1;
`;

const Description = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: ${COLOR_GRAY2};
  margin-top: 5px;
  line-height: 1;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 6px;
  position: relative;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 140px;
  height: 210px;
  cursor: pointer;
  border: 1px solid #cccccc;
`;

const Image = styled.img`
  object-fit: cover;
  width: 140px;
  height: 210px;
`;

const SelectionOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 140px;
  height: 210px;
  background: rgba(246, 174, 36, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CircularSelection = styled.div`
  width: 58px;
  height: 58px;
  background-color: ${COLOR_WHITE};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CheckIconImg = styled.img`
  width: 30px;
  height: 22px;
`;

const SelectText = styled.div`
  margin-top: 10px;
  font-weight: 700;
  font-size: 12px;
  color: ${COLOR_WHITE};
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 27px;
`;

const ModalContent = styled.div`
  background-color: ${COLOR_WHITE};
  padding: 20px;
  max-width: 500px;
  width: 100%;
  height: 670px;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
`;

const ModalTitle = styled.p`
  font-weight: 800;
  font-size: 16px;
`;

const GrayLine = styled.hr`
  border: none;
  width: 100%;
  border: 1px solid ${COLOR_GRAY0};
  margin: 20px 0;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: auto;
`;

const CancelButton = styled.button`
  width: 100%;
  height: 56px;
  background-color: ${COLOR_GRAY1};
  color: ${COLOR_WHITE};
  border: none;
  border-radius: 6px;
  cursor: pointer;

  font-weight: 800;
  font-size: 16px;
`;

const WarningModal = styled(ModalOverlay)`
  background-color: rgba(0, 0, 0, 0.7);
`;

const WarningModalContent = styled(ModalContent)`
  max-width: 376px;
  height: 329px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const WarningMessage = styled.p`
  color: ${COLOR_BLACK};
  font-weight: 400;
  font-size: 14px;
  text-align: center;
  margin: 0;
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
