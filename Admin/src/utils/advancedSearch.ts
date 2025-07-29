// 검색 고도화 유틸리티 (제품리스트에서 추출)

// 문자열 정규화 함수 (공백, 특수문자 제거, 소문자)
export function normalize(str: string) {
  return (str || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w가-힣]/g, '');
}

// 색상/카테고리/브랜드 옵션을 외부에서 주입받도록 일반화
export function buildMap(options: Array<{ ko: string; value: string; label?: string }>) {
  const map: Record<string, string[]> = {};
  options.forEach((opt) => {
    const arr = [normalize(opt.ko), normalize(opt.value)];
    if (opt.label) arr.push(normalize(opt.label));
    arr.forEach((key) => {
      map[key] = arr;
    });
  });
  return map;
}

// 브랜드 유사어 예시 (확장 가능)
export const defaultBrandMap: Record<string, string[]> = {
  [normalize('대현')]: [
    normalize('대현'),
    normalize('(주)대현'),
    normalize('㈜대현'),
    normalize('daehyun'),
  ],
};

// 고도화된 검색 필터 함수
export function advancedSearchFilter<T extends Record<string, any>>({
  item,
  keywords,
  colorMap,
  categoryMap,
  brandMap,
  fields,
}: {
  item: T;
  keywords: string[];
  colorMap?: Record<string, string[]>;
  categoryMap?: Record<string, string[]>;
  brandMap?: Record<string, string[]>;
  fields: string[]; // 일반 필드명 배열 (부분일치)
}): boolean {
  return keywords.every((word) => {
    // 색상 한영 동시 매칭
    if (
      colorMap &&
      Object.keys(colorMap).some(
        (key) => key.includes(word) && colorMap[key].includes(normalize(item.color ?? '')),
      )
    )
      return true;
    // 카테고리 한영/라벨/부분일치(포함)
    if (
      categoryMap &&
      Object.keys(categoryMap).some(
        (key) => key.includes(word) && categoryMap[key].includes(normalize(item.category ?? '')),
      )
    )
      return true;
    // 브랜드 유사어/한영/부분일치(포함)
    if (
      brandMap &&
      Object.keys(brandMap).some(
        (key) => key.includes(word) && brandMap[key].includes(normalize(item.brand ?? '')),
      )
    )
      return true;
    // 일반 필드 부분 포함
    return fields.some((field) => normalize(String(item[field] ?? '')).includes(word));
  });
}
