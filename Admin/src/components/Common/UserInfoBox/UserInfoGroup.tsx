import styled from 'styled-components';

/**
 * 사용자 정보 그룹(UserInfoGroup)
 *
 * - 사용자 정보 관련 요소들을 가로로 그룹화하는 컨테이너
 * - flex 레이아웃, 간격, 정렬 등 기본 스타일링 제공
 * - 재사용 가능한 공통 컴포넌트
 */
export const UserInfoGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 0;
`;

/**
 * 사용자 정보 그룹 스타일드 컴포넌트
 * - 가로 배치, 간격, 정렬 등 스타일링
 */
