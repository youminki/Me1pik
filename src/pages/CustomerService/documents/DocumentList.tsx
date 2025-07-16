import React, { useState } from 'react';
import {
  getTermsPolicyList,
  getTermsPolicyDetail,
} from '../../../api/terms/termsApi';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

const typeToTitle: Record<string, string> = {
  notice: '공지사항',
  faq: '자주 묻는 질문',
  terms: '이용약관',
  privacy: '개인정보처리방침',
};

const typeToApiType: Record<string, string> = {
  notice: 'FAQ', // 실제 API type/category에 맞게 조정 필요
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

  if (loading) return <ListContainer>로딩 중...</ListContainer>;
  if (!list.length) return <ListContainer>데이터가 없습니다.</ListContainer>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 700, fontSize: 24, marginBottom: 16 }}>
        {title}
      </h1>
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
      <ListContainer>
        {list.map((item) => (
          <div key={item.id}>
            <ListItem onClick={() => handleClick(item.id)}>
              <ItemTitle>{item.title}</ItemTitle>
              <ItemMeta>
                <span>{item.category}</span>
                <span>{item.author}</span>
                <span>{item.createdAt.slice(0, 10)}</span>
              </ItemMeta>
            </ListItem>
            <DetailWrapper isOpen={openId === item.id}>
              <DetailInner isOpen={openId === item.id}>
                {detail[item.id] || (openId === item.id && '로딩 중...')}
              </DetailInner>
            </DetailWrapper>
          </div>
        ))}
      </ListContainer>
    </div>
  );
};

export default DocumentList;

const TabSection = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
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
`;

const ListContainer = styled.div`
  width: 100%;
  background: #fff;
  border: 1px solid #dddddd;
  border-radius: 8px;
  box-sizing: border-box;
  margin-top: 8px;
  margin-bottom: 24px;
  padding: 0;
  overflow: hidden;
`;

const ListItem = styled.div`
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
`;

const ItemMeta = styled.div`
  font-size: 12px;
  color: #888;
  display: flex;
  gap: 12px;
`;

const DetailWrapper = styled.div<{ isOpen: boolean }>`
  max-height: ${({ isOpen }) => (isOpen ? '500px' : '0')};
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8f8f8;
  border-bottom: 1px solid #eeeeee;
`;

const DetailInner = styled.div<{ isOpen: boolean }>`
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transform: translateY(${({ isOpen }) => (isOpen ? '0' : '-20px')});
  transition:
    opacity 0.3s,
    transform 0.3s;
  padding: ${({ isOpen }) => (isOpen ? '20px 16px' : '0 16px')};
  font-size: 15px;
  color: #333;
  white-space: pre-wrap;
`;
