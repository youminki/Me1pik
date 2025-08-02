import styled, { keyframes } from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import TripleButtonDetailSubHeader from '@components/Header/TripleButtonDetailSubHeader';
import SizeGuideSection from '@components/productregister/SizeGuideSection';
import SizeDisplaySection from '@components/productregister/SizeDisplaySection';
import MaterialInfoSection from '@components/productregister/MaterialInfoSection';
import FabricInfoSection from '@components/productregister/FabricInfoSection';
import ProductImageSection from '@components/productregister/ProductImageSection';
import ImportedDetailTopBoxes from '@components/DetailTopBoxes';
import ReusableModal from '@components/TwoButtonModal';
import ReusableModal2 from '@components/OneButtonModal';

import { getProductDetail, updateProduct, ProductDetailResponse, SizeRow } from '@api/adminProduct';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';

/**
 * 제품 상세 페이지(ProductDetail)
 *
 * - 제품의 상세 정보를 조회, 편집, 삭제하는 페이지
 * - 스켈레톤 로딩, 모달, 이미지 관리, 사이즈 가이드 등 다양한 기능 지원
 * - 제품 정보 수정, 삭제, 이미지 업로드/삭제/재정렬 등 지원
 * - 재사용 가능한 공통 컴포넌트
 */

// 스켈레톤 애니메이션
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

/**
 * 스켈레톤 박스 스타일드 컴포넌트
 * - 기본 스켈레톤 박스 스타일링
 */
const SkeletonBox = styled.div<{ width?: string; height?: string }>`
  width: ${(props) => props.width || '100%'};
  height: ${(props) => props.height || '32px'};
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 12px;
`;

/**
 * 스켈레톤 입력 필드 스타일드 컴포넌트
 * - 입력 필드 스켈레톤 스타일링
 */
const SkeletonInput = styled(SkeletonBox)`
  border-radius: 0;
`;

/**
 * 스켈레톤 라벨 스타일드 컴포넌트
 * - 라벨 스켈레톤 스타일링
 */
const SkeletonLabel = styled(SkeletonBox)`
  width: 80px;
  height: 16px;
  border-radius: 2px;
`;

/**
 * 스켈레톤 버튼 스타일드 컴포넌트
 * - 버튼 스켈레톤 스타일링
 */
const SkeletonButton = styled(SkeletonBox)`
  width: 100px;
  height: 40px;
  border-radius: 4px;
`;

/**
 * 스켈레톤 이미지 스타일드 컴포넌트
 * - 이미지 스켈레톤 스타일링
 */
const SkeletonImage = styled(SkeletonBox)`
  width: 120px;
  height: 120px;
  border-radius: 8px;
`;

/**
 * 실제 DetailTopBoxes 구조에 맞는 스켈레톤
 * - 기본 정보와 추가 정보 섹션의 스켈레톤 구조
 */
const SkeletonDetailTopBoxes = () => (
  <DetailTopBoxesWrapper>
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      {/* 기본 정보 섹션 */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <SkeletonLabel style={{ marginBottom: '8px' }} />
        <SkeletonInput height="40px" />
        <SkeletonInput height="40px" />
        <SkeletonInput height="40px" />
      </div>
      {/* 추가 정보 섹션 */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <SkeletonLabel style={{ marginBottom: '8px' }} />
        <SkeletonInput height="40px" />
        <SkeletonInput height="40px" />
        <SkeletonInput height="40px" />
      </div>
    </div>
  </DetailTopBoxesWrapper>
);

/**
 * 실제 SizeGuideSection 구조에 맞는 스켈레톤
 * - 사이즈 가이드 섹션의 스켈레톤 구조
 */
const SkeletonSizeGuideSection = () => (
  <div style={{ flex: 1 }}>
    <SkeletonLabel style={{ marginBottom: '16px' }} />
    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
      <SkeletonButton width="80px" height="32px" />
      <SkeletonButton width="80px" height="32px" />
      <SkeletonButton width="80px" height="32px" />
    </div>
    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx}>
            <SkeletonLabel width="60px" height="12px" />
            <SkeletonInput height="32px" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * 실제 SizeDisplaySection 구조에 맞는 스켈레톤
 * - 사이즈 디스플레이 섹션의 스켈레톤 구조
 */
const SkeletonSizeDisplaySection = () => (
  <div style={{ flex: 1 }}>
    <SkeletonLabel style={{ marginBottom: '16px' }} />
    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
      <SkeletonImage style={{ margin: '0 auto 16px' }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
        }}
      >
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx}>
            <SkeletonLabel width="50px" height="12px" />
            <SkeletonInput height="28px" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * 실제 MaterialInfoSection 구조에 맞는 스켈레톤
 * - 재료 정보 섹션의 스켈레톤 구조
 */
const SkeletonMaterialInfoSection = () => (
  <div>
    <SkeletonLabel style={{ marginBottom: '16px' }} />
    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}
      >
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx}>
            <SkeletonLabel width="80px" height="14px" />
            <SkeletonInput height="40px" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * 실제 FabricInfoSection 구조에 맞는 스켈레톤
 * - 섬유 정보 섹션의 스켈레톤 구조
 */
