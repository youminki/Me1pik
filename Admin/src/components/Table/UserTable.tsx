import React from 'react';
import { Column } from 'src/components/CommonTable';
import AccountCell from 'src/components/Table/AccountCell';
import GenericTable from './GenericTable';
import StatusBadge from 'src/components/Common/StatusBadge';
import { getStatusBadge } from '@utils/statusUtils';

/**
 * 사용자 테이블(UserTable)
 *
 * - 사용자 정보를 표 형태로 렌더링
 * - 등급, 이름, 닉네임, 이메일, 팔로잉/팔로우, 서비스 지역, 가입일자 등 표시
 * - 이메일 계정 클릭 시 상세 페이지 이동, 체크박스 선택 기능 지원
 * - 재사용 가능한 공통 컴포넌트
 */

/**
 * 사용자 인터페이스
 * - 사용자 목록에 필요한 사용자 정보 구조
 */
export interface User {
  no: number;
  email: string;
  status: string;
  grade: string;
  name: string;
  nickname: string;
  instagram: string;
  followingFollower: string;
  serviceArea: string;
  joinDate: string;
  handleEdit?: (no: number) => void;
  [key: string]: unknown;
}

/**
 * 사용자 테이블 props
 * - 필터링된 데이터, 편집 핸들러, 선택 상태, 로딩 상태 등
 */
interface UserTableProps {
  filteredData: User[];
  handleEdit: (no: number) => void;
  selectedRows: Set<number>;
  setSelectedRows: React.Dispatch<React.SetStateAction<Set<number>>>;
  isLoading?: boolean; // 추가
}

/**
 * 테이블 컬럼 정의
 * - No., 등급, 이름, 닉네임, 이메일, 팔로잉/팔로우, 서비스 지역, 가입일자 등
 */
const columns: Column<User>[] = [
  // 체크박스는 CommonTable의 showCheckbox로 처리하므로 컬럼에서 제외
  { key: 'no', label: 'No.', width: '50px' },
  {
    key: 'grade',
    label: '등급',
    width: '80px',
    render: (v) => {
      const badge = getStatusBadge(v as string);
      return (
        <StatusBadge background={badge.background} color="#fff">
          {badge.label}
        </StatusBadge>
      );
    },
  },
  { key: 'name', label: '이름', width: '80px' },
  { key: 'nickname', label: '닉네임', width: '80px' },
  {
    key: 'email',
    label: '계정(이메일)',
    width: '150px',
    render: (v, row) => (
      <AccountCell value={v as string} onClick={() => row.handleEdit?.(row.no)} />
    ),
  },
  { key: 'followingFollower', label: '팔로잉/팔로우', width: '100px' },
  { key: 'serviceArea', label: '서비스 지역', width: '100px' },
  { key: 'joinDate', label: '가입일자', width: '100px' },
];

/**
 * 사용자 테이블 컴포넌트
 * - 사용자 정보를 테이블 형태로 표시
 */
const UserTable: React.FC<UserTableProps> = ({
  filteredData,
  handleEdit,
  selectedRows,
  setSelectedRows,
  isLoading,
}) => {
  /**
   * handleEdit을 row에 추가 (GenericTable의 processRow로 대체)
   * - 사용자 클릭 시 상세/수정 진입이 가능하도록 합니다.
   */
  const processRow = React.useCallback((user: User) => ({ ...user, handleEdit }), [handleEdit]);

  /**
   * 전체 선택 핸들러
   * - 체크박스 전체 선택/해제 시 선택 상태 업데이트
   */
  const onSelectAll = React.useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedRows(new Set(filteredData.map((user) => user.no)));
      } else {
        setSelectedRows(new Set());
      }
    },
    [filteredData, setSelectedRows],
  );

  /**
   * 개별 선택 핸들러
   * - 개별 체크박스 선택/해제 시 선택 상태 업데이트
   */
  const onSelectRow = React.useCallback(
    (row: User, checked: boolean) => {
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        if (checked) newSet.add(row.no);
        else newSet.delete(row.no);
        return newSet;
      });
    },
    [setSelectedRows],
  );

  return (
    <GenericTable<User>
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

export default UserTable;
