import styled from 'styled-components';

const Footer = () => {
  return (
    <FooterContainer>
      <Divider />
      <FooterText>
        <span className='highlight'> (주) 팀리프트 </span> | 235-87-01284 |
        2020-서울금천-0973
        <br />
        서울 금천구 디지털로9길 41, 1008호
      </FooterText>
      <FooterCopyright>© 2024 MELPICK. All Rights Reserved.</FooterCopyright>
    </FooterContainer>
  );
};

export default Footer;

const FooterContainer = styled.footer`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Divider = styled.div`
  width: 100%;
  border-top: 1px solid #eeeeee;
  margin-bottom: 20px;
`;

const FooterText = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;

  color: #999999;

  .highlight {
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;

    color: #000000;
  }
`;

const FooterCopyright = styled.div`
  margin-top: 20px;

  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  /* or 167% */

  color: #f6ae24;
`;
