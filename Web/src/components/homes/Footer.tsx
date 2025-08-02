/**
 * 홈 페이지 푸터 컴포넌트 (Footer.tsx)
 *
 * 홈 페이지 하단에 표시되는 푸터 컴포넌트입니다.
 * 회사 정보, 사업자등록번호, 주소, 저작권 정보를 포함합니다.
 *
 * @description
 * - 회사 정보 및 사업자등록번호 표시
 * - 회사 주소 정보
 * - 저작권 정보
 * - 반응형 디자인 지원
 */
import styled from 'styled-components';

/**
 * 홈 페이지 푸터 컴포넌트
 *

 * 홈 페이지 하단에 회사 정보와 저작권 정보를 표시합니다.
 *
 * @returns 푸터 JSX 요소
 */
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

/**
 * 푸터 컨테이너
 *

 * 푸터 전체를 감싸는 컨테이너입니다.
 */
const FooterContainer = styled.footer`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

/**
 * 구분선
 *

 * 푸터 상단의 구분선입니다.
 */
const Divider = styled.div`
  width: 100%;
  border-top: 1px solid #eeeeee;
  margin-bottom: 20px;
`;

/**
 * 푸터 텍스트
 *

 * 회사 정보와 주소를 포함하는 텍스트입니다.
 * highlight 클래스로 회사명을 강조합니다.
 */
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

/**
 * 푸터 저작권
 *

 * 저작권 정보를 표시하는 텍스트입니다.
 */
const FooterCopyright = styled.div`
  margin-top: 20px;

  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  /* or 167% */

  color: #f6ae24;
`;
