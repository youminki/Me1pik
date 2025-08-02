/**
 * 이용권 목록(TicketList) 페이지
 *
 * - 이용권 상태별 필터링, 검색, 일괄 상태 변경 등 지원
 * - react-query 기반 데이터 관리, 페이지네이션, 체크박스 등 포함
 * - Chip 컴포넌트로 필터 표시, BulkChangeUI로 일괄 변경
 */
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import TicketTable, { TicketItem } from '@components/Table/TicketTable';
import SubHeader, { TabItem } from '@components/Header/SearchSubHeader';
import Pagination from '@components/Pagination';
import BulkChangeUI from '@components/BulkChangeUI';
import {
  getAdminPaginatedTickets,
  changeTicketStatus,
  AdminTicketItem,
} from '@api/Ticket/TicketApi';
import { advancedSearchFilter, normalize } from '@utils/advancedSearch';

/**
 * 이용권 상태 탭 옵션
 * - 전체/결제완료/결제대기/이용완료/취소내역 등
 */
const tabs: TabItem[] = [
  { label: '전체보기', path: '' },
  { label: '결제완료', path: '결제완료' },
  { label: '결제대기', path: '결제대기' },
  { label: '이용완료', path: '이용완료' },
  { label: '취소내역', path: '취소완료' },
];

/**
 * 이용권 상태 옵션
 * - 결제완료, 결제대기, 이용완료, 취소완료 등
 */
const statusOptions = [
  { label: '결제완료', value: '결제완료' },
  { label: '결제대기', value: '결제대기' },
  { label: '이용완료', value: '이용완료' },
  { label: '취소완료', value: '취소완료' },
];

/**
 * Chip 컴포넌트 (제품 관리에서 복사)
 * - 필터 표시용, 삭제 기능 포함
 */
const Chip = ({ label, onDelete }: { label: string; onDelete: () => void }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: '#e6f0fa',
      border: '1px solid #90caf9',
      borderRadius: 16,
      padding: '4px 14px',
      marginRight: 8,
      fontSize: 14,
      fontWeight: 500,
      color: '#1976d2',
      marginBottom: 4,
      boxShadow: '0 1px 4px rgba(25, 118, 210, 0.08)',
      transition: 'background 0.2s',
    }}
    onMouseOver={(e) => (e.currentTarget.style.background = '#bbdefb')}
    onMouseOut={(e) => (e.currentTarget.style.background = '#e6f0fa')}
  >
    {label}
    <button
      onClick={onDelete}
      style={{
        background: 'none',
        border: 'none',
        marginLeft: 8,
        cursor: 'pointer',
        fontWeight: 'bold',
        color: '#1976d2',
        fontSize: 16,
        lineHeight: 1,
        padding: 0,
        transition: 'color 0.2s',
      }}
      onMouseOver={(e) => (e.currentTarget.style.color = '#d32f2f')}
      onMouseOut={(e) => (e.currentTarget.style.color = '#1976d2')}
      aria-label="삭제"
    >
      ×
    </button>
  </span>
);

/**
 * 이용권 목록 컴포넌트
 * - 이용권 목록을 표시하고 필터링/일괄변경 기능 제공
 * - react-query를 사용하여 데이터를 관리하며, 클라이언트 페이지네이션 지원
 */
