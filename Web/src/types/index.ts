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
  children?: React.ReactNode;
  title?: string;
  width?: string;
  height?: string;
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
