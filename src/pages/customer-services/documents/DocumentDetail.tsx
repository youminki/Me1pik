import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import TermsPolicyDetail from '../../../components/terms-policy-detail';

const typeToTitle: Record<string, string> = {
  notice: '공지사항 상세',
  faq: '자주 묻는 질문 상세',
  terms: '이용약관 상세',
  privacy: '개인정보처리방침 상세',
};

const DocumentDetail: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  if (!type || !id) return null;
  const title = typeToTitle[type] || '문서 상세';
  return (
    <PageContainer>
      <PageTitle>{title}</PageTitle>
      <TermsPolicyDetail id={Number(id)} />
    </PageContainer>
  );
};

export default DocumentDetail;

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f8f8f8;
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PageTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #222;
  margin-bottom: 24px;
`;
