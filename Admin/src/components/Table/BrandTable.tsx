import React from 'react';
import CommonTable, { Column } from '@components/CommonTable';
import StatusBadge from 'src/components/Common/StatusBadge';
import { getStatusBadge } from 'src/utils/statusUtils';

/**
 * 브랜드 테이블(BrandTable)
 *
 * - 브랜드 정보를 표 형태로 렌더링
 * - 그룹사, 브랜드, 제품수, 할인율, 담당자, 연락처, 등록일, 상태 등 표시
 * - 그룹사 클릭 시 상세 페이지 이동, 체크박스 선택 기능 지원
 * - 재사용 가능한 공통 컴포넌트
 */

/**
 * 브랜드 아이템 인터페이스
 * - 브랜드 목록에 필요한 브랜드 정보 구조
 */
export interface BrandItem extends Record<string, unknown> {
  no: number;
  group: string;
  brand: string;
  quantity: number;
  discount: number;
  manager: string;
  contact: string;
  registerDate: string;
  status: string;
}

/**
 * 브랜드 테이블 props
 * - 필터링된 데이터, 편집 핸들러, 선택 상태, 로딩 상태 등
 */
interface BrandTableProps {
  filteredData: BrandItem[];
  handleEdit: (no: number) => void;
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: BrandItem, checked: boolean) => void;
  isLoading?: boolean; // 추가
}

/**
 * 테이블 컬럼 정의
 * - No., 그룹사, 브랜드, 제품수, 할인율, 담당자, 연락처, 등록일, 상태 등
 */
const columns: Column<BrandItem & { handleEdit: (no: number) => void }>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  {
    key: 'group',
    label: '그룹사',
    width: '150px',
    render: (v, row) => (
      <span
        style={{ color: '#007bff', cursor: 'pointer' }}
        title={String(v)}
        onClick={() => row.handleEdit(row.no)}
      >
        {String(v)}
      </span>
    ),
  },
  {
    key: 'brand',
    label: '브랜드',
    width: '100px',
    render: (v) => <span title={String(v)}>{String(v)}</span>,
  },
  {
    key: 'quantity',
    label: '제품수',
    width: '80px',
    render: (v) => <span title={String(v)}>{String(v)}</span>,
  },
  {
    key: 'discount',
    label: '할인율',
    width: '80px',
    render: (v) => <span title={`${v}%`}>{String(v)}%</span>,
  },
  {
    key: 'manager',
    label: '담당자',
    width: '120px',
    render: (v) => <span title={String(v)}>{String(v)}</span>,
  },
  {
    key: 'contact',
    label: '연락처',
    width: '120px',
    render: (v) => <span title={String(v)}>{String(v)}</span>,
  },
  {
    key: 'registerDate',
    label: '등록일',
    width: '100px',
    render: (v) => <span title={String(v)}>{String(v)}</span>,
  },
  {
    key: 'status',
    label: '상태',
    width: '80px',
    render: (v) => {
      const badge = getStatusBadge(String(v));
      return <StatusBadge style={{ background: badge.background }}>{badge.label}</StatusBadge>;
    },
  },
];

/**
 * 브랜드 테이블 컴포넌트
 * - 브랜드 정보를 테이블 형태로 표시
 */
const BrandTable: React.FC<BrandTableProps> = ({
  filteredData,
  handleEdit,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
  isLoading,
}) => {
  /**
   * handleEdit을 각 row에 추가하여, 그룹사 클릭 시 상세/수정 진입이 가능하도록 합니다.
   */
  const dataWithEdit = filteredData.map((item) => ({ ...item, handleEdit }));

  return (
    <CommonTable<BrandItem & { handleEdit: (no: number) => void }>
      columns={columns}
      data={dataWithEdit}
      showCheckbox
      selectedRows={Array.from(selectedRows)}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 1000 }}
      isLoading={isLoading} // 추가
    />
  );
};

export default BrandTable;
