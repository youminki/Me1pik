import { FAQ_TABS, NOTICE_TABS, TERMS_TABS, PRIVACY_TABS } from 'src/constants/setting';
import { faqColumns } from 'src/components/Table/Setting/columns/faqColumns';
import { noticeColumns } from 'src/components/Table/Setting/columns/noticeColumns';
import { termsColumns } from 'src/components/Table/Setting/columns/termsColumns';
import { privacyColumns } from 'src/components/Table/Setting/columns/privacyColumns';

export type DocumentType = 'faq' | 'notice' | 'terms' | 'privacy';

export const DOCUMENT_LABELS = {
  faq: 'FAQ',
  notice: '공지사항',
  terms: '이용약관',
  privacy: '개인정보보호',
};

export const DOCUMENT_TABS = {
  faq: FAQ_TABS,
  notice: NOTICE_TABS,
  terms: TERMS_TABS,
  privacy: PRIVACY_TABS,
};

export const DOCUMENT_COLUMNS = {
  faq: faqColumns,
  notice: noticeColumns,
  terms: termsColumns,
  privacy: privacyColumns,
};
