/**
 * 제품 평가 테이블(ProductEvaluationTable)
 *
 * - 사용자별 제품 평가 정보를 표 형태로 렌더링
 * - 등급, 이름, 닉네임, 인스타그램, 제품상태, 서비스 품질, 제품후기 등 표시
 * - 인스타그램 계정 클릭 시 상세 페이지 이동, 체크박스 선택 기능 지원
 * - 재사용 가능한 공통 컴포넌트
 */

// src/components/Table/ProductEvaluationTable.tsx
import React from 'react';
import { Column, default as CommonTable } from '@components/CommonTable';
import { InstaContainer, Avatar, InstaText } from '@components/Common/Profile';
import StatusBadge from '@components/Common/StatusBadge';
import { getStatusBadge } from '@utils/statusUtils';

/**
 * 사용자 인터페이스
 * - 제품 평가 목록에 필요한 사용자 정보 구조
 */
export interface User {
  no: number;
  grade: string;
  name: string;
  nickname: string;
  instagram: string;
  productStatus: string;
  serviceQuality: string;
  productReview: string;
  registeredAt: string;
}

/**
 * 제품 평가 테이블 props
 * - 필터링된 데이터, 편집 핸들러, 선택 상태, 로딩 상태 등
 */
interface ProductEvaluationTableProps {
  filteredData: User[];
  handleEdit: (no: number) => void;
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: User, checked: boolean) => void;
  isLoading?: boolean; // 추가
}

/**
 * 테이블 컬럼 정의
 * - No., 등급, 이름, 닉네임, 인스타그램, 제품상태, 서비스 품질, 제품후기 등
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
  {
    key: 'productStatus',
    label: '제품상태',
    width: '80px',
    render: (v) => {
      const badge = getStatusBadge(v as string);
      return <StatusBadge style={{ background: badge.background }}>{badge.label}</StatusBadge>;
    },
  },
  { key: 'serviceQuality', label: '서비스 품질', width: '80px' },
  {
    key: 'productReview',
    label: '제품후기',
    width: '200px',
    render: (v) => <span style={{ textAlign: 'left', display: 'block' }}>{v as string}</span>,
  },
  { key: 'registeredAt', label: '등록일자', width: '100px' },
];

/**
 * 제품 평가 테이블 컴포넌트
 * - 사용자별 제품 평가 정보를 테이블 형태로 표시
 */
const ProductEvaluationTable: React.FC<ProductEvaluationTableProps> = ({
  filteredData,
  handleEdit,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
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
      showCheckbox
      selectedRows={Array.from(selectedRows)}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 900 }}
      isLoading={isLoading} // 추가
    />
  );
};

export default ProductEvaluationTable;
