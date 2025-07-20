import React from 'react';

interface HeartIconProps {
  filled: boolean;
}

const HeartIcon: React.FC<HeartIconProps> = ({ filled }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='24px'
    height='24px'
    viewBox='0 0 24 24'
    fill={filled ? '#f44336' : 'none'}
    stroke='#000000'
    strokeWidth='1'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-label='좋아요'
    role='img'
  >
    <path
      d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 
      5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 
      1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
    />
  </svg>
);

export { HeartIcon };
