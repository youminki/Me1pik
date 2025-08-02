// 소재 정보 컴포넌트 - 제품 소재 특성 표시 및 시각적 가이드 제공
import React from 'react';
import styled from 'styled-components';

// 소재 데이터 타입 정의
export interface MaterialData {
  [key: string]: string;
}

// 소재 정보 Props 인터페이스
export interface MaterialInfoProps {
  materialData: MaterialData;
}

// 소재 옵션 정의 (각 특성별 옵션들)
const materialOptions: Record<string, string[]> = {
  두께감: ['매우 두꺼움', '두꺼움', '적당', '얇음'],
  신축성: ['좋음', '약간있음', '없음', '허리밴딩'],
  안감: ['전체안감', '부분안감', '기모안감', '안감없음'],
  촉감: ['뻣뻣함', '까슬함', '적당', '부드러움'],
  비침: ['비침있음', '약간있음', '적당', '비침없음'],
};

// 선택된 값 가져오기 함수
const getSelectedValue = (
  key: string,
  options: string[],
  data: MaterialData
) => {
  const value = data[key];
  return options.includes(value) ? value : options[0];
};

// 슬라이더 위치 계산 함수
const calculatePosition = (index: number, total: number) =>
  `${(index / total) * 100 + 100 / total / 2}%`;

// 옵션별 색상 정의 (회색 계열)
const optionColors: Record<string, string[]> = {
  두께감: ['#696969', '#808080', '#A9A9A9', '#D3D3D3'],
  신축성: ['#696969', '#808080', '#A9A9A9', '#D3D3D3'],
  안감: ['#696969', '#808080', '#A9A9A9', '#D3D3D3'],
  촉감: ['#696969', '#808080', '#A9A9A9', '#D3D3D3'],
  비침: ['#696969', '#808080', '#A9A9A9', '#D3D3D3'],
};

// 메인 소재 정보 컴포넌트
const MaterialInfo: React.FC<MaterialInfoProps> = ({ materialData }) => (
  <Container>
    <Title>제품소재 정보</Title>
    <List>
      {Object.entries(materialOptions).map(([key, options]) => {
        const selected = getSelectedValue(key, options, materialData);
        const position = calculatePosition(
          options.indexOf(selected),
          options.length
        );

        return (
          <Item key={key}>
            <Label>{key}</Label>
            <BarWrapper>
              {/* 슬라이더 트랙 */}
              <Track>
                {options.map((option, index) => (
                  <ColoredBar
                    key={option}
                    style={{
                      left: `${(index / options.length) * 100}%`,
                      width: `${(1 / options.length) * 100}%`,
                      backgroundColor: optionColors[key][index],
                    }}
                  />
                ))}
                <Thumb style={{ left: position }} />
              </Track>
              {/* 옵션 라벨 */}
              <OptionList>
                {options.map((option, index) => (
                  <Option
                    key={option}
                    selected={option === selected}
                    style={{
                      left: `${(index / options.length) * 100}%`,
                      width: `${(1 / options.length) * 100}%`,
                    }}
                  >
                    {option}
                  </Option>
                ))}
              </OptionList>
            </BarWrapper>
          </Item>
        );
      })}
    </List>
  </Container>
);

export default MaterialInfo;

// 스타일 컴포넌트들
const Container = styled.div`
  margin-top: 40px;
`;

const Title = styled.h3`
  font-weight: 700;
  font-size: 14px;
  line-height: 16px;
  margin-bottom: 15px;
  text-align: center;
`;

const List = styled.div`
  border: 1px solid #ccc;
  padding: 8px 0;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 10px;
`;

const Label = styled.div`
  width: 40px;
  font-weight: 800;
  font-size: 13px;
  text-align: center;
  color: #333;
  margin-right: 20px;
`;

const BarWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Track = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  margin-bottom: 8px;
`;

const ColoredBar = styled.div`
  position: absolute;
  height: 4px;
  border-radius: 2px;
`;

const Thumb = styled.div`
  position: absolute;
  top: -8px;
  width: 14px;
  height: 14px;
  border: 3px solid #f6ae24;
  border-radius: 50%;
  background-color: #fff;
  transform: translateX(-50%);
  transition: left 0.3s ease;
`;

const OptionList = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 5px;
  position: relative;
`;

const Option = styled.div<{ selected: boolean }>`
  position: absolute;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: ${(props) => (props.selected ? '#f6ae24' : '#555')};
  cursor: pointer;
  transition: color 0.3s ease;
  width: 100%;
  transform: translateX(0%);
`;
