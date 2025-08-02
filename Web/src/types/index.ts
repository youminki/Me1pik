/**
 * Melpik 애플리케이션 공통 타입 정의
 *
 * 애플리케이션 전체에서 사용되는 타입들을 정의합니다.
 * 각 타입은 명확한 목적과 구조를 가지고 있습니다.
 */

/**
 * 사용자 정보 타입
 *
 * 사용자의 기본 정보를 담는 인터페이스
 */
export interface UserInfo {
  id: number; // 사용자 고유 ID
  email: string; // 이메일 주소
  nickname: string; // 닉네임
  name: string; // 실명
  phone: string; // 전화번호
  profileImageUrl?: string; // 프로필 이미지 URL (선택사항)
}

/**
 * 멤버십 정보 타입
 *
 * 사용자의 멤버십 등급과 포인트 정보를 담는 인터페이스
 */
export interface MembershipInfo {
  membershipId: number; // 멤버십 고유 ID
  membershipName: string; // 멤버십 이름
  membershipLevel: string; // 멤버십 등급
  pointBalance: number; // 포인트 잔액
  totalRentalCount: number; // 총 대여 횟수
}

/**
 * 카드 정보 타입
 *
 * 결제 카드 정보를 담는 인터페이스
 */
export interface CardItem {
  cardId: number; // 카드 고유 ID
  cardName: string; // 카드명
  cardNumber: string; // 카드번호 (마스킹된 형태)
  cardType: string; // 카드 타입
  isDefault: boolean; // 기본 카드 여부
}

/**
 * 상품 정보 타입
 *
 * 대여 상품의 기본 정보를 담는 인터페이스
 */
export interface Product {
  id: number; // 상품 고유 ID
  name: string; // 상품명
  brand: string; // 브랜드명
  price: number; // 가격
  imageUrl: string; // 상품 이미지 URL
  category: string; // 카테고리
}

/**
 * 브랜드 정보 타입
 *
 * 브랜드의 기본 정보를 담는 인터페이스
 */
export interface Brand {
  brandId: number; // 브랜드 고유 ID
  brandName: string; // 브랜드명
  brandImageUrl: string; // 브랜드 이미지 URL
  company?: string; // 회사명 (선택사항)
}

/**
 * 티켓 정보 타입
 *
 * 대여 티켓의 정보를 담는 인터페이스
 */
export interface Ticket {
  ticketId: number; // 티켓 고유 ID
  ticketName: string; // 티켓명
  ticketType: string; // 티켓 타입
  remainingCount: number; // 남은 횟수
  totalCount: number; // 총 횟수
  expiryDate: string; // 만료일
}

/**
 * 스케줄 정보 타입
 *
 * 예약 스케줄 정보를 담는 인터페이스
 */
export interface Schedule {
  scheduleId: number; // 스케줄 고유 ID
  scheduleName: string; // 스케줄명
  startDate: string; // 시작일
  endDate: string; // 종료일
  status: string; // 상태
}

/**
 * API 응답 타입
 *
 * 서버 API 응답의 공통 구조를 정의
 *
 * @template T - 응답 데이터 타입
 */
export interface ApiResponse<T> {
  success: boolean; // 요청 성공 여부
  data: T; // 응답 데이터
  message?: string; // 응답 메시지 (선택사항)
}

/**
 * 페이지네이션 정보 타입
 *
 * 목록 조회 시 페이지 정보를 담는 인터페이스
 */
export interface PaginationInfo {
  page: number; // 현재 페이지
  size: number; // 페이지 크기
  totalElements: number; // 전체 요소 수
  totalPages: number; // 전체 페이지 수
}

/**
 * 모달 컴포넌트 Props 타입
 *
 * 모달 컴포넌트의 공통 속성을 정의
 */
export interface ModalProps {
  isOpen: boolean; // 모달 열림 상태
  onClose: () => void; // 닫기 핸들러
  children?: React.ReactNode; // 모달 내용
  title?: string; // 모달 제목 (선택사항)
  width?: string; // 모달 너비 (선택사항)
  height?: string; // 모달 높이 (선택사항)
}

export interface ItemCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export interface ItemListProps {
  items: ItemCardProps[];
  onItemClick?: (item: ItemCardProps) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface StatsSectionProps {
  visits: string;
  sales: string;
  dateRange: string;
  visitLabel: string;
  salesLabel: string;
}

export interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

export interface BottomBarProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  required?: boolean;
  disabled?: boolean;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
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

// 에러 처리 관련 타입들
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaypleError {
  message: string;
  code: string;
  status: number;
}

// 외부 라이브러리 타입들
export interface DaumPostcode {
  Postcode: {
    new: (options: {
      oncomplete: (data: {
        address: string;
        addressType: string;
        bname: string;
        buildingName: string;
        apartment: string;
        zonecode: string;
        postcode: string;
      }) => void;
      onclose: () => void;
    }) => void;
  };
}

export interface PaypleWindow extends Window {
  PaypleCpayAuthCheck?: (data: unknown) => void;
  PCD_PAY_CALLBACK?: (result: unknown) => void;
  handleWebLogout?: () => void;
  saveLoginInfo?: (data: Record<string, unknown>) => void;
}

// 유틸리티 타입들
export type ErrorHandler = (error: unknown) => void;
export type SuccessHandler<T> = (data: T) => void;
