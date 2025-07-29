// src/utils/sizeGuideUtils.ts
import { sizeGuideConfig } from 'src/config/sizeGuideConfig';
import { SizeRow } from 'src/api/adminProduct';

/**
 * 이전 카테고리의 sizes를 라벨 기준으로 새 카테고리에 매핑하여 반환
 */
export function mapSizesByLabel(
  oldSizes: SizeRow[],
  oldCategory: string,
  newCategory: string,
): SizeRow[] {
  const oldConfig = sizeGuideConfig[oldCategory];
  const newConfig = sizeGuideConfig[newCategory];

  // 이전 라벨 → 키 맵핑 생성
  const labelToOldKey = Object.entries(oldConfig.labels).reduce<Record<string, string>>(
    (acc, [key, label]) => {
      acc[label] = key;
      return acc;
    },
    {},
  );

  return oldSizes.map((oldRow) => {
    const newMeasurements: Record<string, number> = {};
    // 새 카테고리의 각 키에 대해, 같은 라벨이 있으면 이전 값을, 없으면 0
    Object.entries(newConfig.labels).forEach(([newKey, newLabel]) => {
      const oldKey = labelToOldKey[newLabel];
      newMeasurements[newKey] = oldRow.measurements[oldKey] ?? 0;
    });
    return {
      size: oldRow.size,
      measurements: newMeasurements,
    };
  });
}
