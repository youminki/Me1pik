import { useParams } from 'react-router-dom';
import {
  DOCUMENT_LABELS,
  DOCUMENT_TABS,
  DOCUMENT_COLUMNS,
  DocumentType,
} from 'src/constants/document';
import DocumentListPageCore, { TableColumn } from 'src/pages/Tab5/Common/DocumentListPage';
import { getTermsPolicyList, TermsPolicy } from 'src/api/terms/termsPolicyApi';
// 미사용 import 삭제
// import { FAQItem, NoticeItem, TermsItem, PrivacyItem } from 'src/types/setting';
import styled from 'styled-components';

// DocumentRow 타입 정의 (중복 방지 위해 이 파일에 정의)
export interface DocumentRow {
  id: number;
  no: number;
  title: string;
  category: string;
  content: string;
  createdAt: string;
}

function mapToRowFromTermsPolicy(item: TermsPolicy): DocumentRow {
  return {
    id: item.id,
    no: item.id,
    title: item.title,
    category: item.category ?? '',
    content: item.content,
    createdAt: item.createdAt,
  };
}

export default function DocumentListPage() {
  const { type } = useParams<{ type: DocumentType }>();

  if (!type || !DOCUMENT_LABELS[type]) return <div>잘못된 접근</div>;

  const commonProps = {
    docType: DOCUMENT_LABELS[type],
    tabList: DOCUMENT_TABS[type],
    registerPath: `/document/${type}/create`,
    detailPath: (no: number) => `/document/${type}/${no}`,
    fetchData: (params: { type: string; category?: string }) =>
      getTermsPolicyList({ ...params, type: DOCUMENT_LABELS[type] }),
    mapToRow: mapToRowFromTermsPolicy,
  };

  return (
    <>
      <HeaderTitle>{DOCUMENT_LABELS[type]}</HeaderTitle>
      <DocumentListPageCore<TermsPolicy>
        {...commonProps}
        columns={DOCUMENT_COLUMNS[type] as TableColumn<TermsPolicy>[]}
      />
    </>
  );
}

const HeaderTitle = styled.h1`
  text-align: left;
  font-weight: 700;
  font-size: 16px;
  padding: 0px 10px;
`;
