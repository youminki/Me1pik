import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import SettingsDetailSubHeader, {
  DetailSubHeaderProps,
} from '@components/Header/SettingsDetailSubHeader';
import ReusableModal2 from '@components/TwoButtonModal';
import StatusBadge from '@components/Common/StatusBadge';
import { getStatusBadge } from '@utils/statusUtils';
import {
  getAdminTicketById,
  changeTicketStatus,
  deleteAdminTicketById,
  convertTicketType,
  AdminTicketItem,
} from '@api/Ticket/TicketApi';

// 상태 옵션 매핑
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '결제완료', label: '결제완료' },
  { value: '결제대기', label: '결제대기' },
  { value: '취소요청', label: '취소요청' },
  { value: '취소완료', label: '취소완료' },
];

// 종류 옵션 목록
const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '정기 구독권(4회권)', label: '정기 구독권(4회권)' },
  { value: '정기 구독권(무제한)', label: '정기 구독권(무제한)' },
  { value: '1회 이용권', label: '1회 이용권' },
];

interface TicketDetailProps {
  isCreate?: boolean;
}

const TicketDetail: React.FC<TicketDetailProps> = ({ isCreate = false }) => {
  const navigate = useNavigate();
  const { no } = useParams<{ no: string }>();
  const numericNo = isCreate ? undefined : Number(no);

  const [ticket, setTicket] = useState<AdminTicketItem | null>(null);
  const [status, setStatus] = useState<string>('');
  const [originalStatus, setOriginalStatus] = useState<string>('');
  const [type, setType] = useState<string>(''); // 초기값: 로드 후 data.ticket_name
  const [originalType, setOriginalType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<'save' | 'delete' | null>(null);

  /**
   * StrictMode에서 useEffect 두 번 실행 방지
   *
   * React 18의 StrictMode에서는 개발 환경에서 useEffect가 두 번 호출될 수 있으므로,
   * didFetchRef 플래그를 사용해 실제 데이터 fetch가 한 번만 일어나도록 제어합니다.
   */
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!isCreate && numericNo != null && !didFetchRef.current) {
      didFetchRef.current = true;
      fetchDetail(numericNo);
    }
  }, [numericNo, isCreate]);

  const fetchDetail = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminTicketById(id);
      setTicket(data);

      // 상태 초기 설정
      setStatus(data.ticket_status);
      setOriginalStatus(data.ticket_status);

      // 종류 초기 설정: 백엔드가 반환한 ticket_name 그대로
      const initType = data.ticket_name;
      setType(initType);
      setOriginalType(initType);
    } catch (err: unknown) {
      console.error('fetchDetail 오류:', err);
      const errorResponse =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response
          : null;
      if (errorResponse?.status === 401) {
        alert('인증이 필요합니다. 로그인 후 시도해주세요.');
      } else if (errorResponse?.status === 404) {
        setError(`ID ${id}에 해당하는 이용권을 찾을 수 없습니다.`);
      } else {
        setError('이용권 정보를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate(-1);

  const handleSave = () => {
    setModalTitle('변경 저장');
    setModalMessage('변경된 항목을 저장하시겠습니까?');
    setPendingAction('save');
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    setModalTitle('삭제 확인');
    setModalMessage('이용권을 삭제하시겠습니까?');
    setPendingAction('delete');
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    if (pendingAction === 'save' && ticket) {
      await performSave(ticket.id);
    } else if (pendingAction === 'delete' && ticket) {
      await performDelete(ticket.id);
    }
    setPendingAction(null);
  };

  const performSave = async (id: number) => {
    if (!ticket) return;
    const statusChanged = status !== originalStatus;
    const typeChanged = type !== originalType;

    if (!statusChanged && !typeChanged) {
      alert('변경이 완료되었습니다.');
      return;
    }
    setLoading(true);
    try {
      // 1) 상태 변경
      if (statusChanged) {
        // 예: "취소완료"라면 isActive=false 등 로직 필요시 변환
        const isActive = status !== '취소완료';
        // 여기서 백엔드가 status 한글/영어 중 어떤 값을 기대하는지 맞춰서 body.status로 전달해야 함
        await changeTicketStatus(id, { status, isActive });
        setOriginalStatus(status);
      }
      // 2) 종류 변경
      if (typeChanged) {
        // 정기권 간 전환: originalType 과 type 이 두 옵션일 때만 호출
        if (
          (originalType === '정기 구독권(4회권)' && type === '정기 구독권(무제한)') ||
          (originalType === '정기 구독권(무제한)' && type === '정기 구독권(4회권)')
        ) {
          const updated = await convertTicketType(id);
          if (updated && typeof updated.ticket_name === 'string') {
            setTicket(updated);
            // 응답 ticket_name에 따라 다시 type 판단: 단, 백엔드가 ticket_name을 "정기 구독권(4회권)" 등으로 반환하는지 확인 필요
            let newType = updated.ticket_name;
            if (
              updated.ticket_name.includes('정기 구독권') &&
              updated.ticket_name.includes('4회')
            ) {
              newType = '정기 구독권(4회권)';
            } else if (
              updated.ticket_name.includes('정기 구독권') &&
              updated.ticket_name.includes('무제한')
            ) {
              newType = '정기 구독권(무제한)';
            }
            setType(newType);
            setOriginalType(newType);
            // 상태도 동기화
            setStatus(updated.ticket_status);
            setOriginalStatus(updated.ticket_status);
          } else {
            console.warn('convertTicketType 응답에 ticket_name이 없습니다.', updated);
          }
        }
        // 1회 이용권 선택 시
        else if (type === '1회 이용권') {
          alert('“1회 이용권”은 변환 API가 제공되지 않습니다.');
          setType(originalType);
        }
        // 그 외: 초기값이 “회차 이용권” 등이고, 사용자가 TYPE_OPTIONS 중 하나 선택했거나,
        // 또는 TYPE_OPTIONS 중 하나에서 다른 값 선택했으나 originalType이 해당 옵션이 아닐 때
        else {
          alert('선택한 종류로 변경할 수 없습니다.');
          setType(originalType);
        }
      }
    } catch (err: unknown) {
      console.error('performSave 오류:', err);
      const errorResponse =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response
          : null;
      if (errorResponse?.status === 401) {
        alert('인증이 필요합니다. 로그인 후 시도해주세요.');
      } else if (errorResponse?.status === 404) {
        alert('해당 ID의 티켓을 찾을 수 없습니다.');
      } else if (errorResponse?.status === 400) {
        alert('변경이 불가능한 상태입니다.');
      } else {
        alert('변경 중 오류가 발생했습니다.');
      }
      // 실패 시 다시 초기 로드
      await fetchDetail(id);
    } finally {
      setLoading(false);
    }
  };

  const performDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteAdminTicketById(id);
      alert('삭제가 완료되었습니다.');
      // 삭제 후 목록 페이지로 이동하거나, ticket=null 처리 등 필요에 따라 구현
      // 예: navigate('/ticket-list'); 등
    } catch (err: unknown) {
      console.error('performDelete 오류:', err);
      const errorResponse =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response
          : null;
      if (errorResponse?.status === 401) {
        alert('인증이 필요합니다. 로그인 후 시도해주세요.');
      } else if (errorResponse?.status === 404) {
        alert('해당 ID의 이용권을 찾을 수 없습니다.');
      } else {
        alert('삭제 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const detailProps: DetailSubHeaderProps = {
    backLabel: '목록 이동',
    onBackClick: handleBack,
    editLabel: isCreate ? '등록하기' : '변경저장',
    onEditClick: handleSave,
    endLabel: isCreate ? '취소' : '삭제',
    onEndClick: isCreate ? handleBack : handleDelete,
  };

  if (loading) return <SkeletonBox style={{ height: '200px' }} />;
  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
        <BackButton onClick={handleBack}>뒤로가기</BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderRow>
        <Title>{isCreate ? '이용권 등록' : `이용권 상세 (${numericNo})`}</Title>
      </HeaderRow>

      <SettingsDetailSubHeader {...detailProps} />

      {!isCreate && ticket && (
        <>
          <TicketNumber>
            <strong>번호</strong>
            <span>{ticket.id}</span>
          </TicketNumber>

          <FormBox>
            <Row>
              <Field>
                <label>결제일</label>
                <input value={ticket.purchaseDate} readOnly disabled />
              </Field>
              <Field>
                <label>이용자</label>
                <input value={ticket.user} readOnly disabled />
              </Field>
              <Field>
                <label>종류</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  {/* 현재 type이 정의된 옵션 목록에 없으면 최상단에 현재 값 옵션 추가 */}
                  {!TYPE_OPTIONS.some((opt) => opt.value === type) && (
                    <option key="current" value={type}>
                      {type}
                    </option>
                  )}
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
            </Row>
            <Row>
              <Field>
                <label>다음결제일</label>
                <input value={ticket.nextDate} readOnly disabled />
              </Field>
              <Field>
                <label>이용기간</label>
                <input value={ticket.이용기간} readOnly disabled />
              </Field>
              <Field>
                <label>이용횟수</label>
                <input value={ticket.ticket_count} readOnly disabled />
              </Field>
            </Row>
            <Row>
              <Field style={{ flex: 1 }}>
                <label>상태</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <StatusBadge
                    style={{
                      backgroundColor: getStatusBadge(status).background,
                    }}
                  >
                    {getStatusBadge(status).label}
                  </StatusBadge>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ flex: 1, marginLeft: '8px' }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
            </Row>
          </FormBox>
        </>
      )}

      <ReusableModal2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={modalTitle}
      >
        {modalMessage}
      </ReusableModal2>
    </Container>
  );
};

export default TicketDetail;

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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;
const Title = styled.h1`
  font-weight: 700;
  font-size: 16px;
`;
const TicketNumber = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin: 10px 0 24px;
  strong {
    font-size: 12px;
    font-weight: 700;
  }
  span {
    font-size: 12px;
    font-weight: 900;
  }
`;
const FormBox = styled.div`
  width: 100%;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 0 4px 4px 4px;
`;
const Row = styled.div`
  width: 100%;
  display: flex;
  & + & {
    border-top: 1px solid #ddd;
  }
`;
const Field = styled.div`
  flex: 1;
  min-width: 200px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  box-sizing: border-box;

  &:not(:last-child) {
    border-right: 1px solid #ddd;
  }

  label {
    width: 100px;
    font-size: 12px;
    font-weight: 700;
    margin-right: 8px;
    text-align: center;
  }

  input[disabled],
  input[readOnly],
  select:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  input,
  select {
    flex: 1;
    height: 36px;
    padding: 0 8px;
    font-size: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    max-width: 200px;
  }
`;
const ErrorMessage = styled.div`
  color: red;
  padding: 20px;
  text-align: center;
`;
const BackButton = styled.button`
  margin-top: 16px;
  padding: 8px 12px;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
`;

const SkeletonBox = styled.div`
  width: 100%;
  height: 32px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  border-radius: 4px;
  margin-bottom: 12px;
  animation: skeleton-loading 1.2s infinite linear;
  @keyframes skeleton-loading {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
`;
