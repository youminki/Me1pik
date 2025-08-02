/**
 * 사이즈 가이드 섹션(SizeGuideSection)
 *
 * - 제품 카테고리별 사이즈 가이드 테이블 관리
 * - 라벨 편집, 사이즈 데이터 변경, 부모 컴포넌트와 동기화 등 지원
 * - config 기반 초기 라벨 설정 및 동적 업데이트
 */
// src/components/productregister/SizeGuideSection.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { SizeRow } from '@api/adminProduct';
import { sizeGuideConfig } from '@config/sizeGuideConfig';
// SVG 아이콘을 import (Webpack 또는 CRA 기준)
import BulletIcon from '@assets/BulletIcon.svg';

interface Column {
  key: string;
  label: string;
}
type RowData = Record<string, string>;

/**
 * 사이즈 가이드 섹션 props
 * - 카테고리, 사이즈 데이터, 변경 콜백, 라벨 관리 등
 */
export interface SizeGuideSectionProps {
  category: string;
  sizes: SizeRow[];
  onSizesChange?: (sizes: SizeRow[]) => void;
  /** 변경된 라벨을 부모로 전달 */
  onLabelChange?: (labels: Record<string, string>) => void;
  /** 현재 라벨을 가져오는 함수를 설정 */
  onSetGetCurrentLabels?: (getLabels: () => Record<string, string>) => void;
  style?: React.CSSProperties;
}

/**
 * 사이즈 가이드 섹션 컴포넌트
 * - 카테고리별 사이즈 가이드 테이블을 렌더링하고 관리
 * - 라벨 편집, 사이즈 데이터 변경, 부모 컴포넌트와 동기화 지원
 */