const TicketList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState<TabItem>(tabs[0]);

  // 체크박스 상태
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  // 일괄변경용 상태
  const [newStatus, setNewStatus] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // 파라미터
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const searchTerm = (searchParams.get('search') ?? '').toLowerCase();
  const limit = 10;

  // 전체 데이터
  const [allTickets, setAllTickets] = useState<AdminTicketItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 조회 함수
  const fetchAll = async () => {
    setLoading(true);
    try {
      const first = await getAdminPaginatedTickets(1, 1);
      const total = first.total;
      const { tickets } = await getAdminPaginatedTickets(1, total);
      setAllTickets(tickets);
      setSelectedRows(new Set());
    } catch (err) {
      console.error('전체 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleTabChange = (tab: TabItem) => {
    setSelectedTab(tab);
    setSearchParams({ status: tab.path });
    setSelectedRows(new Set());
  };

  const dataByTab = allTickets.filter((t) =>
    selectedTab.path === '' ? true : t.ticket_status === selectedTab.path,
  );

  const filteredData = dataByTab.filter((t) => {
    const keywords = normalize(searchTerm).split(/\s+/).filter(Boolean);
    return advancedSearchFilter({
      item: t,
      keywords,
      fields: [
        'id',
        'purchaseDate',
        'nextDate',
        'user',
        'ticket_name',
        '이용기간',
        'ticket_count',
        'ticket_status',
      ],
    });
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const paginated = filteredData.slice((page - 1) * limit, page * limit);

  const tableData: TicketItem[] = paginated.map((t) => ({
    no: t.id,
    paymentDate: t.purchaseDate,
    nextPaymentDate: t.nextDate || '-',
    user: t.user,
    type: t.ticket_name,
    usagePeriod: t.이용기간.replace(/-/g, '.') || '-',
    usageCount: t.ticket_count,
    status: t.ticket_status,
  }));

  const handleEdit = (no: number) => {
    navigate(`/ticketDetail/${no}`);
  };

  // 일괄변경 핸들러
  const handleBulkChange = async () => {
    if (!newStatus || selectedRows.size === 0) return;
    if (!window.confirm(`선택된 ${selectedRows.size}건 상태를 "${newStatus}"로 변경하시겠습니까?`))
      return;
    setBulkLoading(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          changeTicketStatus(id, {
            status: newStatus,
            isActive: newStatus !== '취소완료',
          }),
        ),
      );
      alert('상태가 변경되었습니다.');
      setNewStatus('');
      fetchAll();
    } catch (err) {
      console.error('일괄 상태 변경 실패:', err);
      alert('일괄 변경 중 오류가 발생했습니다.');
    } finally {
      setBulkLoading(false);
    }
  };

  // 검색어 키워드 분리 (공백 기준)
  const chipKeywords = searchTerm.trim().split(/\s+/).filter(Boolean);

  // Chip 삭제 핸들러
  const handleDeleteChip = (chip: string) => {
    const newKeywords = chipKeywords.filter((k) => k !== chip);
    const newSearch = newKeywords.join(' ');
    const params = Object.fromEntries(searchParams.entries());
    if (newSearch) params.search = newSearch;
    else delete params.search;
    setSearchParams(params);
  };

  return (
    <Content>
      <HeaderTitle>티켓 관리</HeaderTitle>
      <SubHeader tabs={tabs} onTabChange={handleTabChange} />
      <InfoBar>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <TotalCountText>{loading ? '로딩 중...' : `총 ${filteredData.length}건`}</TotalCountText>
          {/* Chip row: TotalCount 오른쪽에 한 줄로 정렬 */}
          {chipKeywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 12, minWidth: 0 }}>
              {chipKeywords.map((chip) => (
                <Chip key={chip} label={chip} onDelete={() => handleDeleteChip(chip)} />
              ))}
            </div>
          )}
        </div>
        <BulkChangeUI
          newStatus={newStatus}
          onStatusChange={setNewStatus}
          onBulkChange={handleBulkChange}
          statusOptions={statusOptions}
          selectedCount={selectedRows.size}
          isLoading={bulkLoading}
        />
      </InfoBar>

      <TableContainer>
        <TicketTable
          filteredData={tableData}
          handleEdit={handleEdit}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          isLoading={loading}
        />
      </TableContainer>

      <FooterRow>
        <Pagination totalPages={totalPages} />
      </FooterRow>
    </Content>
  );
};

export default TicketList;

/* Styled Components */
const Content = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  flex-grow: 1;
  font-size: 14px;
  padding: 16px;
`;
const HeaderTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
`;
const InfoBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;
const TotalCountText = styled.div`
  font-weight: 700;
  font-size: 12px;
`;
const TableContainer = styled.div`
  min-width: 834px;
  max-width: 100vw;
  min-height: 500px;
  overflow-x: auto;
  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 8px;
  }
`;
const FooterRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;
`;
