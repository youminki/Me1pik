// src/components/OrderTable.tsx
import React, { useCallback } from 'react';
import StatusBadge from 'src/components/Common/StatusBadge';
import type { Column } from '@components/CommonTable';
import CommonTable from '@components/CommonTable'; // default import
import { AccountContainer, ProfileCircle, AccountText } from '@components/Common/Profile';
import { getStatusBadge } from 'src/utils/statusUtils';

/** 주문 인터페이스 */
export interface Order {
  no: number; // No.
  orderDate: string; // 주문일
  buyerAccount: string; // 주문자 (계정)
  brand: string; // 브랜드
  styleCode: string; // 스타일 (행정 코드)
  size: string; // 사이즈
  productOption: string; // 제품명/옵션
  paymentMethod: string; // 결제방법
  paymentStatus: string; // 결제상태 (결제 완료, 취소일정 등)
}

/** OrderTable Props */
interface OrderTableProps {
  data: Order[]; // 또는 data: T[];
  handleEdit: (no: number) => void; // 주문자(계정) 클릭 시 이벤트
  selectedRows?: Set<number>;
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (row: Order, checked: boolean) => void;
}

function getOrderColumns<
  T extends {
    no: number;
    buyerAccount: string;
    paymentStatus: string;
    handleEdit: (no: number) => void;
  },
>(handleAccountClick: (no: number) => void): Column<T>[] {
  return [
    { key: 'no', label: 'No.', width: '50px' },
    { key: 'orderDate', label: '주문일', width: '100px' },
    {
      key: 'buyerAccount',
      label: '주문자(계정)',
      width: '150px',
      render: (v: unknown, row: T) => (
        <AccountContainer onClick={() => handleAccountClick(row.no)}>
          <ProfileCircle />
          <AccountText $clickable>{v as string}</AccountText>
        </AccountContainer>
      ),
    },
    { key: 'brand', label: '브랜드', width: '120px' },
    { key: 'styleCode', label: '스타일(품번)', width: '100px' },
    { key: 'size', label: '사이즈', width: '100px' },
    { key: 'color', label: '제품색상', width: '80px' },
    { key: 'paymentMethod', label: '결제방식', width: '80px' },
    {
      key: 'paymentStatus',
      label: '결제상태',
      width: '80px',
      render: (v: unknown) => {
        const paymentInfo = getStatusBadge(v as string);
        return (
          <StatusBadge style={{ backgroundColor: paymentInfo.background }}>
            {paymentInfo.label}
          </StatusBadge>
        );
      },
    },
  ];
}

const OrderTable: React.FC<OrderTableProps> = ({
  data,
  handleEdit,
  selectedRows = new Set(),
  onSelectAll,
  onSelectRow,
  ...props
}) => {
  // handleEdit을 각 row에 추가
  const dataWithEdit = data.map((order) => ({
    ...order,
    handleEdit,
  }));

  // useCallback으로 최적화된 핸들러 생성
  const handleAccountClick = useCallback(
    (no: number) => {
      handleEdit(no);
    },
    [handleEdit],
  );

  const columns = getOrderColumns<(typeof dataWithEdit)[0]>(handleAccountClick);
  return (
    <CommonTable
      columns={columns}
      data={dataWithEdit}
      showCheckbox
      selectedRows={Array.from(selectedRows)}
      onSelectAll={onSelectAll}
      onSelectRow={onSelectRow}
      rowKey={(row) => row.no}
      {...props}
    />
  );
};

export default OrderTable;