const SizeGuideSection: React.FC<SizeGuideSectionProps> = ({
  category,
  sizes,
  onSizesChange,
  onLabelChange,
  onSetGetCurrentLabels,
}) => {
  //
  // 1) config에서 초기 라벨 맵 가져오기
  //
  const initialLabels = useMemo(() => sizeGuideConfig[category]?.labels ?? {}, [category]);

  // 2) 카테고리 변경 감지
  const [currentCategory, setCurrentCategory] = useState(category);
  const [editedLabels, setEditedLabels] = useState<Record<string, string>>({});

  // 3) 카테고리가 변경되면 편집된 라벨 초기화
  useEffect(() => {
    if (currentCategory !== category) {
      setCurrentCategory(category);
      setEditedLabels({});
    }
  }, [category, currentCategory]);

  // 4) 라벨 맵 계산 (카테고리 변경 시 config 라벨 우선, 표시용으로는 접두사 포함)
  const labelMap = useMemo(() => {
    // 카테고리가 변경되면 config의 라벨을 우선 사용
    // 편집된 라벨이 있으면 그것을 사용 (표시용으로는 접두사 포함)
    const baseLabels = initialLabels;
    const displayLabels = { ...baseLabels, ...editedLabels };

    // 편집된 라벨에 접두사가 없으면 추가
    Object.keys(editedLabels).forEach((key) => {
      if (!displayLabels[key].startsWith(key + '.')) {
        displayLabels[key] = `${key}. ${editedLabels[key]}`;
      }
    });

    return displayLabels;
  }, [initialLabels, editedLabels]);

  // 카테고리가 바뀔 때만 라벨 초기화
  useEffect(() => {
    // 카테고리가 변경되면 편집된 라벨 초기화
    setEditedLabels({});
  }, [category]);

  // 현재 라벨을 가져오는 함수 (접두사 제거된 순수 라벨만 반환)
  const getCurrentLabels = useCallback(() => {
    console.log('getCurrentLabels 호출됨');
    console.log('현재 labelMap:', labelMap);

    // labelMap에서 접두사 제거된 순수 라벨만 추출
    const tableLabels: Record<string, string> = {};
    Object.entries(labelMap).forEach(([k, v]) => {
      // "A.어깨넓이" 형태에서 "어깨넓이"만 추출
      const cleanValue = typeof v === 'string' ? v.replace(/^[A-Z]\. 0/, '') : String(v);
      tableLabels[k] = cleanValue;
    });

    console.log('저장용 순수 라벨:', tableLabels);
    return tableLabels;
  }, [labelMap]);

  // 부모에게 현재 라벨을 가져오는 함수 전달
  useEffect(() => {
    if (onSetGetCurrentLabels) {
      console.log('부모에게 getCurrentLabels 함수 전달');
      onSetGetCurrentLabels(getCurrentLabels);
    }
  }, [getCurrentLabels, onSetGetCurrentLabels]);

  // 라벨 변경 시 부모에게 전달 (무한루프 방지를 위해 조건부 실행)
  useEffect(() => {
    if (onLabelChange && Object.keys(editedLabels).length === 0) {
      // 초기 로드 시에만 전달
      onLabelChange(getCurrentLabels());
    }
  }, [labelMap, onLabelChange, editedLabels, getCurrentLabels]);

  /**
   * 라벨 변경 핸들러
   * - 편집된 라벨을 상태에 저장하고 부모에게 전달
   */
  const handleLabelChange = (key: string, value: string) => {
    console.log('handleLabelChange 호출:', key, value);

    // 접두사 제거된 순수 라벨만 저장
    const cleanValue = value.replace(/^[A-Z]\.\s*/, '');

    // 편집된 라벨 상태 업데이트 (순수 라벨만 저장)
    setEditedLabels((prev) => {
      const updated = { ...prev, [key]: cleanValue };
      console.log('editedLabels 업데이트 (순수 라벨):', updated);
      return updated;
    });

    // 부모에게 라벨 변경 알림 (순수 라벨만 전달)
    setTimeout(() => {
      if (onLabelChange) {
        const currentLabels = getCurrentLabels();
        console.log('부모에게 순수 라벨 전달:', currentLabels);
        onLabelChange(currentLabels);
      }
    }, 0);
  };

  //
  // 3) 컬럼 정의 (첫 번째는 빈 헤더, 나머지는 labelMap 기반)
  //
  const columns: Column[] = useMemo(() => {
    return [
      { key: 'size', label: '' },
      ...Object.entries(labelMap).map(([k, v]) => ({ key: k, label: v })),
    ];
  }, [labelMap]);

  //
  // 4) “44 → 55 → 66 → 77 → Free” 순서로 정렬된 rows 상태 생성
  //
  const [rows, setRows] = useState<RowData[]>([]);
  useEffect(() => {
    // 우선순위에 따른 사이즈 순서
    const sizeOrder = ['44', '55', '66', '77', 'Free'];

    // sizes 배열을 복사한 뒤, sizeOrder에 따라 정렬
    const sortedSizes: SizeRow[] = [...sizes].sort((a, b) => {
      const ia = sizeOrder.indexOf(a.size);
      const ib = sizeOrder.indexOf(b.size);
      // 만약 둘 중 하나가 순서 배열에 없다면, 뒤로 보내도록 Infinity 처리
      const rankA = ia === -1 ? Infinity : ia;
      const rankB = ib === -1 ? Infinity : ib;
      return rankA - rankB;
    });

    // 정렬된 순서대로 rows 객체 생성
    const newRows = sortedSizes.map((item) => {
      // "SIZE 55" 형태를 "55" 형태로 변환
      const cleanSize = item.size.replace('SIZE ', '');
      const row: RowData = { size: cleanSize };
      Object.keys(labelMap).forEach((k) => {
        // measurement 키는 "A 어깨넓이" 등으로 시작한다고 가정
        const mKey = Object.keys(item.measurements).find((mk) => mk.startsWith(k + ' '));
        const rawKey = mKey ?? k;
        const val = item.measurements[rawKey];
        row[k] = val != null && val !== 0 ? String(val) : '';
      });
      return row;
    });

    setRows(newRows);
  }, [sizes, labelMap]);

  /**
   * 셀 변경 핸들러
   * - 사이즈 데이터 변경 시 부모에게 전달
   */
  const handleCellChange = (ri: number, key: string, value: string) => {
    const updated = rows.map((r, i) => (i === ri ? { ...r, [key]: value } : r));
    setRows(updated);

    onSizesChange?.(
      updated.map((r) => ({
        size: `SIZE ${r.size}`,
        measurements: Object.entries(r).reduce<Record<string, number>>((acc, [k, v]) => {
          if (k !== 'size') acc[k] = v ? Number(v) : 0;
          return acc;
        }, {}),
      })),
    );
  };

  /**
   * 사이즈 라벨 포맷팅 함수
   * - 사이즈 값을 표시용 라벨로 변환
   */
  const formatSizeLabel = (size: string) => {
    switch (size) {
      case '44':
        return '44(S)';
      case '55':
        return '55(M)';
      case '66':
        return '66(L)';
      case '77':
        return '77(XL)';
      case 'Free':
      case 'free':
      case 'FREE':
        return 'Free(F)';
      default:
        return size;
    }
  };

  return (
    <SectionBox>
      {/* ──────────────────────────────────────────────────────── */}
      <Header>
        {/* BulletIcon으로 대체 */}
        <BulletIconImage src={BulletIcon} alt="Bullet Icon" />
        <Title>사이즈 가이드</Title>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              {columns.map((col) => (
                <Th key={col.key}>
                  {col.key === 'size' ? (
                    <HeaderStatic>{col.label}</HeaderStatic>
                  ) : (
                    <HeaderInput
                      value={col.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleLabelChange(col.key, e.target.value)
                      }
                      placeholder="라벨 입력"
                    />
                  )}
                </Th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, ri) => (
              <Tr key={ri} $even={ri % 2 === 1}>
                {columns.map((col) => (
                  <Td key={`${ri}-${col.key}`}>
                    {col.key === 'size' ? (
                      <CellSize>{formatSizeLabel(row.size)}</CellSize>
                    ) : (
                      <CellInput
                        value={row[col.key] || ''}
                        placeholder="-"
                        onChange={(e) => handleCellChange(ri, col.key, e.target.value)}
                      />
                    )}
                  </Td>
                ))}
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </SectionBox>
  );
};

export default SizeGuideSection;

/* ===== Styled Components ===== */
const SectionBox = styled.div`
  position: relative;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

// 기존 Bullet 대신 img 태그 스타일링
const BulletIconImage = styled.img`
  width: 14px;
  height: 14px;
  margin-right: 8px;
`;

const Title = styled.div`
  font-weight: 800;
  font-size: 14px;
`;

const TableContainer = styled.div`
  max-width: 100vw;
  overflow-x: auto;
  @media (max-width: 834px) {
    min-width: 100vw;
    padding: 0 8px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;

  th,
  td {
    text-align: center;
    padding: 6px 8px;
    font-size: 12px;
    white-space: nowrap;
  }
`;

const Th = styled.th`
  background: #f9f9f9;
  position: sticky;
  top: 0;
  z-index: 2;
  font-weight: 700;
`;

const HeaderStatic = styled.div`
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  color: #333;
`;

const HeaderInput = styled.input`
  width: 100%;
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  color: #333;
  border: none;
  background: transparent;
  padding: 2px;

  &:focus {
    outline: 2px solid #f6ae24;
    background: white;
  }
`;

const Tr = styled.tr<{ $even: boolean }>`
  height: 44px;
  &:nth-child(even) {
    background: #f8f9fa;
  }
  &:hover {
    background-color: #e3f2fd;
    cursor: pointer;
  }
`;

const Td = styled.td``;

const CellSize = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #000;
`;

const CellInput = styled.input`
  width: 60px;
  height: 28px;
  border: 1px solid #ddd;
  font-size: 12px;
  text-align: center;

  &:focus {
    outline: 2px solid #f6ae24;
  }

  &::placeholder {
    color: #bbb;
  }
`;
