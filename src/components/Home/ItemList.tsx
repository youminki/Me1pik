import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import ItemCard from './ItemCard';

export interface UIItem {
  id: string;
  image: string;
  brand: string;
  description: string;
  price: number;
  discount: number;
  isLiked: boolean;
}

type ItemListProps = {
  items: UIItem[];
  columns?: number;
  onItemClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
};

const SKELETON_COUNT = 8;
const ITEM_HEIGHT = 430; // ItemCard의 대략적인 높이
const GAP = 10; // 갭 크기

const ItemList: React.FC<ItemListProps> = React.memo(
  ({ items, columns = 5, onItemClick, onDelete, isLoading = false }) => {
    const handleOpen = useCallback(
      (id: string) => {
        if (onItemClick) {
          onItemClick(id);
        }
      },
      [onItemClick]
    );

    const handleDelete = useCallback(
      (id: string) => {
        if (onDelete) {
          onDelete(id);
        }
      },
      [onDelete]
    );

    // 컨테이너 크기 계산을 위한 ref
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = React.useState({
      width: 0,
      height: 0,
    });

    // 컨테이너 크기 측정
    React.useEffect(() => {
      const updateSize = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setContainerSize({
            width: rect.width,
            height: window.innerHeight - rect.top - 100, // 대략적인 높이
          });
        }
      };

      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }, []);

    // 그리드 설정 - 컨테이너 너비에 맞게 계산 (소수점 오차 방지)
    const columnWidth = useMemo(() => {
      if (containerSize.width === 0) return 0;
      const totalGapWidth = (columns - 1) * GAP;
      // 픽셀 단위로 버림
      return Math.floor((containerSize.width - totalGapWidth) / columns);
    }, [containerSize.width, columns]);

    // Grid의 width는 containerSize.width로 고정
    const gridWidth = useMemo(() => containerSize.width, [containerSize.width]);

    const rowCount = useMemo(() => {
      const itemCount = isLoading ? SKELETON_COUNT : items.length;
      return Math.ceil(itemCount / columns);
    }, [items.length, columns, isLoading]);

    // 셀 렌더러 - 갭을 포함한 스타일 적용
    const Cell = useCallback(
      ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
        const itemIndex = rowIndex * columns + columnIndex;
        // 좌/우/상/하 padding 계산 (첫/마지막 열, 행은 패딩 다르게)
        const left = columnIndex === 0 ? 0 : GAP / 2;
        const right = columnIndex === columns - 1 ? 0 : GAP / 2;
        const top = rowIndex === 0 ? 0 : GAP / 2;
        const bottom = GAP / 2;
        const cellStyle = {
          ...style,
          left: (style.left as number) + columnIndex * GAP, // 각 셀의 left 위치에 GAP 누적 적용
          top: (style.top as number) + rowIndex * GAP, // 각 셀의 top 위치에 GAP 누적 적용
          width: style.width,
          height: style.height,
          paddingLeft: left,
          paddingRight: right,
          paddingTop: top,
          paddingBottom: bottom,
          boxSizing: 'border-box' as const,
        };

        if (isLoading) {
          if (itemIndex >= SKELETON_COUNT) return null;
          return (
            <CellWrapper style={cellStyle}>
              <ItemCard
                key={`skeleton-${itemIndex}`}
                id={'' + itemIndex}
                image={''}
                brand={''}
                description={''}
                price={0}
                discount={0}
                isLiked={false}
                onOpenModal={() => {}}
              />
            </CellWrapper>
          );
        }

        if (itemIndex >= items.length) return null;
        const item = items[itemIndex];

        return (
          <CellWrapper style={cellStyle}>
            <ItemCard
              key={item.id}
              {...item}
              onOpenModal={handleOpen}
              onDelete={handleDelete}
            />
          </CellWrapper>
        );
      },
      [items, columns, isLoading, handleOpen, handleDelete]
    );

    return (
      <ListContainer ref={containerRef}>
        {containerSize.width > 0 && columnWidth > 0 ? (
          <Grid
            columnCount={columns}
            rowCount={rowCount}
            columnWidth={columnWidth}
            rowHeight={ITEM_HEIGHT}
            width={gridWidth}
            height={rowCount * ITEM_HEIGHT}
            itemData={{ items, isLoading, handleOpen, handleDelete }}
            style={{ overflow: 'visible' }}
          >
            {Cell}
          </Grid>
        ) : (
          // 초기 로딩 시 기존 방식으로 렌더링
          <ItemsWrapper columns={columns}>
            {isLoading
              ? Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
                  <ItemCard
                    key={`skeleton-${idx}`}
                    id={'' + idx}
                    image={''}
                    brand={''}
                    description={''}
                    price={0}
                    discount={0}
                    isLiked={false}
                    onOpenModal={() => {}}
                  />
                ))
              : items.map((item) => (
                  <ItemCard
                    key={item.id}
                    {...item}
                    onOpenModal={handleOpen}
                    onDelete={handleDelete}
                  />
                ))}
          </ItemsWrapper>
        )}
      </ListContainer>
    );
  }
);

export default ItemList;

const ListContainer = styled.div`
  background-color: #fff;
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden; // 좌우 스크롤 방지
`;

const CellWrapper = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const ItemsWrapper = styled.div<{ columns: number }>`
  display: grid;
  gap: ${GAP}px;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  width: 100%;
  overflow: hidden; // 좌우 스크롤 방지
`;
