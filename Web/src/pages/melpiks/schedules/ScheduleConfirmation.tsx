// src/pages/melpiks/schedules/ScheduleConfirmation.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getMyCloset } from '@/api-utils/product-managements/closets/closetApi';
import {
  getSaleScheduleDetail,
  SaleScheduleDetailResponse,
  deleteSaleSchedule,
  patchSaleSchedule,
} from '@/api-utils/schedule-managements/sales/SaleSchedule';
import checkIcon from '@/assets/checkIcon.svg';
import DeleteButtonIcon from '@/assets/DeleteButtonIcon.svg';
import BottomBar from '@/components/bottom-navigation-mobile';
import { UIItem } from '@/components/homes/MyclosetItemList';
import Calendar from '@/components/melpiks/schedules/reservations/Calendar';
import DateSelection from '@/components/melpiks/schedules/reservations/DateSelection';
import Summary from '@/components/melpiks/schedules/reservations/Summary';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { theme } from '@/styles/Theme';

const MAX_SELECTION = 6;

// 색상 상수

const COLOR_WHITE = '#ffffff';
const COLOR_GRAY2 = '#757575';

const truncateText = (
  text: string | null | undefined,
  limit: number
): string => {
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

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
  $isDisabled?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  image,
  brand,
  description,
  onSelect,
  $isSelected,
  $isDisabled = false,
}) => {
  const handleSelect = () => onSelect(id);

  return (
    <CardContainer>
      <ImageWrapper onClick={handleSelect} $disabled={$isDisabled}>
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
        setSelectedItems(
          data.products.map((p: { id: number }) => String(p.id))
        );
        const [sStr, eStr] = data.dateRange
          .split('~')
          .map((d: string) => d.trim());
        const s = new Date(sStr),
          e = new Date(eStr);
        setEditRange([s, e]);
        setModalYear(s.getFullYear());
        setModalMonth(s.getMonth() + 1);
      } catch (err: unknown) {
        console.error(err);
        let errorMsg = '오류가 발생했습니다.';
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const e = err as { response?: { data?: { message?: string } } };
          errorMsg = e.response?.data?.message || errorMsg;
        } else if (err instanceof Error) {
          errorMsg = err.message;
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    })();
  }, [scheduleId]);

  // 내 옷장 조회
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
          setClosetItems(
            res.items.map(
              (it: {
                productId: number;
                mainImage: string;
                brand: string;
                description: string;
                price: number;
                name?: string;
                discountRate?: number;
              }) => ({
                id: String(it.productId),
                image: it.mainImage,
                brand: it.brand,
                description: it.name || '',
                price: it.price,
                discount: it.discountRate || 0,
                isLiked: true,
              })
            )
          );
        }
      )
      .catch((err: Error) => console.error(err))
      .finally(() => setLoadingCloset(false));
  }, []);

  const toggleSelect = (id: string) => {
    // 완료된 스케줄에서는 제품 선택 불가
    if (detail?.status === 'completed') return;

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

    // === 스케줄 수정 시도 ===

    // 선택된 제품이 없으면 경고
    if (selectedItems.length === 0) {
      alert('하나 이상의 제품을 선택해주세요.');
      return;
    }

    // 스케줄 상태 확인 - 경고만 표시하고 수정은 시도
    if (detail.status !== 'scheduled' && detail.status !== 'scheduling') {
      const confirmed = window.confirm(
        `현재 스케줄 상태가 '${detail.status}'입니다. 수정을 시도하시겠습니까?\n\n일부 상태에서는 수정이 제한될 수 있습니다.`
      );
      if (!confirmed) {
        return;
      }
    }

    // 현재 표시된 날짜 범위 사용 (모달에서 변경된 날짜 포함)
    const [s, e] = detail.dateRange.split('~').map((d) => d.trim());
    // 파싱된 날짜 확인

    const requestData = {
      title: detail.title,
      startDate: s,
      endDate: e,
      productIds: selectedItems.map((id) => Number(id)), // 제품 목록 전달
    };

    // PATCH 요청 데이터 준비 완료

    try {
      await patchSaleSchedule(Number(scheduleId), requestData);
      // 저장 후 다시 상세 조회
      const updated = await getSaleScheduleDetail(Number(scheduleId));
      setDetail(updated);
      setSelectedItems(updated.products.map((p) => String(p.id)));
      alert('스케줄이 저장되었습니다.');
    } catch (error: unknown) {
      console.error('스케줄 수정 실패:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { message?: string }; status?: number };
        };
        console.error('에러 응답 데이터:', axiosError.response?.data);
        console.error('에러 상태 코드:', axiosError.response?.status);

        // 서버에서 반환한 구체적인 오류 메시지 표시
        const errorMessage =
          axiosError.response?.data?.message || '스케줄 수정에 실패했습니다.';

        if (errorMessage.includes('이 상태의 스케줄은 수정할 수 없습니다')) {
          const action = window.confirm(
            `${errorMessage}\n\n스케줄을 삭제하고 새로 생성하시겠습니까?`
          );
          if (action) {
            // 스케줄 삭제 후 새로 생성하는 로직
            try {
              await deleteSaleSchedule(Number(scheduleId));
              alert('스케줄이 삭제되었습니다. 새 스케줄을 생성해주세요.');
              navigate('/schedule/reservation1');
            } catch (deleteError) {
              console.error('스케줄 삭제 실패:', deleteError);
              alert('스케줄 삭제에 실패했습니다.');
            }
          }
        } else {
          alert(`수정 실패: ${errorMessage}`);
        }
      } else {
        alert('스케줄 수정에 실패했습니다.');
      }
    }
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
        <LoadingSpinner label='로딩 중...' />
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
    <>
      <UnifiedHeader variant='twoDepth' />
      <Container>
        <Content>
          <Label>스케줄 타이틀</Label>
          <TextBox>{detail.title}</TextBox>

          <Label>스케줄 상태</Label>
          <StatusBox $status={detail.status}>
            {detail.status === 'completed'
              ? '완료'
              : detail.status === 'scheduled'
                ? '예약됨'
                : detail.status === 'scheduling'
                  ? '예약 중'
                  : detail.status}
          </StatusBox>

          <Label>스케줄 예약일자</Label>
          <ClickableBox>
            <span style={{ flex: 1 }}>
              {detail.dateRange
                .split('~')
                .map((d) => formatDateWithDay(d.trim()))
                .join(' ~ ')}
            </span>
            <ChangeBtn
              type='button'
              onClick={() => setShowModal(true)}
              disabled={detail.status === 'completed'}
            >
              변경
            </ChangeBtn>
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
                  <ProductName>
                    {truncateText(item.description, 15)}
                  </ProductName>
                </Product>
              ))}
            </ProductList>
          )}

          <Label>내 옷장 제품목록</Label>
          {loadingCloset ? (
            <LoadingSpinner label='로딩 중...' />
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
                      $isDisabled={detail?.status === 'completed'}
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
          buttonText={detail.status === 'completed' ? '수정 불가' : '수정하기'}
          onClick={handleEdit}
          disabled={detail.status === 'completed'}
        />

        {showModal && editRange && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>예약일자 변경</ModalTitle>
              </ModalHeader>

              <ModalBody>
                <DateSelectionSection>
                  <DateSelection
                    year={modalYear}
                    month={modalMonth}
                    onYearChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setModalYear(Number(e.target.value))
                    }
                    onMonthChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setModalMonth(Number(e.target.value))
                    }
                  />
                </DateSelectionSection>

                <CalendarSection>
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
                </CalendarSection>

                <SummarySection>
                  <Summary
                    range={editRange}
                    seasonProgress={{ total: 6, completed: 2, pending: 0 }}
                  />
                </SummarySection>
              </ModalBody>

              <ModalFooter>
                <ButtonGroup>
                  <CancelBtn onClick={() => setShowModal(false)}>
                    취소
                  </CancelBtn>
                  <ApplyBtn onClick={applyModal}>적용하기</ApplyBtn>
                </ButtonGroup>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </>
  );
};

