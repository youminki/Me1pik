import React, { useState } from 'react';
import styled from 'styled-components';

import {
  getTermsPolicyList,
  getTermsPolicyDetail,
} from '@/api-utils/user-managements/terms/termsApi';
import CustomerServiceIcon from '@/assets/CustomerServiceIcons.svg';
import UnifiedHeader from '@/components/shared/headers/UnifiedHeader';
import StatsSection from '@/components/stats-section';

interface NoticeItem {
  id: number;
  title: string;
  type: string;
  category: string;
  content: string;
  createdAt: string;
}

const categoryTabs = [
  { label: '전체', value: undefined },
  { label: '공지', value: '공지' },
  { label: '안내', value: '안내' },
];

const Notice: React.FC = () => {
  const [list, setList] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<{ [id: number]: string }>({});
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );

  React.useEffect(() => {
    setLoading(true);
    getTermsPolicyList({
      type: '공지사항',
      category: selectedCategory,
    })
      .then(setList)
      .finally(() => setLoading(false));
  }, [selectedCategory]);

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

  return (
    <>
      <UnifiedHeader variant='twoDepth' title='공지사항' />
      <ResponsiveContainer>
        <Header>
          <ResponsiveTitle>공지사항</ResponsiveTitle>
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
        {loading ? (
          <LoadingContainer>로딩 중...</LoadingContainer>
        ) : !list.length ? (
          <EmptyContainer>공지사항이 없습니다.</EmptyContainer>
        ) : (
          <ListContainer>
            {list.map((item, idx) => (
              <div key={item.id}>
                <ListItem onClick={() => handleClick(item.id)}>
                  <div style={{ flex: 1 }}>
                    <ItemTitle>
                      <span style={{ fontWeight: 700, color: '#222' }}>
                        📢{' '}
                      </span>
                      {item.title}
                    </ItemTitle>
                    <ItemMeta>
                      <CategoryOrange>{item.category}</CategoryOrange>
                      <DateText>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </DateText>
                    </ItemMeta>
                  </div>
                  <IconRight>
                    <ArrowIcon>{openId === item.id ? '▲' : '▼'}</ArrowIcon>
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
    </>
  );
};

export default Notice;

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

const LoadingContainer = styled(ListContainer)`
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px 16px 16px;
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

const DateText = styled.span`
  color: #888;
  font-size: 12px;
  @media (max-width: 600px) {
    font-size: 10px;
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

const ArrowIcon = styled.span`
  font-size: 12px;
  color: #888;
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
