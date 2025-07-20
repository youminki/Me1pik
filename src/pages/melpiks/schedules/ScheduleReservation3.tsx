// src/pages/melpiks/schedules/ScheduleReservation3.tsx

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import Stepper from '../../../components/melpiks/Schedule/Reservation1/Stepper';
import BottomBar from '../../../components/melpiks/Schedule/Reservation1/BottomBar';
import { getMyCloset } from '../../../api-utils/product-managements/closets/closetApi';
import Spinner from '../../../components/spinner';
import { UIItem } from '../../../components/homes/MyclosetItemList'; // UIItem.id는 string 타입
import { createSaleSchedule } from '../../../api-utils/schedule-managements/sales/SaleSchedule'; // API 호출 함수
import ReusableModal2 from '../../../common-components/modals/reusable-modal-v2';

interface ItemCardProps {
  id: string;
  image: string;
  brand: string;
  description: string;
  onSelect: (id: number) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  image,
  brand,
  description,
  onSelect,
}) => {
  const navigate = useNavigate();

  const handleSelect = () => {
    const numId = parseInt(id, 10);
    onSelect(numId);
    navigate(`/item/${numId}`);
  };

  return (
    <CardContainer>
      <ImageWrapper onClick={handleSelect}>
        <Image src={image || ''} alt={brand} />
      </ImageWrapper>
      <Brand>{brand}</Brand>
      <Description>{description}</Description>
    </CardContainer>
  );
};

interface ItemListProps {
  HeaderContainer: React.FC;
  items: UIItem[];
  selectedItems: number[];
  onSelect: (id: number) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  HeaderContainer,
  items,
  selectedItems,
  onSelect,
}) => {
  // UIItem.id는 string이므로 숫자로 변환해 비교
  const filteredItems = items.filter((ui) =>
    selectedItems.includes(parseInt(ui.id, 10))
  );

  return (
    <ListContainer>
      <HeaderContainer />
      {filteredItems.length > 0 ? (
        <ItemsWrapper>
          {filteredItems.map((ui) => (
            <ItemCard
              key={ui.id}
              id={ui.id}
              image={ui.image}
              brand={ui.brand}
              description={truncateText(ui.description, 12)}
              onSelect={onSelect}
            />
          ))}
        </ItemsWrapper>
      ) : (
        <NoItemMessage>선택된 제품이 없습니다.</NoItemMessage>
      )}
    </ListContainer>
  );
};

const truncateText = (text: string, limit: number): string =>
  text.length > limit ? text.slice(0, limit) + '...' : text;

