import styled from 'styled-components';

// 기본 컨테이너
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  padding: 1rem;
  min-height: 100vh;

  @media (min-width: 1024px) {
    padding: 3rem;
    max-width: 1000px;
    margin: 0 auto;
  }
`;

// 페이지 헤더
export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 6px;

  @media (min-width: 1024px) {
    margin-bottom: 24px;
  }
`;

// 페이지 제목
export const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: #000;
  margin-bottom: 0px;

  @media (min-width: 1024px) {
    font-size: 32px;
    margin-bottom: 10px;
  }
`;

// 페이지 부제목
export const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: #ccc;

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

// 구분선
export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin: 20px 0;

  @media (min-width: 1024px) {
    margin: 30px 0;
  }
`;

// 섹션 컨테이너
export const Section = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 20px;
`;

// 섹션 제목
export const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #000;
  margin-bottom: 12px;
`;

// 행 컨테이너
export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;

  @media (min-width: 1024px) {
    gap: 20px;
  }
`;

// 열 컨테이너
export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// 입력 그룹
export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

// 카드 컨테이너
export const Card = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// 버튼 기본 스타일
export const Button = styled.button<{
  $primary?: boolean;
  $secondary?: boolean;
  $danger?: boolean;
  $disabled?: boolean;
}>`
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${({ $primary, $secondary, $danger, $disabled }) => {
    if ($disabled) {
      return `
        background: #ccc;
        color: #666;
        cursor: not-allowed;
      `;
    }
    if ($primary) {
      return `
        background: #f6ae24;
        color: #fff;
        &:hover {
          background: #e69e1e;
        }
      `;
    }
    if ($secondary) {
      return `
        background: #fff;
        color: #f6ae24;
        border: 1px solid #f6ae24;
        &:hover {
          background: #f6ae24;
          color: #fff;
        }
      `;
    }
    if ($danger) {
      return `
        background: #dc3545;
        color: #fff;
        &:hover {
          background: #c82333;
        }
      `;
    }
    return `
      background: #fff;
      color: #333;
      border: 1px solid #ddd;
      &:hover {
        background: #f8f9fa;
      }
    `;
  }}
`;

// 모달 오버레이
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

// 모달 박스
export const ModalBox = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;

  @media (min-width: 768px) {
    min-width: 400px;
  }
`;

// 모달 헤더
export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
`;

// 로딩 스피너 컨테이너
export const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
`;

// 빈 상태 컨테이너
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
`;

// 텍스트 컨테이너
export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// 이미지 컨테이너
export const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 그리드 컨테이너
export const GridContainer = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns = 2 }) => $columns}, 1fr);
  gap: 16px;
  width: 100%;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(
      ${({ $columns = 2 }) => Math.min($columns + 1, 4)},
      1fr
    );
  }
`;

// 플렉스 컨테이너
export const FlexContainer = styled.div<{
  $direction?: 'row' | 'column';
  $justify?: 'start' | 'center' | 'end' | 'space-between';
  $align?: 'start' | 'center' | 'end';
  $gap?: number;
}>`
  display: flex;
  flex-direction: ${({ $direction = 'row' }) => $direction};
  justify-content: ${({ $justify = 'start' }) => $justify};
  align-items: ${({ $align = 'start' }) => $align};
  gap: ${({ $gap = 0 }) => $gap}px;
`;

// 배지
export const Badge = styled.span<{
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
}>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;

  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'primary':
        return 'background: #f6ae24; color: #fff;';
      case 'secondary':
        return 'background: #6c757d; color: #fff;';
      case 'success':
        return 'background: #28a745; color: #fff;';
      case 'danger':
        return 'background: #dc3545; color: #fff;';
      case 'warning':
        return 'background: #ffc107; color: #000;';
      default:
        return 'background: #f6ae24; color: #fff;';
    }
  }}
`;

// 아이콘 컨테이너
export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

// 툴팁
export const Tooltip = styled.div`
  position: absolute;
  background: #333;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: #333;
  }
`;
