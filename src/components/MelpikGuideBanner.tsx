import { useState } from 'react';
import styled from 'styled-components';
import ReusableModal from './ReusableModal';
import HomeserviceIcon from '../assets/Home/HomeserviceIcon.svg';

const BannerWrapper = styled.div`
  width: 100%;
  height: 70px;
  background: #fff;
  border: 0.5px solid #ccc;
  border-radius: 20px 0px;
  display: flex;
  align-items: center;
  position: relative;
  margin: 0 auto 26px auto;
  cursor: pointer;
`;

const IconBox = styled.div`
  width: 66px;
  height: 50px;
  margin-left: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentBox = styled.div`
  flex: 1;
  margin-left: 20px;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
`;

const GuideText = styled.span`
  font-style: normal;
  font-size: 14px;
  line-height: 15px;
  color: #000;
`;

const MelpikText = styled(GuideText)`
  font-weight: 800;
`;

const GuideBoldText = styled(GuideText)`
  font-weight: 900;
`;

const RegularText = styled(GuideText)`
  font-weight: 400;
`;

const PopupBadge = styled.span`
  background: #000;
  border-radius: 4px;
  color: #fff;
  font-family: 'NanumSquare Neo OTF', sans-serif;
  font-weight: 800;
  font-size: 10px;
  line-height: 11px;
  padding: 4px 8px;
  margin-left: 10px;
  display: flex;
  align-items: center;
`;

const InfoList = styled.ol`
  margin: 12px 0 0 16px;
  padding: 0;
  list-style: decimal;
  font-size: 14px;
  & li {
    margin-bottom: 8px;
  }
`;

const MelpikGuideBanner = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BannerWrapper onClick={() => setOpen(true)}>
        <IconBox>
          <img
            src={HomeserviceIcon}
            alt='멜픽 서비스 아이콘'
            width={66}
            height={50}
          />
        </IconBox>
        <ContentBox>
          <MelpikText>멜픽 </MelpikText>
          <RegularText>서비스 - </RegularText>
          <GuideBoldText>이용 가이드</GuideBoldText>
          <RegularText>(안내)</RegularText>
          <PopupBadge>팝업</PopupBadge>
        </ContentBox>
      </BannerWrapper>
      <ReusableModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title='멜픽 - 이용안내'
      >
        <p>멜픽 서비스에서 대여 이용 시 아래 순서로 진행하세요:</p>
        <InfoList>
          <li>결제카드 등록</li>
          <li>이용권 결제</li>
          <li>대여제품 신청</li>
        </InfoList>
      </ReusableModal>
    </>
  );
};

export default MelpikGuideBanner;
