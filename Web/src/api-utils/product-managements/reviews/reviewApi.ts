import { Axios } from '@/api-utils/Axios';

// Presigned URL 발급
export interface PresignedUrlResponse {
  url: string;
  key: string;
}

export const getReviewPresignedUrl = async (
  filename: string,
  contentType: string
): Promise<PresignedUrlResponse> => {
  const res = await Axios.get<PresignedUrlResponse>('/review/upload-url', {
    params: { filename, contentType },
  });
  return res.data;
};

// 리뷰 등록
export interface CreateReviewRequest {
  productId: number;
  rentalScheduleId: number;
  productRating: number;
  serviceRating: number;
  content: string;
  imageUrl?: string;
}

export const createReview = async (
  data: CreateReviewRequest
): Promise<void> => {
  await Axios.post('/review', data);
};

// 내 리뷰 목록 조회
export interface MyReview {
  id: number;
  productName: string;
  productRating: number;
  serviceRating: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface MyReviewsResponse {
  total: number;
  reviews: MyReview[];
}

export const getMyReviews = async (
  page = 1,
  limit = 10
): Promise<MyReviewsResponse> => {
  const res = await Axios.get<MyReviewsResponse>('/review/mine', {
    params: { page, limit },
  });
  return res.data;
};
