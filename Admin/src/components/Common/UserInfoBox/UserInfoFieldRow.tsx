import styled from 'styled-components';

/**
 * 사용자 정보 필드 행(UserInfoFieldRow)
 *
 * - 사용자 정보 입력 필드들을 가로로 배치하는 컨테이너
 * - 라벨과 입력 필드의 쌍, 반응형 레이아웃 등 지원
 * - 재사용 가능한 공통 컴포넌트
 */
export const UserInfoFieldRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
`;

/**
 * 사용자 정보 필드 행 스타일드 컴포넌트
 * - flex 레이아웃, 반응형, 래핑 등 스타일링
 */
export const UserInfoPair = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1 1 0; // 1:1 비율로 늘어남
  min-width: 0;
  gap: 15px;
`;

/**
 * 사용자 정보 라벨(UserInfoLabel)
 * - 입력 필드의 라벨을 표시하는 컴포넌트
 */
export const UserInfoLabel = styled.label`
  display: flex; // flex로!
  align-items: center; // 내부 텍스트도 중앙정렬
  justify-content: center; // 여러 열에서 중앙정렬
  width: auto;
  min-width: 50px;
  height: 40px; // input과 동일한 높이
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  padding: 0;
  /* width: 60px; // 필요시 고정 */
`;

/**
 * 사용자 정보 입력 필드(UserInfoInput)
 * - 사용자 정보를 입력받는 텍스트 필드
 */
export const UserInfoInput = styled.input`
  flex: 1 1 0;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 8px 10px;
  height: 40px; // label과 동일하게!
  border: 1px solid #aaa;
`;
