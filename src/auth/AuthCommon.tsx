import styled from 'styled-components';

export const NaverLoginBg = styled.div`
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
export const NaverLoginBox = styled.div`
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64px;
`;
export const FormSectionWrapper = styled.div`
  padding: 2rem;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 64px;
  margin-left: auto;
  margin-right: auto;
`;
export const LogoWrap = styled.div`
  margin-bottom: 24px;
`;
export const LogoImg = styled.img`
  width: 184px;
  height: 83px;
`;
export const Slogan = styled.div`
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #222;
  margin-bottom: 18px;
  line-height: 1.5;
`;
export const SloganSub = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #888;
  margin-top: 4px;
`;
export const FormSection = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
export const InputLabel = styled.label`
  font-size: 10px;
  color: #222;
  font-weight: 700;
  margin-bottom: 4px;
`;
export const InputFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;
export const InputWrap = styled.div`
  position: relative;
  width: 100%;
`;
export const InputIconBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  z-index: 2;
`;
export const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  height: 51px;
  border: 1.5px solid ${({ hasError }) => (hasError ? '#ff4d4f' : '#dadada')};
  font-size: 16px;
  padding: 0 44px 0 15px;
  background: #fafbfb;
  box-sizing: border-box;
  color: #222;
  transition:
    border 0.2s,
    background 0.2s;
  &:focus {
    border-color: ${({ hasError }) => (hasError ? '#ff4d4f' : '#F6AE24')};
    background: #fff;
    outline: none;
  }
  &::placeholder {
    color: #b0b8c1;
    font-size: 16px;
  }
`;
export const StyledSelect = styled.select<{ hasError?: boolean }>`
  width: 100%;
  height: 51px;
  border: 1.5px solid ${({ hasError }) => (hasError ? '#ff4d4f' : '#dadada')};
  font-size: 16px;
  padding: 0 15px;
  background: #fafbfb;
  box-sizing: border-box;
  color: #222;
  transition:
    border 0.2s,
    background 0.2s;
  border-radius: 6px;
  margin-bottom: 0;
  &:focus {
    border-color: ${({ hasError }) => (hasError ? '#ff4d4f' : '#F6AE24')};
    background: #fff;
    outline: none;
  }
`;
export const ErrorMessage = styled.div`
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 2px;
  margin-bottom: 2px;
`;
export const FindBtn = styled.button<{ active?: boolean }>`
  width: 100%;
  height: 52px;
  background: ${({ active }) => (active ? '#222' : '#F6AE24')};
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  border: none;
  border-radius: 6px;
  margin-top: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover:enabled {
    background: ${({ active }) => (active ? '#111' : '#e09e1f')};
  }
  &:disabled {
    background: #f6ae24;
    cursor: not-allowed;
  }
`;
export const MelpikPointText = styled.p`
  color: #f6ae24;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0.5rem 0 0 0;
  text-align: center;
`;
