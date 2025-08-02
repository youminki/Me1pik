/**
 * 설정 상세 테이블(SettingsDetailTable)
 *
 * - 설정 정보를 편집 가능한 테이블 형태로 렌더링
 * - 제목, 구분, 내용 필드의 실시간 편집 및 변경 이벤트 지원
 * - 부모 컴포넌트로부터 전달받은 옵션으로 구분 선택 지원
 * - 재사용 가능한 공통 컴포넌트
 */
// src/components/Table/Setting/SettingsDetailTable.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TabItem } from '@components/Header/SearchSubHeader';

/**
 * 설정 상세 행 인터페이스
 * - 설정 상세 정보에 필요한 행 데이터 구조
 */
export interface SettingsDetailRow {
  title: string;
  category: string;
  content: string;
}

/**
 * 설정 상세 테이블 props
 * - 데이터, 변경 이벤트, 선택 옵션 등
 */
interface SettingsDetailTableProps {
  data: SettingsDetailRow[];
  onChange?: (row: SettingsDetailRow) => void;
  // 부모에서 전달받은 TabItem 배열을 통해 SelectBox 옵션 구성 (프롭스로 반드시 전달)
  selectOptions: TabItem[];
}

/**
 * 설정 상세 테이블 컴포넌트
 * - 설정 정보를 편집 가능한 테이블 형태로 표시
 */
const SettingsDetailTable: React.FC<SettingsDetailTableProps> = ({
  data,
  onChange,
  selectOptions,
}) => {
  const [row, setRow] = useState<SettingsDetailRow>(
    data[0] ?? { title: '', category: '', content: '' },
  );

  useEffect(() => {
    if (data[0]) {
      setRow(data[0]);
    }
  }, [data]);

  /**
   * 제목 변경 핸들러
   * - 제목 입력 필드 변경 시 상태 업데이트 및 부모 컴포넌트에 알림
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedRow = { ...row, title: e.target.value };
    setRow(updatedRow);
    if (onChange) onChange(updatedRow);
  };

  /**
   * 구분 변경 핸들러
   * - 구분 선택 필드 변경 시 상태 업데이트 및 부모 컴포넌트에 알림
   */
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedRow = { ...row, category: e.target.value };
    setRow(updatedRow);
    if (onChange) onChange(updatedRow);
  };

  /**
   * 내용 변경 핸들러
   * - 내용 입력 필드 변경 시 상태 업데이트 및 부모 컴포넌트에 알림
   */
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedRow = { ...row, content: e.target.value };
    setRow(updatedRow);
    if (onChange) onChange(updatedRow);
  };

  return (
    <TableContainer>
      <StyledTable>
        <tbody>
          {/* 1) 제목 */}
          <TableRow>
            <Th>제목</Th>
            <Td>
              <InputBox type="text" value={row.title} onChange={handleTitleChange} />
            </Td>
          </TableRow>

          {/* 2) 구분 - 부모에서 전달받은 selectOptions 사용 */}
          <TableRow>
            <Th>구분</Th>
            <Td>
              <SelectBox value={row.category} onChange={handleCategoryChange}>
                {selectOptions.map((option) => (
                  <option key={option.label} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </SelectBox>
            </Td>
          </TableRow>

          {/* 3) 내용 */}
          <TableRow>
            <Th>내용</Th>
            <Td>
              <TextArea value={row.content} onChange={handleContentChange} />
            </Td>
          </TableRow>
        </tbody>
      </StyledTable>
    </TableContainer>
  );
};

export default SettingsDetailTable;

/**
 * 테이블 컨테이너 스타일드 컴포넌트
 * - 테이블 컨테이너 스타일링
 */
const TableContainer = styled.div`
  min-width: 834px;
  min-height: 600px;
  max-width: 100vw;
  overflow-x: auto;
  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 8px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;

  font-size: 12px;
  line-height: 23px;
  color: #000000;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #dddddd;
  &:last-child {
    border-bottom: none;
  }
  &:nth-child(even) {
    background: #f8f9fa;
  }
  &:hover {
    background-color: #e3f2fd;
    cursor: pointer;
  }
`;

const Th = styled.th`
  width: 120px;
  padding: 12px 16px;
  background: #f5f6fa;
  font-weight: bold;
  text-align: left;
  border-right: 1px solid #dddddd;
`;

const Td = styled.td`
  padding: 12px 16px;
  border-right: 1px solid #dddddd;
  vertical-align: top;
`;

const InputBox = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
`;

const SelectBox = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 8px 12px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  resize: vertical;
`;
