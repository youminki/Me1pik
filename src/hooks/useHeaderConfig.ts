import { matchPath } from 'react-router-dom';

type Variant = 'default' | 'oneDepth' | 'twoDepth' | 'threeDepth';

interface HeaderConfig {
  includeHeader1: boolean;
  includeHeader2: boolean;
  includeHeader3: boolean;
  includeHeader4: boolean;
  includeBottomNav: boolean;
  headerTitle: string;
  disablePadding: boolean;
}

const headerRules: {
  paths: string[];
  variant: Variant;
  getTitle?: (path: string) => string;
}[] = [
  {
    paths: ['/main', '/melpik', '/brand', '/lockerRoom', '/customerService'],
    variant: 'default',
  },
  {
    paths: [
      '/create-melpik',
      '/brand/:brandName',
      '/sales-schedule',
      '/melpik-settings',
      '/sales-settlement',
      '/usage-history',
      '/my-ticket',
      '/my-closet',
      '/point',
      '/product-review',
      '/payment-method',
    ],
    variant: 'oneDepth',
  },
  {
    paths: [
      '/item/:id',
      '/createMelpik/settings',
      '/schedule/confirmation/:scheduleId',

      '/schedule/reservation1',
      '/schedule/reservation2',
      '/schedule/reservation3',
      '/sales-settlement-detail/:id',
      '/settlement-request',
      '/payment-review/Write',
      '/payment-method/addcard',
      '/payment-method/cardDetail',
      '/my-ticket/PurchaseOfPasses',

      '/my-ticket/PurchaseOfPasses/TicketPayment',

      '/customerService/NoticeDetail',
      '/customerService/PersonalInformationProcessingPolicyDetail',
      '/customerService/TermsAndConditionsOfUseDetail',
      '/payment/:id',
      '/EditAddress',
    ],
    variant: 'twoDepth',
    getTitle: getTwoDepthTitle,
  },
  {
    paths: [
      '/signup',
      '/findid',
      '/findPassword',
      '/basket',
      '/alarm',
      '/MyInfo',
      '/MyStyle',
      '/MyInfoList',
      '/ticketDetail/:id',
      '/updateprofile',
      '/ChangePassword',
      '/DeliveryManagement',
    ],
    variant: 'threeDepth',
    getTitle: getThreeDepthTitle,
  },
];

export default function useHeaderConfig(path: string): HeaderConfig {
  let variant: Variant = 'default';
  let getTitle: ((path: string) => string) | undefined;

  for (const rule of headerRules) {
    if (rule.paths.some((p) => matchPath(p, path))) {
      variant = rule.variant;
      getTitle = rule.getTitle;
      break;
    }
  }

  const includeHeader1 = variant === 'default';
  const includeHeader2 = variant === 'oneDepth';
  const includeHeader3 = variant === 'twoDepth';
  const includeHeader4 = variant === 'threeDepth';
  const includeBottomNav = includeHeader1 || includeHeader2;
  const headerTitle = getTitle ? getTitle(path) : '';
  const disablePadding = path === '/PersonalLink' || path === '/landing';

  return {
    includeHeader1,
    includeHeader2,
    includeHeader3,
    includeHeader4,
    includeBottomNav,
    headerTitle,
    disablePadding,
  };
}

function getTwoDepthTitle(path: string): string {
  const map: Record<string, string> = {
    '/createMelpik/settings': '컨템포러리',
    '/sales-schedule': '판매 스케줄',
    '/schedule/confirmation/:scheduleId': '예약 스케줄 확인',
    '/schedule/reservation1': '스케줄 예약하기',
    '/schedule/reservation2': '스케줄 예약하기',
    '/schedule/reservation3': '스케줄 예약하기',
    '/EditAddress': '내 정보 - 배송지 관리',
  };
  for (const pattern in map) {
    if (matchPath(pattern, path)) return map[pattern];
  }
  if (matchPath('/sales-settlement-detail/:id', path)) return '정산내역 상세';
  if (matchPath('/settlement-request', path)) return '정산신청';
  if (matchPath('/payment-review/Write', path)) return '평가작성';
  if (matchPath('/payment-method/addcard', path)) return '카드등록';
  if (matchPath('/payment-method/cardDetail', path)) return '카드상세';
  if (matchPath('/my-ticket/PurchaseOfPasses', path)) return '이용권 구매';
  if (matchPath('/my-ticket/PurchaseOfPasses/TicketPayment', path))
    return '결제하기';

  if (matchPath('/payment/:id', path)) return '결제하기';
  return '';
}

function getThreeDepthTitle(path: string): string {
  const map: Record<string, string> = {
    '/signup': '회원가입',
    '/findid': '아이디찾기',
    '/findPassword': '비밀번호찾기',
    '/basket': '장바구니',
    '/alarm': '알람',
    '/MyInfo': '내 정보',
    '/MyStyle': '내 스타일',
    '/MyInfoList': '내 정보',
    'ticketDetail/:id': '이용권 상세',
    '/updateprofile': '내 정보 - 회원정보 변경',
    '/ChangePassword': '내 정보 - 비밀번호 변경',
    '/DeliveryManagement': '내 정보 - 배송지 관리',
  };
  for (const pattern in map) {
    if (matchPath(pattern, path)) return map[pattern];
  }
  return '';
}
