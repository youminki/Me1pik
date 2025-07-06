import React, { useState } from 'react';
import styled from 'styled-components';

export interface SizeInfoProps {
  productSizes: {
    size: string;
    measurements: Record<string, string | number>;
  }[];
  size_picture: string;
  /** key → label 매핑(서버에서 내려오는 값) */
  labelGuide?: Record<string, string>;
}

const SIZE_PLACEHOLDER = '/images/size-placeholder.png';

const SIZE_LABELS: Record<string, string> = {
  '44': 'S',
  '55': 'M',
  '66': 'L',
  '77': 'XL',
};

const SizeInfo: React.FC<SizeInfoProps> = ({
  productSizes,
  size_picture,
  labelGuide,
}) => {
  const [imgSrc, setImgSrc] = useState(size_picture);
  const handleImageError = () => setImgSrc(SIZE_PLACEHOLDER);

  if (!productSizes?.length) {
    return <Message>사이즈 정보가 없습니다.</Message>;
  }

  const measurementKeys = Object.keys(productSizes[0].measurements || {});
  const sortedKeys = measurementKeys.sort((a, b) => a.localeCompare(b));

  // 항상 ABCDE 라벨을 사용하되, labelGuide가 있으면 설명을 포함
  const columnLabels = sortedKeys.map((key, idx) => {
    const baseLabel = String.fromCharCode(65 + idx);
    const description = labelGuide && labelGuide[key] ? labelGuide[key] : '';
    return description ? `${baseLabel}.${description}` : baseLabel;
  });

  const formatSize = (raw: string) => {
    if (/free/i.test(raw)) return 'Free';
    const num = raw.replace(/\D/g, '');
    const label = SIZE_LABELS[num];
    return label ? `${num}(${label})` : num;
  };

  return (
    <Container>
      <Title>사이즈 정보</Title>

      <InfoWrapper>
        <PictureWrapper>
          <StyledImg
            src={imgSrc}
            srcSet={`${imgSrc} 1x, ${imgSrc} 2x`}
            alt='사이즈 안내 이미지'
            onError={handleImageError}
          />
        </PictureWrapper>

        <LabelInfoContainer>
          <LabelList>
            {sortedKeys.map((key, idx) => {
              const baseLabel = String.fromCharCode(65 + idx);
              const description =
                labelGuide && labelGuide[key] ? labelGuide[key] : '';
              return (
                <LabelItem key={key}>
                  <LabelKey>{baseLabel}</LabelKey>
                  <LabelDescription>{description || key}</LabelDescription>
                </LabelItem>
              );
            })}
          </LabelList>
        </LabelInfoContainer>
      </InfoWrapper>

      <TableWrapper>
        <Table>
          <thead>
            <Row>
              <Header>사이즈</Header>
              {columnLabels.map((lbl, i) => (
                <Header key={i}>{lbl}</Header>
              ))}
            </Row>
          </thead>
          <tbody>
            {productSizes.map(({ size, measurements }) => (
              <Row key={size}>
                <Cell>{formatSize(size)}</Cell>
                {sortedKeys.map((key) => {
                  const raw = measurements[key];
                  const displayVal =
                    typeof raw === 'number' ? Math.round(raw) : (raw ?? '-');
                  return <Cell key={key}>{displayVal}</Cell>;
                })}
              </Row>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </Container>
  );
};

export default SizeInfo;

/* Styled Components */
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: #000;
  margin-bottom: 12px;
  text-align: center;
`;

const InfoWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  width: 100%;
  max-width: 1000px;
  margin-bottom: 16px;
  overflow-x: auto;
`;

const PictureWrapper = styled.div`
  flex: none;
  overflow: hidden;
  border-radius: 4px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImg = styled.img`
  min-width: 300px;
  width: 100%;
  height: auto;
  object-fit: contain;
  image-rendering: crisp-edges;
`;

const LabelInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
`;

const LabelList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
`;

const LabelItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background-color: #f8f8f8;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
`;

const LabelKey = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #f6ae24;
  background-color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #f6ae24;
  min-width: 20px;
  text-align: center;
`;

const LabelDescription = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #333;
  flex: 1;
`;

const TableWrapper = styled.div`
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
`;

const Row = styled.tr`
  &:nth-child(even) {
    background-color: #f7f7f7;
  }
`;

const Header = styled.th`
  padding: 8px 4px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  background-color: #e0e0e0;
  border: 1px solid #ccc;
`;

const Cell = styled.td`
  padding: 8px 4px;
  font-size: 12px;
  text-align: center;
  border: 1px solid #ccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Message = styled.p`
  font-size: 14px;
  color: #666;
  text-align: center;
`;
