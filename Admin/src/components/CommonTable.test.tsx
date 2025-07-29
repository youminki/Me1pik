import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommonTable, { Column } from './CommonTable';
import { ThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';

type TestRow = { no: number; name: string };

const columns: Column<TestRow>[] = [
  { key: 'no', label: 'No.' },
  { key: 'name', label: '이름' },
];

const data: TestRow[] = [
  { no: 1, name: '홍길동' },
  { no: 2, name: '김철수' },
];

describe('CommonTable', () => {
  const renderWithTheme = (ui: React.ReactElement) =>
    render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

  it('컬럼 헤더와 데이터가 정상적으로 렌더링된다', () => {
    renderWithTheme(<CommonTable columns={columns} data={data} rowKey={(row) => row.no} />);
    expect(screen.getByText('No.')).toBeInTheDocument();
    expect(screen.getByText('이름')).toBeInTheDocument();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('김철수')).toBeInTheDocument();
  });

  it('showCheckbox가 true면 체크박스가 렌더링된다', () => {
    renderWithTheme(
      <CommonTable columns={columns} data={data} rowKey={(row) => row.no} showCheckbox />,
    );
    // 헤더 체크박스
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
  });

  it('onSelectAll, onSelectRow 이벤트가 정상 동작한다', () => {
    const onSelectAll = jest.fn();
    const onSelectRow = jest.fn();
    renderWithTheme(
      <CommonTable
        columns={columns}
        data={data}
        rowKey={(row) => row.no}
        showCheckbox
        onSelectAll={onSelectAll}
        onSelectRow={onSelectRow}
      />,
    );
    // 헤더 체크박스 클릭
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(onSelectAll).toHaveBeenCalled();
    // 첫 번째 row 체크박스 클릭
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    expect(onSelectRow).toHaveBeenCalled();
  });
});
