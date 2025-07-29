// 결제 상태 뱃지 스타일
export function getPaymentStatusBadge(status: string) {
  switch (status) {
    case '결제완료':
      return { background: '#4AA361', label: '결제완료' };
    case '취소요청':
      return { background: '#000000', label: '취소요청' };
    case '환불 진행중':
      return { background: '#CD5542', label: '환불 진행중' };
    case '환불완료':
      return { background: '#F39C12', label: '환불완료' };
    case '결제실패':
      return { background: '#AAAAAA', label: '결제실패' };
    default:
      return { background: '#6c757d', label: status };
  }
}

// 티켓 상태 뱃지 스타일
export function getTicketStatusBadge(status: string) {
  switch (status) {
    case '결제완료':
      return { background: '#3071B2', label: '결제완료' };
    case '결제대기':
      return { background: '#CD5542', label: '결제대기' };
    case '이용완료':
      return { background: '#28a745', label: '이용완료' };
    case '취소완료':
      return { background: '#AAAAAA', label: '취소완료' };
    default:
      return { background: '#6c757d', label: status };
  }
}

// 배송/모니터링 상태 뱃지 스타일
export function getDeliveryStatusBadge(status: string) {
  switch (status) {
    case '신청완료':
      return { background: '#ffb300', color: '#FFFFFF' };
    case '배송준비':
      return { background: '#000000', color: '#FFFFFF' };
    case '배송중':
      return { background: '#007bff', color: '#FFFFFF' };
    case '배송완료':
      return { background: '#4AA361', color: '#FFFFFF' };
    case '배송취소':
      return { background: '#c02626', color: '#FFFFFF' };
    case '반납중':
      return { background: '#6c757d', color: '#FFFFFF' };
    case '반납완료':
      return { background: '#6c757d', color: '#FFFFFF' };
    default:
      return { background: '#6c757d', color: '#FFFFFF' };
  }
}

// 회원 상태 뱃지 스타일
export function getUserStatusBadge(status: string) {
  switch (status) {
    case '정상':
      return { background: '#4AA361', label: '정상' };
    case '휴면':
      return { background: '#AAAAAA', label: '휴면' };
    case '탈퇴':
      return { background: '#CD5542', label: '탈퇴' };
    case '정지':
      return { background: '#F39C12', label: '정지' };
    default:
      return { background: '#6c757d', label: status };
  }
}

// 관리자 상태 뱃지 스타일
export function getAdminStatusBadge(status: string) {
  switch (status) {
    case 'active':
    case '활성':
      return { background: '#4AA361', label: '활성' };
    case 'inactive':
    case '비활성':
      return { background: '#AAAAAA', label: '비활성' };
    case 'suspended':
    case '정지':
      return { background: '#CD5542', label: '정지' };
    default:
      return { background: '#6c757d', label: status };
  }
}

// 브랜드 상태 뱃지 스타일
export function getBrandStatusBadge(status: string) {
  switch (status) {
    case '등록완료':
      return { background: '#4AA361', label: '등록완료' };
    case '계약종료':
      return { background: '#AAAAAA', label: '계약종료' };
    default:
      return { background: '#6c757d', label: status };
  }
}
