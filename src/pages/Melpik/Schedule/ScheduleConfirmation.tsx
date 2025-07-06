// src/pages/Melpik/Schedule/ScheduleConfirmation.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Theme from '../../../styles/Theme';
import BottomBar from '../../../components/BottomNav2';
import DeleteButtonIcon from '../../../assets/DeleteButtonIcon.svg';
import checkIcon from '../../../assets/checkIcon.svg';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getSaleScheduleDetail,
  SaleScheduleDetailResponse,
  deleteSaleSchedule,
  patchSaleSchedule,
} from '../../../api/sale/SaleSchedule';
import Spinner from '../../../components/Spinner';
import Calendar from '../../../components/Melpik/Schedule/Reservation1/Calendar';
import DateSelection from '../../../components/Melpik/Schedule/Reservation1/DateSelection';
import Summary from '../../../components/Melpik/Schedule/Reservation1/Summary';

// 내 옷장 API & 타입 import
import { getMyCloset } from '../../../api/closet/closetApi';
import { UIItem } from '../../../components/Home/MyclosetItemList';

const MAX_SELECTION = 6;

// 색상 상수

const COLOR_WHITE = '#ffffff';
const COLOR_GRAY2 = '#757575';

const truncateText = (text: string, limit: number): string =>
  text.length > limit ? text.slice(0, limit) + '...' : text;

const formatDateWithDay = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdayNames[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
};

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
  const handleSelect = () => onSelect(id);

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

const ScheduleConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const { scheduleId } = useParams<{ scheduleId: string }>();

  const [detail, setDetail] = useState<SaleScheduleDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모달
  const [showModal, setShowModal] = useState(false);
  const today = new Date();
  const [modalYear, setModalYear] = useState(today.getFullYear());
  const [modalMonth, setModalMonth] = useState(today.getMonth() + 1);
  const [editRange, setEditRange] = useState<[Date, Date] | null>(null);

  // 내 옷장
  const [closetItems, setClosetItems] = useState<UIItem[]>([]);
  const [loadingCloset, setLoadingCloset] = useState(true);

  // 선택된 제품 ID
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 스케줄 상세 조회
  useEffect(() => {
    if (!scheduleId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getSaleScheduleDetail(Number(scheduleId));
        setDetail(data);
        // 기존 스케줄에 있던 제품도 초기 선택 상태로 반영
        setSelectedItems(data.products.map((p) => String(p.id)));
        const [sStr, eStr] = data.dateRange.split('~').map((d) => d.trim());
        const s = new Date(sStr),
          e = new Date(eStr);
        setEditRange([s, e]);
        setModalYear(s.getFullYear());
        setModalMonth(s.getMonth() + 1);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [scheduleId]);

  // 내 옷장 조회
  useEffect(() => {
    setLoadingCloset(true);
    getMyCloset()
      .then((res) => {
        setClosetItems(
          res.items.map((it) => ({
            id: String(it.productId),
            image: it.mainImage,
            brand: it.brand,
            description: it.name,
            price: it.price,
            discount: it.discountRate,
            isLiked: true,
          }))
        );
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingCloset(false));
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_SELECTION
          ? [...prev, id]
          : prev
    );
  };

  const handleDelete = async () => {
    if (!scheduleId) return;
    await deleteSaleSchedule(Number(scheduleId));
    navigate('/sale-schedule');
  };

  // 수정하기: 날짜·타이틀·선택 제품 모두 저장
  const handleEdit = async () => {
    if (!scheduleId || !detail) return;
    const [s, e] = detail.dateRange.split('~').map((d) => d.trim());
    await patchSaleSchedule(Number(scheduleId), {
      title: detail.title,
      startDate: s,
      endDate: e,
      // productIds: selectedItems.map((id) => Number(id)),
    });
    // 저장 후 다시 상세 조회
    const updated = await getSaleScheduleDetail(Number(scheduleId));
    setDetail(updated);
    setSelectedItems(updated.products.map((p) => String(p.id)));
    alert('스케줄이 저장되었습니다.');
  };

  // 모달 내 날짜 선택 로직
  const handleDateClick = (day: number) => {
    if (!editRange) return;
    const clicked = new Date(modalYear, modalMonth - 1, day);
    const todayZero = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();
    if (clicked.getTime() < todayZero) return;
    const newEnd = new Date(clicked);
    newEnd.setMonth(clicked.getMonth() + 1);
    setEditRange([clicked, newEnd]);
    setModalYear(clicked.getFullYear());
    setModalMonth(clicked.getMonth() + 1);
  };

  const adjustEnd = (offset: number) => {
    if (!editRange) return;
    const [start, end] = editRange;
    const newEnd = new Date(end);
    newEnd.setDate(end.getDate() + offset);
    if (newEnd.getTime() <= start.getTime()) return;
    setEditRange([start, newEnd]);
    setModalYear(newEnd.getFullYear());
    setModalMonth(newEnd.getMonth() + 1);
  };

  const applyModal = () => {
    if (!editRange || !detail) return;
    const [s, e] = editRange;
    const pad = (n: number) => `${n}`.padStart(2, '0');
    const newRangeStr = `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())} ~ ${e.getFullYear()}-${pad(e.getMonth() + 1)}-${pad(e.getDate())}`;
    setDetail({ ...detail, dateRange: newRangeStr });
    setShowModal(false);
  };

  if (loading)
    return (
      <Container>
        <Spinner />
      </Container>
    );
  if (error || !detail)
    return (
      <Container>
        <ErrorMessage>{error || '정보를 불러올 수 없습니다.'}</ErrorMessage>
      </Container>
    );

  // 실제 예약된 목록 대신, 현재 선택된 내 옷장 제품으로 표시
  const reservedItems = closetItems.filter((it) =>
    selectedItems.includes(it.id)
  );

  return (
    <Container>
      <Content>
        <Label>스케줄 타이틀</Label>
        <TextBox>{detail.title}</TextBox>

        <Label>스케줄 예약일자</Label>
        <ClickableBox onClick={() => setShowModal(true)}>
          {detail.dateRange
            .split('~')
            .map((d) => formatDateWithDay(d.trim()))
            .join(' ~ ')}
        </ClickableBox>

        <RowContainer>
          <Column>
            <Label>선택된 제품</Label>
            <TextBox>
              {reservedItems.length} / {MAX_SELECTION}개
            </TextBox>
          </Column>
        </RowContainer>

        <ConnectorLine />

        <Label>예약된 제품목록</Label>
        {reservedItems.length === 0 ? (
          <TextBox>아직 예약된 제품이 없습니다.</TextBox>
        ) : (
          <ProductList>
            {reservedItems.map((item) => (
              <Product key={item.id}>
                <ProductImage src={item.image} alt={item.description} />
                <ProductLabel>{item.brand}</ProductLabel>
                <ProductName>{truncateText(item.description, 15)}</ProductName>
              </Product>
            ))}
          </ProductList>
        )}

        <Label>내 옷장 제품목록</Label>
        {loadingCloset ? (
          <Spinner />
        ) : (
          <ListContainer>
            <ItemsWrapper>
              {closetItems.map((item) => {
                const sel = selectedItems.includes(item.id);
                return (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    image={item.image}
                    brand={item.brand}
                    description={truncateText(item.description, 12)}
                    onSelect={toggleSelect}
                    $isSelected={sel}
                  />
                );
              })}
            </ItemsWrapper>
          </ListContainer>
        )}
      </Content>

      <BottomBar
        imageSrc={DeleteButtonIcon}
        cartOnClick={handleDelete}
        buttonText='수정하기'
        onClick={handleEdit}
      />

      {showModal && editRange && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <DateSelection
                year={modalYear}
                month={modalMonth}
                onYearChange={(e) => setModalYear(Number(e.target.value))}
                onMonthChange={(e) => setModalMonth(Number(e.target.value))}
              />
              <CloseBtn onClick={() => setShowModal(false)}>✕</CloseBtn>
            </ModalHeader>
            <Calendar
              year={modalYear}
              month={modalMonth}
              startDate={editRange[0]}
              endDate={editRange[1]}
              onDateClick={handleDateClick}
              onIncrease={() => adjustEnd(1)}
              onDecrease={() => adjustEnd(-1)}
              today={today}
            />
            <ModalFooter>
              <Summary
                range={editRange}
                seasonProgress={{ total: 6, completed: 2, pending: 0 }}
              />
              <ApplyBtn onClick={applyModal}>적용하기</ApplyBtn>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ScheduleConfirmation;

/* Styled Components */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 1rem;
  max-width: 600px;
  margin: auto;
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const Label = styled.label`
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
`;
const TextBox = styled.div`
  padding: 21px 10px;
  border: 1px solid ${Theme.colors.gray4};
  border-radius: 5px;
  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
`;
const ClickableBox = styled(TextBox)`
  cursor: pointer;
`;
const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;
const Column = styled.div`
  flex: 1;
`;
const ConnectorLine = styled.div`
  border: 1px solid ${Theme.colors.gray4};
  margin: 20px 0;
`;
const ProductList = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const Product = styled.div`
  flex-shrink: 0;
`;
const ProductImage = styled.img`
  width: 140px;
  height: 210px;
  object-fit: cover;
`;
const ProductLabel = styled.div`
  font-size: 12px;
  font-weight: bold;
`;
const ProductName = styled.div`
  margin-top: 5px;
  font-size: 12px;
  line-height: 13px;
  color: #999;
`;
const ErrorMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: red;
`;
const ListContainer = styled.div`
  background-color: ${COLOR_WHITE};
  overflow: hidden;
  margin-bottom: 40px;
`;
const ItemsWrapper = styled.div`
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
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
const Brand = styled.h3`
  margin-top: 10px;
  font-size: 14px;
  font-weight: bold;
`;
const Description = styled.p`
  margin-top: 5px;
  font-size: 12px;
  color: ${COLOR_GRAY2};
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #fff;
  width: 90%;
  max-width: 500px;
  border-radius: 8px;
  overflow: hidden;
`;
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
`;
const CloseBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;
const ModalFooter = styled.div`
  padding: 12px;
  border-top: 1px solid #eee;
`;
const ApplyBtn = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
`;
