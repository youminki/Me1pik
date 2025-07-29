import React from 'react';
import { Column } from 'src/components/CommonTable';
import AccountCell from 'src/components/Table/AccountCell';
import GenericTable from './GenericTable';
import StatusBadge from 'src/components/Common/StatusBadge';
import { getStatusBadge } from '@utils/statusUtils';

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

interface UserTableProps {
  filteredData: User[];
  handleEdit: (no: number) => void;
  selectedRows: Set<number>;
  setSelectedRows: React.Dispatch<React.SetStateAction<Set<number>>>;
  isLoading?: boolean; // 추가
}

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

const UserTable: React.FC<UserTableProps> = ({
  filteredData,
  handleEdit,
  selectedRows,
  setSelectedRows,
  isLoading,
}) => {
  // handleEdit을 row에 추가 (GenericTable의 processRow로 대체)
  const processRow = React.useCallback((user: User) => ({ ...user, handleEdit }), [handleEdit]);

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
