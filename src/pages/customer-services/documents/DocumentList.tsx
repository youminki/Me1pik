import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  getTermsPolicyList,
  getTermsPolicyDetail,
} from '@/api-utils/user-managements/terms/termsApi';
import CustomerServiceIcon from '@/assets/CustomerServiceIcons.svg';
import StatsSection from '@/components/stats-section';

// 스켈레톤 UI용 styled-components (불필요한 것 삭제)
const shimmer = `
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

// SkeletonTitle, SkeletonMeta 선언부 완전히 삭제

const typeToTitle: Record<string, string> = {
  notice: '공지사항',
  faq: '자주 묻는 질문',
  terms: '이용약관',
  privacy: '개인정보처리방침',
};

const typeToApiType: Record<string, string> = {
  notice: '공지사항', // 실제 API type/category에 맞게 조정 필요
  faq: 'FAQ',
  terms: '이용약관',
  privacy: '개인정보보호',
};

const typeToCategoryTabs: Record<string, { label: string; value?: string }[]> =
  {
    faq: [
      { label: '전체', value: undefined },
      { label: '서비스', value: '서비스' },
      { label: '주문/결제', value: '주문/결제' },
      { label: '배송/반품', value: '배송/반품' },
      { label: '이용권', value: '이용권' },
    ],
    notice: [
      { label: '전체', value: undefined },
      { label: '공지', value: '공지' },
      { label: '안내', value: '안내' },
    ],
    terms: [
      { label: '전체', value: undefined },
      { label: '서비스정책', value: '서비스정책' },
      { label: '판매정책', value: '판매정책' },
      { label: '환불정책', value: '환불정책' },
      { label: '기타', value: '기타' },
    ],
    privacy: [
      { label: '전체', value: undefined },
      { label: '수집항목', value: '수집항목' },
      { label: '이용목적', value: '이용목적' },
      { label: '보유기간', value: '보유기간' },
      { label: '동의/거부', value: '동의/거부' },
      { label: '기타', value: '기타' },
    ],
  };

interface TermsPolicyItem {
  id: number;
  title: string;
  type: string;
  category: string;
  content: string;
  author: string;
  createdAt: string;
}

// 스켈레톤 UI 컴포넌트 (실제 리스트 구조와 유사하게 개선)
const SkeletonList = () => (
  <ListContainer>
    {[1, 2, 3, 4].map((i) => (
      <SkeletonListItem key={i}>
        <div style={{ flex: 1 }}>
          <SkeletonQ>Q.</SkeletonQ>
          <SkeletonTitleBlock />
          <SkeletonMetaBlock />
        </div>
        <SkeletonIcon />
      </SkeletonListItem>
    ))}
  </ListContainer>
);

const SkeletonListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid #eeeeee;
  background: #fff;
`;

const SkeletonQ = styled.div`
  display: inline-block;
  width: 22px;
  height: 18px;
  border-radius: 4px;
  background: #f3f3f3;
  margin-bottom: 8px;
`;

const SkeletonTitleBlock = styled.div`
  width: 70%;
  height: 18px;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 40px, #eee 80px);
  background-size: 400px 100%;
  animation: shimmer 1.2s infinite linear;
  @keyframes shimmer {
    ${shimmer}
  }
`;

const SkeletonMetaBlock = styled.div`
  width: 40%;
  height: 14px;
  border-radius: 6px;
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 40px, #eee 80px);
  background-size: 400px 100%;
  animation: shimmer 1.2s infinite linear;
`;

const SkeletonIcon = styled.div`
  width: 32px;
  height: 20px;
  border-radius: 50%;
  background: #f3f3f3;
`;

