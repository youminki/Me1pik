/**
 * 버튼 래퍼 컴포넌트 (ButtonWrapper.tsx)
 *
 * 보조 버튼 컴포넌트를 특정 색상으로 미리 설정한 래퍼 컴포넌트들을 제공합니다.
 * 색상 선택을 단순화하여 개발 편의성을 높이고 일관된 디자인을 보장합니다.
 *
 * @description
 * - 노란색 버튼 래퍼 (YellowButton)
 * - 검은색 버튼 래퍼 (BlackButton)
 * - 색상 선택 단순화
 * - 일관된 디자인 보장
 * - 개발 편의성 향상
 */

import Button02 from '@/components/shared/buttons/SecondaryButton';

type ButtonPropsWithoutColor = Omit<
  React.ComponentProps<typeof Button02>,
  'color'
>;

/**
 * 노란색 버튼 컴포넌트
 *
 * 보조 버튼을 노란색으로 미리 설정한 래퍼 컴포넌트입니다.
 *
 * @param props - 보조 버튼 props (color 제외)
 * @returns 노란색 보조 버튼 컴포넌트
 */
export const YellowButton: React.FC<ButtonPropsWithoutColor> = (props) => {
  return <Button02 {...props} color='yellow' />;
};

/**
 * 검은색 버튼 컴포넌트
 *
 * 보조 버튼을 검은색으로 미리 설정한 래퍼 컴포넌트입니다.
 *
 * @param props - 보조 버튼 props (color 제외)
 * @returns 검은색 보조 버튼 컴포넌트
 */
export const BlackButton: React.FC<ButtonPropsWithoutColor> = (props) => {
  return <Button02 {...props} color='black' />;
};