const SkeletonFabricInfoSection = () => (
  <div>
    <SkeletonLabel style={{ marginBottom: '16px' }} />
    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
        }}
      >
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx}>
            <SkeletonLabel width="100px" height="14px" />
            <SkeletonInput height="40px" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * 실제 ProductImageSection 구조에 맞는 스켈레톤
 * - 제품 이미지 섹션의 스켈레톤 구조
 */
const SkeletonProductImageSection = () => (
  <div>
    <SkeletonLabel style={{ marginBottom: '16px' }} />
    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            <SkeletonImage width="120px" height="120px" />
            <SkeletonButton
              width="20px"
              height="20px"
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                borderRadius: '50%',
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: '16px' }}>
        <SkeletonLabel width="60px" height="14px" />
        <SkeletonInput height="40px" />
      </div>
    </div>
  </div>
);

/**
 * 전체 페이지 스켈레톤
 * - 제품 상세 페이지의 전체 스켈레톤 구조
 */
const SkeletonProductDetail = () => (
  <Container>
    <HeaderRow>
      <Title>제품상세</Title>
    </HeaderRow>

    {/* 헤더 버튼들 */}
    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
      <SkeletonButton width="100px" height="40px" />
      <SkeletonButton width="100px" height="40px" />
      <SkeletonButton width="100px" height="40px" />
    </div>

    {/* 제품 번호 */}
    <ProductNumberWrapper>
      <ProductNumberLabel>번호</ProductNumberLabel>
      <SkeletonBox width="40px" height="12px" />
    </ProductNumberWrapper>

    {/* DetailTopBoxes 스켈레톤 */}
    <SkeletonDetailTopBoxes />

    <MiddleDivider />

    {/* 폼 스켈레톤 */}
    <Form>
      <TwoColumn>
        <SkeletonSizeGuideSection />
        <SkeletonSizeDisplaySection />
      </TwoColumn>
      <MiddleDivider />
      <SkeletonMaterialInfoSection />
      <MiddleDivider />
      <SkeletonFabricInfoSection />
      <MiddleDivider />
      <SkeletonProductImageSection />
      <BottomDivider />
    </Form>
  </Container>
);

/**
 * 페이로드 정리 유틸리티 함수
 * - API 요청 시 불필요한 필드를 제거하는 함수
 */
const cleanPayload = <T extends object>(obj: T): Partial<T> => {
  const result = { ...(obj as Record<string, unknown>) } as Partial<T>;
  Object.entries(result).forEach(([key, value]) => {
    if (key === 'product_img') return;
    /**
     * size_label_guide는 빈 객체여도 유지
     *
     * 사이즈 가이드 정보는 빈 객체라도 필수 필드로 간주하여
     * API 요청 시 제거되지 않도록 합니다.
     */
    if (key === 'size_label_guide') {
      console.log('cleanPayload에서 size_label_guide 발견:', value);
      return;
    }
    if (
      value == null ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    ) {
      delete (result as Record<string, unknown>)[key];
    }
  });
  console.log('cleanPayload 결과:', result);
  return result;
};

/**
 * 제품 상세 페이지 컴포넌트
 * - 제품 상세 정보를 표시하고 편집하는 메인 컴포넌트
 */