const DocumentList: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const [list, setList] = useState<TermsPolicyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<{ [id: number]: string }>({});
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  const categoryTabs = type ? typeToCategoryTabs[type] : [];

  React.useEffect(() => {
    if (!type) return;
    setLoading(true);
    getTermsPolicyList({
      type: typeToApiType[type] || '',
      category: selectedCategory,
    })
      .then(setList)
      .finally(() => setLoading(false));
  }, [type, selectedCategory]);

  const handleClick = async (id: number) => {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    if (!detail[id]) {
      const data = await getTermsPolicyDetail(id);
      setDetail((prev) => ({ ...prev, [id]: data.content }));
    }
  };

  const title = typeToTitle[type || ''] || '문서';

  return (
    <ResponsiveContainer>
      <Header>
        <ResponsiveTitle>{title}</ResponsiveTitle>
        <Subtitle>새로운 소식 및 서비스 안내를 드립니다.</Subtitle>
      </Header>
      <StatsRow>
        <StatsSection
          visits={999}
          sales={999}
          dateRange='2024-01-01 ~ 2024-01-31'
          visitLabel='전체'
          salesLabel='최근업데이트'
        />
        <img
          src={CustomerServiceIcon}
          alt='고객센터 아이콘'
          style={{ width: 64, height: 'auto' }}
        />
      </StatsRow>
      <Divider />
      {categoryTabs.length > 0 && (
        <TabSection>
          {categoryTabs.map((tab) => (
            <TabButton
              key={tab.label}
              active={
                selectedCategory === tab.value ||
                (!selectedCategory && !tab.value)
              }
              onClick={() => setSelectedCategory(tab.value)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabSection>
      )}
      {loading ? (
        <SkeletonList />
      ) : !list.length ? (
        <EmptyContainer>데이터가 없습니다.</EmptyContainer>
      ) : (
        <ListContainer>
          {list.map((item, idx) => (
            <div key={item.id}>
              <ListItem onClick={() => handleClick(item.id)}>
                <div style={{ flex: 1 }}>
                  <ItemTitle>
                    <span style={{ fontWeight: 700, color: '#222' }}>Q. </span>
                    {item.title}
                  </ItemTitle>
                  <ItemMeta>
                    <CategoryOrange>{item.category}</CategoryOrange>
                  </ItemMeta>
                </div>
                <IconRight>
                  {/* <ArrowToggleIcon
                    direction={openId === item.id ? 'up' : 'down'}
                  /> */}
                </IconRight>
              </ListItem>
              <DetailWrapper
                isOpen={openId === item.id}
                isLast={idx === list.length - 1}
              >
                <DetailInner isOpen={openId === item.id}>
                  {detail[item.id] || (openId === item.id && '로딩 중...')}
                </DetailInner>
              </DetailWrapper>
            </div>
          ))}
        </ListContainer>
      )}
    </ResponsiveContainer>
  );
};

export default DocumentList;

const TabSection = styled.div`
  display: flex;
  gap: 8px;

  border: 1px solid #dddddd;
  background-color: #f3f3f3;
  padding: 20px;
  @media (max-width: 600px) {
    gap: 4px;
    margin-bottom: 12px;
    padding: 10px 4px;
  }
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 8px 18px;
  border-radius: 18px;
  border: 1.5px solid ${({ active }) => (active ? '#222' : '#ccc')};
  background: ${({ active }) => (active ? '#222' : '#fff')};
  color: ${({ active }) => (active ? '#fff' : '#222')};
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  @media (max-width: 600px) {
    font-size: 11px;
    padding: 6px 10px;
    border-radius: 14px;
  }
`;

const ListContainer = styled.div`
  width: 100%;
  background: #fff;
  border: 1px solid #dddddd;

  box-sizing: border-box;
  margin-top: 8px;
  margin-bottom: 24px;
  padding: 0;
  overflow: hidden;
`;

const EmptyContainer = styled(ListContainer)`
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px 16px 16px;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid #eeeeee;
  cursor: pointer;
  background: #fff;
  transition: background 0.2s;
  &:hover {
    background: #f8f8f8;
  }
  &:last-child {
    border-bottom: none;
  }
`;

const ItemTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #222;
  margin-bottom: 8px;
  @media (max-width: 600px) {
    font-size: 14px;
    margin-bottom: 6px;
  }
`;

const ItemMeta = styled.div`
  font-size: 14px;
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
  align-items: center;
  justify-content: space-between;
  @media (max-width: 600px) {
    font-size: 12px;
    gap: 8px;
    margin-bottom: 2px;
  }
`;

const CategoryOrange = styled.span`
  color: #ff9100;
  font-weight: 700;
  flex: 1;
  font-size: 14px;
  @media (max-width: 600px) {
    font-size: 12px;
  }
`;

const DetailWrapper = styled.div<{ isOpen: boolean; isLast?: boolean }>`
  max-height: ${({ isOpen }) => (isOpen ? '350px' : '0')};
  overflow: hidden;
  transition: max-height 0.45s ease;
  background: #f5f5f5;
  border-bottom: ${({ isLast }) => (isLast ? 'none' : '1px solid #eeeeee')};
`;

const DetailInner = styled.div<{ isOpen: boolean }>`
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transform: translateY(${({ isOpen }) => (isOpen ? '0' : '12px')});
  transition:
    opacity 0.45s ease,
    transform 0.45s ease,
    padding 0.45s ease;
  padding: ${({ isOpen }) => (isOpen ? '20px 16px' : '0 16px')};
  font-size: 15px;
  color: #333;
  white-space: pre-wrap;
  @media (max-width: 600px) {
    font-size: 13px;
    padding: ${({ isOpen }) => (isOpen ? '14px 8px' : '0 8px')};
  }
`;

const IconRight = styled.span`
  min-width: 32px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;
  @media (min-width: 1024px) {
    margin-bottom: 24px;
  }
`;

const ResponsiveTitle = styled.h1`
  font-weight: 800;
  font-size: 24px;
  margin: 0;
  color: #000;
  @media (min-width: 1024px) {
    font-size: 32px;
    margin-bottom: 10px;
  }
`;

const Subtitle = styled.p`
  font-size: 12px;
  line-height: 28px;
  margin: 0;
  color: #ccc;
  font-weight: 400;
  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #eee;
  margin: 30px 0;
`;

const ResponsiveContainer = styled.div`
  padding: 1rem;
  font-size: 16px;
  background: #fff;
  box-sizing: border-box;
  @media (min-width: 1024px) {
    padding: 3rem;
  }
`;
