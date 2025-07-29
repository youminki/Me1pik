import CommonTable, { Column } from 'src/components/CommonTable';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { commonColumns } from '@utils/commonColumns';

interface ExampleRow {
  no: number;
  name: string;
  status: string;
  createdAt: string;
  [key: string]: unknown;
}

const columns: Column<ExampleRow>[] = [
  commonColumns.no<ExampleRow>(),
  { key: 'name', label: '이름', width: '120px' },
  {
    key: 'status',
    label: '상태',
    width: '100px',

    render: (value: unknown, _row: ExampleRow, _rowIndex: number) => {
      const v = value as string;
      if (v === '활성') return <span style={{ color: 'green', fontWeight: 700 }}>● 활성</span>;
      if (v === '비활성') return <span style={{ color: 'gray' }}>비활성</span>;
      return <span style={{ color: 'orange' }}>대기</span>;
    },
  },
  commonColumns.createdAt<ExampleRow>(),
];

const longData: ExampleRow[] = Array.from({ length: 30 }).map((_, i) => ({
  no: i + 1,
  name: `사용자 ${i + 1}`,
  status: i % 3 === 0 ? '활성' : i % 3 === 1 ? '비활성' : '대기',
  createdAt: `2024-06-${String((i % 30) + 1).padStart(2, '0')}`,
}));

const data: ExampleRow[] = [
  { no: 1, name: '홍길동', status: '활성', createdAt: '2024-06-01' },
  { no: 2, name: '김민수', status: '비활성', createdAt: '2024-06-02' },
  { no: 3, name: '이영희', status: '대기', createdAt: '2024-06-03' },
];

const meta: Meta<typeof CommonTable<ExampleRow>> = {
  title: 'Common/CommonTable',
  component: CommonTable,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof CommonTable<ExampleRow>>;

export const Default: Story = {
  args: {
    columns,
    data,
    showCheckbox: true,
    emptyMessage: '데이터가 없습니다.',
  },
};

export const CustomRender: Story = {
  args: {
    columns,
    data,
    showCheckbox: false,
    emptyMessage: '데이터가 없습니다.',
  },
  parameters: {
    docs: {
      description: {
        story: '상태 컬럼에 커스텀 렌더링(색상/아이콘 등) 적용 예시',
      },
    },
  },
};

export const LongDataWithScroll: Story = {
  args: {
    columns,
    data: longData,
    showCheckbox: true,
    emptyMessage: '데이터가 없습니다.',
    style: {
      minWidth: 800,
      maxHeight: 300,
      overflowY: 'auto',
      display: 'block',
    },
  },
  parameters: {
    docs: {
      description: {
        story: '행이 많을 때 스크롤 및 minWidth 적용 예시',
      },
    },
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    showCheckbox: false,
    emptyMessage: '데이터가 없습니다.',
  },
};

export const A11yKeyboard: Story = {
  args: {
    columns,
    data,
    showCheckbox: true,
    emptyMessage: '데이터가 없습니다.',
    style: { minWidth: 600 },
  },
  parameters: {
    docs: {
      description: {
        story: '체크박스, 컬럼, 행 등 키보드 네비게이션/포커스/aria-label 등 접근성 테스트 예시',
      },
    },
  },
};
