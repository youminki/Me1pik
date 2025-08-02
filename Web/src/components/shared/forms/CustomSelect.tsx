/**
 * 커스텀 셀렉트 컴포넌트 (CustomSelect.tsx)
 *
 * 프로젝트에 맞춤화된 셀렉트 박스 스타일 컴포넌트를 제공합니다.
 * 테마 시스템과 연동되며, 접근성과 사용자 경험을 고려한
 * 스타일링을 적용합니다.
 *
 * @description
 * - 커스텀 셀렉트 스타일링
 * - 테마 시스템 연동
 * - 접근성 지원 (포커스, 읽기전용, 비활성화)
 * - 커스텀 화살표 아이콘
 * - 반응형 디자인
 * - 트랜지션 효과
 */

import styled from 'styled-components';

export const CustomSelect = styled.select`
  font-size: 16px;
  border: 1px solid #000000;
  border-radius: 0;
  height: 51px;
  width: 100%;
  padding: 0 ${({ theme }) => theme.spacing.lg} 0
    ${({ theme }) => theme.spacing.md};
  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
  color: #000000;
  appearance: none;
  background:
    url('/SelectIcon.svg') no-repeat right 16px center/15px 16px,
    #fff !important;
  transition: border 0.2s;
  ${({ theme }) => theme.shadow.base};
  z-index: ${({ theme }) => theme.zIndex.header};
  &:focus {
    outline: none;
    border: 1px solid #000000;
    background:
      url('/SelectIcon.svg') no-repeat right 16px center/15px 16px,
      #fff !important;
  }
  &[readonly],
  &:disabled {
    background: #ddd !important;
    color: #888 !important;
    opacity: 0.7;
    cursor: not-allowed;
    pointer-events: none;
  }
`;
