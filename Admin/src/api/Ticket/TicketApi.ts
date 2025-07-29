import { Axios } from 'src/api/Axios';

/**
 * 관리자용 이용권 항목 스펙
 * 백엔드 예시 응답:
 * {
 *   "id": 17,
 *   "purchaseDate": "2025-05-01",
 *   "nextDate": "2025-06-01",
 *   "user": "홍길동 (gildong)",
 *   "ticket_name": "무제한 이용권",
 *   "이용기간": "2025-05-01 ~ 2025-08-01",
 *   "ticket_count": "∞ / 3",
 *   "ticket_status": "ACTIVE"  // 또는 "PENDING", "CANCEL_REQUEST", "CANCELLED" 등
 * }
 */
export interface AdminTicketItem {
  id: number;
  purchaseDate: string;
  nextDate: string;
  user: string;
  ticket_name: string;
  이용기간: string;
  ticket_count: string;
  ticket_status: string;
}

/**
 * 관리자용 페이징 응답 스펙
 */
export interface AdminPaginatedTicketsResponse {
  total: number;
  tickets: AdminTicketItem[];
}

/**
 * 관리자용: 이용권 목록(페이지네이션) 조회
 * GET /ticket/admin/paginated? page={page}&limit={limit}
 */
export const getAdminPaginatedTickets = async (
  page: number,
  limit: number,
): Promise<AdminPaginatedTicketsResponse> => {
  const response = await Axios.get<AdminPaginatedTicketsResponse>('/ticket/admin/paginated', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * 관리자용: 단일 이용권 상세 조회
 * GET /ticket/user/{id}
 * - 성공: 200, AdminTicketItem 반환
 * - 실패: 404
 */
export const getAdminTicketById = async (id: number): Promise<AdminTicketItem> => {
  const response = await Axios.get<AdminTicketItem>(`/ticket/user/${id}`);
  return response.data;
};

/**
 * 관리자용: 이용권 상태 변경
 * PATCH /ticket/{id}/status
 * Request body 예:
 * {
 *   "status": "취소완료",
 *   "isActive": false
 * }
 * - 200: 수정된 AdminTicketItem 반환
 * - 404: 해당 ID 없음
 */
export const changeTicketStatus = async (
  id: number,
  body: {
    status: string;
    isActive: boolean;
  },
): Promise<AdminTicketItem> => {
  const response = await Axios.patch<AdminTicketItem>(`/ticket/${id}/status`, body);
  return response.data;
};

/**
 * 관리자용: 무제한권 ↔ 제한권 전환
 * PATCH /ticket/convert-ticket/{ticketId}
 * - 200: 변경된 AdminTicketItem 반환
 * - 400: 전환 불가
 * - 401: 권한 문제
 */
export const convertTicketType = async (ticketId: number): Promise<AdminTicketItem> => {
  const response = await Axios.patch<AdminTicketItem>(`/ticket/convert-ticket/${ticketId}`);
  return response.data;
};

/**
 * 관리자용: 이용권 삭제
 * DELETE /ticket-list/{id}
 * - 200: 삭제 성공
 * - 401: 관리자 인증 필요
 * - 404: 해당 ID 없음
 */
export const deleteAdminTicketById = async (id: number): Promise<void> => {
  await Axios.delete(`/ticket-list/${id}`);
};
