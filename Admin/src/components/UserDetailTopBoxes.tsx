import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import userDetailImg1 from '@assets/userDetailImg1.svg';
import userDetailImg2 from '@assets/userDetailImg2.svg';
import userDetailImg3 from '@assets/userDetailImg3.svg';
import userDetailImg4 from '@assets/userDetailImg4.svg';
import { getUserByEmail, UserDetail } from '@api/adminUser';

interface Props {
  email: string;
}

const UserDetailTopBoxes: React.FC<Props> = ({ email }) => {
  const [user, setUser] = useState<UserDetail | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserByEmail(email);
        setUser(data);
      } catch (error) {
        console.error('사용자 정보를 불러오는 데 실패했습니다.', error);
      }
    };

    fetchUser();
  }, [email]);

  if (!user) return <Container>로딩 중...</Container>;

  const getAge = (birthdate: string): number => {
    const birthYear = parseInt(birthdate.split('-')[0], 10);
    const thisYear = new Date().getFullYear();
    return thisYear - birthYear + 1;
  };

  return (
    <Container>
      <BoxWrapper>
        {/* 첫 번째 박스 */}
        <Box>
          <IconPlaceholder>
            <IconImage src={userDetailImg1} alt="User Detail 1" />
          </IconPlaceholder>
          <Content>
            <Row>
              <Value>
                <BoldValue>{user.name}</BoldValue> ({user.nickname})
              </Value>
            </Row>
            <Row>
              <Value>{user.email}</Value>
            </Row>
            <Row>
              <Value>
                {/* 등급: membership.name으로 표시 */}
                <BoldValue>이용자 </BoldValue>
                {user.membership.name}
              </Value>
            </Row>
          </Content>
        </Box>

        <Divider />

        {/* 두 번째 박스 */}
        <Box>
          <IconPlaceholder>
            <IconImage src={userDetailImg2} alt="User Detail 2" />
          </IconPlaceholder>
          <Content>
            <Row>
              <Value>
                <BoldValue>{user.birthdate.split('-')[0]}년</BoldValue> ({getAge(user.birthdate)}세)
              </Value>
            </Row>
            <Row>
              <Value>
                <BoldValue>{user.phoneNumber}</BoldValue>
              </Value>
            </Row>
          </Content>
        </Box>

        <Divider />

        {/* 세 번째 박스 */}
        <Box>
          <IconPlaceholder>
            <IconImage src={userDetailImg3} alt="User Detail 3" />
          </IconPlaceholder>
          <Content>
            <Row>
              <Value>
                <BoldValue>{user.instagramId}</BoldValue> (브랜드)
              </Value>
            </Row>
            <Row>
              <Value>
                팔로워 <BoldValue>{user.followersCount.toLocaleString()}</BoldValue> / 팔로잉{' '}
                <BoldValue>{user.followingCount.toLocaleString()}</BoldValue>
              </Value>
            </Row>
          </Content>
        </Box>

        <Divider />

        {/* 네 번째 박스 */}
        <Box>
          <IconPlaceholder>
            <IconImage src={userDetailImg4} alt="User Detail 4" />
          </IconPlaceholder>
          <Content>
            <Row>
              <Value>
                <BoldValue>{user.address}</BoldValue>
              </Value>
            </Row>
            <Row>
              <Value>
                멜픽 - <BoldValue>{user.personalWebpage}</BoldValue>
              </Value>
            </Row>
          </Content>
        </Box>
      </BoxWrapper>
    </Container>
  );
};

export default UserDetailTopBoxes;

/* ======================= Styled Components ======================= */

const Container = styled.div`
  min-width: 1100px;
`;

const BoxWrapper = styled.div`
  display: flex;
  align-items: stretch;
  border: 1px solid #dddddd;
  border-radius: 4px;
`;

const Box = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 10px;
`;

const Divider = styled.div`
  width: 1px;
  background-color: #dddddd;
  align-self: stretch;
  margin: 10px;
`;

const IconPlaceholder = styled.div`
  width: 72px;
  height: 72px;
  border: 1px solid #dddddd;
  border-radius: 50%;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconImage = styled.img`
  width: 72px;
  height: 72px;
  object-fit: contain;
  border-radius: 50%;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Value = styled.div`
  font-weight: 400;
  font-size: 12px;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BoldValue = styled.span`
  font-weight: 800;
  font-size: 12px;
  color: #000;
`;
