/**
 * 개인 평가 테이블(PersonalEvaluationTable)
 *
 * - 사용자별 개인 평가 정보를 표 형태로 렌더링
 * - 이용형태, 제품상태, 서비스 품질, 이용 기간, 브랜드, 스타일, 사이즈, 색상 등 표시
 * - 스타일 품번 복사 기능, 상태별 뱃지 표시, 체크박스 선택 기능 지원
 * - 재사용 가능한 공통 컴포넌트
 */
// src/components/Table/user/PersonalEvaluationTable.tsx
import React from 'react';
import CommonTable, { Column } from '@/components/CommonTable';
import StatusBadge from '@/components/Common/StatusBadge';
import { getStatusBadge } from '@/utils/statusUtils';
import styled from 'styled-components';
import { FaCopy } from 'react-icons/fa';

/**
 * 개인 평가 행 인터페이스
 * - 개인 평가에 필요한 행 데이터 구조
 */
export interface PersonalEvaluationRow {
  no: number; // No.
  usageType: string; // 이용형태
  productNumber: string; // 제품번호
  serviceQuality: string; // 서비스 품질
  usagePeriod: string; // 이용 기간
  brand: string; // 브랜드
  style: string; // 스타일 (품번)
  size: string; // 사이즈
  color: string; // 제품색상
  [key: string]: unknown;
}

/**
 * 개인 평가 테이블 props
 * - 데이터, 선택 상태, 선택 이벤트 등
 */
interface PersonalEvaluationTableProps {
  data: PersonalEvaluationRow[];
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: PersonalEvaluationRow, checked: boolean) => void;
}

/**
 * 스타일 품번 컨테이너 스타일드 컴포넌트
 * - 스타일 품번과 복사 버튼을 가로로 배치
 */
const StyleCodeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

/**
 * 스타일 품번 텍스트 스타일드 컴포넌트
 * - 스타일 품번 텍스트 스타일링
 */
const StyleCodeText = styled.span`
  font-size: 12px;
  color: #333;
`;

/**
 * 복사 버튼 스타일드 컴포넌트
 * - 스타일 품번 복사 버튼 스타일링
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
 * - No., 이용형태, 제품상태, 서비스 품질, 이용 기간, 브랜드, 스타일, 사이즈, 색상 등
 */
const columns: Column<PersonalEvaluationRow>[] = [
  { key: 'no', label: 'No.', width: '60px' },
  { key: 'usageType', label: '이용형태', width: '100px' },
  {
    key: 'productNumber',
    label: '제품상태',
    width: '100px',
    render: (v) => {
      const badge = getStatusBadge(v as string);
      return <StatusBadge style={{ background: badge.background }}>{badge.label}</StatusBadge>;
    },
  },
  { key: 'serviceQuality', label: '서비스 품질', width: '100px' },
  { key: 'usagePeriod', label: '이용 기간', width: '100px' },
  { key: 'brand', label: '브랜드', width: '100px' },
  {
    key: 'style',
    label: '스타일 (품번)',
    width: '120px',
    render: (value, row) => {
      const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(row.style);
          console.log('스타일 품번이 복사되었습니다:', row.style);
        } catch (err) {
          console.error('복사 실패:', err);
        }
      };

      return (
        <StyleCodeContainer>
          <StyleCodeText>{value as string}</StyleCodeText>
          <CopyButton onClick={handleCopy} title="스타일 품번 복사">
            <FaCopy size={12} />
          </CopyButton>
        </StyleCodeContainer>
      );
    },
  },
  { key: 'size', label: '사이즈', width: '80px' },
  { key: 'color', label: '제품색상', width: '80px' },
];

/**
 * 스타일 품번 복사 핸들러
 * - 클립보드에 스타일 품번을 복사하는 기능
 */

/**
 * 개인 평가 테이블 컴포넌트
 * - 개인 평가 정보를 테이블 형태로 표시
 */
const PersonalEvaluationTable: React.FC<PersonalEvaluationTableProps> = ({
  data,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
}) => {
  return (
    <CommonTable<PersonalEvaluationRow>
      columns={columns}
      data={data}
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

export default PersonalEvaluationTable;
