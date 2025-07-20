// 공통 타입 정의

// 사용자 관련 타입
export interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  name: string;
  phone: string;
  profileImageUrl?: string;
}

// 멤버십 관련 타입
export interface MembershipInfo {
  membershipId: number;
  membershipName: string;
  membershipLevel: string;
  pointBalance: number;
  totalRentalCount: number;
}

// 카드 관련 타입
export interface CardItem {
  cardId: number;
  cardName: string;
  cardNumber: string;
  cardType: string;
  isDefault: boolean;
}

// 상품 관련 타입
export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  category: string;
}

// 브랜드 관련 타입
export interface Brand {
  brandId: number;
  brandName: string;
  brandImageUrl: string;
  company?: string;
}

// 티켓 관련 타입
export interface Ticket {
  ticketId: number;
  ticketName: string;
  ticketType: string;
  remainingCount: number;
  totalCount: number;
  expiryDate: string;
}

// 스케줄 관련 타입
export interface Schedule {
  scheduleId: number;
  scheduleName: string;
  startDate: string;
  endDate: string;
  status: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 페이지네이션 타입
export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// 모달 관련 타입
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// 폼 관련 타입
export interface FormData {
  [key: string]: unknown;
}

// 네이티브 앱 관련 타입
export interface NativeApp {
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
}

// Payple 관련 타입
export interface PayCallbackResult {
  success: boolean;
  message: string;
  data?: unknown;
}
