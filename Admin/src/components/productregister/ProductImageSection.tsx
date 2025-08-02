// src/components/productregister/ProductImageSection.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaLink } from 'react-icons/fa';

import BulletIcon from '@assets/BulletIcon.svg'; // SVG 아이콘 import

interface ProductImageSectionProps {
  images: string[];
  handleImageLinkUpload: (index: number, url: string) => void;
  handleImageDelete: (index: number) => void;
  handleImageReorder: (from: number, to: number) => void;
  productUrl: string;
  style?: React.CSSProperties;
}

const ProductImageSection: React.FC<ProductImageSectionProps> = ({
  images,
  handleImageLinkUpload,
  handleImageDelete,
  handleImageReorder,
  productUrl,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const onAddUrl = (idx: number) => {
    const url = window.prompt('이미지 URL을 입력해주세요\n예: https://…jpg#addimg');
    if (url?.trim()) handleImageLinkUpload(idx, url.trim());
  };

  const onBatchUrl = () => {
    const input = window.prompt(
      '여러 이미지 URL을 붙여넣으세요.\n쉼표(,) 또는 공백·줄바꿈으로 구분',
    );
    if (!input) return;
    const urls = input
      .split(/[\s,]+/)
      .map((u) => u.trim())
      .filter((u) => /^https?:\/\/\S+\.(?:jpe?g|png|gif)(?:\?\S*)?(?:#\S*)?$/i.test(u));
    if (!urls.length) {
      alert('유효한 이미지 URL이 없습니다.');
      return;
    }
    const startIdx = images.length;
    urls.forEach((url, i) => handleImageLinkUpload(startIdx + i, url));
  };

  const onDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (!isNaN(from) && from !== idx) handleImageReorder(from, idx);
  };

  const handleCopyClick = () => {
    if (!productUrl) return;
    navigator.clipboard
      .writeText(productUrl)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // 2초 후 버튼 색상 원복
      })
      .catch((err) => {
        console.error('복사 실패:', err);
      });
  };

  return (
    <SectionBox>
      {/* Header: 타이틀만 남기고 일괄등록 버튼은 제거 */}
      <Header>
        <HeaderLeft>
          <BulletIconImage src={BulletIcon} alt="bullet icon" />
          <Title>제품 이미지</Title>
        </HeaderLeft>
      </Header>

      {/* 이미지 리스트와 일괄등록 버튼을 감싸는 테두리 컨테이너 */}
      <BorderContainer>
        <ImageList>
          {images.map((src, idx) => (
            <Column key={idx}>
              <DragWrapper
                draggable
                onDragStart={(e) => onDragStart(e, idx)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, idx)}
              >
                <IdxLabel>{idx + 1}</IdxLabel>
                <ImgBox $isMain={idx === 0}>
                  <Img src={src} alt={`이미지 ${idx + 1}`} />
                  <DeleteBtn
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageDelete(idx);
                    }}
                    title="삭제"
                  >
                    <FaTimes size={16} />
                  </DeleteBtn>
                </ImgBox>
              </DragWrapper>
              <Caption>{idx === 0 ? '썸네일 이미지' : `착장 이미지 ${idx}`}</Caption>
            </Column>
          ))}

          {/* '이미지 등록' 빈 박스 */}
          <Column>
            <EmptyBox onClick={() => onAddUrl(images.length)}>
              <AddIcon>
                <FaLink size={24} />
              </AddIcon>
            </EmptyBox>
            <Caption>이미지 등록</Caption>
          </Column>
        </ImageList>

        {/* 일괄등록 버튼: BorderContainer 안쪽 오른쪽 하단에 절대 위치 */}
        <ContainerBatchButton onClick={onBatchUrl} title="URL 일괄 등록">
          <FaLink size={14} />
          <span>일괄등록</span>
        </ContainerBatchButton>
      </BorderContainer>

      {/* URL 복사 섹션 */}
      <UrlContainer>
        <HeaderLeft>
          <BulletIconImage src={BulletIcon} alt="bullet icon" />
          <Title>제품(원본) URL 정보</Title>
        </HeaderLeft>

        {productUrl ? (
          <UrlLinkWrapper>
            <StyledLink href={productUrl} target="_blank" rel="noopener noreferrer">
              {productUrl}
            </StyledLink>
            <CopyButton onClick={handleCopyClick} $isCopied={isCopied}>
              {isCopied ? '복사완료' : '링크복사'}
            </CopyButton>
          </UrlLinkWrapper>
        ) : (
          <UrlText>등록된 URL이 없습니다.</UrlText>
        )}
      </UrlContainer>
    </SectionBox>
  );
};

