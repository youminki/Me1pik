// src/pages/Sales/SalesDetail.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCopy } from 'react-icons/fa';

import SettingsDetailSubHeader, {
  DetailSubHeaderProps,
} from '@components/Header/SettingsDetailSubHeader';
import ShippingTabBar from '@components/TabBar';
import ReusableModal2 from '@components/TwoButtonModal';
import SalesDetailTopBoxes from '@components/SalesDetailTopBoxes';

interface SalesDetailProps {
  isCreate?: boolean;
}

interface OrderItem {
  no: number;
  date: string;
  account: string;
  avatarUrl: string;
  brand: string;
  styleCode: string;
  size: string;
  color: string;
  amount: number;
  status: string;
}

const SalesDetail: React.FC<SalesDetailProps> = ({ isCreate = false }) => {
  const navigate = useNavigate();
  const { no } = useParams<{ no: string }>();
  const numericNo = isCreate ? undefined : Number(no);

  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 더미 주문 데이터
  const [orders] = useState<OrderItem[]>([
    {
      no: 16,
      date: '2024-12-12',
      account: 'styleweex',
      avatarUrl: '/avatars/styleweex.png',
      brand: 'CC Collect',
      styleCode: 'C244WBSE231',
      size: '55 (M)',
      color: 'BLACK',
      amount: 240000,
      status: '결제완료',
    },
    {
      no: 15,
      date: '2024-12-12',
      account: 'jmert__eunrae',
      avatarUrl: '/avatars/default.png',
      brand: 'MOJO.S.PHINE',
      styleCode: 'J24MSE009',
      size: '55 (M)',
      color: 'PINK',
      amount: 180000,
      status: '결제완료',
    },
    {
      no: 14,
      date: '2024-12-12',
      account: 'jimmy.stagram',
      avatarUrl: '/avatars/default.png',
      brand: 'MOJO.S.PHINE',
      styleCode: 'J24MSE009',
      size: '55 (M)',
      color: 'BLACK',
      amount: 148000,
      status: '결제완료',
    },
    {
      no: 13,
      date: '2024-12-12',
      account: 'mikyooon___k',
      avatarUrl: '/avatars/default.png',
      brand: 'SATIN',
      styleCode: 'C244WT003',
      size: '55 (M)',
      color: 'BLACK',
      amount: 200000,
      status: '결제완료',
    },
    {
      no: 12,
      date: '2024-12-12',
      account: 'olivs0852193',
      avatarUrl: '/avatars/default.png',
      brand: 'ZOOC',
      styleCode: 'Z244MSE015',
      size: '55 (M)',
      color: 'PINK',
      amount: 150000,
      status: '결제완료',
    },
    {
      no: 11,
      date: '2024-12-12',
      account: 'blossom620',
      avatarUrl: '/avatars/default.png',
      brand: 'ZOOC',
      styleCode: 'Z244MSE015',
      size: '55 (M)',
      color: 'BLACK',
      amount: 148000,
      status: '결제완료',
    },
    {
      no: 10,
      date: '2024-12-12',
      account: 'blossom520',
      avatarUrl: '/avatars/default.png',
      brand: 'MOJO.S.PHINE',
      styleCode: 'J24MSE009',
      size: '55 (M)',
      color: 'LIGHT BEIGE',
      amount: 210000,
      status: '결제완료',
    },
  ]);

  const handleBack = () => navigate(-1);
  const handleSave = () => setIsModalOpen(true);
  const handleDelete = () => setIsModalOpen(true);
  const handleConfirm = () => {
    setIsModalOpen(false);
    navigate(-1);
  };

  const detailProps: DetailSubHeaderProps = {
    backLabel: '뒤로',
    onBackClick: handleBack,
    editLabel: isCreate ? '등록' : '저장',
    onEditClick: handleSave,
    endLabel: isCreate ? '취소' : '삭제',
    onEndClick: handleDelete,
  };

  const handleCopyStyleCode = async (styleCode: string) => {
    try {
      await navigator.clipboard.writeText(styleCode);
      console.log('스타일 품번이 복사되었습니다:', styleCode);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  return (
    <Container>
      <HeaderRow>
        <Title>{isCreate ? '판매 등록' : `판매 상세 (${numericNo})`}</Title>
      </HeaderRow>

      <SettingsDetailSubHeader {...detailProps} />

      <ProductNumberWrapper>
        <ProductNumberLabel>번호</ProductNumberLabel>
        <ProductNumberValue>{numericNo}</ProductNumberValue>
      </ProductNumberWrapper>

      <SalesDetailTopBoxes />

      <DividerDashed />

      <ShippingTabBar tabs={['상세내역']} activeIndex={activeTab} onTabClick={setActiveTab} />

      {activeTab === 0 && (
        <DetailSection>
          <Table>
            <colgroup>
              <col style={{ width: '50px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
            </colgroup>
            <Thead>
              <TableRow>
                <Th>No.</Th>
                <Th>주문일</Th>
                <Th>주문자 (계정)</Th>
                <Th>브랜드</Th>
                <Th>스타일 (품번)</Th>
                <Th>사이즈</Th>
                <Th>제품색상</Th>
                <Th>결제금액</Th>
                <Th>결제상태</Th>
              </TableRow>
            </Thead>
            <Tbody>
              {orders.map((o) => (
                <TableRow key={o.no}>
                  <TdCenter>{o.no}</TdCenter>
                  <TdCenter>{o.date}</TdCenter>
                  <TdLeft>
                    <InstaContainer>
                      <Avatar src={o.avatarUrl} alt={o.account} />
                      <AccountText>{o.account}</AccountText>
                    </InstaContainer>
                  </TdLeft>
                  <TdCenter>{o.brand}</TdCenter>
                  <TdCenter>
                    <StyleCodeContainer>
                      <StyleCodeText>{o.styleCode}</StyleCodeText>
                      <CopyButton
                        onClick={() => handleCopyStyleCode(o.styleCode)}
                        title="스타일 품번 복사"
                      >
                        <FaCopy size={12} />
                      </CopyButton>
                    </StyleCodeContainer>
                  </TdCenter>
                  <TdCenter>{o.size}</TdCenter>
                  <TdCenter>{o.color}</TdCenter>
                  <TdCenter>{o.amount.toLocaleString()}원</TdCenter>
                  <TdCenter>{o.status}</TdCenter>
                </TableRow>
              ))}
            </Tbody>
          </Table>
        </DetailSection>
      )}

      <ReusableModal2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="확인"
      >
        저장하시겠습니까?
      </ReusableModal2>
    </Container>
  );
};

export default SalesDetail;

/* ===== styled-components ===== */

const Container = styled.div`
  width: 100%;
  height: 100%;
  max-width: 100vw;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  overflow: hidden;
  padding: 12px 8px 0 8px;

  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 4px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: 700;
`;

const ProductNumberWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 16px 0;
`;

const ProductNumberLabel = styled.div`
  font-weight: 700;
  font-size: 12px;
`;

const ProductNumberValue = styled.div`
  font-weight: 900;
  font-size: 12px;
`;

const DividerDashed = styled.hr`
  border: none;
  border-top: 1px dashed #dddddd;
  margin: 30px 0;
`;

const DetailSection = styled.div`
  overflow-x: auto;
`;

/* 테이블 */
const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background-color: #ffffff;
  border: 1px solid #dddddd;
`;

const Thead = styled.thead`
  background-color: #eeeeee;
`;

const Tbody = styled.tbody``;

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

const Th = styled.th``;

const TdCenter = styled.td`
  text-align: center;
  vertical-align: middle;
  padding: 12px 16px;
  border-right: 1px solid #dddddd;
`;

const TdLeft = styled.td`
  text-align: left;
  vertical-align: middle;
  padding: 12px 16px;
  border-right: 1px solid #dddddd;
`;

const InstaContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
`;

const AccountText = styled.span`
  font-size: 14px;
  color: #333;
`;

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
