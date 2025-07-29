// src/components/Table/AdminTable.tsx

import React from 'react';
import styled from 'styled-components';

export interface Admin {
  no: number;
  name: string;
  team: string; // 구분
  email: string;
  status: string;
}

interface AdminTableProps {
  filteredData: Admin[];
  handleEdit?: (id: string) => void;
}

const StatusLabel = styled.span<{ status: string }>`
  display: inline-block;
  min-width: 48px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  background: ${({ status }) => (status === '정상' ? '#f4f4f4' : '#ffeaea')};
  color: ${({ status }) => (status === '정상' ? '#555' : '#e74c3c')};
  border: 1px solid ${({ status }) => (status === '정상' ? '#e0e0e0' : '#ffb3b3')};
`;

const AdminTable: React.FC<AdminTableProps> = ({ filteredData, handleEdit }) => (
  <TableWrapper>
    <Table>
      <colgroup>
        <col style={{ width: '10%' }} />
        <col style={{ width: '20%' }} />
        <col style={{ width: '15%' }} />
        <col style={{ width: '35%' }} />
        <col style={{ width: '20%' }} />
      </colgroup>
      <thead>
        <tr>
          <Th>번호</Th>
          <Th>관리자</Th>
          <Th>구분</Th>
          <Th>아이디</Th>
          <Th>상태</Th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((row) => (
          <Tr key={row.no} onClick={() => handleEdit && handleEdit(row.email)}>
            <Td style={{ textAlign: 'center' }}>{row.no}</Td>
            <Td>{row.name}</Td>
            <Td>{row.team}</Td>
            <Td>{row.email}</Td>
            <Td style={{ textAlign: 'center' }}>
              <StatusLabel status={row.status}>{row.status}</StatusLabel>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  </TableWrapper>
);

const TableWrapper = styled.div`
  width: 100%;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  overflow-x: hidden;
  border: 1px solid #eee;
`;

const Table = styled.table`
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
  background: #fff;
  table-layout: fixed;
`;

const Th = styled.th`
  background: #fafafa;
  font-weight: 700;
  font-size: 14px;
  color: #222;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  text-align: center;
`;

const Td = styled.td`
  font-size: 14px;
  color: #222;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  text-align: center;

  &:nth-child(2),
  &:nth-child(3),
  &:nth-child(4) {
    text-align: left;
    padding-left: 16px;
  }
`;

const Tr = styled.tr`
  background: #fff;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
  }
`;

export default AdminTable;
