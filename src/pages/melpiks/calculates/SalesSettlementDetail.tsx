import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// 타입 정의
interface Sale {
  product: string;
  buyer: string;
  price: string;
  settlement: string;
}

interface SettlementDetail {
  id: number;
  date: string;
  time: string;
  amount: string;
  deduction: string;
  salesList: Sale[];
}

// mock fetch 함수
async function fetchSettlementDetail(
  id: string
): Promise<SettlementDetail | null> {
  const settlements: SettlementDetail[] = [
    {
      id: 1,
      date: '2025-01-15',
      time: '2025년 1월 24일 (금) - 18:30:40',
      amount: '86,400',
      deduction: '-3,600원',
      salesList: [
        {
          product: 'JNS2219 (55) - SANDRO',
          buyer: 'styleweex01',
          price: '386,000',
          settlement: '10,000',
        },
        {
          product: 'JNS2219 (55) - SANDRO',
          buyer: 'styleweex01',
          price: '386,000',
          settlement: '10,000',
        },
        {
          product: 'JNS2219 (55) - SANDRO',
          buyer: 'styleweex01',
          price: '386,000',
          settlement: '10,000',
        },
        {
          product: 'JNS2219 (55) - SANDRO',
          buyer: 'styleweex01',
          price: '386,000',
          settlement: '10,000',
        },
      ],
    },
  ];
  return settlements.find((s) => s.id.toString() === id) ?? null;
}

// react-query 훅
function useSettlementDetail(id: string) {
  return useQuery<SettlementDetail | null>({
    queryKey: ['settlementDetail', id],
    queryFn: () => fetchSettlementDetail(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

const SalesSettlementDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: settlement, isLoading } = useSettlementDetail(id);

  if (isLoading)
    return (
      <Container>
        <LoadingSpinner label='정산 상세 정보를 불러오는 중입니다...' />
      </Container>
    );
  if (!settlement) {
    return <Container>정산 내역을 찾을 수 없습니다.</Container>;
  }

  return (
    <>
      <UnifiedHeader variant='twoDepth' />
      <Container>
        <Section>
          <InputField>
            <Label>정산회차</Label>
            <Input readOnly value={settlement.date} />
          </InputField>
          <InputField>
            <Label>정산일시</Label>
            <Input readOnly value={settlement.time} />
          </InputField>
          <InputField>
            <Label>정산금액</Label>
            <Input readOnly value={settlement.amount} />
          </InputField>
        </Section>
        <SectionRow>
          <InputField>
            <Label>정산금액</Label>
            <Input readOnly value={settlement.amount} />
          </InputField>
          <InputField>
            <Label>공제세액 (4%)</Label>
            <Input readOnly value={settlement.deduction} />
          </InputField>
        </SectionRow>
        <Note>
          ※ 정산금액은 세액 공제 및 신고비용을 제외한 나머지 금액입니다.
        </Note>
        <Divider />
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <ThRight>판매제품 / 구매자 정보</ThRight>
                <ThLeft>결제금액 / 정산금액</ThLeft>
              </tr>
            </thead>
            <tbody>
              {settlement.salesList.map((sale, index) => (
                <tr key={index}>
                  <TdLeft>
                    <ProductName isBold={sale.product.includes('JNS2219')}>
                      {sale.product}
                    </ProductName>
                    <SubInfo>{`${settlement.date} - (구매자: ${sale.buyer})`}</SubInfo>
                  </TdLeft>
                  <TdRight>
                    {sale.price}
                    <SubInfo isBold>{sale.settlement}</SubInfo>
                  </TdRight>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </Container>
    </>
  );
};

export default SalesSettlementDetail;

// styled-components 정의를 컴포넌트 정의 위로 이동
const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  padding: 1rem;
`;

const SectionRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 20px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

const InputField = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  margin-top: 30px;
`;

const Label = styled.label`
  font-weight: 700;
  font-size: 10px;
  color: #000;
  margin-bottom: 10px;
`;

const Input = styled.input`
  padding: 21px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 800;
  font-size: 13px;
  color: #000;
  background: #f9f9f9;
`;

const Note = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 13px;
  color: #999999;
  margin-top: 20px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin: 30px 0;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
`;

const ThRight = styled.th`
  white-space: nowrap;
  text-align: left;
  font-weight: 800;
  font-size: 10px;
  padding: 15px 20px;
  color: #000;
  background-color: #dddddd;
`;

const ThLeft = styled.th`
  white-space: nowrap;
  text-align: right;
  font-weight: 800;
  font-size: 10px;
  padding: 15px 20px;
  color: #000;
  background-color: #dddddd;
`;

const TdLeft = styled.td`
  white-space: nowrap;
  padding: 20px;
  border: 1px solid #dddddd;
  text-align: left;
  font-weight: 800;
  font-size: 12px;
  line-height: 13px;
  color: #000000;
`;

const TdRight = styled.td`
  white-space: nowrap;
  padding: 20px;
  border: 1px solid #dddddd;
  font-weight: 400;
  font-size: 12px;
  line-height: 13px;
  text-align: right;
  color: #000000;
`;

const ProductName = styled.span<{ isBold?: boolean }>`
  font-weight: ${({ isBold }) => (isBold ? 800 : 400)};
`;

const SubInfo = styled.p<{ isBold?: boolean }>`
  white-space: nowrap;
  font-weight: ${({ isBold }) => (isBold ? 800 : 400)};
  font-size: 12px;
  line-height: 13px;
  color: #000;
  margin-top: 4px;
`;
