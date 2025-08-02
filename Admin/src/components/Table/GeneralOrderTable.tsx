import React from 'react';
import CommonTable from '@components/CommonTable';
import { getOrderColumns } from '@components/Table/orderColumns';

export interface GeneralOrderListItem {
  no: number;
  orderDate: string;
  buyerAccount: string;
  brand: string;
  styleCode: string;
  size: string;
  color: string;
  paymentMethod: string;
  paymentStatus: string;
}

interface GeneralOrderListTableProps {
  filteredData: GeneralOrderListItem[];
  handleEdit: (no: number) => void;
}

/**
 * 일반 주문 목록 테이블
 *
 * 주문 데이터와 편집 핸들러를 받아 테이블을 렌더링합니다.
 */
const GeneralOrderListTable: React.FC<GeneralOrderListTableProps> = ({
  filteredData,
  handleEdit,
}) => {
  // 각 row에 handleEdit 추가
  const dataWithEdit = filteredData.map((item) => ({ ...item, handleEdit }));

  const columns = getOrderColumns();

  return (
    <CommonTable
      columns={columns}
      data={dataWithEdit}
      rowKey={(row) => row.no}
      emptyMessage="데이터가 없습니다."
      style={{ minWidth: 900 }}
    />
  );
};

export default GeneralOrderListTable;
