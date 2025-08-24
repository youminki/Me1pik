// src/api/rentalScheduleAdminApi.ts

import { Axios } from 'src/api/Axios';

/**
 * 관리자: 전체 대여 내역 조회 (페이징 지원)
 * GET /rental-schedule?limit={limit}&page={page}
 */
export interface RentalScheduleAdminItem {
  id: number;
  userName: string;
  nickname: string;
  rentalPeriod: string; // "YYYY-MM-DD ~ YYYY-MM-DD"
  brand: string;
  category: string;
  productNum: string;
  color: string;
  size: string;
  ticketName: string;
  deliveryStatus: string;
  createAt: string;
}

export interface RentalScheduleAdminListResponse {
  count: number;
  rentals: RentalScheduleAdminItem[];
}

export const getRentalSchedules = async (
  limit: number = 10,
  page: number = 1,
): Promise<RentalScheduleAdminListResponse> => {
  const response = await Axios.get<RentalScheduleAdminListResponse>('/rental-schedule', {
    params: { limit, page },
  });
  return response.data;
};

/**
 * 관리자: 특정 대여 내역 상세 조회
 * GET /rental-schedule/detail/{id}
 */
export interface DeliveryInfo {
  shipping: {
    address: string;
    detailAddress: string;
    phone: string;
    receiver: string;
    deliveryMethod: string;
    message: string;
  };
  return: {
    address: string;
    detailAddress: string;
    phone: string;
  };
}

export interface RentalScheduleAdminDetailResponse {
  id: number;
  userName: string;
  rentalPeriod: string;
  brand: string;
  category: string;
  productNum: string;
  color: string;
  size: string;
  ticketName: string;
  deliveryInfo: DeliveryInfo;
  paymentStatus?: '결제완료' | '취소요청' | '취소완료';
  deliveryStatus?:
    | '신청완료'
    | '배송준비'
    | '배송중'
    | '배송완료'
    | '배송취소'
    | '반납중'
    | '반납완료';
  isCleaned: boolean;
  isRepaired: boolean;
}

export const getRentalScheduleDetail = async (
  id: number,
): Promise<RentalScheduleAdminDetailResponse> => {
  const response = await Axios.get<RentalScheduleAdminDetailResponse>(
    `/rental-schedule/detail/${id}`,
  );
  return response.data;
};

/**
 * 관리자: 대여 상태 수정
 * PATCH /rental-schedule/{id}/status
 */
export interface UpdateRentalStatusRequest {
  paymentStatus?: '결제완료' | '취소요청' | '취소완료';
  deliveryStatus?:
    | '신청완료'
    | '배송준비'
    | '배송중'
    | '배송완료'
    | '배송취소'
    | '반납중'
    | '반납완료';
  isCleaned?: boolean;
  isRepaired?: boolean;
}

export interface UpdateRentalStatusResponse {
  id: number;
  payment_status: string;
  delivery_status: string;
  is_cleaned: boolean;
  is_repaired: boolean;
}

export const updateRentalScheduleStatus = async (
  id: number,
  payload: UpdateRentalStatusRequest,
): Promise<UpdateRentalStatusResponse> => {
  const response = await Axios.patch<UpdateRentalStatusResponse>(
    `/rental-schedule/${id}/status`,
    payload,
  );
  return response.data;
};

/**
 * 관리자: 대여 기간 변경
 * PATCH /admin/rental/{id}/change-period
 *
 * Request body:
 * {
 *   startDate: "YYYY-MM-DD",
 *   endDate: "YYYY-MM-DD"
 * }
 *
 * Response example:
 * {
 *   "message": "대여 기간이 성공적으로 수정되었습니다.",
 *   "rentalId": 123,
 *   "newStartDate": "2025-07-01",
 *   "newEndDate": "2025-07-07"
 * }
 */
export interface ChangeRentalPeriodRequest {
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
}

export interface ChangeRentalPeriodResponse {
  message: string;
  rentalId: number;
  newStartDate: string; // "YYYY-MM-DD"
  newEndDate: string; // "YYYY-MM-DD"
}

export const changeRentalSchedulePeriod = async (
  id: number,
  payload: ChangeRentalPeriodRequest,
): Promise<ChangeRentalPeriodResponse> => {
  const response = await Axios.patch<ChangeRentalPeriodResponse>(
    `/admin/rental/${id}/change-period`,
    payload,
  );
  return response.data;
};

/**
 * 관리자: 대여 제품정보 변경
 * PATCH /admin/rental/{id}/change-product
 *
 * Request body:
 * {
 *   "productNum": "ITP4DPT850",
 *   "sizeLabel": "55",
 *   "color": "BLUE"
 * }
 *
 * Response example:
 * {
 *   "id": 1,
 *   "product_id": 1,
 *   "product_size_stock_id": 1
 * }
 */
export interface ChangeRentalProductRequest {
  productNum: string; // 품번
  sizeLabel: string; // 사이즈 라벨
  color: string; // 색상
}

export interface ChangeRentalProductResponse {
  id: number;
  product_id: number;
  product_size_stock_id: number;
}

export const changeRentalScheduleProduct = async (
  id: number,
  payload: ChangeRentalProductRequest,
): Promise<ChangeRentalProductResponse> => {
  const response = await Axios.patch<ChangeRentalProductResponse>(
    `/admin/rental/${id}/change-product`,
    payload,
  );
  return response.data;
};

