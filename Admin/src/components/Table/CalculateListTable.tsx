/**
 * 정산 목록 테이블(CalculateListTable)
 *
 * - 사용자별 정산 정보를 표 형태로 렌더링
 * - 등급, 이름, 닉네임, 인스타그램, 시즌, 판매 정보 등 표시
 * - 인스타그램 계정 클릭 시 상세 페이지 이동
 * - 재사용 가능한 공통 컴포넌트
 */
// src/components/Table/CalculateListTable.tsx
import React from 'react';
import { Column, default as CommonTable } from '@components/CommonTable';
import { InstaContainer, Avatar, InstaText } from '@components/Common/Profile';

/**
 * 사용자 인터페이스
 * - 정산 목록에 필요한 사용자 정보 구조
 */
export interface User {
  no: number;
  grade: string;
  name: string;
  nickname: string;
  instagram: string;
  season: string;
  sellCount: string;
  totalSum: number;
  profit: number;
  expectedProfit: number;
}

/**
 * 정산 목록 테이블 props
 * - 필터링된 데이터, 편집 핸들러, 로딩 상태 등
 */
interface CalculateListTableProps {
  filteredData: User[];
  handleEdit: (no: number) => void;
  isLoading?: boolean; // 추가
}

/**
 * 테이블 컬럼 정의
 * - No., 등급, 이름, 닉네임, 인스타그램, 시즌, 판매 정보 등
 */
const columns: Column<User & { handleEdit: (no: number) => void }>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'grade', label: '등급', width: '60px' },
  { key: 'name', label: '이름', width: '80px' },
  { key: 'nickname', label: '닉네임', width: '80px' },
  {
    key: 'instagram',
    label: '계정(인스타)',
    width: '150px',
    render: (v, row) => (
      <InstaContainer>
        <Avatar />
        <InstaText $clickable onClick={() => row.handleEdit(row.no)}>
          {v as string}
        </InstaText>
      </InstaContainer>
    ),
  },
  { key: 'season', label: '시즌 진행상태', width: '120px' },
  { key: 'sellCount', label: '판매 제품수', width: '90px' },
  {
    key: 'totalSum',
    label: '총 판매금액',
    width: '100px',
    render: (v) => Number(v).toLocaleString(),
  },
  {
    key: 'profit',
    label: '판매 수익금',
    width: '90px',
    render: (v) => Number(v).toLocaleString(),
  },
  {
    key: 'expectedProfit',
    label: '정산 예정금',
    width: '90px',
    render: (v) => Number(v).toLocaleString(),
  },
];

/**
 * 정산 목록 테이블 컴포넌트
 * - 사용자별 정산 정보를 테이블 형태로 표시
 */
const CalculateListTable: React.FC<CalculateListTableProps> = ({
  filteredData,
  handleEdit,
  isLoading,
}) => {
  /**
   * handleEdit을 각 row에 추가하여, 사용자 클릭 시 상세/수정 진입이 가능하도록 합니다.
   */
  const dataWithEdit = filteredData.map((user) => ({ ...user, handleEdit }));

  return (
    <CommonTable
      columns={columns}
      data={dataWithEdit}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 900 }}
      isLoading={isLoading} // 추가
    />
  );
};

export default CalculateListTable;
