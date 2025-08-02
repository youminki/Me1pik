import React from 'react';
import styled from 'styled-components';

import { Header, Title, Subtitle } from '@/components/shared/CommonStyles';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <StyledHeader>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </StyledHeader>
  );
};

export default PageHeader;

const StyledHeader = styled(Header)`
  gap: 8px;
  margin-bottom: 20px;
 
  @media (min-width: 1024px) {
    gap: 12px;
    margin-bottom: 24px;
  }
`;
