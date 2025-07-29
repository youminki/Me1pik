// src/components/productregister/SizeDisplaySection.tsx
import React, { useState, ChangeEvent, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { ProductDetailResponse } from '@api/adminProduct';
import { sizeGuideConfig } from '@config/sizeGuideConfig';
// BulletIcon을 불러옵니다. (Webpack/CRA 기준)
import BulletIcon from '@assets/BulletIcon.svg';

interface SizeDisplaySectionProps {
  product?: ProductDetailResponse;
  sizeProductImg: string;
  /** 변경된 라벨을 부모로 전달 */
  onLabelChange?: (labels: Record<string, string>) => void;
  style?: React.CSSProperties;
}

const SizeDisplaySection: React.FC<SizeDisplaySectionProps> = ({
  product,
  sizeProductImg,
  onLabelChange,
}) => {
  const category = product?.category || '';

  // 1) 원본 키(key) 목록 및 초기 라벨 맵
  const keys = useMemo(() => Object.keys(sizeGuideConfig[category]?.labels || {}), [category]);
  const initialLabels = useMemo(() => sizeGuideConfig[category]?.labels || {}, [category]);

  // 2) 라벨 상태를 key→label 맵으로 관리
  const [labelMap, setLabelMap] = useState<Record<string, string>>(initialLabels);

  // --- (1) 초기 레이블 변경 감지 시에만 labelMap 리셋 ---
  useEffect(() => {
    // 기존 제품의 라벨이 있으면 사용, 없으면 기본값 사용
    const existingLabels = product?.size_label_guide || {};
    const mergedLabels = { ...initialLabels, ...existingLabels };
    setLabelMap(mergedLabels);

    // 알파벳을 제거하고 실제 라벨 텍스트만 저장
    const cleanLabels: Record<string, string> = {};
    Object.entries(mergedLabels).forEach(([k, v]) => {
      // "A.어깨넓이" 형태에서 "어깨넓이"만 추출
      const cleanValue = typeof v === 'string' ? v.replace(/^[A-Z]\. 0/, '') : String(v);
      cleanLabels[k] = cleanValue;
    });

    // 초기 로드 시에도 상위로 전달
    if (onLabelChange) {
      onLabelChange(cleanLabels);
    }
  }, [initialLabels, product?.size_label_guide, onLabelChange]);

  // 3) 사용자 입력으로 변경된 경우에만 부모 콜백 호출
  const handleLabelChange = (key: string, e: ChangeEvent<HTMLInputElement>) => {
    const next = { ...labelMap, [key]: e.target.value };
    setLabelMap(next);

    // 알파벳을 제거하고 실제 라벨 텍스트만 저장
    const cleanLabels: Record<string, string> = {};
    Object.entries(next).forEach(([k, v]) => {
      // "A.어깨넓이" 형태에서 "어깨넓이"만 추출
      const cleanValue = typeof v === 'string' ? v.replace(/^[A-Z]\. 0/, '') : String(v);
      cleanLabels[k] = cleanValue;
    });

    console.log('SizeDisplaySection 라벨 변경:', key, e.target.value, cleanLabels);
    onLabelChange?.(cleanLabels);
  };

  // 이하 타이틀/노트 렌더링 로직은 그대로 유지
  const [labelsState, setLabelsState] = useState({
    title: '사이즈 표기',
    specTitle: '[ 사이즈 표기 ]',
    note: '*측정 위치에 따라 약간의 오차 있음.',
  });

  const handleFieldChange = (field: keyof typeof labelsState, e: ChangeEvent<HTMLInputElement>) => {
    setLabelsState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <SectionBox>
      <SectionHeader>
        {/* BulletIcon으로 대체 */}
        <BulletIconImage src={BulletIcon} alt="bullet icon" />
        <SectionTitleInput value={labelsState.title} readOnly />
      </SectionHeader>

      <SizeGuideContainer>
        <GuideWrapper>
          <ImageContainer>
            <SizeProductImage src={sizeProductImg} alt="사이즈 표기 이미지" />
          </ImageContainer>

          <SizeInfoContainer>
            <SpecTitleInput
              value={labelsState.specTitle}
              onChange={(e) => handleFieldChange('specTitle', e)}
            />

            {/* --- SpaceColumn과 SpecItemRow를 사용해 각 입력창을 배치 --- */}
            <SpaceColumn>
              {keys.map((key) => (
                <SpecItemRow key={key}>
                  <SpecLabelInput
                    value={labelMap[key] || ''}
                    onChange={(e) => handleLabelChange(key, e)}
                  />
                </SpecItemRow>
              ))}
            </SpaceColumn>

            <NoteInput value={labelsState.note} onChange={(e) => handleFieldChange('note', e)} />
          </SizeInfoContainer>
        </GuideWrapper>
      </SizeGuideContainer>
    </SectionBox>
  );
};

export default SizeDisplaySection;

/* Styled Components */
const SectionBox = styled.div`
  position: relative;
  margin-bottom: 20px;
  padding-left: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 10px;
`;

// Bullet을 SVG 아이콘으로 교체하기 위한 styled.img
const BulletIconImage = styled.img`
  width: 14px;
  height: 14px;
  margin-right: 10px; /* 제목과 간격 맞추기 */
`;

const SectionTitleInput = styled.input`
  font-weight: 800;
  font-size: 14px;
  line-height: 15px;
  border: none;
  background: transparent;

  &:read-only {
    color: #000;
  }
`;

const SizeGuideContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const GuideWrapper = styled.div`
  display: flex;
  flex-direction: row;
  border: 1px solid #dddddd;
`;

const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SizeProductImage = styled.img`
  width: 230px;
  height: auto;
  object-fit: contain;
  margin: 10px;
`;

const SizeInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 4px;
  padding: 20px;
`;

/* 원래 생략되었던 SpaceColumn과 SpecItemRow */
const SpaceColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px; /* SpecTitle과 Note 사이 여유 */
`;

const SpecItemRow = styled.div`
  display: flex;
  align-items: baseline;
`;

const SpecTitleInput = styled.input`
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 10px;
  text-align: left;
  border: none;
  background: transparent;
`;

const SpecLabelInput = styled.input`
  font-size: 12px;
  font-weight: 700;
  text-align: left;

  &:focus {
    outline: 2px solid #f6ae24;
  }
`;

const NoteInput = styled.input`
  font-size: 12px;
  color: #aaa;
  text-align: center;
  border: none;
  background: transparent;
  width: 100%;
`;
