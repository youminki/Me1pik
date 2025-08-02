/**
 * 상품 리스트 컴포넌트 (ItemList.tsx)
 *
 * 홈, 브랜드, 멜픽 등에서 사용되는 상품 리스트 컴포넌트입니다.
 * 상품 카드 렌더링, 스켈레톤 로딩, 무한 스크롤 옵저버, 반응형 그리드 레이아웃을 제공합니다.
 *
 * @description
 * - 상품 카드(ItemCard) 리스트 렌더링
 * - 스켈레톤 로딩 지원
 * - 무한 스크롤 옵저버 ref 지원
 * - 반응형 컬럼 그리드 레이아웃
 * - 삭제/클릭 핸들러 지원
 */
import React, { useMemo } from 'react';
import styled from 'styled-components';

import ItemCard from '@/components/homes/ItemCard';
import SkeletonItemCard from '@/components/homes/SkeletonItemList';

/**
 * 상품 리스트 아이템 UI 타입
 *
 * @property id - 상품 고유 ID
 * @property image - 상품 이미지 URL
 * @property brand - 브랜드명
 * @property description - 상품 설명
 * @property price - 상품 가격
 * @property discount - 할인율
 * @property isLiked - 찜(좋아요) 여부
 */
export interface UIItem {
  id: string;
  image: string;
  brand: string;
  description: string;
  price: number;
  discount: number;
  isLiked: boolean;
}

/**
 * 상품 리스트 컴포넌트 Props
 *
 * @property items - 상품 데이터 배열
 * @property columns - 컬럼 수 (기본값: 4)
 * @property onItemClick - 아이템 클릭 핸들러 (선택)
 * @property onDelete - 아이템 삭제 핸들러 (선택)
 * @property isLoading - 로딩 상태 (기본값: false)
 * @property observerRef - 무한 스크롤 옵저버 ref (선택)
 * @property visibleCount - 스켈레톤 표시 개수 (기본값: 40)
 */
type ItemListProps = {
  items: UIItem[];
  columns?: number;
  onItemClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  observerRef?: React.RefObject<HTMLDivElement>;
  visibleCount?: number;
};

/**
 * 상품 리스트 컴포넌트
 *
 * 상품 카드(ItemCard)들을 그리드로 렌더링하고, 스켈레톤/무한스크롤/삭제/클릭 기능을 제공합니다.
 *
 * @param items - 상품 데이터 배열
 * @param columns - 컬럼 수 (기본값: 4)
 * @param onItemClick - 아이템 클릭 핸들러 (선택)
 * @param onDelete - 아이템 삭제 핸들러 (선택)
 * @param isLoading - 로딩 상태 (기본값: false)
 * @param observerRef - 무한 스크롤 옵저버 ref (선택)
 * @param visibleCount - 스켈레톤 표시 개수 (기본값: 40)
 * @returns 상품 리스트 JSX 요소
 */
const ItemList: React.FC<ItemListProps> = ({
  items,
  columns = 4,
  onItemClick,
  onDelete,
  isLoading = false,
  observerRef,
  visibleCount = 40,
}) => {
  const renderedItems = useMemo(() => {
    const handleOpen = onItemClick ?? (() => {});
    const handleDelete = onDelete ?? (() => {});

    if (isLoading) {
      return Array.from({ length: visibleCount }, (_, i) => (
        <SkeletonItemCard key={`skeleton-${i}`} />
      ));
    }
    return items.map((item, index) => (
      <ItemCard
        key={item.id}
        {...item}
        onOpenModal={handleOpen}
        onDelete={handleDelete}
        isFirstItem={index === 0} // 첫 번째 아이템에 우선순위 적용
      />
    ));
  }, [isLoading, items, visibleCount, onItemClick, onDelete]);

  return (
    <ListContainer>
      <ItemsWrapper $columns={columns}>
        {renderedItems}
        {observerRef && <div ref={observerRef} style={{ height: 1 }} />}
      </ItemsWrapper>
    </ListContainer>
  );
};

export default ItemList;

const ListContainer = styled.div`
  background-color: #fff;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;
`;

const ItemsWrapper = styled.div<{ $columns: number }>`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
`;
