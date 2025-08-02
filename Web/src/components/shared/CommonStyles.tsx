/**
 * 공통 스타일 컴포넌트 라이브러리 (CommonStyles.tsx)
 *
 * 프로젝트 전역에서 사용하는 재사용 가능한 스타일드 컴포넌트들을 정의합니다.
 * 일관된 디자인 시스템을 제공하며, 반응형 디자인과 접근성을 고려합니다.
 *
 * @description
 * - 기본 레이아웃 컴포넌트 (Container, Header, Section 등)
 * - 버튼 및 입력 필드 스타일
 * - 모달 및 오버레이 컴포넌트
 * - 유틸리티 스타일 (Badge, Tooltip, Grid 등)
 * - 반응형 디자인 지원
 * - 접근성 고려 (포커스, 색상 대비 등)
 */
import styled from 'styled-components';

/**
 * 기본 페이지 컨테이너
 *
 * 모든 페이지의 기본 레이아웃을 제공하는 컨테이너입니다.
 * 중앙 정렬, 패딩, 최소 높이를 설정합니다.
 */
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

/**
 * 페이지 헤더 컨테이너
 *
 * 페이지의 제목과 부제목을 포함하는 헤더 영역입니다.
 * 반응형 마진과 정렬을 제공합니다.
 */
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

/**
 * 페이지 제목
 *
 * 페이지의 메인 제목을 표시하는 스타일드 컴포넌트입니다.
 * 큰 폰트 크기와 굵은 폰트 웨이트를 사용합니다.
 */
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

/**
 * 페이지 부제목
 *
 * 페이지의 부제목이나 설명 텍스트를 표시합니다.
 * 작은 폰트 크기와 연한 색상을 사용합니다.
 */
export const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: #ccc;

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`;

/**
 * 구분선
 *
 * 섹션 간의 시각적 구분을 제공하는 구분선입니다.
 * 반응형 마진을 적용합니다.
 */
export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin: 20px 0;

  @media (min-width: 1024px) {
    margin: 30px 0;
  }
`;

/**
 * 섹션 컨테이너
 *
 * 콘텐츠의 논리적 그룹을 구분하는 섹션 컨테이너입니다.
 * 하단 마진을 통해 섹션 간 간격을 제공합니다.
 */
export const Section = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 20px;
`;

/**
 * 섹션 제목
 *
 * 섹션의 제목을 표시하는 스타일드 컴포넌트입니다.
 * 중간 크기의 폰트와 굵은 폰트 웨이트를 사용합니다.
 */
export const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: #000;
  margin-bottom: 12px;
`;

/**
 * 행 컨테이너
 *
 * 가로로 배치되는 요소들을 포함하는 행 컨테이너입니다.
 * 반응형 간격을 제공합니다.
 */
export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;

  @media (min-width: 1024px) {
    gap: 20px;
  }
`;

/**
 * 열 컨테이너
 *
 * 세로로 배치되는 요소들을 포함하는 열 컨테이너입니다.
 * 요소 간의 간격을 제공합니다.
 */
export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/**
 * 입력 그룹
 *
 * 입력 필드와 라벨을 그룹화하는 컨테이너입니다.
 * 전체 너비를 사용하여 일관된 레이아웃을 제공합니다.
 */
export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

/**
 * 카드 컨테이너
 *
 * 콘텐츠를 카드 형태로 표시하는 컨테이너입니다.
 * 테두리, 둥근 모서리, 그림자 효과를 제공합니다.
 */
export const Card = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

/**
 * 버튼 컴포넌트
 *
 * 다양한 스타일의 버튼을 제공하는 스타일드 컴포넌트입니다.
 * primary, secondary, danger, disabled 등의 변형을 지원합니다.
 *
 * @param $primary - 주요 액션 버튼 스타일
 * @param $secondary - 보조 액션 버튼 스타일
 * @param $danger - 위험한 액션 버튼 스타일
 * @param $disabled - 비활성화된 버튼 스타일
 */
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

/**
 * 모달 오버레이
 *
 * 모달의 배경 오버레이를 제공합니다.
 * 반투명 배경과 중앙 정렬을 제공합니다.
 */
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

/**
 * 모달 박스
 *
 * 모달의 메인 컨테이너입니다.
 * 반응형 크기 조정과 스크롤을 지원합니다.
 */
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

/**
 * 모달 헤더
 *
 * 모달의 헤더 영역을 구성합니다.
 * 제목과 닫기 버튼을 포함할 수 있습니다.
 */
export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
`;

/**
 * 로딩 스피너 래퍼
 *
 * 로딩 상태를 표시하는 스피너를 감싸는 컨테이너입니다.
 * 중앙 정렬과 패딩을 제공합니다.
 */
export const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
`;

/**
 * 빈 상태 컨테이너
 *

 * 데이터가 없을 때 표시되는 빈 상태 컨테이너입니다.
 * 중앙 정렬과 적절한 패딩을 제공합니다.
 */
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
`;

/**
 * 텍스트 컨테이너
 *

 * 텍스트 요소들을 세로로 배치하는 컨테이너입니다.
 * 요소 간의 간격을 제공합니다.
 */
export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/**
 * 이미지 컨테이너
 *

 * 이미지를 표시하는 컨테이너입니다.
 * 테두리, 둥근 모서리, 중앙 정렬을 제공합니다.
 */
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

/**
 * 그리드 컨테이너
 *

 * CSS Grid를 사용한 레이아웃 컨테이너입니다.
 * 반응형 컬럼 수 조정을 지원합니다.
 *
 * @param $columns - 그리드 컬럼 수 (기본값: 2)
 */
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

/**
 * 플렉스 컨테이너
 *

 * CSS Flexbox를 사용한 레이아웃 컨테이너입니다.
 * 방향, 정렬, 간격을 커스터마이징할 수 있습니다.
 *
 * @param $direction - 플렉스 방향 ('row' | 'column')
 * @param $justify - 주축 정렬 ('start' | 'center' | 'end' | 'space-between')
 * @param $align - 교차축 정렬 ('start' | 'center' | 'end')
 * @param $gap - 요소 간 간격 (픽셀)
 */
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

/**
 * 배지 컴포넌트
 *

 * 상태나 카테고리를 표시하는 작은 배지입니다.
 * 다양한 색상 변형을 지원합니다.
 *
 * @param $variant - 배지 스타일 ('primary' | 'secondary' | 'success' | 'danger' | 'warning')
 */
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

/**
 * 아이콘 컨테이너
 *

 * 아이콘을 중앙에 배치하는 컨테이너입니다.
 * 고정된 크기와 중앙 정렬을 제공합니다.
 */
export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

/**
 * 툴팁 컴포넌트
 *

 * 요소에 마우스를 올렸을 때 표시되는 툴팁입니다.
 * 화살표와 함께 표시되며, 포인터 이벤트를 차단합니다.
 */
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
