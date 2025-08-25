import { useMemo } from 'react';

// 색상 매핑 테이블
const colorMap: Record<string, string> = {
  화이트: 'WHITE',
  블랙: 'BLACK',
  그레이: 'GRAY',
  네이비: 'NAVY',
  아이보리: 'IVORY',
  베이지: 'BEIGE',
  브라운: 'BROWN',
  카키: 'KHAKI',
  그린: 'GREEN',
  블루: 'BLUE',
  퍼플: 'PURPLE',
  버건디: 'BURGUNDY',
  레드: 'RED',
  핑크: 'PINK',
  옐로우: 'YELLOW',
  오렌지: 'ORANGE',
  마젠타: 'MAGENTA',
  민트: 'MINT',
};

// 사이즈 매핑 테이블
const sizeMap: Record<string, string[]> = {
  '44(S)': ['44'],
  '55(M)': ['55'],
  '66(L)': ['66'],
  '77(XL)': ['77'],
};

interface Product {
  id: number;
  name?: string;
  brand?: string;
  description?: string;
  color?: string;
  sizes?: string[];
  image?: string;
  price?: number;
  discount?: number;
  isLiked?: boolean;
  category?: string;
}

interface UseProductFilterProps {
  products: Product[];
  searchQuery: string;
  selectedColors: string[];
  selectedSizes: string[];
}

export const useProductFilter = ({
  products,
  searchQuery,
  selectedColors,
  selectedSizes,
}: UseProductFilterProps) => {
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    const term = searchQuery.trim().toLowerCase();
    // 쉼표로 분리된 여러 검색어 처리
    const terms = term
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);

    // 색상 매핑: 한글 <-> 영문
    const colorMapEntries = Object.entries(colorMap);
    const allColorKeywords = [
      ...colorMapEntries.map(([kor]) => kor.toLowerCase()),
      ...colorMapEntries.map(([, eng]) => eng.toLowerCase()),
    ];

    // 검색어 중 색상 키워드와 일반 키워드 분리
    const searchColors: string[] = [];
    const searchKeywords: string[] = [];
    terms.forEach((t: string) => {
      if (allColorKeywords.includes(t)) {
        searchColors.push(t);
      } else if (t) {
        searchKeywords.push(t);
      }
    });

    const filtered = products.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const brand = (item.brand || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const color = item.color?.toLowerCase() || '';
      const sizes = item.sizes || [];

      // 이름/브랜드/설명 검색: 모든 일반 키워드가 이름/브랜드/설명에 하나라도 포함되면 true
      const matchesNameOrBrandOrDesc =
        searchKeywords.length === 0 ||
        searchKeywords.some(
          (kw) => name.includes(kw) || brand.includes(kw) || desc.includes(kw)
        );

      // 색상 검색: 검색어에 색상 키워드가 있으면, 상품 색상에 하나라도 포함되면 true
      let matchesSearchColors = true;
      if (searchColors.length > 0) {
        matchesSearchColors = searchColors.some((searchColor) => {
          // 한글로 입력한 경우 영문도 체크, 영문으로 입력한 경우 한글도 체크
          const found = colorMapEntries.find(
            ([kor, eng]) =>
              kor.toLowerCase() === searchColor ||
              eng.toLowerCase() === searchColor
          );
          if (found) {
            const [kor, eng] = found;
            return (
              color.includes(kor.toLowerCase()) ||
              color.includes(eng.toLowerCase()) ||
              color.toUpperCase().includes(eng.toUpperCase())
            );
          }
          return color.includes(searchColor);
        });
      }

      // 여러 색상 필터(필터 모달): selectedColors 중 하나라도 포함되면 true
      let matchesSelectedColors = true;
      if (selectedColors.length > 0) {
        matchesSelectedColors = selectedColors.some((selected) => {
          const engColor = colorMap[selected] || selected;
          return (
            color.toUpperCase().includes(engColor) || color.includes(selected)
          );
        });
      }

      // 사이즈 필터: selectedSizes 중 하나라도 상품의 sizes에 포함되면 true
      let matchesSelectedSizes = true;
      if (selectedSizes.length > 0) {
        matchesSelectedSizes = selectedSizes.some((selectedSize) => {
          // 사이즈 매핑 테이블에서 해당하는 숫자 사이즈들 가져오기
          const mappedSizes = sizeMap[selectedSize] || [selectedSize];

          // 상품 사이즈와 매핑된 사이즈들 중 하나라도 일치하는지 확인
          return mappedSizes.some((mappedSize) => {
            return sizes.some((productSize) => {
              // FREE 사이즈 특별 처리
              if (selectedSize === 'FREE') {
                return /free/i.test(productSize);
              }
              // 숫자 사이즈 매칭 - 정확한 숫자 비교
              return productSize === mappedSize;
            });
          });
        });
      }

      return (
        matchesNameOrBrandOrDesc &&
        matchesSearchColors &&
        matchesSelectedColors &&
        matchesSelectedSizes
      );
    });

    return filtered;
  }, [products, searchQuery, selectedColors, selectedSizes]);

  return { filteredProducts };
};
