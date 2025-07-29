// src/pages/AdminDetail.tsx

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import ListButtonDetailSubHeader, {
  DetailSubHeaderProps,
} from '@/components/Header/ListButtonDetailSubHeader';
import AdminDetailTopBoxes from '@/components/AdminDetailTopBoxes';
import ShippingTabBar from '@/components/TabBar';
import TaskHistoryTable, { TaskHistoryRow } from '@/components/Table/admin/TaskHistoryTable';
import PermissionSettingsTable, {
  PermissionGroup,
} from '@/components/Table/admin/PermissionSettingsTable';
import Pagination from '@/components/Pagination';

// 예시 제품 번호
const dummyProducts = [{ no: 5 }];

// 탭 목록
const tabs = ['작업내역', '권한설정'];

/** 작업내역 더미 데이터 */
const dummyTaskData: TaskHistoryRow[] = [
  {
    workDate: '서비스 > 제품목록 관리',
    workContent: '변경전 작업내용을 기여합니다. 관리자 내 상세 변경된 내용을 검토 및 반영',
    changedAt: '2025-03-02 00:00:00',
  },
  // 필요에 따라 추가...
];

/** 권한설정 더미 데이터 */
const dummyPermissionData: PermissionGroup[] = [
  {
    category: '관리자',
    permissions: [
      { label: '관리자 관리', checked: true },
      { label: '분석정보 목록', checked: false },
    ],
  },
  {
    category: '회원',
    permissions: [
      { label: '회원관리', checked: true },
      { label: '페이지 목록', checked: false },
      { label: '스케줄 목록', checked: false },
      { label: '판매내역', checked: false },
      { label: '정산내역', checked: true },
    ],
  },
  {
    category: '서비스',
    permissions: [
      { label: '제품목록', checked: true },
      { label: '브랜드 목록', checked: false },
      { label: '마켓 주문내역', checked: false },
      { label: '일반 주문내역', checked: false },
      { label: '대여', checked: false },
    ],
  },
  {
    category: '고객센터',
    permissions: [
      { label: '공지사항', checked: false },
      { label: '이용약관', checked: false },
      { label: '개인정보보호', checked: false },
      { label: 'FAQ', checked: false },
    ],
  },
];

const AdminDetail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 쿼리에서 현재 페이지 읽어오기
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = 10;

  const [activeTab, setActiveTab] = useState<number>(0);

  /** 서브헤더 버튼 핸들러 */
  const handleBackClick = () => navigate('/adminlist');
  const handleEditClick = () => alert('정보가 수정되었습니다!');
  const handleEndClick = () => alert('종료 처리가 완료되었습니다!');

  const detailSubHeaderProps: DetailSubHeaderProps = {
    backLabel: '목록이동',
    onBackClick: handleBackClick,
    editLabel: '정보수정',
    onEditClick: handleEditClick,
    endLabel: '삭제',
    onEndClick: handleEndClick,
  };

  /** 탭 클릭 시 activeTab 설정 + 페이지 1로 리셋 */
  const handleTabClick = (index: number) => {
    setActiveTab(index);
    const params = Object.fromEntries(searchParams.entries());
    params.page = '1';
    setSearchParams(params);
  };

  /** 현재 탭에 따른 전체 데이터 */
  const activeData = activeTab === 0 ? dummyTaskData : dummyPermissionData;
  const totalPages = Math.max(1, Math.ceil(activeData.length / pageSize));

  /** 페이지에 맞춰 데이터 슬라이스 */
  const sliceData = <T,>(data: T[]): T[] => data.slice((page - 1) * pageSize, page * pageSize);

  /** 테이블 렌더링 */
  const renderTable = () => {
    if (activeTab === 0) {
      const sliced = sliceData(dummyTaskData);
      return <TaskHistoryTable data={sliced} />;
    } else {
      const sliced = sliceData(dummyPermissionData);
      return <PermissionSettingsTable data={sliced} />;
    }
  };

  return (
    <Container>
      <HeaderRow>
        <Title>관리자 상세</Title>
      </HeaderRow>

      <ListButtonDetailSubHeader {...detailSubHeaderProps} />

      <ProductNumberWrapper>
        <ProductNumberLabel>번호</ProductNumberLabel>
        <ProductNumberValue>{dummyProducts[0].no}</ProductNumberValue>
      </ProductNumberWrapper>

      <AdminDetailTopBoxesWrapper>
        <AdminDetailTopBoxes />
      </AdminDetailTopBoxesWrapper>

      <MiddleDivider />

      <TabBarWrapper>
        <ShippingTabBar tabs={tabs} activeIndex={activeTab} onTabClick={handleTabClick} />
      </TabBarWrapper>

      {renderTable()}

      <FooterRow>
        <Pagination totalPages={totalPages} />
      </FooterRow>
    </Container>
  );
};

export default AdminDetail;

/* ====================== Styled Components ====================== */

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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Title = styled.h1`
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: #000000;
`;

const ProductNumberWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 10px 0;
  margin-top: 34px;
`;

const ProductNumberLabel = styled.div`
  font-weight: 700;
  font-size: 12px;
  color: #000000;
`;

const ProductNumberValue = styled.div`
  font-weight: 900;
  font-size: 12px;
  color: #000000;
`;

const AdminDetailTopBoxesWrapper = styled.div`
  width: 100%;
  margin-bottom: 24px;
`;

const MiddleDivider = styled.hr`
  width: 100%;
  border: 0;
  border-top: 1px dashed #ddd;
  margin: 12px 0;
`;

const TabBarWrapper = styled.div`
  width: 100%;
`;

const FooterRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 24px;
`;
