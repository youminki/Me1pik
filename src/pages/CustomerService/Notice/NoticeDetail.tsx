import React from 'react';
import styled from 'styled-components';

const NoticeDetail: React.FC = () => {
  return (
    <DetailContainer>
      <Section>
        <Label>공지사항</Label>
        <Box>
          <BoxText>새로운 시즌 의류 업데이트 (2025 봄)</BoxText>
        </Box>
      </Section>

      <Section>
        <Label>등록일</Label>
        <Box>
          <BoxText>2025.02.01</BoxText>
        </Box>
      </Section>

      <Section>
        <Label>상세내용</Label>
        <ContentBox>
          <ContentText>
            공지사항에 들어가는 상세한 내용이 들어가는 영역으로
          </ContentText>
        </ContentBox>
      </Section>

      <Divider />

      <NoticeMessage>
        <Bullet>※</Bullet>
        <NoticeText>
          해당 공지는 새로운 업데이트에 관한 내용으로 상황에 따라 변경될 수
          있으며, 자세한 문의는 서비스팀을 통해 안내 드립니다.
        </NoticeText>
      </NoticeMessage>
    </DetailContainer>
  );
};

export default NoticeDetail;

const DetailContainer = styled.div`
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  background: #ffffff;
  box-sizing: border-box;
  padding: 1rem;
  max-width: 1000px;
`;

const Section = styled.div`
  width: 100%;

  margin-bottom: 30px;
`;

const Label = styled.div`
  font-weight: 700;
  font-size: 10px;
  line-height: 11px;
  color: #000000;

  margin-bottom: 10px;
`;

const Box = styled.div`
  width: 100%;
  background: #ffffff;
  border: 1px solid #eeeeee;
  border-radius: 4px;
  padding: 20px 10px;
  box-sizing: border-box;
`;

const BoxText = styled.div`
  font-weight: 700;
  font-size: 13px;
  line-height: 14px;
  color: #000000;
`;

const ContentBox = styled(Box)`
  min-height: 320px;
`;

const ContentText = styled.div`
  font-weight: 400;
  font-size: 13px;
  line-height: 20px;
  color: #000000;
  white-space: pre-wrap;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #dddddd;
  margin-bottom: 30px;
`;

const NoticeMessage = styled.div`
  width: 100%;

  display: flex;
  align-items: flex-start;
`;

const Bullet = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 23px;
  color: #999999;

  margin-right: 5px;
`;

const NoticeText = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 23px;
  color: #999999;

  white-space: pre-wrap;
`;
