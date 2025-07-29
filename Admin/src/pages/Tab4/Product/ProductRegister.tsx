// // src/pages/ProductRegister.tsx
// import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import styled from 'styled-components';
// import ListButtonDetailSubHeader from 'src/components/Header/ListButtonDetailSubHeader';
// import sizeProductImg from 'src/assets/productregisterSizeProduct.svg';
// import DetailTopBoxes from 'src/components/DetailTopBoxes';
// import SizeGuideSection from 'src/components/productregister/SizeGuideSection';
// import SizeDisplaySection from 'src/components/productregister/SizeDisplaySection';
// import MaterialInfoSection from 'src/components/productregister/MaterialInfoSection';
// import FabricInfoSection from 'src/components/productregister/FabricInfoSection';
// import ProductImageSection from 'src/components/productregister/ProductImageSection';
// import ReusableModal from 'src/components/ReusableModal';
// import ReusableModal2 from 'src/components/ReusableModal2';

// import {
//   getProductDetail,
//   updateProduct,
//   createProduct,
//   ProductDetailResponse,
//   UpdateProductRequest,
//   CreateProductRequest,
//   SizeRow,
// } from 'src/api/adminProduct';

// // 신규 등록용 빈 제품 정보
// const newEmptyProduct: ProductDetailResponse = {
//   id: 0,
//   name: '',
//   product_num: '',
//   brand: '',
//   category: '',
//   color: '',
//   price: 0,
//   rental_price: undefined,
//   registration: 0,
//   registration_date: '',
//   product_url: '',
//   product_img: [],
//   size_picture: '',
//   season: '',
//   manufacturer: '',
//   description: '',
//   fabricComposition: {
//     겉감: '',
//     안감: '',
//     배색: '',
//     부속: '',
//   },
//   elasticity: '',
//   transparency: '',
//   thickness: '',
//   lining: '',
//   touch: '',
//   fit: '',
//   sizes: [],
// };

// const ProductRegister: React.FC = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const productId = id ? parseInt(id, 10) : null;

//   const [productDetail, setProductDetail] = useState<ProductDetailResponse>(
//     productId ? ({} as ProductDetailResponse) : newEmptyProduct
//   );
//   const [images, setImages] = useState<(string | null)[]>([]);
//   const [imageLinks, setImageLinks] = useState<(string | null)[]>([]);
//   const [loading, setLoading] = useState<boolean>(!!productId);
//   const [error, setError] = useState<string>('');

//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalMessage, setModalMessage] = useState('');
//   const [modalCallback, setModalCallback] = useState<(() => void) | null>(null);

//   const [endModalOpen, setEndModalOpen] = useState(false);
//   const [endModalMessage, setEndModalMessage] = useState('');
//   const [endModalCallback, setEndModalCallback] = useState<(() => void) | null>(
//     null
//   );

//   const showModal = (message: string, callback?: () => void) => {
//     setModalMessage(message);
//     setModalCallback(() => callback || null);
//     setModalOpen(true);
//   };
//   const showEndModal = (message: string, callback?: () => void) => {
//     setEndModalMessage(message);
//     setEndModalCallback(() => callback || null);
//     setEndModalOpen(true);
//   };

//   // 상세 or 신규 초기화
//   useEffect(() => {
//     if (productId) {
//       (async () => {
//         setLoading(true);
//         setError('');
//         try {
//           const data = await getProductDetail(productId);
//           setProductDetail(data);
//           setImages(data.product_img.map((src) => src));
//           setImageLinks(data.product_img.map((src) => src));
//         } catch (err) {
//           console.error('제품 상세 정보를 불러오는데 실패했습니다.', err);
//           setError('제품 상세 정보를 불러오는데 실패했습니다.');
//         } finally {
//           setLoading(false);
//         }
//       })();
//     } else {
//       // 신규 등록일 땐 4개의 빈 슬롯
//       setImages(new Array(4).fill(null));
//       setImageLinks(new Array(4).fill(null));
//       setLoading(false);
//     }
//   }, [productId]);

//   const handleBackClick = () => navigate(-1);

//   const handleEditOrRegister = () => {
//     showModal(
//       productId ? '제품 정보를 수정하시겠습니까?' : '제품을 등록하시겠습니까?',
//       async () => {
//         setModalOpen(false);
//         try {
//           // payload 준비: 빈 값/빈 객체 제거
//           const payload: any = {
//             ...productDetail,
//             product_img: imageLinks.filter((l) => !!l),
//           };
//           Object.keys(payload).forEach((key) => {
//             const v = payload[key];
//             if (
//               v == null ||
//               (Array.isArray(v) && v.length === 0) ||
//               (typeof v === 'object' &&
//                 !Array.isArray(v) &&
//                 Object.keys(v).length === 0)
//             ) {
//               delete payload[key];
//             }
//           });

//           if (productId) {
//             // 수정
//             const updateData: UpdateProductRequest = payload;
//             const updated = await updateProduct(productDetail.id, updateData);
//             setProductDetail(updated);
//             showModal('제품 정보가 수정되었습니다!', () =>
//               navigate('/productlist')
//             );
//           } else {
//             // 등록
//             const createData: CreateProductRequest = payload;
//             await createProduct(createData); // ← 반환값은 사용하지 않습니다
//             showModal('제품이 등록되었습니다!', () => navigate('/productlist'));
//           }
//         } catch (err) {
//           console.error('등록/수정 실패', err);
//           showModal('등록/수정에 실패했습니다.');
//         }
//       }
//     );
//   };

//   const handleEndClick = () =>
//     showEndModal('등록 중인 내용을 취소하시겠습니까?', () => navigate(-1));

