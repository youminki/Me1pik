// src/components/productregister/FabricInfoSection.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { ProductDetailResponse } from '@api/adminProduct';
import BulletIcon from '@assets/BulletIcon.svg';

interface FabricInfoSectionProps {
  product: ProductDetailResponse;
  onChange?: (data: Partial<ProductDetailResponse>) => void;
  style?: React.CSSProperties;
}

const INITIAL_COLUMN_COUNT = 5;
const MATERIAL_OPTIONS = [
  '폴리에스터',
  '나일론',
  '폴리우레탄',
  '아크릴',
  '레이온',
  '면',
  '모',
  '마',
  '캐시미어',
  '큐프로',
  '천연모피(밍크)',
  '천연모피(양)',
  '천연가죽(양)',
  '천연가죽(돼지)',
  '천연모피(여우)',
  '메탈',
  '금속성섬유',
  '거위솜털',
  '거위깃털',
  '아세테이트',
  '견',
] as const;
type SlotItem = { material: string; percent: string };
type SlotsMap = Record<string, SlotItem[]>;
const FABRIC_KEYS = ['겉감', '안감', '배색', '부속'] as const;

const FabricInfoSection: React.FC<FabricInfoSectionProps> = ({ product, onChange }) => {
  const [columnCount, setColumnCount] = useState(INITIAL_COLUMN_COUNT);

  const createEmptySlots = (cols: number): SlotsMap =>
    FABRIC_KEYS.reduce((acc, key) => {
      acc[key] = Array.from({ length: cols }, () => ({
        material: '',
        percent: '',
      }));
      return acc;
    }, {} as SlotsMap);

  const [slots, setSlots] = useState<SlotsMap>(() => createEmptySlots(columnCount));

  useEffect(() => {
    const compMap = (product.fabricComposition || {}) as Record<string, string>;
    const savedCounts = FABRIC_KEYS.map(
      (key) => (compMap[key] || '').split(/\s*,\s*/).filter(Boolean).length,
    );
    const maxSaved = Math.max(...savedCounts, INITIAL_COLUMN_COUNT);
    setColumnCount(maxSaved);

    const newSlots = createEmptySlots(maxSaved);
    FABRIC_KEYS.forEach((key) => {
      (compMap[key] || '')
        .split(/\s*,\s*/)
        .filter(Boolean)
        .forEach((part, idx) => {
          if (idx < maxSaved) {
            const [material = '', percent = ''] = part.split(/\s+/);
            newSlots[key][idx] = { material, percent };
          }
        });
    });
    setSlots(newSlots);
  }, [product.fabricComposition]);

  const notifyChange = (updated: SlotsMap) => {
    const comp: Record<string, string> = {};
    FABRIC_KEYS.forEach((key) => {
      const entries = updated[key]
        .filter((s) => s.material && s.percent)
        .map((s) => `${s.material} ${s.percent}`);
      if (entries.length) comp[key] = entries.join(', ');
    });
    onChange?.({ fabricComposition: comp } as Partial<ProductDetailResponse>);
  };

  const handleMaterial = (key: string, idx: number, material: string) => {
    setSlots((prev) => {
      const updated = { ...prev };
      updated[key] = updated[key].map((s, i) => (i === idx ? { material, percent: '' } : s));
      return updated;
    });
  };

  const handlePercent = (key: string, idx: number, raw: string) => {
    let num = parseInt(raw.replace(/\D/g, ''), 10);
    if (isNaN(num)) num = 0;
    num = Math.min(100, Math.max(0, num));
    const percent = `${num}%`;
    setSlots((prev) => {
      const updated = { ...prev };
      updated[key] = updated[key].map((s, i) => (i === idx ? { ...s, percent } : s));
      notifyChange(updated);
      return updated;
    });
  };

  const handleDeleteSlot = (key: string, idx: number) => {
    setSlots((prev) => {
      const updated = { ...prev };
      updated[key] = updated[key].map((s, i) => (i === idx ? { material: '', percent: '' } : s));
      notifyChange(updated);
      return updated;
    });
  };

  const handleAddColumn = () => {
    const newCount = columnCount + 1;
    setColumnCount(newCount);
    setSlots((prev) => {
      const updated = createEmptySlots(newCount);
      FABRIC_KEYS.forEach((key) => {
        prev[key].forEach((slot, i) => {
          if (i < prev[key].length) updated[key][i] = slot;
        });
      });
      return updated;
    });
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BulletIconImage src={BulletIcon} alt="bullet icon" />
          <Title>제품 원단정보</Title>
        </HeaderLeft>
      </Header>
      <OutsideButtonWrapper>
        <AddButton onClick={handleAddColumn} title="열 추가">
          <FaPlus />
        </AddButton>
      </OutsideButtonWrapper>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>구분</th>
              {Array.from({ length: columnCount }, (_, i) => (
                <th key={i}>{i + 1}번</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FABRIC_KEYS.map((key) => (
              <tr key={key}>
                <td className="label">{key}</td>
                {slots[key].map((slot, idx) => {
                  const empty = !slot.material && !slot.percent;
                  const listId = `options-${key}-${idx}`;
                  return (
                    <CellTd key={idx} $empty={empty}>
                      <CellRow>
                        <MaterialInput
                          $empty={empty}
                          list={listId}
                          value={slot.material}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleMaterial(key, idx, e.target.value)
                          }
                        />
                        <datalist id={listId}>
                          {MATERIAL_OPTIONS.map((m) => (
                            <option key={m} value={m} />
                          ))}
                        </datalist>
                        <PercentWrapper>
                          <NumberInput
                            $empty={empty}
                            type="number"
                            min={0}
                            max={100}
                            value={slot.percent.replace('%', '')}
                            disabled={!slot.material}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handlePercent(key, idx, e.target.value)
                            }
                          />
                          <Suffix>%</Suffix>
                        </PercentWrapper>
                        {!empty && (
                          <DeleteButton onClick={() => handleDeleteSlot(key, idx)} title="삭제">
                            <FaTimes />
                          </DeleteButton>
                        )}
                      </CellRow>
                    </CellTd>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </Container>
  );
};

export default FabricInfoSection;

// styled-components 정의
const Container = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
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
  font-weight: 700;
  font-size: 15px;
`;

const OutsideButtonWrapper = styled.div`
  text-align: right;
  margin-bottom: 8px;
`;

const AddButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  &:hover {
    color: #333;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  margin-top: 12px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  th,
  td {
    border: 1px solid #ccc;
    text-align: center;
    font-size: 13px;
    width: 250px;
    padding: 8px;
  }
  th {
    background: #f2f2f2;
    font-weight: 600;
    min-width: 40px;
  }
  td.label {
    background: #fafafa;
    font-weight: 600;
    color: #333;
    width: auto;
  }
  tr:hover {
    background-color: #e3f2fd;
    cursor: pointer;
  }
`;

const CellTd = styled.td<{ $empty: boolean }>`
  position: relative;
  padding: 8px 28px 8px 8px;
  background: ${({ $empty }) => ($empty ? '#f9f9f9' : '#fff')};
`;

const CellRow = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
`;

const MaterialInput = styled.input<{ $empty: boolean }>`
  flex: 1;
  max-width: 100px;
  height: 32px;
  font-size: 13px;
  padding: 0 8px;
  border: 1px solid #bbb;
  border-radius: 4px;
  background: #fff;
  outline: ${({ $empty }) => ($empty ? 'none' : '2px solid #f6ae24')};
  &:focus {
    outline: 2px solid #f6ae24;
  }
`;

const PercentWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const NumberInput = styled.input<{ $empty: boolean }>`
  width: 36px;
  height: 30px;
  font-size: 13px;
  text-align: center;
  border: 1px solid #bbb;
  border-radius: 4px;
  background: ${({ $empty }) => ($empty ? '#f9f9f9' : '#fff')};
  outline: ${({ $empty }) => ($empty ? 'none' : '2px solid #f6ae24')};
  &:focus {
    outline: 2px solid #f6ae24;
  }
`;

const Suffix = styled.span`
  margin-left: 4px;
  font-size: 13px;
  color: #666;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 10px;
  color: #ff4d4f;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  &:hover {
    background: #ff4d4f;
    color: #fff;
  }
`;
