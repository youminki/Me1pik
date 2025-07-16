import React from 'react';
import UpIcon from '../UpIcon.svg';
import DownIcon from '../DownIcon.svg';

interface ArrowToggleIconProps {
  direction: 'up' | 'down';
}

const ArrowToggleIcon: React.FC<ArrowToggleIconProps> = ({ direction }) => {
  return (
    <img
      src={direction === 'up' ? UpIcon : DownIcon}
      alt={direction === 'up' ? '위로' : '아래로'}
      style={{ width: 20, height: 20, display: 'block' }}
    />
  );
};

export default ArrowToggleIcon;
