// 공통 상태 뱃지 유틸

export const statusBadgeMap: Record<string, { label: string; background: string }> = {
  // 제품 관련
  등록완료: { label: '등록완료', background: '#4AA361' },
  등록대기: { label: '등록대기', background: '#3071B2' },
  판매종료: { label: '판매종료', background: '#CD5542' },

  // 브랜드 관련
  계약종료: { label: '계약종료', background: '#CD5542' },

  // 배송상태 관련
  신청완료: { label: '신청완료', background: '#6c757d' },
  배송준비: { label: '배송준비', background: '#000000' },
  배송중: { label: '배송중', background: '#3071B2' },
  배송완료: { label: '배송완료', background: '#4AA361' },
  배송취소: { label: '배송취소', background: '#CD5542' },
  반납중: { label: '반납중', background: '#fd7e14' },
  반납완료: { label: '반납완료', background: '#6c757d' },

  // 기존 배송상태 (호환성 유지)
  배송준비중: { label: '배송준비중', background: '#000000' },
  '배송 준비중': { label: '배송 준비중', background: '#6f42c1' },
  '배송 중': { label: '배송 중', background: '#3071B2' },
  '배송 완료': { label: '배송 완료', background: '#4AA361' },
  주문취소중: { label: '주문취소중', background: '#CD5542' },
  주문취소: { label: '주문취소', background: '#AAAAAA' },

  // 결제상태 관련
  결제완료: { label: '결제완료', background: '#17a2b8' },
  결제대기: { label: '결제대기', background: '#6f42c1' },
  취소요청: { label: '취소요청', background: '#fd7e14' },
  취소완료: { label: '취소완료', background: '#CD5542' },

  // 이용권 상태
  이용완료: { label: '이용완료', background: '#28a745' },
  이용중: { label: '이용중', background: '#3071B2' },
  만료: { label: '만료', background: '#6c757d' },
  취소: { label: '취소', background: '#CD5542' },
  사용불가: { label: '사용불가', background: '#6c757d' },

  // 백엔드 상태 (영어)
  ACTIVE: { label: '이용중', background: '#3071B2' },
  PENDING: { label: '대기중', background: '#6f42c1' },
  CANCEL_REQUEST: { label: '취소요청', background: '#fd7e14' },
  CANCELLED: { label: '취소완료', background: '#CD5542' },

  // 결제수단 상태
  정상: { label: '정상', background: '#4AA361' },
  정지: { label: '정지', background: '#CD5542' },

  // 제품상태
  좋음: { label: '좋음', background: '#4AA361' },
  보통: { label: '보통', background: '#6f42c1' },
  나쁨: { label: '나쁨', background: '#CD5542' },

  // 회원 등급
  '제휴사 단골': { label: '제휴사 단골', background: '#3071B2' },
  단골: { label: '단골', background: '#F6AE24' },
  일반: { label: '일반', background: '#4AA361' },
  테스트: { label: '테스트', background: '#fd7e14' },
};

export function getStatusBadge(status: string) {
  return statusBadgeMap[status] || { label: status, background: '#6c757d' };
}
