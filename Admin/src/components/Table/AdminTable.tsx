/**
 * 관리자 테이블(AdminTable)
 *
 * - 관리자 정보를 표 형태로 렌더링
 * - 번호, 관리자, 구분, 아이디, 상태 등 표시
 * - 행 클릭 시 상세 페이지 이동, 상태별 스타일링 지원
 * - 재사용 가능한 공통 컴포넌트
 */

// src/components/Table/AdminTable.tsx

import React from 'react';
import styled from 'styled-components';

/**
 * 관리자 인터페이스
 * - 관리자 목록에 필요한 관리자 정보 구조
 */
export interface Admin {
  no: number;
  name: string;
  team: string; // 구분
  email: string;
  status: string;
}

/**
 * 관리자 테이블 props
 * - 필터링된 데이터, 편집 핸들러 등
 */
interface AdminTableProps {
  filteredData: Admin[];
  handleEdit?: (id: string) => void;
}

/**
 * 상태 라벨 스타일드 컴포넌트
 * - 관리자 상태에 따른 조건부 스타일링
 */
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

/**
 * 관리자 테이블 컴포넌트
 * - 관리자 정보를 테이블 형태로 표시
 */
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

/**
 * 테이블 래퍼 스타일드 컴포넌트
 * - 테이블 컨테이너 스타일링
 */
const TableWrapper = styled.div`
  width: 100%;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  overflow-x: hidden;
  border: 1px solid #eee;
`;

/**
 * 테이블 스타일드 컴포넌트
 * - 테이블 기본 스타일링
 */
const Table = styled.table`
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
  background: #fff;
  table-layout: fixed;
`;

/**
 * 테이블 헤더 스타일드 컴포넌트
 * - 테이블 헤더 스타일링
 */
const Th = styled.th`
  background: #fafafa;
  font-weight: 700;
  font-size: 14px;
  color: #222;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  text-align: center;
`;

/**
 * 테이블 셀 스타일드 컴포넌트
 * - 테이블 셀 스타일링
 */
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

/**
 * 테이블 행 스타일드 컴포넌트
 * - 테이블 행 스타일링
 */
const Tr = styled.tr`
  background: #fff;
  cursor: pointer;

  &:hover {
    background: #f8f9fa;
  }
`;

export default AdminTable;
