import StatusBadge from 'src/components/Common/StatusBadge';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * StatusBadge 스토리북 스토리
 *
 * - StatusBadge 컴포넌트의 다양한 사용 예시를 보여주는 스토리
 * - 기본, 성공, 실패, 커스텀 색상 등 다양한 상태 뱃지 예시
 * - Storybook을 통한 컴포넌트 문서화 및 테스트
 */

const meta: Meta<typeof StatusBadge> = {
  title: 'Common/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

/**
 * 기본 상태 뱃지 스토리
 * - 기본적인 상태 표시 뱃지 예시
 */
export const Default: Story = {
  args: {
    children: '상태',
    background: '#3071B2',
  },
};

/**
 * 성공 상태 뱃지 스토리
 * - 성공 상태를 나타내는 녹색 뱃지 예시
 */
export const Success: Story = {
  args: {
    children: '성공',
    background: '#4AA361',
  },
};

/**
 * 실패 상태 뱃지 스토리
 * - 실패 상태를 나타내는 빨간색 뱃지 예시
 */
export const Danger: Story = {
  args: {
    children: '실패',
    background: '#CD5542',
  },
};

/**
 * 커스텀 색상 뱃지 스토리
 * - 사용자 정의 색상을 사용하는 뱃지 예시
 */
export const CustomColor: Story = {
  args: {
    children: '커스텀',
    background: '#FF9800',
    color: '#222',
  },
};
