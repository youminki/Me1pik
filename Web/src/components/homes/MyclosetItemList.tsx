/**
 * 내 옷장 아이템 리스트 컴포넌트 (MyclosetItemList.tsx)
 *
 * 내 옷장에서 찜한 상품들을 그리드 형태로 표시하는 컴포넌트입니다.
 * 반응형 레이아웃을 지원하며, 모바일에서는 2열, PC에서는 지정된 컬럼 수로 표시합니다.
 *
 * @description
 * - 내 옷장 상품 리스트 렌더링
 * - 반응형 그리드 레이아웃 (모바일 2열, PC 지정 컬럼)
 * - 상품 클릭 및 삭제 핸들러 지원
 * - ItemCard 컴포넌트 재사용
 */
import React, { useMemo } from 'react';
import styled from 'styled-components';

import ItemCard from '@/components/homes/ItemCard';

/**
 * 내 옷장 아이템 UI 타입
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
 * 내 옷장 아이템 리스트 Props
 *
 * @property items - 상품 데이터 배열
 * @property columns - PC 컬럼 수 (>=768px, 기본값: 5)
 * @property onItemClick - 아이템 클릭 핸들러 (선택)
 * @property onDelete - 아이템 삭제 핸들러 (선택)
 */
interface MyclosetItemListProps {
  items: UIItem[];
  /** PC columns count (>=768px) */
  columns?: number;
  onItemClick?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * 내 옷장 아이템 리스트 컴포넌트
 *

 * 내 옷장의 찜한 상품들을 그리드 형태로 렌더링합니다.
 * 모바일에서는 2열, PC에서는 지정된 컬럼 수로 표시됩니다.
 *
 * @param items - 상품 데이터 배열
 * @param columns - PC 컬럼 수 (기본값: 5)
 * @param onItemClick - 아이템 클릭 핸들러 (선택)
 * @param onDelete - 아이템 삭제 핸들러 (선택)
 * @returns 내 옷장 아이템 리스트 JSX 요소
 */
const MyclosetItemList: React.FC<MyclosetItemListProps> = ({
  items,
  columns = 5,
  onItemClick,
  onDelete,
}) => {
  const renderedItems = useMemo(() => {
    const handleOpen = onItemClick ?? (() => {});
    const handleDelete = onDelete ?? (() => {});
    return items.map((item) => (
      <ItemCard
        key={item.id}
        {...item}
        onOpenModal={handleOpen}
        onDelete={handleDelete}
      />
    ));
  }, [items, onItemClick, onDelete]);

  return (
    <ListContainer>
      <ItemsWrapper columns={columns}>{renderedItems}</ItemsWrapper>
    </ListContainer>
  );
};

export default MyclosetItemList;

/**
 * 리스트 컨테이너
 *

 * 내 옷장 아이템 리스트 전체를 감싸는 컨테이너입니다.
 */
const ListContainer = styled.div`
  background-color: #fff;
  margin: 0 auto;
  box-sizing: border-box;
`;

/**
 * 아이템 래퍼
 *

 * 상품 카드들을 그리드로 배치하는 래퍼입니다.
 * 반응형 레이아웃을 지원합니다.
 *
 * @param columns - PC 컬럼 수
 */
const ItemsWrapper = styled.div<{ columns: number }>`
  display: grid;
  gap: 16px;
  /* 모바일(폭 < 768px) 고정 2열 */
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (min-width: 768px) {
    /* PC에서는 지정된 columns */
    grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  }
`;
