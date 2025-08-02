/**
 * 예약 요약 정보 컴포넌트 (Summary.tsx)
 *
 * 예약 스케줄에서 선택된 날짜 범위와 시즌 진행 상황을 요약하여 표시하는 컴포넌트입니다.
 * 선택된 스케줄과 시즌 진행 회차 정보를 제공합니다.
 *
 * @description
 * - 선택된 날짜 범위 표시
 * - 시즌 진행 회차 정보
 * - 날짜 포맷팅 기능
 * - 반응형 레이아웃
 */
// src/components/melpiks/schedules/reservations/Summary.tsx
import React from 'react';
import styled from 'styled-components';

/**
 * 요약 정보 Props
 *
 * @property range - 선택된 날짜 범위 [시작일, 종료일] (선택)
 * @property seasonProgress - 시즌 진행 상황 정보
 * @property seasonProgress.total - 총 회차 수
 * @property seasonProgress.completed - 완료된 회차 수
 * @property seasonProgress.pending - 대기 중인 회차 수
 */
interface SummaryProps {
  range: [Date, Date] | null;
  seasonProgress: {
    total: number;
    completed: number;
    pending: number;
  };
}

/**
 * 예약 요약 정보 컴포넌트
 *

 * 예약 스케줄에서 선택된 날짜 범위와 시즌 진행 상황을 요약하여 표시합니다.
 * 날짜 포맷팅과 진행 상황 정보를 제공합니다.
 *
 * @param range - 선택된 날짜 범위 [시작일, 종료일] (선택)
 * @param seasonProgress - 시즌 진행 상황 정보
 * @returns 요약 정보 JSX 요소
 */
const Summary: React.FC<SummaryProps> = ({ range, seasonProgress }) => {
  /**
   * 날짜 범위 텍스트 포맷팅
   *
   * 선택된 날짜 범위를 '월 일 ~ 월 일' 형태로 포맷팅합니다.
   * 날짜가 선택되지 않은 경우 안내 메시지를 반환합니다.
   *
   * @returns 포맷팅된 날짜 범위 텍스트
   */
  const formatRangeText = () => {
    if (!range) return '날짜 선택 필요';
    const [start, end] = range;
    const startMonth = start.getMonth() + 1;
    const startDay = start.getDate();
    const endMonth = end.getMonth() + 1;
    const endDay = end.getDate();
    return `${startMonth}월 ${startDay}일 ~ ${endMonth}월 ${endDay}일`;
  };

  return (
    <SummaryContainer>
      <ScheduleInfo>
        <Label>선택된 스케줄</Label>
        <InfoBox>
          <InfoText>{formatRangeText()}</InfoText>
        </InfoBox>
      </ScheduleInfo>
      <ScheduleInfo>
        <Label>시즌 진행 회차</Label>
        <InfoBox>
          <InfoText>
            총 {seasonProgress.total}회 / 완료 {seasonProgress.completed}회
          </InfoText>
        </InfoBox>
      </ScheduleInfo>
    </SummaryContainer>
  );
};

export default Summary;

/**
 * 요약 컨테이너
 *

 * 요약 정보 전체를 감싸는 컨테이너입니다.
 * 상단 마진과 가로 배치를 제공합니다.
 */
const SummaryContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
`;

/**
 * 스케줄 정보 섹션
 *

 * 개별 스케줄 정보를 감싸는 섹션입니다.
 * flex: 1로 균등한 너비를 가집니다.
 */
const ScheduleInfo = styled.div`
  flex: 1;
`;

/**
 * 라벨 텍스트
 *

 * 정보 섹션의 라벨을 표시하는 텍스트입니다.
 */
const Label = styled.label`
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
  color: #000000;
`;

/**
 * 정보 박스
 *

 * 실제 정보를 표시하는 박스입니다.
 * 테두리와 패딩을 적용합니다.
 */
const InfoBox = styled.div`
  margin-top: 10px;
  padding: 0 10px;
  border: 1px solid #000;

  min-height: 51px;
  display: flex;
  align-items: center;
`;

/**
 * 정보 텍스트
 *

 * 실제 정보를 표시하는 텍스트입니다.
 * 굵은 폰트로 강조됩니다.
 */
const InfoText = styled.div`
  font-weight: 800;
  font-size: 13px;
  line-height: 14px;
  color: #000000;
`;
