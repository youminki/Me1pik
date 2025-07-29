import type { Column } from 'src/components/CommonTable';
import AccountCell from './AccountCell';
import StatusBadgeCell from './StatusBadgeCell';
import { getPaymentStatusBadge } from 'src/components/CommonTable/statusUtils';
import styled from 'styled-components';
import { FaCopy } from 'react-icons/fa';

const StyleCodeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const StyleCodeText = styled.span`
  font-size: 12px;
  color: #333;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s;

  &:hover {
    color: #007bff;
  }
`;

export function getOrderColumns<
  T extends {
    no: number;
    buyerAccount: string;
    paymentStatus: string;
    styleCode: string;
    handleEdit: (no: number) => void;
  },
>(): Column<T>[] {
  return [
    { key: 'no', label: 'No.', width: '50px' },
    { key: 'orderDate', label: '주문일', width: '100px' },
    {
      key: 'buyerAccount',
      label: '주문자(계정)',
      width: '150px',
      render: (v: unknown, row: T) => (
        <AccountCell value={v as string} onClick={() => row.handleEdit(row.no)} />
      ),
    },
    { key: 'brand', label: '브랜드', width: '120px' },
    {
      key: 'styleCode',
      label: '스타일(품번)',
      width: '100px',
      render: (value: unknown, row: T) => {
        const handleCopy = async (e: React.MouseEvent) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(row.styleCode);
            console.log('스타일 품번이 복사되었습니다:', row.styleCode);
          } catch (err) {
            console.error('복사 실패:', err);
          }
        };

        return (
          <StyleCodeContainer>
            <StyleCodeText>{value as string}</StyleCodeText>
            <CopyButton onClick={handleCopy} title="스타일 품번 복사">
              <FaCopy size={12} />
            </CopyButton>
          </StyleCodeContainer>
        );
      },
    },
    { key: 'size', label: '사이즈', width: '100px' },
    { key: 'color', label: '제품색상', width: '80px' },
    { key: 'paymentMethod', label: '결제방식', width: '80px' },
    {
      key: 'paymentStatus',
      label: '결제상태',
      width: '80px',
      render: (v: unknown) => {
        const paymentInfo = getPaymentStatusBadge(v as string);
        return <StatusBadgeCell status={paymentInfo.label} />;
      },
    },
  ];
}
