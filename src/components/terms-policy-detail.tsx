import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { getTermsPolicyDetail } from '../api-utils/user-management/terms/termsApi';

interface TermsPolicyDetailProps {
  id: number;
}

interface TermsPolicyItem {
  id: number;
  title: string;
  type: string;
  category: string;
  content: string;
  author: string;
  createdAt: string;
}

const TermsPolicyDetail: React.FC<TermsPolicyDetailProps> = ({ id }) => {
  const [data, setData] = useState<TermsPolicyItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTermsPolicyDetail(id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailContainer>로딩 중...</DetailContainer>;
  if (!data) return <DetailContainer>데이터가 없습니다.</DetailContainer>;

  return (
    <DetailContainer>
      <Section>
        <Title>{data.title}</Title>
        <Meta>
          <span>{data.category}</span>
          <span>{data.author}</span>
          <span>{data.createdAt.slice(0, 10)}</span>
        </Meta>
      </Section>
      <Divider />
      <ContentSection>
        <ContentText>{data.content}</ContentText>
      </ContentSection>
    </DetailContainer>
  );
};

export default TermsPolicyDetail;

const DetailContainer = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  box-sizing: border-box;
  padding: 1.5rem 1rem;
  max-width: 800px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
`;

const Section = styled.div`
  width: 100%;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-weight: 800;
  font-size: 20px;
  color: #000;
  margin-bottom: 8px;
`;

const Meta = styled.div`
  font-size: 12px;
  color: #888;
  display: flex;
  gap: 12px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin: 16px 0;
`;

const ContentSection = styled.div`
  width: 100%;
  min-height: 200px;
`;

const ContentText = styled.div`
  font-weight: 400;
  font-size: 15px;
  line-height: 1.7;
  color: #222;
  white-space: pre-wrap;
`;
