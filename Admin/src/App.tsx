// src/App.tsx

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from 'src/styles/theme';

const Login = lazy(() => import('src/pages/Login'));
const AdminList = lazy(() => import('src/pages/Tab2/Admins/AdminList'));
const UserList = lazy(() => import('src/pages/Tab3/Users/UserList'));
const TicketList = lazy(() => import('src/pages/Tab4/Ticket/TicketList'));
const TicketDetail = lazy(() => import('src/pages/Tab4/Ticket/TicketDetail'));
const MonitoringList = lazy(() => import('src/pages/Tab4/Monitoring/MonitoringList'));
const MonitoringDetail = lazy(() => import('src/pages/Tab4/Monitoring/MonitoringDetail'));
const Layout = lazy(() => import('src/Layout'));
const ProductList = lazy(() => import('src/pages/Tab4/Product/ProductList'));
const ProductDetail = lazy(() => import('src/pages/Tab4/Product/ProductDetail'));
const UserDetail = lazy(() => import('src/pages/Tab3/Users/UserDetail'));
const AdminDetail = lazy(() => import('src/pages/Tab2/Admins/AdminDetail'));
const PageList = lazy(() => import('src/pages/Tab3/Page/PageList'));
const PageDetail = lazy(() => import('src/pages/Tab3/Page/PageDetail'));
const ProductEvaluation = lazy(() => import('src/pages/Tab3/Evaluation/ProductEvaluation'));
const EvaluationDetail = lazy(() => import('src/pages/Tab3/Evaluation/EvaluationDetail'));
const SalesList = lazy(() => import('src/pages/Tab3/Sales/SalesList'));
const SalesDetail = lazy(() => import('src/pages/Tab3/Sales/SalesDetail'));
const CalculateList = lazy(() => import('src/pages/Tab3/Calculate/CalculateList'));
const CalculateDetail = lazy(() => import('src/pages/Tab3/Calculate/CalculateDetail'));
const BrandList = lazy(() => import('src/pages/Tab4/Brand/BrandList'));
const BrandDetail = lazy(() => import('src/pages/Tab4/Brand/BrandDetail'));
const GeneralOrderList = lazy(() => import('src/pages/Tab4/General/GeneralOrderList'));
const GeneralOrderDetail = lazy(() => import('src/pages/Tab4/General/GeneralOrderDetail'));
const MarketOrderList = lazy(() => import('src/pages/Tab4/Market/MarketOrderList'));
const MarketOrderDetail = lazy(() => import('src/pages/Tab4/Market/MarketOrderDetail'));
const Dashboard = lazy(() => import('src/pages/Tab1/Dashboard'));
const AnalysisInfo = lazy(() => import('src/pages/Tab2/Analysis/AnalysisInfo'));
const AdminCreate = lazy(() => import('src/pages/Tab2/Admins/AdminCreate'));
const DocumentListPage = lazy(() => import('src/pages/Document/DocumentListPage'));
const DocumentDetailPage = lazy(() => import('src/pages/Document/DocumentDetailPage'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Routes>
          {/* 기본 경로를 로그인 페이지로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <Suspense fallback={<div>로딩중...</div>}>
                <Login />
              </Suspense>
            }
          />

          {/* Layout 내부에 Outlet을 사용하여 공통 UI를 구성 */}
          <Route
            element={
              <Suspense fallback={<div>로딩중...</div>}>
                <Layout />
              </Suspense>
            }
          >
            <Route
              path="/adminlist"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <AdminList />
                </Suspense>
              }
            />
            <Route
              path="/admin-create"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <AdminCreate />
                </Suspense>
              }
            />
            <Route
              path="/admindetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <AdminDetail />
                </Suspense>
              }
            />
            <Route
              path="/userlist"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <UserList />
                </Suspense>
              }
            />
            {/* 이메일 파라미터 예시 */}
            <Route
              path="/userdetail/:email"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <UserDetail />
                </Suspense>
              }
            />
            <Route
              path="/ticketlist"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <TicketList />
                </Suspense>
              }
            />
            <Route
              path="/ticketDetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <TicketDetail />
                </Suspense>
              }
            />
            <Route
              path="/monitoringlist"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <MonitoringList />
                </Suspense>
              }
            />
            <Route
              path="/monitoringdetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <MonitoringDetail />
                </Suspense>
              }
            />
            <Route
              path="/productlist"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <ProductList />
                </Suspense>
              }
            />
            <Route
              path="/productdetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <ProductDetail />
                </Suspense>
              }
            />
            <Route
              path="/Pagelist"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <PageList />
                </Suspense>
              }
            />
            <Route
              path="/pagedetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <PageDetail />
                </Suspense>
              }
            />
            <Route
              path="/product-evaluation"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <ProductEvaluation />
                </Suspense>
              }
            />
            <Route
              path="/evaluationdetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <EvaluationDetail />
                </Suspense>
              }
            />
            <Route
              path="/saleslist"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <SalesList />
                </Suspense>
              }
            />
            <Route
              path="/salesdetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <SalesDetail />
                </Suspense>
              }
            />
            <Route
              path="/calculatelist"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <CalculateList />
                </Suspense>
              }
            />
            <Route
              path="/calculatedetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <CalculateDetail />
                </Suspense>
              }
            />
            {/* 브랜드 관리 */}
            <Route
              path="/brandlist"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <BrandList />
                </Suspense>
              }
            />
            <Route
              path="/branddetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <BrandDetail />
                </Suspense>
              }
            />
            <Route
              path="/generalorderList"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <GeneralOrderList />
                </Suspense>
              }
            />
            <Route
              path="/generalorderdetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <GeneralOrderDetail />
                </Suspense>
              }
            />
            <Route
              path="/marketorderList"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <MarketOrderList />
                </Suspense>
              }
            />
            <Route
              path="/marketorderdetail/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <MarketOrderDetail />
                </Suspense>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/analysisInfo"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <AnalysisInfo />
                </Suspense>
              }
            />
            {/* 라우트 구조 정리: 문서성 페이지는 아래 3개 라우트만 남김 */}
            <Route
              path="/document/:type"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <DocumentListPage />
                </Suspense>
              }
            />
            <Route
              path="/document/:type/create"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <DocumentDetailPage />
                </Suspense>
              }
            />
            <Route
              path="/document/:type/:no"
              element={
                <Suspense fallback={<div>로딩중...</div>}>
                  <DocumentDetailPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
