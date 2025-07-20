// src/components/myinfos/ChangeProfileImageModal.tsx
import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
} from 'react';
import { FaTimes, FaUserCircle } from 'react-icons/fa';
import styled from 'styled-components';

interface ChangeProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeProfileImageModal: React.FC<ChangeProfileImageModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달 오픈/닫기 시 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  // Escape 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 파일 선택 시 미리보기 생성
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Avatar 클릭 시 파일 입력 트리거
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('이미지를 선택해주세요.');
      return;
    }
    console.log({ file });
    onClose();
    setFile(null);
    setPreviewUrl(null);
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalWrapper onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <Header>
          <Title>프로필 이미지 변경</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        {/* 본문 */}
        <Body>
          {/* Avatar & PlusBadge */}
          <AvatarContainer>
            <AvatarWrapper onClick={handleAvatarClick}>
              {previewUrl ? (
                <AvatarImg src={previewUrl} alt='프로필 미리보기' />
              ) : (
                <FaUserCircle size={70} color='#999' />
              )}
            </AvatarWrapper>
            <HelperText>클릭하여 이미지 선택</HelperText>
          </AvatarContainer>

          {/* 실제 파일 입력(input) - 숨김 */}
          <HiddenFileInput
            ref={fileInputRef}
            type='file'
            accept='image/*'
            onChange={handleFileChange}
          />

          {/* 구분선 */}
          <Divider />

          {/* 제출 버튼 */}
          <SubmitBtn onClick={handleSubmit} disabled={!file}>
            이미지 변경
          </SubmitBtn>
        </Body>
      </ModalWrapper>
    </Overlay>
  );
};

export default ChangeProfileImageModal;

/* Styled Components */
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalWrapper = styled.div`
  width: 100%;
  max-width: 320px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const Header = styled.div`
  position: relative;
  padding: 12px 16px;
  background-color: #fffcfc;
  border-bottom: 1px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #000;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 16px;
  background: transparent;
  border: none;
  color: #000;
  cursor: pointer;
  padding: 0;
  font-size: 20px;
  line-height: 1;
`;

const Body = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* Avatar 영역 */
const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  overflow: hidden;
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

/* 도우미 텍스트 */
const HelperText = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #666;
`;

/* 숨김 파일 입력 */
const HiddenFileInput = styled.input`
  display: none;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #ccc;
  margin: 24px 0;
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 12px 0;
  background: #000;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background: #999;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #dfa11d;
  }
`;
