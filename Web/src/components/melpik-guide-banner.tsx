import { useState } from 'react';
import styled from 'styled-components';

import homeIcon1 from '@/assets/homes/homeIcon1.svg';
import homeIcon2 from '@/assets/homes/homeIcon2.svg';
import homeIcon3 from '@/assets/homes/homeIcon3.svg';
import homeIcon4 from '@/assets/homes/homeIcon4.svg';
import ReusableModal from '@/components/shared/modals/ReusableModal';

const BannerWrapper = styled.div`
  width: 251px;
  height: 56px;
  background: #fff;
  border: 0.5px solid #ccc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  position: relative;
  margin: 20px auto;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const IconBox = styled.div<{ isActive: boolean }>`
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  border-radius: 6px;
  background: ${(props) => (props.isActive ? '#000' : 'transparent')};
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.isActive ? '#000' : '#f5f5f5')};
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 30px;
  background: #ddd;
`;

const IconImage = styled.img<{ isActive: boolean }>`
  width: 22px;
  height: 22px;

  transition: all 0.2s ease;
  filter: ${(props) => (props.isActive ? 'brightness(0) invert(1)' : 'none')};

  &:hover {
    transform: scale(1.05);
  }
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
  const [modalType, setModalType] = useState<
    'guide' | 'temp1' | 'temp2' | 'temp3'
  >('guide');
  const [activeIcon, setActiveIcon] = useState<
    'guide' | 'temp1' | 'temp2' | 'temp3'
  >('guide');

  const handleIconClick = (type: 'guide' | 'temp1' | 'temp2' | 'temp3') => {
    setModalType(type);
    setActiveIcon(type);
    setOpen(true);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'guide':
        return '멜픽 - 이용안내';
      case 'temp1':
        return '서비스 1';
      case 'temp2':
        return '서비스 2';
      case 'temp3':
        return '서비스 3';
      default:
        return '멜픽 - 이용안내';
    }
  };

  const getModalContent = () => {
    switch (modalType) {
      case 'guide':
        return (
          <>
            <p>멜픽 서비스에서 대여 이용 시 아래 순서로 진행하세요:</p>
            <InfoList>
              <li>결제카드 등록</li>
              <li>이용권 결제</li>
              <li>대여제품 신청</li>
            </InfoList>
          </>
        );
      case 'temp1':
        return <p>서비스 1 - 구현 예정입니다.</p>;
      case 'temp2':
        return <p>서비스 2 - 구현 예정입니다.</p>;
      case 'temp3':
        return <p>서비스 3 - 구현 예정입니다.</p>;
      default:
        return <p>서비스 가이드</p>;
    }
  };

  return (
    <>
      <BannerWrapper>
        <IconContainer>
          <IconBox
            isActive={activeIcon === 'guide'}
            onClick={() => handleIconClick('guide')}
          >
            <IconImage
              src={homeIcon1}
              alt='서비스 가이드'
              isActive={activeIcon === 'guide'}
            />
          </IconBox>
          <Divider />
          <IconBox
            isActive={activeIcon === 'temp1'}
            onClick={() => handleIconClick('temp1')}
          >
            <IconImage
              src={homeIcon2}
              alt='서비스 1'
              isActive={activeIcon === 'temp1'}
            />
          </IconBox>
          <Divider />
          <IconBox
            isActive={activeIcon === 'temp2'}
            onClick={() => handleIconClick('temp2')}
          >
            <IconImage
              src={homeIcon3}
              alt='서비스 2'
              isActive={activeIcon === 'temp2'}
            />
          </IconBox>
          <Divider />
          <IconBox
            isActive={activeIcon === 'temp3'}
            onClick={() => handleIconClick('temp3')}
          >
            <IconImage
              src={homeIcon4}
              alt='서비스 3'
              isActive={activeIcon === 'temp3'}
            />
          </IconBox>
        </IconContainer>
      </BannerWrapper>
      <ReusableModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={getModalTitle()}
      >
        {getModalContent()}
      </ReusableModal>
    </>
  );
};

export default MelpikGuideBanner;