export default ScheduleConfirmation;

/* Styled Components */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;

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
  display: flex;
  align-items: center;
  height: 51px;
  padding: 0 10px;
  border: 1px solid #000;

  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
`;

const StatusBox = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  height: 51px;
  padding: 0 10px;
  border: 1px solid #000;
  background-color: ${({ $status }) =>
    $status === 'completed'
      ? '#f5f5f5'
      : $status === 'scheduled'
        ? '#e8f5e8'
        : $status === 'scheduling'
          ? '#fff3cd'
          : '#ffffff'};
  color: ${({ $status }) => ($status === 'completed' ? '#666666' : '#000000')};

  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
`;
const ClickableBox = styled(TextBox)`
  cursor: default;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0;
`;
const ChangeBtn = styled.button<{ disabled?: boolean }>`
  padding: 6px 12px;
  margin-left: 8px;
  background: ${({ disabled }) =>
    disabled ? theme.colors.gray : theme.colors.yellow};
  color: #fff;

  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  height: 32px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
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
  border: 1px solid ${theme.colors.gray4};
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
  border: 1px solid ${theme.colors.gray4};
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
const ImageWrapper = styled.div<{ $disabled?: boolean }>`
  position: relative;
  width: 140px;
  height: 210px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  border: 1px solid ${theme.colors.gray4};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
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
  overflow: hidden;
`;
const ModalContent = styled.div`
  background: #fff;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  border-radius: 12px;
  overflow: hidden;

  display: flex;
  flex-direction: column;
`;
const ModalHeader = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
`;
const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;
const ModalBody = styled.div`
  padding: 1rem;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;
const DateSelectionSection = styled.div`
  margin-bottom: 20px;
`;
const CalendarSection = styled.div`
  margin-bottom: 20px;
`;
const SummarySection = styled.div`
  margin-bottom: 16px;
`;
const ModalFooter = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
`;
const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;
const CancelBtn = styled.button`
  flex: 1;
  padding: 14px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
  }
`;
const ApplyBtn = styled.button`
  flex: 1;
  padding: 14px;
  background: ${theme.colors.yellow};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #e6a000;
  }
`;