const ScheduleReservation3: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Reservation2에서 전달된 state: range와 selectedItems
  const prevState = location.state as {
    range?: [Date, Date];
    selectedItems?: number[];
  } | null;
  const initialRange = prevState?.range;
  const initialSelectedItems = prevState?.selectedItems || [];

  // selectedItems를 초기 state로 설정
  const [selectedItems, setSelectedItems] =
    useState<number[]>(initialSelectedItems);

  // 내 옷장 전체 아이템: UIItem[]
  const [closetItems, setClosetItems] = useState<UIItem[]>([]);
  const [loadingCloset, setLoadingCloset] = useState<boolean>(true);

  // 판매방식 선택 state
  const [saleMethod, setSaleMethod] = useState<string>('제품판매');

  // 예약 생성 중 로딩 상태
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 모달 오픈 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // range가 없으면 이전 단계로 리디렉트
  useEffect(() => {
    if (!initialRange) {
      navigate('/schedule/reservation1');
    }
  }, [initialRange, navigate]);

  // 내 옷장 전체 아이템 불러오기
  useEffect(() => {
    setLoadingCloset(true);
    getMyCloset()
      .then(
        (res: {
          items: Array<{
            productId: number;
            mainImage: string;
            brand: string;
            name: string;
            price: number;
            discountRate: number;
          }>;
        }) => {
          const items: UIItem[] = res.items.map(
            (it: {
              productId: number;
              mainImage: string;
              brand: string;
              name: string;
              price: number;
              discountRate: number;
            }) => ({
              id: String(it.productId),
              image: it.mainImage,
              brand: it.brand,
              description: it.name,
              price: it.price,
              discount: it.discountRate,
              // it.isLiked이 없으므로 기본값 할당
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

  const handleSelect = (id: number) => {
    if (!selectedItems.includes(id)) {
      setSelectedItems([...selectedItems, id]);
    }
    // 상세 페이지 이동은 ItemCard 내부 handleSelect에서 처리
  };

  const handleSaleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSaleMethod(e.target.value);
  };

  // BottomBar onNext에서 호출: 유효성 검사 후 모달 열기
  const handleOpenModal = () => {
    if (!initialRange) {
      alert('날짜 정보가 없습니다.');
      return;
    }
    if (selectedItems.length === 0) {
      alert('하나 이상의 제품을 선택해주세요.');
      return;
    }
    setIsModalOpen(true);
  };

  // 모달에서 “네” 클릭 시 실제 생성 처리
  const handleCreateSchedule = async () => {
    if (!initialRange) {
      return;
    }
    const [start, end] = initialRange;
    const pad = (n: number) => String(n).padStart(2, '0');
    const startDate = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
      start.getDate()
    )}`;
    const endDate = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(
      end.getDate()
    )}`;
    let apiSaleType = saleMethod;
    if (saleMethod === '제품대여') {
      apiSaleType = '제품 대여';
    }
    setSubmitting(true);
    try {
      const reqBody = {
        startDate,
        endDate,
        saleType: apiSaleType,
        productIds: selectedItems,
      };
      await createSaleSchedule(reqBody); // result 변수 제거
      // 성공 시 알림 후 /sales-schedule로 이동
      alert('판매 스케줄이 생성되었습니다.');
      navigate('/sales-schedule');
    } catch (error: unknown) {
      console.error('스케줄 생성 실패', error);
      let msg = '스케줄 생성 중 오류가 발생했습니다.';
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const e = error as { response?: { data?: { message?: string } } };
        msg = e.response?.data?.message || msg;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      alert(`스케줄 생성 실패: ${msg}`);
    } finally {
      setSubmitting(false);
      setIsModalOpen(false);
    }
  };

  // 날짜 범위 포맷 함수 (뷰 표시용)
  const formatKoreanDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const ItemContainer: React.FC = () => (
    <CustomHeader>
      <Label>
        예약된 제품목록<GrayText2>(선택)</GrayText2>
      </Label>
    </CustomHeader>
  );

  return (
    <Container>
      <Stepper currentStep={3} />

      <Summary>
        <ScheduleInfo>
          <Label>예약한 스케줄</Label>
          <InfoText>
            {initialRange
              ? `${formatKoreanDate(initialRange[0])} ~ ${formatKoreanDate(
                  initialRange[1]
                )}`
              : '날짜 정보 없음'}
          </InfoText>
        </ScheduleInfo>
        <ScheduleInfo>
          <Label>예약한 제품목록</Label>
          <InfoText>선택한 제품 수 {selectedItems.length} 개</InfoText>
        </ScheduleInfo>
      </Summary>

      <Content>
        {loadingCloset ? (
          <Spinner />
        ) : (
          <ItemList
            HeaderContainer={ItemContainer}
            items={closetItems}
            selectedItems={selectedItems}
            onSelect={handleSelect}
          />
        )}
      </Content>

      <GrayLine />

      <FormContainer>
        <ColumnWrapper>
          <Label>판매방식 선택 *</Label>
          <StyledSelect value={saleMethod} onChange={handleSaleMethodChange}>
            <option value='제품판매'>제품판매</option>
            <option value='제품대여'>제품대여</option>
          </StyledSelect>
        </ColumnWrapper>
      </FormContainer>

      <InfoMessage>
        <GrayText> ※ 노출일정은</GrayText>
        <BlackText>스케줄 시작일 기준 2일 이내 </BlackText>
        <GrayText>까지 가능합니다.</GrayText>
      </InfoMessage>

      {/* BottomBar: onNext에서 모달 열기 */}
      <BottomBar
        onNext={handleOpenModal}
        buttonText='예약완료'
        disabled={submitting}
      />

      {/* ReusableModal2 */}
      <ReusableModal2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCreateSchedule}
        title='판매 스케줄 생성'
      >
        <ModalMessage>
          선택하신 기간과 제품으로 판매 스케줄을 생성하시겠습니까?
        </ModalMessage>
      </ReusableModal2>

      <BeenContainer />
    </Container>
  );
};

export default ScheduleReservation3;

// 색상 코드 예시: 프로젝트에 맞춰 변경하세요.
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

const Summary = styled.div`
  margin-top: 30px;
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

const Content = styled.div`
  flex: 1;
  margin-bottom: 20px;
`;

const GrayLine = styled.hr`
  border: none;
  width: 100%;
  border: 1px solid ${COLOR_GRAY0};
  margin: 30px 0;
`;

const FormContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
`;

const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
  color: ${COLOR_BLACK};
`;

const StyledSelect = styled.select`
  height: 51px;
  padding: 0 10px;
  border: 1px solid ${COLOR_BLACK};
  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
  color: ${COLOR_BLACK};
`;

const InfoMessage = styled.p`
  font-size: 12px;
  color: ${COLOR_GRAY2};
  margin-bottom: 20px;
`;

const GrayText = styled.span`
  color: ${COLOR_GRAY1};
  font-size: 12px;
`;

const BlackText = styled.span`
  font-weight: 700;
  font-size: 12px;
  line-height: 13px;
  color: ${COLOR_BLACK};
`;

const BeenContainer = styled.div`
  height: 300px;
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

const NoItemMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${COLOR_GRAY2};
  font-size: 14px;
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

const CustomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const GrayText2 = styled.span`
  margin-left: 5px;
  color: ${COLOR_GRAY3};
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
`;

// 모달 내부 메시지 스타일
const ModalMessage = styled.div`
  padding: 10px 0;
  font-size: 14px;
  text-align: center;
`;
