// src/pages/Calculate/CalculateDetail.tsx

import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import SettingsDetailSubHeader, {
  DetailSubHeaderProps,
} from '@components/Header/SettingsDetailSubHeader';
import ShippingTabBar from '@components/TabBar';
import ReusableModal2 from '@components/OneButtonModal';
import CalculateDetailTopBoxes from '@components/CalculateDetailTopBoxes';

interface CalculateDetailProps {
  isCreate?: boolean;
}

interface SummaryItem {
  no: number;
  season: string;
  productCount: number;
  totalSales: number;
  profit: number;
  expectedSettlement: number;
  unsettled: number;
  settlementDate: string;
}

const CalculateDetail: React.FC<CalculateDetailProps> = ({ isCreate = false }) => {
  const navigate = useNavigate();
  const { no } = useParams<{ no: string }>();
  const numericNo = isCreate ? undefined : Number(no);

  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 정산 내역 더미 데이터
  const [summary] = useState<SummaryItem[]>([
    {
      no: 16,
      season: '2025 / 4월',
      productCount: 12,
      totalSales: 1840000,
      profit: 184000,
      expectedSettlement: 92000,
      unsettled: 0,
      settlementDate: '2025-05-01',
    },
    {
      no: 15,
      season: '2025 / 3월',
      productCount: 12,
      totalSales: 1840000,
      profit: 184000,
      expectedSettlement: 92000,
      unsettled: 0,
      settlementDate: '2025-04-01',
    },
    {
      no: 14,
      season: '2025 / 2월',
      productCount: 12,
      totalSales: 1840000,
      profit: 184000,
      expectedSettlement: 92000,
      unsettled: 0,
      settlementDate: '2025-03-01',
    },
    {
      no: 13,
      season: '2025 / 1월',
      productCount: 12,
      totalSales: 1840000,
      profit: 184000,
      expectedSettlement: 92000,
      unsettled: 0,
      settlementDate: '2025-02-01',
    },
    {
      no: 12,
      season: '2024 / 12월',
      productCount: 12,
      totalSales: 1840000,
      profit: 184000,
      expectedSettlement: 92000,
      unsettled: 0,
      settlementDate: '2025-01-02',
    },
    {
      no: 11,
      season: '2024 / 11월',
      productCount: 12,
      totalSales: 1840000,
      profit: 184000,
      expectedSettlement: 92000,
      unsettled: 0,
      settlementDate: '2024-12-01',
    },
    {
      no: 10,
      season: '2024 / 10월',
      productCount: 12,
      totalSales: 1840000,
      profit: 184000,
      expectedSettlement: 92000,
      unsettled: 0,
      settlementDate: '2024-11-01',
    },
  ]);

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
        <Title>{isCreate ? '판매 등록' : `판매 상세 (${numericNo})`}</Title>
      </HeaderRow>

      <SettingsDetailSubHeader {...detailProps} />

      <ProductNumberWrapper>
        <ProductNumberLabel>번호</ProductNumberLabel>
        <ProductNumberValue>{numericNo}</ProductNumberValue>
      </ProductNumberWrapper>

      <CalculateDetailTopBoxes />

      <DividerDashed />

      <ShippingTabBar tabs={['상세내역']} activeIndex={activeTab} onTabClick={setActiveTab} />

      {activeTab === 0 && (
        <DetailSection>
          <Table>
            <colgroup>
              <col style={{ width: '50px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
            </colgroup>
            <Thead>
              <TableRow>
                <Th>No.</Th>
                <Th>시즌표기</Th>
                <Th>판매 제품수</Th>
                <Th>총 판매금액</Th>
                <Th>판매 수익금</Th>
                <Th>정산 예상금</Th>
                <Th>미정산금</Th>
                <Th>정산일자</Th>
              </TableRow>
            </Thead>
            <Tbody>
              {summary.map((s) => (
                <TableRow key={s.no}>
                  <TdCenter>{s.no}</TdCenter>
                  <TdCenter>{s.season}</TdCenter>
                  <TdCenter>{s.productCount}</TdCenter>
                  <TdCenter>{s.totalSales.toLocaleString()}원</TdCenter>
                  <TdCenter>{s.profit.toLocaleString()}원</TdCenter>
                  <TdCenter>{s.expectedSettlement.toLocaleString()}원</TdCenter>
                  <TdCenter>{s.unsettled.toLocaleString()}원</TdCenter>
                  <TdCenter>{s.settlementDate}</TdCenter>
                </TableRow>
              ))}
            </Tbody>
          </Table>
        </DetailSection>
      )}

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

export default CalculateDetail;

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
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: #ffffff;
  border: 1px solid #dddddd;
`;

const Thead = styled.thead`
  background-color: #eeeeee;
`;

const Tbody = styled.tbody``;

const TableRow = styled.tr`
  height: 44px;
  &:nth-child(even) {
    background: #f8f9fa;
  }
  &:hover {
    background-color: #e3f2fd;
    cursor: pointer;
  }
`;

const Th = styled.th``;

const TdCenter = styled.td`
  text-align: center;
  vertical-align: middle;
  padding: 12px 16px;
  border-right: 1px solid #dddddd;
`;
