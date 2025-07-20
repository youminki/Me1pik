import React, { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

/* helper component */
const ParenText = styled.span`
  font-weight: 400;
  font-size: 12px;
  color: #999;
`;
const SectionTitleWithParen: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\(.*?\))/g);
  return (
    <SectionTitle>
      {parts.map((p, i) =>
        p.startsWith('(') && p.endsWith(')') ? (
          <ParenText key={i}>{p}</ParenText>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </SectionTitle>
  );
};

const sizeData = ['44(S)', '55(M)', '66(L)', '77(XL)'];
const colorMap: Record<string, string> = {
  화이트: '#FFFFFF',
  블랙: '#000000',
  그레이: '#808080',
  네이비: '#001F5B',
  아이보리: '#ECEBE4',
  베이지: '#C8AD7F',
  브라운: '#7B4A2F',
  카키: '#4B5320',
  그린: '#2E8B57',
  블루: '#0000FF',
  퍼플: '#800080',
  버건디: '#800020',
  레드: '#FF0000',
  핑크: '#FFC0CB',
  옐로우: '#FFFF00',
  오렌지: '#FFA500',
};

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect?: (colors: string[]) => void;
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onColorSelect,
  selectedColors,
  setSelectedColors,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  };

  const toggleSelected = (
    list: string[],
    value: string,
    setFn: (l: string[]) => void
  ) => {
    setFn(
      list.includes(value) ? list.filter((i) => i !== value) : [...list, value]
    );
  };

  // 색상 선택 핸들러: 상태만 변경
  const handleColorClick = (color: string) => {
    toggleSelected(selectedColors, color, setSelectedColors);
  };

  // 설정 적용 버튼 클릭 시
  const handleApply = () => {
    if (onColorSelect) {
      onColorSelect(selectedColors);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleClose}>
      <Container onClick={(e) => e.stopPropagation()} $isClosing={isClosing}>
        <ModalHandle>
          <HandleBar />
        </ModalHandle>

        <FixedHeader>
          <Header>
            <Title>필터</Title>
          </Header>
          <Divider />
        </FixedHeader>

        <ScrollContent>
          <Section>
            <SectionTitleWithParen text='사이즈 (셋팅 : 없음)' />
            <ButtonRow>
              {sizeData.map((size) => (
                <FilterButton key={size} selected={false} disabled>
                  {size}
                </FilterButton>
              ))}
            </ButtonRow>
          </Section>
          <DashedDivider />

          <Section>
            <SectionTitleWithParen text='색상 (셋팅 : 없음)' />
            <ColorButtonGrid>
              {Object.keys(colorMap).map((color) => {
                return (
                  <ColorButton
                    key={color}
                    selected={selectedColors.includes(color)}
                    colorName={color}
                    onClick={() => handleColorClick(color)}
                  >
                    {color}
                  </ColorButton>
                );
              })}
            </ColorButtonGrid>
          </Section>
          <Divider />
        </ScrollContent>

        <FixedFooter>
          <CloseButtonWrapper>
            <NoButton onClick={onClose}>취소</NoButton>
            <YesButton onClick={handleApply}>설정 적용</YesButton>
          </CloseButtonWrapper>
        </FixedFooter>
      </Container>
    </Overlay>
  );
};

export default FilterModal;

/* animations */
const slideUp = keyframes`
  0% { transform: translateY(100%); }
  60% { transform: translateY(-2%); }
  80% { transform: translateY(1%); }
  100% { transform: translateY(0); }
`;
const slideDown = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(100%); }
`;

/* styled components */
interface ContainerProps {
  $isClosing: boolean;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 10000;
`;

const Container = styled.div<ContainerProps>`
  width: 100%;
  max-width: 1000px;
  height: 60%;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: ${({ $isClosing }) =>
    $isClosing
      ? css`
          ${slideDown} 0.4s ease-out forwards
        `
      : css`
          ${slideUp} 0.4s ease-out forwards
        `};
`;

const ModalHandle = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 8px 0;
`;
const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
`;

const FixedHeader = styled.div`
  flex-shrink: 0;
  padding: 0 40px;
`;
const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 16px;
`;
const Title = styled.h2`
  font-size: 16px;
  font-weight: 800;
  margin: 0;
`;

const Divider = styled.hr`
  border: none;
  margin: 16px 0;
  border-top: 1px solid #ddd;
`;
const DashedDivider = styled.hr`
  border: none;
  border-top: 1px dashed #ddd;
  margin: 10px 0;
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 40px;
`;

const Section = styled.div`
  margin: 20px 0;
`;
const SectionTitle = styled.div`
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 10px;
  color: #000;
`;

interface FilterButtonProps {
  selected: boolean;
  disabled?: boolean;
}
const FilterButton = styled.button<FilterButtonProps>`
  min-width: 60px;
  height: 36px;
  border-radius: 18px;
  border: 1px solid #000;
  background: ${({ selected, disabled }) =>
    disabled ? '#eee' : selected ? '#000' : '#fff'};
  color: ${({ selected, disabled }) =>
    disabled ? '#aaa' : selected ? '#fff' : '#000'};
  font-weight: 700;
  font-size: 12px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 1 : 1)};
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

// ColorButton에 colorName prop 추가
interface ColorButtonPropsStyled extends FilterButtonProps {
  colorName: string;
}
const ColorButton = styled(FilterButton)<ColorButtonPropsStyled>`
  background: ${({ selected }) => (selected ? '#000' : '#fff')};
  color: ${({ selected }) => (selected ? '#fff' : '#000')};
  border: 1px solid #000;
  &:hover {
    background: ${({ selected, colorName }) => {
      if (selected) return '#000';
      return colorMap[colorName] || '#fff';
    }};
    color: ${({ selected, colorName }) => {
      if (selected) return '#fff';
      const hex = colorMap[colorName] || '#fff';
      function getContrastColor(hex: string) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        return yiq >= 180 ? '#222' : '#fff';
      }
      return getContrastColor(hex);
    }};
  }
`;
const ColorButtonGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const FixedFooter = styled.div`
  flex-shrink: 0;
  padding: 0 40px 40px;
`;
const CloseButtonWrapper = styled.div`
  display: flex;
  gap: 20px;
  padding: 16px 0;
`;
const NoButton = styled.button`
  flex: 1;
  height: 50px;
  background: #ccc;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;
const YesButton = styled.button`
  flex: 1;
  height: 50px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;
