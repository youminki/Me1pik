import StatusBadge from 'src/components/Common/StatusBadge';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof StatusBadge> = {
  title: 'Common/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = {
  args: {
    children: '상태',
    background: '#3071B2',
  },
};

export const Success: Story = {
  args: {
    children: '성공',
    background: '#4AA361',
  },
};

export const Danger: Story = {
  args: {
    children: '실패',
    background: '#CD5542',
  },
};

export const CustomColor: Story = {
  args: {
    children: '커스텀',
    background: '#FF9800',
    color: '#222',
  },
};
