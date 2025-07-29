import { useParams } from 'react-router-dom';
import { DOCUMENT_LABELS, DOCUMENT_TABS } from 'src/constants/document';
import DocumentDetailPageCore from 'src/pages/Tab5/Common/DocumentDetailPage';
import { DocumentType } from 'src/constants/document';

export default function DocumentDetailPage() {
  const { type, no } = useParams<{ type: DocumentType; no?: string }>();
  const isCreate = !no;

  if (!type || !DOCUMENT_LABELS[type]) return <div>잘못된 접근</div>;

  return (
    <DocumentDetailPageCore
      docType={DOCUMENT_LABELS[type]}
      isCreate={isCreate}
      selectOptions={DOCUMENT_TABS[type]}
      backPath={`/document/${type}`}
      // 기타 props
    />
  );
}
