import styled from 'styled-components';

const AnalysisContent = () => {
  return (
    <ContentContainer>
      <h1>유형 분석</h1>
      <p>여기에서 사용자의 유형을 분석할 수 있습니다.</p>
    </ContentContainer>
  );
};

export default AnalysisContent;

const ContentContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
`;