export default ProductImageSection;

/* styled-components */

const SectionBox = styled.div`
  position: relative;
  margin-bottom: 40px;
`;

/* Header: 타이틀만 표시 */
const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const BulletIconImage = styled.img`
  width: 14px;
  height: 14px;
  margin-right: 8px;
`;

const Title = styled.div`
  font-weight: 800;
  font-size: 14px;
`;

/* BorderContainer: 이미지 리스트 + 일괄등록 버튼을 감싸는 박스 */
const BorderContainer = styled.div`
  position: relative; /* 내부에 절대 위치 배치 가능하도록 설정 */
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 2rem;
  background: #fafafa;
`;

/* ImageList: 가로 스크롤 가능한 flex 컨테이너 */
const ImageList = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 8px;

  /* 스크롤바 스타일 (옵션) */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

/* Column: 이미지+캡션을 세로로 정렬 */
const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* DragWrapper: 드래그 가능한 래퍼 */
const DragWrapper = styled.div`
  position: relative;
  cursor: move;
`;

/* IdxLabel: 이미지 좌상단 인덱스 표시 */
const IdxLabel = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 4px;
  font-size: 10px;
  border-radius: 2px;
  z-index: 1;
`;

/* ImgBox: 이미지 박스 (연한 회색 배경, 테두리) */
const ImgBox = styled.div<{ $isMain?: boolean }>`
  width: 140px;
  height: 200px;
  background: #ececec;
  border: 2px solid ${({ $isMain }) => ($isMain ? '#f6ae24' : '#ddd')};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
`;

/* Img: 이미지 태그 */
const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

/* DeleteBtn: 이미지 삭제 버튼 */
const DeleteBtn = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: #fff;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition:
    transform 0.2s,
    background-color 0.2s;

  &:hover {
    transform: scale(1.1);
    background-color: #fce4ec;
  }
`;

/* EmptyBox: '이미지 등록' 빈 박스 */
const EmptyBox = styled.div`
  width: 140px;
  height: 200px;
  background: #f5f5f5;
  border: 1px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 2px;

  &:hover {
    background: #e8e8e8;
  }
`;

/* AddIcon: 빈 박스 안 링크 아이콘 */
const AddIcon = styled.div`
  color: #888;
`;

/* Caption: 이미지 아래 라벨 텍스트 */
const Caption = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #333;
  text-align: center;
`;

/* ContainerBatchButton: 일괄등록 버튼 (BorderContainer 내부 절대 위치) */
const ContainerBatchButton = styled.button`
  position: absolute;
  right: 0px;
  bottom: 0px;
  background: #fff;
  color: #000;
  border: none;
  border: 1px solid #ddd;
  padding: 10px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 0;
  cursor: pointer;

  &:hover {
    background: #f6ae24;
  }
`;

/* URL 섹션 */
const UrlContainer = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
`;

const UrlText = styled.div`
  font-size: 14px;
  word-break: break-all;
  color: #000;
`;

/* UrlLinkWrapper: URL 텍스트 + 복사 버튼을 감싸는 박스 */
const UrlLinkWrapper = styled.div`
  display: flex;
  align-items: center;

  height: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
  margin-top: 20px;
  padding: 10px 20px;
`;

/* StyledLink: URL 텍스트 */
const StyledLink = styled.a`
  flex: 1;
  font-size: 12px;
  color: #000;
  text-decoration: none;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  &:hover {
    color: #1565c0;
  }
`;

/* CopyButton: 링크 복사 버튼 */
const CopyButton = styled.button<{ $isCopied: boolean }>`
  width: 70px;
  height: 100%;
  background: ${({ $isCopied }) => ($isCopied ? '#555' : '#000')};
  color: #fff;
  border: none;
  border-radius: 0;
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
`;
