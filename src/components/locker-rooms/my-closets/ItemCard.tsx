import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import DeleteButton from '../../../assets/locker-rooms/DeleteButton.svg';
import SampleMyCloset1 from '../../../assets/locker-rooms/SampleMyCloset1.svg';
import SampleMyCloset2 from '../../../assets/locker-rooms/SampleMyCloset2.svg';
import SampleMyCloset3 from '../../../assets/locker-rooms/SampleMyCloset3.svg';
import SampleMyCloset4 from '../../../assets/locker-rooms/SampleMyCloset4.svg';
import ReusableModal from '../../../components/shared/modals/ReusableModal';

const sampleImages = [
  SampleMyCloset1,
  SampleMyCloset2,
  SampleMyCloset3,
  SampleMyCloset4,
];

type ItemCardProps = {
  id: string;
  image: string;
  brand: string;
  description: string;
  price: number;
  discount: number;
  onDelete: (id: string) => void;
};

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  image,
  brand,
  description,
  price,
  discount,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    navigate(`/item/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(id);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const imageToShow =
    image.trim() !== ''
      ? image
      : sampleImages[(parseInt(id, 10) - 1) % sampleImages.length];

  return (
    <>
      <CardContainer onClick={handleClick}>
        <ImageWrapper>
          <Image src={imageToShow} alt={brand} />
          <DeleteButtonIcon
            onClick={handleDeleteClick}
            src={DeleteButton}
            alt='삭제'
          />
        </ImageWrapper>
        <Brand>{brand}</Brand>
        <Description>{description}</Description>
        <PriceWrapper>
          <OriginalPrice>{price.toLocaleString()}원</OriginalPrice>
          <NowLabel>NOW</NowLabel>
          <DiscountLabel>{discount}%</DiscountLabel>
        </PriceWrapper>
      </CardContainer>

      <ReusableModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title='삭제 확인'
        showConfirmButton={true}
      >
        <ModalContentWrapper>
          <ModalImage src={imageToShow} alt={brand} />
          <ModalMessage>선택한 옷을 삭제하시겠습니까?</ModalMessage>
        </ModalContentWrapper>
      </ReusableModal>
    </>
  );
};

export default React.memo(ItemCard);

const CardContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  width: 100%;
  margin-bottom: 15px;
`;

const ImageWrapper = styled.div`
  width: 100%;
  aspect-ratio: 2 / 3;
  background-color: #f5f5f5;
  position: relative;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DeleteButtonIcon = styled.img`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  cursor: pointer;
`;

const Brand = styled.h3`
  font-weight: 900;
  font-size: 12px;
  color: #000;
  margin-bottom: 2px;
`;

const Description = styled.p`
  font-weight: 400;
  font-size: 14px;
  color: #999;
  margin: 5px 0;
`;

const PriceWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  border-left: 1px solid #e0e0e0;
`;

const OriginalPrice = styled.span`
  font-weight: 900;
  font-size: 16px;
  color: #000;
  margin-left: 6px;
`;

const NowLabel = styled.span`
  font-size: 10px;
  color: #000;
`;

const DiscountLabel = styled.span`
  font-weight: 800;
  font-size: 12px;
  color: #f6ae24;
`;

const ModalContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const ModalImage = styled.img`
  max-width: 20%;
  max-height: 100%;
  object-fit: contain;
`;

const ModalMessage = styled.p`
  font-size: 14px;
  color: #000;
  text-align: center;
`;
