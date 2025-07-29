import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import SettingsDetailSubHeader, {
  DetailSubHeaderProps,
} from '@components/Header/SettingsDetailSubHeader';
import SettingsDetailTopBoxes from '@components/SettingsDetailTopBoxes';
import ShippingTabBar from '@components/TabBar';
import ReusableModal2 from '@components/TwoButtonModal';
import {
  getTermsPolicy,
  createTermsPolicy,
  updateTermsPolicy,
  deleteTermsPolicy,
  TermsPolicy,
} from '@/api/terms/termsPolicyApi';
import { TabItem } from '@components/Header/SearchSubHeader';

interface DocumentDetailPageProps {
  docType: string;
  isCreate?: boolean;
  selectOptions: TabItem[];
  backPath: string;
}

const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({
  docType,
  isCreate = false,
  selectOptions,
  backPath,
}) => {
  const navigate = useNavigate();
  const { no } = useParams<{ no: string }>();
  const numericNo = isCreate ? undefined : Number(no);

  // form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(selectOptions[0]?.label ?? '');
  const [content, setContent] = useState('');

  // modal state
  const [activeTab, setActiveTab] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // 데이터 불러오기
  useEffect(() => {
    if (!isCreate && numericNo) {
      getTermsPolicy(numericNo).then((data: TermsPolicy) => {
        setTitle(data.title);
        setCategory(data.category ?? '');
        setContent(data.content);
      });
    }
  }, [isCreate, numericNo]);

  const handleBack = () => navigate(backPath);
  const handleSave = () => {
    setModalTitle(isCreate ? '등록 완료' : '변경 완료');
    setModalMessage(isCreate ? '새 문서를 등록하시겠습니까?' : '변경 내용을 저장하시겠습니까?');
    setIsModalOpen(true);
  };
  const handleDelete = () => {
    setModalTitle('삭제 완료');
    setModalMessage('문서를 삭제하시겠습니까?');
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    try {
      if (modalTitle === '등록 완료') {
        if (!title || !content) {
          alert('제목과 내용을 입력하세요.');
          return;
        }
        console.log({ title, type: docType, category, content }); // 추가
        await createTermsPolicy({ title, type: docType, category, content });
        navigate(backPath);
      } else if (modalTitle === '변경 완료' && numericNo) {
        await updateTermsPolicy(numericNo, {
          title,
          type: docType,
          category,
          content,
        });
        navigate(backPath);
      } else if (modalTitle === '삭제 완료' && numericNo) {
        await deleteTermsPolicy(numericNo);
        navigate(backPath);
      }
    } catch (err) {
      alert('등록에 실패했습니다. 다시 시도해 주세요.');
      console.error(err);
      // navigate(backPath); // 실패 시에는 이동하지 않음
    }
  };

  const detailProps: DetailSubHeaderProps = {
    backLabel: '목록이동',
    onBackClick: handleBack,
    editLabel: isCreate ? '등록하기' : '변경저장',
    onEditClick: handleSave,
    endLabel: isCreate ? '취소' : '삭제',
    onEndClick: isCreate ? handleBack : handleDelete,
  };

  return (
    <Container>
      <HeaderRow>
        <Title>{isCreate ? `${docType} 등록` : `${docType} 상세 (${numericNo})`}</Title>
      </HeaderRow>
      <SettingsDetailSubHeader {...detailProps} />
      <ProductNumberWrapper>
        <ProductNumberLabel>번호</ProductNumberLabel>
        <ProductNumberValue>
          {typeof numericNo === 'number' && !isNaN(numericNo) ? numericNo : '-'}
        </ProductNumberValue>
      </ProductNumberWrapper>
      <SettingsDetailTopBoxes />
      <MiddleDivider />
      <ShippingTabBar tabs={['상세내용']} activeIndex={activeTab} onTabClick={setActiveTab} />
      {activeTab === 0 && (
        <DetailBox>
          <Table>
            <tbody>
              <Tr>
                <Th>제목</Th>
                <Td>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                  />
                </Td>
              </Tr>
              <Tr>
                <Th>구분</Th>
                <Td>
                  <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {selectOptions.map((option) => (
                      <option key={option.label} value={option.label}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Td>
              </Tr>
              <Tr>
                <Th>내용</Th>
                <Td>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="내용을 입력하세요"
                  />
                </Td>
              </Tr>
            </tbody>
          </Table>
        </DetailBox>
      )}
      <ReusableModal2
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title={modalTitle}
      >
        {modalMessage}
      </ReusableModal2>
    </Container>
  );
};

export default DocumentDetailPage;

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  background: #fff;
`;
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;
const Title = styled.h1`
  font-weight: 700;
  font-size: 16px;
`;
const ProductNumberWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 10px 0 34px;
`;
const ProductNumberLabel = styled.div`
  font-weight: 700;
  font-size: 12px;
`;
const ProductNumberValue = styled.div`
  font-weight: 900;
  font-size: 12px;
`;
const MiddleDivider = styled.hr`
  border-top: 1px dashed #dddddd;
  margin: 30px 0;
`;

const DetailBox = styled.div`
  border: 1px solid #dddddd;

  background: #fff;
  width: 100%;
  margin-top: 0; /* 탭바와 딱 붙게 */
  box-sizing: border-box;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const Th = styled.th`
  width: 120px;
  background: #f8f9fb;

  font-weight: 700;
  font-size: 12px;
  color: #000;
  padding: 16px 12px;
  border-right: 1px solid #eeeeee;
  text-align: center;
`;

const Td = styled.td`
  background: #fff;

  font-size: 12px;
  color: #000;
  padding: 16px 12px;
`;

const Input = styled.input`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
`;

const Textarea = styled.textarea`
  width: 100%;
  max-width: 100%;
  min-height: 120px;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  resize: vertical;
`;

const Tr = styled.tr`
  &:not(:last-child) td,
  &:not(:last-child) th {
    border-bottom: 1px solid #eeeeee;
  }
`;
