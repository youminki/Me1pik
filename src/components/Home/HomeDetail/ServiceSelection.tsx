import React from 'react';
import styled from 'styled-components';

import { CustomSelect } from '../../CustomSelect';

export interface ServiceSelectionProps {
  selectedService: string;
  setSelectedService: (service: string) => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  selectedService,
  setSelectedService,
}) => {
  return (
    <ServiceContainer>
      <label>서비스 방식 (선택)</label>
      <CustomSelect
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
      >
        <option value=''>서비스 선택 (대여 or 구매)</option>
        <option value='rental'>대여</option>
        <option value='purchase' disabled>
          구매 (준비중)
        </option>
      </CustomSelect>
    </ServiceContainer>
  );
};

export default ServiceSelection;

const ServiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  label {
    font-weight: 700;
    font-size: 12px;
    margin-bottom: 10px;
    display: block;
  }
`;