/**
 * 관리자: 대여 ID로 상세 내역 조회 (관리자 전용)
 * GET /rental-schedule/search-by-rental-id?rentalId={rentalId}
 *
 * Response 예시:
 * {
 *   "id": 320,
 *   "userName": "홍길동",
 *   "nickname": "gildong",
 *   "userEmail": "gildong@example.com",
 *   "userMembership": "프리미엄",
 *   "createAt": "2025-06-22 18:32:10",
 *   "order_num": 42,
 *   "cancel_at": "string",
 *   "pointUsed": 1000,
 *   "extraCharge": 5000,
 *   "productName": "J244KSL027",
 *   "brand": "GUCCI",
 *   "color": "Black",
 *   "size": "M",
 *   "delivery_method": "일반배송",
 *   "ticketName": "무제한권",
 *   "rentalPeriod": "2025-06-01 ~ 2025-06-07",
 *   "category": "상의",
 *   "paymentStatus": "결제완료",
 *   "delivery_info": { ... },
 *   "deliveryStatus": "배송중",
 *   "is_cleaned": true,
 *   "is_repaired": true
 * }
 */
export interface RentalScheduleAdminByRentalIdResponse {
  id: number;
  userName: string;
  nickname: string;
  userEmail: string;
  userMembership: string;
  createAt: string; // "YYYY-MM-DD HH:mm:ss" 등
  orderNum: number;
  cancelAt: string | null;
  pointUsed: number;
  extraCharge: number;
  productName: string;
  brand: string;
  color: string;
  size: string;
  deliveryMethod: string;
  ticketName: string;
  rentalPeriod: string; // "YYYY-MM-DD ~ YYYY-MM-DD"
  category: string;
  paymentStatus: string;
  deliveryInfo: {
    shipping: {
      address: string;
      detailAddress: string;
      phone: string;
      receiver: string;
      deliveryMethod: string;
      message: string;
    };
    return: {
      address: string;
      detailAddress: string;
      phone: string;
    };
  };
  deliveryStatus: string;
  isCleaned: boolean;
  isRepaired: boolean;
}

export const getRentalScheduleByRentalId = async (
  rentalId: number,
): Promise<RentalScheduleAdminByRentalIdResponse> => {
  const response = await Axios.get<any>('/rental-schedule/search-by-rental-id', {
    params: { rentalId },
  });
  const data = response.data;
  // snake_case 필드를 camelCase로 매핑
  const mapped: RentalScheduleAdminByRentalIdResponse = {
    id: data.id,
    userName: data.userName,
    nickname: data.nickname,
    userEmail: data.userEmail,
    userMembership: data.userMembership,
    createAt: data.createAt,
    orderNum: data.order_num,
    cancelAt: data.cancel_at ?? null,
    pointUsed: data.pointUsed,
    extraCharge: data.extraCharge,
    productName: data.productName,
    brand: data.brand,
    color: data.color,
    size: data.size,
    deliveryMethod: data.delivery_method,
    ticketName: data.ticketName,
    rentalPeriod: data.rentalPeriod,
    category: data.category,
    paymentStatus: data.paymentStatus,
    deliveryInfo: {
      shipping: {
        address: data.delivery_info.shipping.address,
        detailAddress: data.delivery_info.shipping.detailAddress,
        phone: data.delivery_info.shipping.phone,
        receiver: data.delivery_info.shipping.receiver,
        deliveryMethod: data.delivery_info.shipping.deliveryMethod,
        message: data.delivery_info.shipping.message,
      },
      return: {
        address: data.delivery_info.return.address,
        detailAddress: data.delivery_info.return.detailAddress,
        phone: data.delivery_info.return.phone,
      },
    },
    deliveryStatus: data.deliveryStatus,
    isCleaned: data.is_cleaned,
    isRepaired: data.is_repaired,
  };
  return mapped;
};

/**
 * 관리자: 제품 정보 조회 (드롭다운용)
 * GET /admin/products
 *
 * Response example:
 * {
 *   "products": [
 *     {
 *       "id": 1,
 *       "productNum": "ITP4DPT850",
 *       "name": "제품명",
 *       "brand": "브랜드명"
 *     }
 *   ]
 * }
 */
export interface ProductInfo {
  id: number;
  productNum: string;
  name: string;
  brand: string;
}

export interface GetProductsResponse {
  products: ProductInfo[];
}

export const getProducts = async (): Promise<GetProductsResponse> => {
  const response = await Axios.get<GetProductsResponse>('/admin/products');
  return response.data;
};

/**
 * 관리자: 사이즈 옵션 조회
 * GET /admin/sizes
 *
 * Response example:
 * {
 *   "sizes": ["XS", "S", "M", "L", "XL", "55", "66", "77"]
 * }
 */
export interface GetSizesResponse {
  sizes: string[];
}

export const getSizes = async (): Promise<GetSizesResponse> => {
  const response = await Axios.get<GetSizesResponse>('/admin/sizes');
  return response.data;
};

/**
 * 관리자: 색상 옵션 조회
 * GET /admin/colors
 *
 * Response example:
 * {
 *   "colors": ["BLACK", "WHITE", "BLUE", "RED", "GREEN"]
 * }
 */
export interface GetColorsResponse {
  colors: string[];
}

export const getColors = async (): Promise<GetColorsResponse> => {
  const response = await Axios.get<GetColorsResponse>('/admin/colors');
  return response.data;
};
