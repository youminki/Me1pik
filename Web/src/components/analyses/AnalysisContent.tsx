/**
 * 유형 분석 컨텐츠 컴포넌트 (AnalysisContent.tsx)
 *
 * 사용자의 유형을 분석하고 결과를 표시하는 컴포넌트입니다.
 * 분석 결과를 시각적으로 표현하고 사용자에게 인사이트를 제공합니다.
 *
 * @description
 * - 사용자 유형 분석 결과 표시
 * - 분석 데이터 시각화
 * - 사용자 인사이트 제공
 * - 반응형 디자인 지원
 */
import styled from 'styled-components';

/**
 * 유형 분석 컨텐츠 컴포넌트
 *
 * 사용자의 유형 분석 결과를 표시하는 메인 컴포넌트입니다.
 * 현재는 기본적인 레이아웃만 제공하며, 향후 분석 기능이 확장될 예정입니다.
 *
 * @returns 유형 분석 컨텐츠 JSX 요소
 */
const AnalysisContent = () => {
  return (
    <ContentContainer>
      <h1>유형 분석</h1>
      <p>여기에서 사용자의 유형을 분석할 수 있습니다.</p>
    </ContentContainer>
  );
};

export default AnalysisContent;

/**
 * 컨텐츠 컨테이너 스타일드 컴포넌트
 *
 * 분석 컨텐츠를 감싸는 컨테이너로, 중앙 정렬과 그림자 효과를 제공합니다.
 */
const ContentContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
`;
