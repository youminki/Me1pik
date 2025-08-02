/**
 * 상세 판매 테이블(DetailsSalesTable)
 *
 * - 사용자별 상세 판매 정보를 표 형태로 렌더링
 * - 등급, 이름, 닉네임, 인스타그램, 시즌, 제품수, 구매 정보, 판매금액 등 표시
 * - 인스타그램 계정 클릭 시 상세 페이지 이동, 10행 고정 레이아웃 지원
 * - 재사용 가능한 공통 컴포넌트
 */
// src/components/Table/DetailsSalesTable.tsx
import React from 'react';
import styled from 'styled-components';

/**
 * 사용자 인터페이스
 * - 상세 판매 목록에 필요한 사용자 정보 구조
 */
export interface User {
  no: number;
  grade: string; // 등급
  name: string; // 이름
  nickname: string; // 닉네임
  instagram: string; // 계정(인스타)
  season: string; // 시즌 편집참여
  contentsCount: string; // 등록 제품수
  submitCount: string; // 구매 횟수
  average: number; // 구매 갯수
  totalSum: number; // 총 판매금액
}

/**
 * 상세 판매 테이블 props
 * - 필터링된 데이터, 편집 핸들러 등
 */
interface DetailsSalesTableProps {
  filteredData: User[];
  handleEdit: (no: number) => void;
}

/**
 * 상세 판매 테이블 컴포넌트
 * - 사용자별 상세 판매 정보를 테이블 형태로 표시
 */
const DetailsSalesTable: React.FC<DetailsSalesTableProps> = ({ filteredData, handleEdit }) => {
  return (
    <Table>
      <colgroup>
        <col style={{ width: '60px' }} /> {/* No. */}
        <col style={{ width: '60px' }} /> {/* 등급 */}
        <col style={{ width: '80px' }} /> {/* 이름 */}
        <col style={{ width: '80px' }} /> {/* 닉네임 */}
        <col style={{ width: '150px' }} /> {/* 계정(인스타) */}
        <col style={{ width: '100px' }} /> {/* 시즌 편집참여 */}
        <col style={{ width: '80px' }} /> {/* 등록 제품수 */}
        <col style={{ width: '80px' }} /> {/* 구매자 수 */}
        <col style={{ width: '80px' }} /> {/* 판매제품 수 */}
        <col style={{ width: '100px' }} /> {/* 총 판매금액 */}
      </colgroup>
      <thead>
        <TableRow>
          <Th>No.</Th>
          <Th>등급</Th>
          <Th>이름</Th>
          <Th>닉네임</Th>
          <Th>계정(인스타)</Th>
          <Th>시즌 편집참여</Th>
          <Th>등록 제품수</Th>
          <Th>구매자 수</Th>
          <Th>판매제품 수</Th>
          <Th>총 판매금액</Th>
        </TableRow>
      </thead>
      <tbody>
        {filteredData.map((user, index) => (
          <TableRow key={index}>
            <Td>{user.no}</Td>
            <Td>{user.grade}</Td>
            <Td>{user.name}</Td>
            <Td>{user.nickname}</Td>
            <TdLeft>
              <InstaContainer>
                <Avatar />
                <InstaText onClick={() => handleEdit(user.no)}>{user.instagram}</InstaText>
              </InstaContainer>
            </TdLeft>
            <Td>{user.season}</Td>
            <Td>{user.contentsCount}</Td>
            <Td>{user.submitCount}</Td>
            <Td>{user.average}</Td>
            {/* toLocaleString()을 사용해 1,840,000처럼 쉼표 표시 */}
            <Td>{user.totalSum.toLocaleString()}</Td>
          </TableRow>
        ))}
        {/* 10행 미만이면 빈 행 생성 */}
        {filteredData.length < 10 &&
          Array.from({ length: 10 - filteredData.length }).map((_, i) => (
            <TableRow key={`empty-${i}`}>
              <Td>&nbsp;</Td>
              <Td>&nbsp;</Td>
              <Td>&nbsp;</Td>
              <Td>&nbsp;</Td>
              <TdLeft>&nbsp;</TdLeft>
              <Td>&nbsp;</Td>
              <Td>&nbsp;</Td>
              <Td>&nbsp;</Td>
              <Td>&nbsp;</Td>
              <Td>&nbsp;</Td>
            </TableRow>
          ))}
      </tbody>
    </Table>
  );
};

export default DetailsSalesTable;

/**
 * 테이블 스타일드 컴포넌트
 * - 테이블 기본 스타일링
 */
const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: #ffffff;
  border: 1px solid #dddddd;
`;

const TableRow = styled.tr`
  height: 44px;
  &:nth-child(even) {
    background: #f8f9fa;
  }
  &:hover {
    background-color: #e3f2fd;
    cursor: pointer;
  }
`;

const Th = styled.th`
  text-align: center;
  vertical-align: middle;
  background-color: #eeeeee;

  font-weight: 800;
  font-size: 12px;
  color: #000000;
  border: 1px solid #dddddd;
  white-space: nowrap;
`;

const Td = styled.td`
  text-align: center;
  vertical-align: middle;

  font-weight: 400;
  font-size: 12px;
  color: #000000;
  border: 1px solid #dddddd;
  white-space: nowrap;
`;

const TdLeft = styled(Td)`
  text-align: left;
`;

const InstaContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
`;

const Avatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: #cccccc;
`;

const InstaText = styled.span`
  cursor: pointer;
  color: #007bff;

  &:hover {
    color: #0056b3;
  }
`;
