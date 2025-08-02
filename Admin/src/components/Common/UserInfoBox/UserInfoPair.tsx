import styled from 'styled-components';

/**
 * 사용자 정보 쌍(UserInfoPair)
 *
 * - 라벨과 입력 필드를 쌍으로 묶는 컨테이너
 * - flex 레이아웃, 정렬 등 기본 스타일링 제공
 * - 재사용 가능한 공통 컴포넌트
 */
export const UserInfoPair = styled.div`
  display: flex;
  align-items: center;
  flex: 1 1 0;
  min-width: 0;
`;

/**
 * 사용자 정보 쌍 스타일드 컴포넌트
 * - flex 레이아웃, 정렬, 크기 등 스타일링
 */
