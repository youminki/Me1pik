/**
 * terms-policy-list 컴포넌트
 *
 * 약관 및 정책 목록 컴포넌트를 제공합니다.
 * 약관이나 정책의 목록을 표시하는 컴포넌트입니다.
 * API를 통해 데이터를 가져와서 목록 형태로 표시하며, 클릭 시 상세 페이지로 이동합니다.
 *
 * @description
 * - 약관/정책 목록 표시
 * - API 데이터 로딩
 * - 아이템 클릭 핸들링
 * - 메타 정보 표시 (카테고리, 작성자, 작성일)
 * - 반응형 디자인
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getTermsPolicyList } from '@/api-utils/user-managements/terms/termsApi';

/**
 * TermsPolicyListProps 인터페이스
 *
 * 약관 정책 목록 컴포넌트의 props를 정의합니다.
 *
 * @property type - 약관/정책 타입
 * @property category - 카테고리 (선택사항)
 * @property onItemClick - 아이템 클릭 핸들러
 */
interface TermsPolicyListProps {
  type: string;
  category?: string;
  onItemClick: (id: number) => void;
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
 * TermsPolicyList 컴포넌트
 *
 * 약관 정책 목록 컴포넌트입니다.
 *
 * @param type - 약관/정책 타입
 * @param category - 카테고리 (선택사항)
 * @param onItemClick - 아이템 클릭 핸들러
 * @returns 약관 정책 목록 컴포넌트
 */
const TermsPolicyList: React.FC<TermsPolicyListProps> = ({
  type,
  category,
  onItemClick,
}) => {
  const [list, setList] = useState<TermsPolicyItem[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * useEffect 훅
   *
   * 컴포넌트 마운트 시 또는 type/category 변경 시 데이터를 가져옵니다.
   */
  useEffect(() => {
    setLoading(true);
    getTermsPolicyList({ type, category })
      .then(setList)
      .finally(() => setLoading(false));
  }, [type, category]);

  if (loading) return <ListContainer>로딩 중...</ListContainer>;
  if (!list.length) return <ListContainer>데이터가 없습니다.</ListContainer>;

  return (
    <ListContainer>
      {list.map((item) => (
        <ListItem key={item.id} onClick={() => onItemClick(item.id)}>
          <ItemTitle>{item.title}</ItemTitle>
          <ItemMeta>
            <span>{item.category}</span>
            <span>{item.author}</span>
            <span>{item.createdAt.slice(0, 10)}</span>
          </ItemMeta>
        </ListItem>
      ))}
    </ListContainer>
  );
};

export default TermsPolicyList;

/**
 * ListContainer 스타일 컴포넌트
 *
 * 목록 컨테이너의 스타일을 정의합니다.
 */
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

/**
 * ListItem 스타일 컴포넌트
 *
 * 목록 아이템의 스타일을 정의합니다.
 * 호버 효과를 포함합니다.
 */
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

/**
 * ItemTitle 스타일 컴포넌트
 *
 * 아이템 제목의 스타일을 정의합니다.
 */
const ItemTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  color: #222;
  margin-bottom: 8px;
`;

/**
 * ItemMeta 스타일 컴포넌트
 *
 * 아이템 메타 정보의 스타일을 정의합니다.
 */
const ItemMeta = styled.div`
  font-size: 12px;
  color: #888;
  display: flex;
  gap: 12px;
`;
