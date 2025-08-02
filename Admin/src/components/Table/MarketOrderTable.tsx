// src/components/Table/MarketOrderTable.tsx

import React from 'react';
import CommonTable from '@components/CommonTable';
import { getOrderColumns } from '@components/Table/orderColumns';

export interface MarketOrderListItem {
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

interface MarketOrderListTableProps {
  filteredData: MarketOrderListItem[];
  handleEdit: (no: number) => void;
}

const MarketOrderListTable: React.FC<MarketOrderListTableProps> = ({
  filteredData,
  handleEdit,
}) => {
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

export default MarketOrderListTable;
