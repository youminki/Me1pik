// src/pages/Tab4/Monitoring/MonitoringList.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MonitoringTable, { MonitoringItem } from '@components/Table/MonitoringTable';
import SubHeader, { TabItem } from '@components/Header/SearchSubHeader';
import Pagination from '@components/Pagination';
import {
  getRentalSchedules,
  updateRentalScheduleStatus,
  RentalScheduleAdminItem,
} from '@api/RentalSchedule/RentalScheduleApi';
import { advancedSearchFilter, normalize } from '@utils/advancedSearch';

const tabs: TabItem[] = [
  { label: '전체보기', path: '' },
  { label: '진행내역', path: '진행내역' },
  { label: '취소내역', path: '취소' },
];
// '신청완료'를 맨 앞에 추가
const statuses = ['신청완료', '배송준비', '배송중', '배송완료', '배송취소', '반납중', '반납완료'];

// Chip 컴포넌트 (제품 관리에서 복사)
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

const MonitoringList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = (searchParams.get('search') ?? '').toLowerCase();
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = 10;

  const [selectedTab, setSelectedTab] = useState<TabItem>(tabs[0]);
  const [newStatus, setNewStatus] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const [allData, setAllData] = useState<MonitoringItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const first = await getRentalSchedules(1, 1);
        const total = first.count;
        const { rentals } = await getRentalSchedules(total, 1);
        const mapped: MonitoringItem[] = rentals.map((item: RentalScheduleAdminItem) => ({
          no: item.id,
          신청일: item.createAt.split(' ')[0],
          주문자: `${item.userName}(${item.nickname})`,
          대여기간: item.rentalPeriod,
          브랜드: item.brand,
          종류: item.category,
          스타일: item.productNum,
          색상: item.color,
          사이즈: item.size,
          이용권: item.ticketName,
          배송상태: item.deliveryStatus,
        }));
        setAllData(mapped);
        setTotalCount(total);
      } catch (err) {
        console.error(err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleTabChange = (tab: TabItem) => {
    setSelectedTab(tab);
    setSearchParams({ status: tab.path });
    setSelectedRows(new Set());
  };

  const reloadAll = async () => {
    setLoading(true);
    try {
      const first = await getRentalSchedules(1, 1);
      const total = first.count;
      const { rentals } = await getRentalSchedules(total, 1);
      const mapped = rentals.map((item: RentalScheduleAdminItem) => ({
        no: item.id,
        신청일: item.createAt.split(' ')[0],
        주문자: `${item.userName}(${item.nickname})`,
        대여기간: item.rentalPeriod,
        브랜드: item.brand,
        종류: item.category,
        스타일: item.productNum,
        색상: item.color,
        사이즈: item.size,
        이용권: item.ticketName,
        배송상태: item.deliveryStatus,
      }));
      setAllData(mapped);
      setTotalCount(total);
      setSelectedRows(new Set());
      setNewStatus('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkChange = async () => {
    if (!newStatus) return alert('변경할 배송상태를 선택해주세요.');
    if (!selectedRows.size) return alert('선택된 항목이 없습니다.');
    setLoading(true);
    try {
      await Promise.all(
        Array.from(selectedRows).map((id) =>
          updateRentalScheduleStatus(id, {
            deliveryStatus: newStatus as
              | '배송취소'
              | '신청완료'
              | '배송준비'
              | '배송중'
              | '배송완료'
              | '반납중'
              | '반납완료',
          }),
        ),
      );
      alert('배송상태가 일괄 변경되었습니다.');
      await reloadAll();
    } catch {
      alert('일괄 변경 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleRowSave = async (id: number, status: string) => {
    setLoading(true);
    try {
      await updateRentalScheduleStatus(id, {
        deliveryStatus: status as
          | '배송취소'
          | '신청완료'
          | '배송준비'
          | '배송중'
          | '배송완료'
          | '반납중'
          | '반납완료',
      });
      alert('상태가 변경되었습니다.');
      await reloadAll();
    } catch {
      alert('변경 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const dataByTab = allData.filter((i) =>
    selectedTab.label === '전체보기'
      ? true
      : selectedTab.label === '진행내역'
        ? i.배송상태 !== '배송취소'
        : i.배송상태 === '배송취소',
  );
  const filtered = dataByTab.filter((i) => {
    const keywords = normalize(searchTerm).split(/\s+/).filter(Boolean);
    return advancedSearchFilter({
      item: i,
      keywords,
      fields: [
        'no',
        '신청일',
        '주문자',
        '대여기간',
        '브랜드',
        '종류',
        '스타일',
        '색상',
        '사이즈',
        '배송상태',
      ],
    });
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paged = filtered.slice((page - 1) * limit, page * limit);

  const toggleAll = () => {
    setSelectedRows((prev) =>
      prev.size === paged.length ? new Set() : new Set(paged.map((i) => i.no)),
    );
  };
  const toggleRow = (no: number) => {
    setSelectedRows((prev) => {
      const s = new Set(prev);
      if (s.has(no)) {
        s.delete(no);
      } else {
        s.add(no);
      }
      return s;
    });
  };
  const handleEdit = (no: number) => {
    navigate(`/monitoringdetail/${no}?page=${page}`);
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
      <HeaderTitle>대여 내역</HeaderTitle>
      <SubHeader tabs={tabs} onTabChange={handleTabChange} />
      <InfoBar>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <TotalCountText>총 {totalCount}건</TotalCountText>
          {/* Chip row: TotalCount 오른쪽에 한 줄로 정렬 */}
          {chipKeywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginLeft: 12, minWidth: 0 }}>
              {chipKeywords.map((chip) => (
                <Chip key={chip} label={chip} onDelete={() => handleDeleteChip(chip)} />
              ))}
            </div>
          )}
        </div>
        <FilterGroup>
          <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="">변경할 상태</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <BulkButton onClick={handleBulkChange}>일괄변경</BulkButton>
        </FilterGroup>
      </InfoBar>
      <TableContainer>
        <MonitoringTable
          filteredData={paged}
          handleEdit={handleEdit}
          selectedRows={selectedRows}
          toggleRow={toggleRow}
          toggleAll={toggleAll}
          statuses={statuses}
          onSave={handleRowSave}
          isLoading={loading} // 항상 전달
        />
        {error && <ErrorText>{error}</ErrorText>}
      </TableContainer>
      <FooterRow>
        <Pagination totalPages={totalPages} />
      </FooterRow>
    </Content>
  );
};
export default MonitoringList;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 10px;
  font-size: 14px;
`;
const HeaderTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 18px;
`;
const InfoBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;
const TotalCountText = styled.div`
  font-weight: 900;
  font-size: 12px;
`;
const FilterGroup = styled.div`
  display: flex;
  gap: 8px;
`;
const Select = styled.select`
  height: 32px;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid #ccc;
`;
const BulkButton = styled.button`
  height: 32px;
  padding: 0 12px;
  background: #000;
  color: #fff;
  border: none;
  cursor: pointer;
`;
const ErrorText = styled.div`
  text-align: center;
  color: red;
  padding: 20px;
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
  margin-top: 40px;
`;