//   const handleSizesChange = (sizes: SizeRow[]) => {
//     setProductDetail((prev) => ({ ...prev, sizes }));
//   };

//   const handleImageUpload = (
//     index: number,
//     e: ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         const url = reader.result as string;
//         setImages((prev) => {
//           const arr = [...prev];
//           arr[index] = url;
//           return arr;
//         });
//         setImageLinks((prev) => {
//           const arr = [...prev];
//           arr[index] = url;
//           return arr;
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleImageDelete = (index: number) => {
//     setImages((prev) => {
//       const arr = [...prev];
//       arr[index] = null;
//       return arr;
//     });
//     setImageLinks((prev) => {
//       const arr = [...prev];
//       arr[index] = null;
//       return arr;
//     });
//   };

//   const handleImageReorder = (from: number, to: number) => {
//     setImages((prev) => {
//       const arr = [...prev];
//       const [m] = arr.splice(from, 1);
//       arr.splice(to, 0, m);
//       return arr;
//     });
//     setImageLinks((prev) => {
//       const arr = [...prev];
//       const [m] = arr.splice(from, 1);
//       arr.splice(to, 0, m);
//       return arr;
//     });
//   };

//   if (loading) return <Container>Loading...</Container>;
//   if (error) return <Container>{error}</Container>;

//   const headerProps = productId
//     ? {
//         backLabel: '목록이동',
//         onBackClick: handleBackClick,
//         editLabel: '정보수정',
//         onEditClick: handleEditOrRegister,
//         endLabel: '취소',
//         onEndClick: handleEndClick,
//       }
//     : {
//         backLabel: '목록이동',
//         onBackClick: handleBackClick,
//         editLabel: '등록완료',
//         onEditClick: handleEditOrRegister,
//       };

//   return (
//     <Container>
//       <HeaderRow>
//         <Title>제품등록</Title>
//       </HeaderRow>
//       <ListButtonDetailSubHeader {...headerProps} />

//       <ProductNumberWrapper>
//         <ProductNumberLabel>번호</ProductNumberLabel>
//         <ProductNumberValue>
//           {productId ? productDetail.id : '신규 등록'}
//         </ProductNumberValue>
//       </ProductNumberWrapper>

//       <DetailTopBoxes
//         product={productDetail}
//         editable={!productId}
//         onChange={(data) => setProductDetail((prev) => ({ ...prev, ...data }))}
//       />

//       <MiddleDivider />

//       <FormWrapper onSubmit={(e: FormEvent) => e.preventDefault()}>
//         <TwoColumnRow>
//           <SizeGuideSection
//             sizes={productDetail.sizes}
//             onSizesChange={handleSizesChange}
//           />
//           <SizeDisplaySection
//             product={productDetail}
//             sizeProductImg={sizeProductImg}
//           />
//         </TwoColumnRow>

//         <MiddleDivider />

//         <MaterialInfoSection
//           product={productDetail}
//           editable={!productId}
//           onChange={(data) =>
//             setProductDetail((prev) => ({ ...prev, ...data }))
//           }
//         />

//         <MiddleDivider />

//         <FabricInfoSection
//           product={productDetail}
//           onChange={(data) =>
//             setProductDetail((prev) => ({ ...prev, ...data }))
//           }
//         />

//         <MiddleDivider />

//         <ProductImageSection
//           images={images}
//           handleImageUpload={handleImageUpload}
//           handleImageDelete={handleImageDelete}
//           handleImageReorder={handleImageReorder}
//           productUrl={productDetail.product_url}
//         />

//         <BottomDivider />
//       </FormWrapper>

//       <ReusableModal
//         isOpen={modalOpen}
//         title='알림'
//         width='400px'
//         height='200px'
//         onClose={() => {
//           setModalOpen(false);
//           modalCallback?.();
//         }}
//         onConfirm={() => {
//           setModalOpen(false);
//           modalCallback?.();
//         }}
//       >
//         {modalMessage}
//       </ReusableModal>

//       <ReusableModal2
//         isOpen={endModalOpen}
//         title='알림'
//         width='400px'
//         height='200px'
//         onClose={() => setEndModalOpen(false)}
//         onConfirm={() => {
//           setEndModalOpen(false);
//           endModalCallback?.();
//         }}
//       >
//         {endModalMessage}
//       </ReusableModal2>
//     </Container>
//   );
// };

// export default ProductRegister;

// /* Styled Components */
// const Container = styled.div`
//   width: 100%;
//   margin: 0 auto;
//   padding: 20px;
//   box-sizing: border-box;
//
// `;
// const HeaderRow = styled.div`
//   display: flex;
//   align-items: center;
//   margin-bottom: 10px;
// `;
// const Title = styled.h1`
//   font-weight: 700;
//   font-size: 16px;
// `;
// const ProductNumberWrapper = styled.div`
//   display: flex;
//   align-items: baseline;
//   gap: 5px;
//   margin: 10px 0 34px;
// `;
// const ProductNumberLabel = styled.div`
//   font-weight: 700;
//   font-size: 12px;
// `;
// const ProductNumberValue = styled.div`
//   font-weight: 900;
//   font-size: 12px;
// `;
// const MiddleDivider = styled.hr`
//   border: 0;
//   border-top: 1px dashed #ddd;
//   margin: 30px 0;
// `;
// const BottomDivider = styled.hr`
//   border: 0;
//   border-top: 1px solid #ddd;
//   margin: 40px 0 20px;
// `;
// const FormWrapper = styled.form`
//   display: flex;
//   flex-direction: column;
// `;
// const TwoColumnRow = styled.div`
//   display: flex;
//   gap: 50px;
//   margin-bottom: 10px;
// `;
