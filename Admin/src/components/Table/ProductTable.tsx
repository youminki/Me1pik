/**
 * 상품 테이블(ProductTable)
 *
 * - 상품 목록을 표 형태로 렌더링
 * - 스타일(품번) 복사, 상태 뱃지, 체크박스 등 다양한 기능 지원
 * - GenericTable 기반으로 재사용성 강화
 */
// src/components/Table/ProductTable.tsx
import React from 'react';
import { Column } from '@components/CommonTable';
import StatusBadge from 'src/components/Common/StatusBadge';
import { getStatusBadge } from 'src/utils/statusUtils';
import styled from 'styled-components';
import { FaCopy } from 'react-icons/fa';
import GenericTable from './GenericTable';

const SIZE_LABELS: Record<string, string> = {
  '44': 'S',
  '55': 'M',
  '66': 'L',
  '77': 'XL',
};

export interface ProductItem extends Record<string, unknown> {
  no: number;
  styleCode: string;
  brand: string;
  category: string;
  color: string;
  size: string;
  price: number;
  registerDate: string;
  status: string;
}

/**
 * 상품 테이블 props
 * - 필터링된 데이터, 편집 핸들러, 선택/토글 등
 */
interface ProductTableProps {
  filteredData: ProductItem[];
  handleEdit: (styleCode: string, no: number) => void;
  startNo?: number;
  selectedRows: Set<number>;
  toggleRow: (no: number) => void;
  toggleAll: () => void;
  isLoading?: boolean; // 추가
}

const StyleCodeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const StyleCodeText = styled.span`
  font-size: 12px;
  cursor: pointer;
  color: #007bff;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s;

  &:hover {
    color: #007bff;
  }
`;

/**
 * 사이즈 표기 변환 함수
 * - 숫자(44, 55 등)를 S/M/L/XL 등으로 변환
 */
const formatSize = (raw: string) => {
  if (/free/i.test(raw)) return 'Free';
  const parts = raw.match(/\d+/g);
  if (!parts) return raw;
  return parts
    .map((num) => {
      const label = SIZE_LABELS[num];
      return label ? `${num}(${label})` : num;
    })
    .join(' / ');
};

type ProductRow = ProductItem & {
  rowNo: number;
  handleEdit: (styleCode: string, no: number) => void;
  [key: string]: unknown;
};

/**
 * 테이블 컬럼 정의
 * - No, 스타일(품번), 브랜드, 카테고리, 색상, 사이즈, 가격, 등록일, 상태 등
 * - 각 컬럼별 렌더/포맷/핸들러 지정
 */
const columns: Column<ProductRow>[] = [
  {
    key: 'rowNo',
    label: 'No.',
    width: '50px',
    render: (value) => value as React.ReactNode,
  },
  {
    key: 'styleCode',
    label: '스타일(품번)',
    width: '150px',
    render: (value, row) => {
      const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(row.styleCode);
          // 복사 성공 시 피드백 (선택사항)
          console.log('스타일 품번이 복사되었습니다:', row.styleCode);
        } catch (err) {
          console.error('복사 실패:', err);
        }
      };

      return (
        <StyleCodeContainer>
          <StyleCodeText
            title={value as string}
            onClick={() => row.handleEdit(row.styleCode, row.no)}
          >
            {value as string}
          </StyleCodeText>
          <CopyButton onClick={handleCopy} title="스타일 품번 복사">
            <FaCopy size={12} />
          </CopyButton>
        </StyleCodeContainer>
      );
    },
  },
  {
    key: 'brand',
    label: '브랜드',
    width: '100px',
    render: (v) => <span title={v as string}>{v as string}</span>,
  },
  {
    key: 'category',
    label: '분류',
    width: '80px',
    render: (v) => <span title={v as string}>{v as string}</span>,
  },
  {
    key: 'color',
    label: '색상',
    width: '80px',
    render: (v) => <span title={v as string}>{v as string}</span>,
  },
  {
    key: 'size',
    label: '사이즈',
    width: '100px',
    render: (v) => formatSize(v as string),
  },
  {
    key: 'price',
    label: '가격',
    width: '100px',
    render: (v) => `${Number(v).toLocaleString()}원`,
  },
  {
    key: 'registerDate',
    label: '등록일',
    width: '100px',
    render: (v) => v as React.ReactNode,
  },
  {
    key: 'status',
    label: '상태',
    width: '80px',
    render: (v) => {
      const badge = getStatusBadge(v as string);
      return <StatusBadge style={{ background: badge.background }}>{badge.label}</StatusBadge>;
    },
  },
];

const ProductTable: React.FC<ProductTableProps> = ({
  filteredData,
  handleEdit,
  startNo = 0,
  selectedRows,
  toggleRow,
  toggleAll,
  isLoading,
}) => {
  // rowNo, handleEdit을 각 row에 추가 (GenericTable의 processRow로 대체)
  const processRow = React.useCallback(
    (item: ProductItem, idx: number) => ({
      ...item,
      rowNo: startNo + idx + 1,
      handleEdit,
    }),
    [handleEdit, startNo],
  );

  // onSelectRow, onSelectAll useCallback 유지
  const onSelectRow = React.useCallback((row: ProductRow) => toggleRow(row.no), [toggleRow]);
  const onSelectAll = React.useCallback(() => toggleAll(), [toggleAll]);

  return (
    <GenericTable<ProductItem, ProductRow>
      data={filteredData}
      columns={columns}
      rowKey={(row) => row.no}
      processRow={processRow}
      showCheckbox
      selectedRows={Array.from(selectedRows)}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 900 }}
      isLoading={isLoading}
    />
  );
};

export default ProductTable;
