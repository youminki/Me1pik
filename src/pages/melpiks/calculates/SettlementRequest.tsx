import React from 'react';
import styled, { ThemeProvider } from 'styled-components';

import FixedBottomBar from '../../../components/fixed-bottom-bar';
import AgreementSection from '../../../components/melpiks/settlement/SettlementAgreementSection';
import InputField from '../../../components/shared/forms/InputField';
import { theme } from '../../../styles/Theme';

const SettlementRequest: React.FC = () => {
  const taxRate = 0.04;

  const preTaxAmount = 90000;
  const taxAmount = Math.floor(preTaxAmount * taxRate);
  const netAmount = preTaxAmount - taxAmount;

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <AgreementSection />
        <InputField
          label='실 정산금액'
          id='netAmount'
          type='text'
          value={netAmount.toLocaleString()}
          readOnly
        />

        <RowContainer>
          <InputField
            label='정산금액 (세전)'
            id='preTaxAmount'
            type='text'
            value={preTaxAmount.toLocaleString()}
            readOnly
          />

          <InputField
            label='공제세액 (4%)'
            id='taxAmount'
            type='text'
            value={`- ${taxAmount.toLocaleString()}`}
            readOnly
          />
        </RowContainer>

        <Notice1>
          ※ 정산금액은 세액 공제 및 신고비용을 제외한 나머지 금액입니다.
        </Notice1>
        <Notice2>
          정산 가능시간 (평일 09:00 ~ 22:00) /{' '}
          <Highlight>공휴일 신청불가</Highlight>
        </Notice2>

        <FixedBottomBar
          text='신청완료'
          color='yellow'
          onClick={() => alert('신청이 완료되었습니다')}
        />
      </Container>
    </ThemeProvider>
  );
};

export default SettlementRequest;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;

  margin: 0 auto;
`;

const RowContainer = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const Notice1 = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 13px;

  color: #999999;
  margin-top: 10px;
`;
const Notice2 = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 13px;

  color: #000000;
  margin-top: 0px;
  padding: 0 15px;
`;

const Highlight = styled.span`
  font-weight: 400;
  font-size: 12px;
  line-height: 13px;

  color: #ef4523;
`;
