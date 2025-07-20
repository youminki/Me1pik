import React from 'react';

import Button02 from './SecondaryButton';

type ButtonPropsWithoutColor = Omit<
  React.ComponentProps<typeof Button02>,
  'color'
>;

export const YellowButton: React.FC<ButtonPropsWithoutColor> = (props) => {
  return <Button02 {...props} color='yellow' />;
};

export const BlackButton: React.FC<ButtonPropsWithoutColor> = (props) => {
  return <Button02 {...props} color='black' />;
};
