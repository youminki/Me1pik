/**
 * 유형 분석 페이지 컴포넌트 (Analysis.tsx)
 *
 * 사용자의 유형을 분석하고 결과를 표시하는 페이지를 제공합니다.
 * 분석 컨텐츠를 중앙에 배치하고 전체 화면 레이아웃을 구성합니다.
 *
 * @description
 * - 유형 분석 컨텐츠 표시
 * - 전체 화면 레이아웃 구성
 * - 중앙 정렬 디자인
 * - 반응형 배경 및 테마 적용
 */
import styled from 'styled-components';

import Content from '@/components/analyses/AnalysisContent';
import { theme } from '@/styles/Theme';

/**
 * 유형 분석 페이지 컴포넌트
 *
 * 사용자의 유형 분석 결과를 표시하는 메인 페이지입니다.
 * AnalysisContent 컴포넌트를 중앙에 배치하여 전체 화면에서 분석 결과를 확인할 수 있습니다.
 *
 * @returns 유형 분석 페이지 JSX 요소
 */
const Analysis = () => {
  return (
    <AnalysisContainer>
      <ContentWrapper>
        <Content />
      </ContentWrapper>
    </AnalysisContainer>
  );
};

export default Analysis;

/**
 * 분석 페이지 컨테이너 스타일드 컴포넌트
 *
 * 전체 분석 페이지를 감싸는 컨테이너로, 중앙 정렬과 배경 스타일을 제공합니다.
 */
const AnalysisContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  margin: 0 auto;
  border: 1px solid ${theme.colors.gray1};
  padding: 1rem;
`;

/**
 * 컨텐츠 래퍼 스타일드 컴포넌트
 *
 * 분석 컨텐츠를 감싸는 래퍼로, 전체 너비를 사용하여 컨텐츠를 배치합니다.
 */
const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`;
