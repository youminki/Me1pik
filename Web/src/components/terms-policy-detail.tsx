/**
 * terms-policy-detail 컴포넌트
 *
 * 약관 및 정책 상세 컴포넌트를 제공합니다.
 * 약관이나 정책의 상세 내용을 표시하는 컴포넌트입니다.
 * API를 통해 데이터를 가져와서 제목, 메타 정보, 내용을 표시합니다.
 *
 * @description
 * - 약관/정책 상세 내용 표시
 * - API 데이터 로딩
 * - 메타 정보 표시 (카테고리, 작성자, 작성일)
 * - 반응형 디자인
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getTermsPolicyDetail } from '@/api-utils/user-managements/terms/termsApi';

/**
 * TermsPolicyDetailProps 인터페이스
 *
 * 약관 정책 상세 컴포넌트의 props를 정의합니다.
 *
 * @property id - 약관/정책 ID
 */
interface TermsPolicyDetailProps {
  id: number;
}

/**
 * TermsPolicyItem 인터페이스
 *
 * 약관 정책 아이템의 데이터 구조를 정의합니다.
 *
 * @property id - 아이템 ID
 * @property title - 제목
 * @property type - 타입
 * @property category - 카테고리
 * @property content - 내용
 * @property author - 작성자
 * @property createdAt - 생성일
 */
interface TermsPolicyItem {
  id: number;
  title: string;
  type: string;
  category: string;
  content: string;
  author: string;
  createdAt: string;
}

/**
 * TermsPolicyDetail 컴포넌트
 *
 * 약관 정책 상세 컴포넌트입니다.
 *
 * @param id - 약관/정책 ID
 * @returns 약관 정책 상세 컴포넌트
 */
const TermsPolicyDetail: React.FC<TermsPolicyDetailProps> = ({ id }) => {
  const [data, setData] = useState<TermsPolicyItem | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * useEffect 훅
   *
   * 컴포넌트 마운트 시 또는 id 변경 시 데이터를 가져옵니다.
   */
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

/**
 * DetailContainer 스타일 컴포넌트
 *
 * 상세 컨테이너의 스타일을 정의합니다.
 */
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

/**
 * Section 스타일 컴포넌트
 *
 * 섹션의 스타일을 정의합니다.
 */
const Section = styled.div`
  width: 100%;
  margin-bottom: 16px;
`;

/**
 * Title 스타일 컴포넌트
 *
 * 제목의 스타일을 정의합니다.
 */
const Title = styled.h1`
  font-weight: 800;
  font-size: 20px;
  color: #000;
  margin-bottom: 8px;
`;

/**
 * Meta 스타일 컴포넌트
 *
 * 메타 정보의 스타일을 정의합니다.
 */
const Meta = styled.div`
  font-size: 12px;
  color: #888;
  display: flex;
  gap: 12px;
`;

/**
 * Divider 스타일 컴포넌트
 *
 * 구분선의 스타일을 정의합니다.
 */
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin: 16px 0;
`;

/**
 * ContentSection 스타일 컴포넌트
 *
 * 내용 섹션의 스타일을 정의합니다.
 */
const ContentSection = styled.div`
  width: 100%;
  min-height: 200px;
`;

/**
 * ContentText 스타일 컴포넌트
 *
 * 내용 텍스트의 스타일을 정의합니다.
 */
const ContentText = styled.div`
  font-weight: 400;
  font-size: 15px;
  line-height: 1.7;
  color: #222;
  white-space: pre-wrap;
`;
