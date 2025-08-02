/**
 * 이용 이력 테이블(UsageHistoryTable)
 *
 * - 사용자별 이용 이력 정보를 표 형태로 렌더링
 * - 신청일자, 이용목적, 이용기간, 브랜드, 스타일, 사이즈, 재질/색상, 상태 등 표시
 * - 스타일 코드 복사 기능, 상태별 뱃지 표시, 체크박스 선택 기능 지원
 * - 재사용 가능한 공통 컴포넌트
 */
// src/components/Table/user/UsageHistoryTable.tsx
import React from 'react';
import CommonTable, { Column } from '@/components/CommonTable';
import StatusBadge from '@/components/Common/StatusBadge';
import { getStatusBadge } from '@/utils/statusUtils';
import styled from 'styled-components';
import { FaCopy } from 'react-icons/fa';

/**
 * 이용 이력 행 인터페이스
 * - 이용 이력에 필요한 행 데이터 구조
 */
export interface UsageHistoryRow {
  applicationDate: string; // 신청일자
  purpose: string; // 이용목적 (대여, 구매 등)
  usagePeriod: string; // 이용기간(합일)
  brand: string; // 브랜드
  style: string; // 스타일(행정)
  size: string; // 사이즈
  color: string; // 재질/색상
  status: string; // 상태
  [key: string]: unknown;
}

/**
 * 이용 이력 테이블 props
 * - 데이터, 선택 상태, 선택 이벤트 등
 */
interface UsageHistoryTableProps {
  data: UsageHistoryRow[];
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: UsageHistoryRow & { no: number }, checked: boolean) => void;
}

/**
 * 스타일 코드 컨테이너 스타일드 컴포넌트
 * - 스타일 코드와 복사 버튼을 가로로 배치
 */
const StyleCodeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

/**
 * 스타일 코드 텍스트 스타일드 컴포넌트
 * - 스타일 코드 텍스트 스타일링
 */
const StyleCodeText = styled.span`
  font-size: 12px;
  color: #333;
`;

/**
 * 복사 버튼 스타일드 컴포넌트
 * - 스타일 코드 복사 버튼 스타일링
 */
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
 * 테이블 컬럼 정의
 * - No., 신청일자, 이용목적, 이용기간, 브랜드, 스타일, 사이즈, 재질/색상, 상태 등
 */
const columns: Column<UsageHistoryRow & { no: number }>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'applicationDate', label: '신청일자', width: '120px' },
  { key: 'purpose', label: '이용목적', width: '100px' },
  { key: 'usagePeriod', label: '이용기간(발송일)', width: '160px' },
  { key: 'brand', label: '브랜드', width: '100px' },
  {
    key: 'style',
    label: '스타일(코드)',
    width: '120px',
    render: (value, row) => {
      /**
       * 스타일 코드 복사 핸들러
       * - 클립보드에 스타일 코드를 복사하는 기능
       */
      const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(row.style);
          console.log('스타일 코드가 복사되었습니다:', row.style);
        } catch (err) {
          console.error('복사 실패:', err);
        }
      };

      return (
        <StyleCodeContainer>
          <StyleCodeText>{value as string}</StyleCodeText>
          <CopyButton onClick={handleCopy} title="스타일 코드 복사">
            <FaCopy size={12} />
          </CopyButton>
        </StyleCodeContainer>
      );
    },
  },
  { key: 'size', label: '사이즈', width: '80px' },
  { key: 'color', label: '재질/색상', width: '100px' },
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

/**
 * 이용 이력 테이블 컴포넌트
 * - 이용 이력 정보를 테이블 형태로 표시
 */
const UsageHistoryTable: React.FC<UsageHistoryTableProps> = ({
  data,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
}) => {
  const dataWithNo = data.map((row, idx) => ({ ...row, no: idx + 1 }));
  return (
    <CommonTable<UsageHistoryRow & { no: number }>
      columns={columns}
      data={dataWithNo}
      showCheckbox
      selectedRows={Array.from(selectedRows)}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 1000 }}
    />
  );
};

export default UsageHistoryTable;