const ProductDetail: React.FC = () => {
  const { no } = useParams<{ no: string }>();
  const productId = no ? Number(no) : null;
  const navigate = useNavigate();

  /**
   * 디버깅을 위한 navigate 함수 래핑
   * - 개발 환경에서 페이지 이동을 위한 디버그 함수
   */
  const debugNavigate = (path: string) => {
    console.log('debugNavigate 호출됨:', path);
    console.log('navigate 함수 타입:', typeof navigate);
    navigate(path);
  };

  const [images, setImages] = useState<string[]>([]);
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [sizeGuides, setSizeGuides] = useState<Record<string, SizeRow[]>>({});
  const [changed, setChanged] = useState<Partial<ProductDetailResponse & { sizes: SizeRow[] }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [getCurrentSizeLabels, setGetCurrentSizeLabels] = useState<
    (() => Record<string, string>) | null
  >(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    message: string;
    onConfirm?: () => Promise<void>;
  }>({ open: false, message: '' });
  const [resultConfig, setResultConfig] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: '' });

  /**
   * 확인 모달 열기 함수
   * - 확인 모달을 표시하는 함수
   */
  const openConfirm = (message: string, onConfirm?: () => Promise<void>) => {
    setConfirmConfig({ open: true, message, onConfirm });
  };
  /**
   * 결과 모달 열기 함수
   * - 결과 모달을 표시하는 함수
   */
  const openResult = (message: string) => {
    setResultConfig({ open: true, message });
  };

  const handleProductChange = useCallback(
    (data: Partial<ProductDetailResponse & { sizes: SizeRow[] }>) => {
      console.log('handleProductChange 호출:', data);
      /**
       * 가격 필드가 변경될 때 price(문자열)도 동기화
       *
       * retailPrice가 숫자로 변경되면 price 필드도 문자열로 동기화하여
       * API 요청 시 일관성을 유지합니다.
       */
      const extra: Partial<ProductDetailResponse & { price?: string }> =
        typeof data.retailPrice === 'number' ? { price: String(data.retailPrice) } : {};
      setProduct((prev) => (prev ? { ...prev, ...data, ...extra } : prev));
      setChanged((prev) => ({ ...prev, ...data, ...extra }));
    },
    [setProduct, setChanged],
  );
  const handleSizesChange = useCallback(
    (sizes: SizeRow[]) => handleProductChange({ sizes }),
    [handleProductChange],
  );

  const handleLabelChange = useCallback((labels: Record<string, string>) => {
    console.log('handleLabelChange 호출:', labels);
    // 라벨 변경을 changed 상태에 저장
    setChanged((prev) => ({ ...prev, size_label_guide: labels }));
  }, []);

  const updateImage = (idx: number, url: string | null) => {
    setImages((prev) => {
      const next = [...prev];
      if (url) next[idx] = url;
      else next.splice(idx, 1);
      handleProductChange({ product_img: next });
      return next;
    });
  };
  /**
   * 이미지 링크 업로드 핸들러
   * - 이미지 링크를 업로드하는 핸들러
   */
  const handleImageLinkUpload = (idx: number, url: string) => {
    updateImage(idx, url);
  };
  /**
   * 이미지 삭제 핸들러
   * - 특정 인덱스의 이미지를 삭제하는 핸들러
   */
  const handleImageDelete = (idx: number) => updateImage(idx, null);
  const handleImageReorder = (from: number, to: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      handleProductChange({ product_img: next });
      return next;
    });
  };

  /**
   * 상세 정보 조회 함수
   * - 제품 상세 정보를 API로부터 조회하는 함수
   */
  const fetchDetail = async (id: number) => {
    setLoading(true);
    try {
      const data = (await getProductDetail(id)) as ProductDetailResponse & {
        sizesByCategory: Record<string, SizeRow[]>;
      };
      // price(문자열)만 내려오는 경우를 위한 매핑 처리
      const raw: Partial<ProductDetailResponse & { price?: string }> = data as Partial<
        ProductDetailResponse & { price?: string }
      >;
      const retailPrice =
        typeof raw.retailPrice === 'number'
          ? raw.retailPrice
          : typeof raw.price === 'string'
            ? Number(raw.price)
            : 0;
      const sale_price =
        typeof raw.sale_price === 'number'
          ? raw.sale_price
          : typeof raw.sale_price === 'string'
            ? Number(raw.sale_price)
            : retailPrice;
      const rental_price =
        typeof raw.rental_price === 'number'
          ? raw.rental_price
          : typeof raw.rental_price === 'string'
            ? Number(raw.rental_price)
            : 0;
      setProduct({
        ...data,
        retailPrice,
        sale_price,
        rental_price,
      });
      setImages(data.product_img || []);
      setSizeGuides(data.sizesByCategory || {});
      setChanged({});
    } catch (fetchErr: unknown) {
      console.error('제품 상세 정보를 불러오는 중 오류 발생:', fetchErr);
      const errorMessage = fetchErr instanceof Error ? fetchErr.message : '알 수 없는 오류';
      setError(`제품 상세 정보를 불러오는데 실패했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId == null) {
      setError('유효한 제품 ID가 없습니다.');
      setLoading(false);
    } else {
      fetchDetail(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    const guide = sizeGuides[product.category];
    if (guide) {
      setProduct((prev) => (prev ? { ...prev, sizes: guide } : prev));
      setChanged((prev) => ({ ...prev, sizes: guide }));
    }
  }, [product?.category, sizeGuides, product]);

  /**
   * 저장 핸들러
   * - 제품 정보를 저장하는 핸들러
   */
  const handleSave = () => {
    if (!product) return;
    openConfirm('변경 내용을 저장하시겠습니까?', async () => {
      try {
        // 1) fabricComposition 정리: 빈값 제거 + 퍼센트 내림차순 정렬
        const rawComp = (changed.fabricComposition || product.fabricComposition) as Record<
          string,
          string
        >;
        const sortedComp: Record<string, string> = {};

        Object.entries(rawComp || {}).forEach(([key, value]) => {
          if (typeof value !== 'string') {
            return; // 문자열이 아닐 경우 건너뜀
          }
          const items = value
            .split(/\s*,\s*/)
            .map((str) => {
              const parts = str.split(/\s+/);
              const material = parts[0] || '';
              const numStr = parts[1] || '';
              const percent = numStr ? parseInt(numStr.replace('%', ''), 10) || 0 : 0;
              return { material, percent };
            })
            .filter((item) => item.material && item.percent > 0)
            .sort((a, b) => b.percent - a.percent);

          if (items.length > 0) {
            sortedComp[key] = items.map((i) => `${i.material} ${i.percent}%`).join(', ');
          }
        });

        // 2) payload 구성 - 순수 라벨만 저장 (접두사 제거)
        let currentLabels: Record<string, string> = {};

        if (getCurrentSizeLabels && typeof getCurrentSizeLabels === 'function') {
          currentLabels = getCurrentSizeLabels();
          console.log('getCurrentSizeLabels()에서 가져온 순수 라벨:', currentLabels);
        } else {
          currentLabels = changed.size_label_guide ?? product.size_label_guide ?? {};
          console.log('기존 데이터에서 가져온 라벨:', currentLabels);
        }

        console.log('최종 저장할 순수 라벨:', currentLabels);
        console.log('getCurrentSizeLabels 함수:', getCurrentSizeLabels);
        console.log('changed.size_label_guide:', changed.size_label_guide);
        console.log('product.size_label_guide:', product.size_label_guide);

        const payload: Partial<ProductDetailResponse & { sizes: SizeRow[] }> = {
          ...changed,
          product_img: images,
          fabricComposition: sortedComp,
          size_label_guide: currentLabels,
        };
        if (changed.sizes || product.sizes) {
          payload.sizes = (changed.sizes ?? product.sizes ?? []).map((row) => ({
            size: row.size,
            measurements: { ...row.measurements },
          }));
        }

        const cleaned = cleanPayload(payload);

        /**
         * size_label_guide가 제거되었을 경우 강제로 추가
         *
         * cleanPayload 함수에서 size_label_guide가 제거되었더라도
         * 현재 라벨 정보가 있다면 강제로 추가하여 데이터 무결성을 보장합니다.
         */
        if (!cleaned.size_label_guide && currentLabels && Object.keys(currentLabels).length > 0) {
          cleaned.size_label_guide = currentLabels;
          console.log('cleaned에서 size_label_guide가 제거되어 강제로 추가:', currentLabels);
        }

        // 디버그용: 전송 payload 콘솔 출력
        console.log('업데이트 전송 payload:', cleaned);
        console.log('사이즈 라벨 가이드:', cleaned.size_label_guide);
        console.log('사이즈 데이터:', cleaned.sizes);
        console.log('changed 상태:', changed);
        console.log('product 상태:', product);

        const updated = await updateProduct(product.id, cleaned);
        await fetchDetail(updated.id);
        setChanged({});
        openResult('수정 완료되었습니다.');
      } catch (updateErr: unknown) {
        console.error('제품 수정 중 오류 발생:', updateErr);
        const detailedMessage = updateErr instanceof Error ? updateErr.message : '알 수 없는 오류';
        openResult(`수정에 실패했습니다: ${detailedMessage}`);
      }
    });
  };

  /**
   * 삭제 핸들러
   * - 제품을 삭제하는 핸들러
   */
  const handleDelete = () => {
    openConfirm('정말 삭제하시겠습니까?', async () => {
      openResult('삭제에 실패했습니다.');
    });
  };

  if (loading) return <SkeletonProductDetail />;
  if (error) return <Container>{error}</Container>;

  return (
    <Container>
      <HeaderRow>
        <Title>제품상세</Title>
      </HeaderRow>
      <TripleButtonDetailSubHeader
        backLabel="목록이동"
        onBackClick={() => {
          console.log('목록이동 버튼 클릭됨');
          console.log('현재 URL:', window.location.href);
          console.log('이동할 URL:', `/productlist${window.location.search}`);
          debugNavigate(`/productlist${window.location.search}`);
        }}
        saveLabel="변경저장"
        onSaveClick={handleSave}
        deleteLabel="삭제"
        onDeleteClick={handleDelete}
      />
      <ProductNumberWrapper>
        <ProductNumberLabel>번호</ProductNumberLabel>
        <ProductNumberValue>{product?.id}</ProductNumberValue>
      </ProductNumberWrapper>

      {product && (
        <>
          <DetailTopBoxesWrapper>
            <ImportedDetailTopBoxes product={product} editable onChange={handleProductChange} />
          </DetailTopBoxesWrapper>
          <MiddleDivider />
          <Form onSubmit={(e: FormEvent) => e.preventDefault()}>
            <TwoColumn>
              <SizeGuideSection
                category={product.category}
                sizes={changed.sizes ?? product.sizes ?? []}
                onSizesChange={handleSizesChange}
                onLabelChange={handleLabelChange}
                onSetGetCurrentLabels={setGetCurrentSizeLabels}
                style={{ height: 0 }}
              />
              <SizeDisplaySection
                product={product}
                sizeProductImg={product.size_picture}
                onLabelChange={handleLabelChange}
                style={{ height: 0 }}
              />
            </TwoColumn>
            <MiddleDivider />
            <MaterialInfoSection
              product={product}
              editable
              onChange={handleProductChange}
              style={{ height: 0 }}
            />
            <MiddleDivider />
            <FabricInfoSection
              product={product}
              onChange={handleProductChange}
              style={{ height: 0 }}
            />
            <MiddleDivider />
            <ProductImageSection
              images={images}
              handleImageLinkUpload={handleImageLinkUpload}
              handleImageDelete={handleImageDelete}
              handleImageReorder={handleImageReorder}
              productUrl={product.product_url}
              style={{ height: 0 }}
            />
            <BottomDivider />
          </Form>
        </>
      )}

      <ReusableModal
        isOpen={confirmConfig.open}
        title="알림"
        onClose={() => setConfirmConfig((c) => ({ ...c, open: false }))}
        onConfirm={async () => {
          setConfirmConfig((c) => ({ ...c, open: false }));
          if (confirmConfig.onConfirm) await confirmConfig.onConfirm();
        }}
      >
        {confirmConfig.message}
      </ReusableModal>
      <ReusableModal2
        isOpen={resultConfig.open}
        title="알림"
        onClose={() => setResultConfig((c) => ({ ...c, open: false }))}
      >
        {resultConfig.message}
      </ReusableModal2>
    </Container>
  );
};

export default ProductDetail;

/* Styled Components */
const Container = styled.div`
  width: 100%;

  max-width: 100vw;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  overflow-y: auto;
  padding: 12px 8px 0 8px;

  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 4px;
  }
`;
const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;
const Title = styled.h1`
  font-size: 16px;
  font-weight: 700;
`;
const ProductNumberWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 10px 0 34px;
`;
const ProductNumberLabel = styled.div`
  font-weight: 700;
  font-size: 12px;
`;
const ProductNumberValue = styled.div`
  font-weight: 900;
  font-size: 12px;
`;
const MiddleDivider = styled.hr`
  border: 0;
  border-top: 1px dashed #ddd;
  margin: 12px 0; // 기존 30px → 12px로 줄임
  @media (max-width: 834px) {
    margin: 8px 0;
  }
`;
const BottomDivider = styled.hr`
  border: 0;
  border-top: 1px solid #ddd;
  margin: 40px 0 20px;
  @media (max-width: 834px) {
    margin: 20px 0 10px;
  }
`;
const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  /* flex: 1; */
  /* min-height: 0; */
  /* overflow-y: auto; */
  @media (max-width: 834px) {
    gap: 16px;
  }
`;
const TwoColumn = styled.div`
  width: 100%;
  display: flex;
  gap: 32px;
  margin-bottom: 10px;
  align-items: flex-start;
  @media (max-width: 1100px) {
    gap: 16px;
  }
  @media (max-width: 834px) {
    flex-direction: column;
    gap: 12px;
  }
`;
const DetailTopBoxesWrapper = styled.div`
  width: 100%;
  margin-bottom: 24px;
  @media (max-width: 834px) {
    margin-bottom: 12px;
  }
`;
