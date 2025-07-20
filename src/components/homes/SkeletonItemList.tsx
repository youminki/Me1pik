import React from 'react';
import styled, { keyframes } from 'styled-components';

interface SkeletonItemListProps {
  columns: number;
  count?: number;
}

const SkeletonItemList: React.FC<SkeletonItemListProps> = ({
  columns,
  count = 8,
}) => {
  return (
    <ListContainer>
      <ItemsWrapper columns={columns}>
        {Array.from({ length: count }).map((_, idx) => (
          <SkeletonCard key={idx}>
            <ImageWrapper>
              <SkeletonImage />
            </ImageWrapper>
            <SkeletonText
              width='60%'
              height='14px'
              style={{ margin: '10px 0 0 0' }}
            />
            <SkeletonText
              width='80%'
              height='11px'
              style={{ margin: '5px 0 0 0', marginBottom: '4px' }}
            />
            <SkeletonText
              width='40%'
              height='14px'
              style={{ marginTop: '5px' }}
            />
          </SkeletonCard>
        ))}
      </ItemsWrapper>
    </ListContainer>
  );
};

export default SkeletonItemList;

// styled-components
const shimmer = keyframes`
  0% { background-position: 0px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const ListContainer = styled.div`
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
`;

const ItemsWrapper = styled.div<{ columns: number }>`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
`;

const SkeletonCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  margin-bottom: 12px;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  min-height: 240px;
  background: #f5f5f5;
  border: 1px solid #ccc;
  overflow: hidden;
  @supports not (aspect-ratio: 2/3) {
    min-height: 240px;
    height: 360px;
  }
`;

const SkeletonImage = styled.div`
  width: 100%;
  height: 240px;
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 40px, #eee 80px);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  border-radius: 8px;
  animation: ${shimmer} 1.2s infinite linear;
  position: absolute;
  top: 0;
  left: 0;
`;

const SkeletonText = styled.div<{ width: string; height: string }>`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  background: #eee;
  background-image: linear-gradient(90deg, #eee 0px, #f5f5f5 40px, #eee 80px);
  background-size: 200px 100%;
  background-repeat: no-repeat;
  border-radius: 4px;
  animation: ${shimmer} 1.2s infinite linear;
  margin-bottom: 6px;
`;
