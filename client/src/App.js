// client/src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { useAuth } from './context/AuthContext';

// Layouts
import PublicPageLayout from './components/layouts/PublicPageLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import HomepageLayout from './components/layouts/HomepageLayout';

// Public Pages
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PleaseVerifyEmailPage from './pages/PleaseVerifyEmailPage';
import EmailConfirmedPage from './pages/EmailConfirmedPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ForgotPasswordEmailSentPage from './pages/ForgotPasswordEmailSentPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ResetPasswordSuccessPage from './pages/ResetPasswordSuccessPage';
import TwoFactorAuthPage from './pages/TwoFactorAuthPage';
import GoogleSigninSuccessPage from './pages/GoogleSigninSuccessPage';
import HomePage from './pages/homepage/HomePage';
import TraCuuHoSoPage from './pages/TraCuuHoSoPage';
import TraCuuThuaDatPage from './pages/TraCuuThuaDatPage';
import BanTinListPage from './pages/BanTinListPage';
import BanTinDetailPage from './pages/BanTinDetailPage';
import VanBanListPage from './pages/VanBanListPage';
import VanBanDetailPage from './pages/VanBanDetailPage';

// Private Pages
import UserProfilePage from './pages/UserProfilePage';
import UserProfileInfoForm from './components/User/UserProfileInfoForm';
import UserSecurityContent from './components/User/UserSecurityContent';
import NopHoSoPage from './pages/NopHoSoPage';
import HoSoDaNopPage from './pages/HoSoDaNopPage';
import ChinhSuaHoSoPage from './pages/ChinhSuaHoSoPage';

// Admin Pages
import UserListPage from './pages/admin/UserListPage';

// Routing Components
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';

import { Typography, Box, CircularProgress } from '@mui/material';

function App() {
  const { isAuthenticated, user, isLoading } = useAuth();
    
  // Hiển thị loading cho toàn bộ ứng dụng trong khi chờ xác thực
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
      <Routes>
        {/* Route cha sử dụng HomepageLayout */}
        <Route element={<HomepageLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route element={<PrivateRoute />}> 
            <Route path="/nop-ho-so" element={<NopHoSoPage />} />
            <Route path="/ho-so-da-nop" element={<HoSoDaNopPage />} />
            <Route path="/chinh-sua-ho-so/:soBienNhan" element={<ChinhSuaHoSoPage />} />
          </Route>
          <Route path="/tra-cuu-ho-so" element={<TraCuuHoSoPage />} />
          <Route path="/tra-cuu-thua-dat" element={<TraCuuThuaDatPage />} />
          <Route path="/ban-tin" element={<BanTinListPage />} />
          <Route path="/ban-tin/:id" element={<BanTinDetailPage />} />
          <Route path="/van-ban" element={<VanBanListPage />} />
          <Route path="/van-ban/:id" element={<VanBanDetailPage />} />
        </Route>

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/please-verify-email" element={<PleaseVerifyEmailPage />} />
        <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/forgot-password-email-sent" element={<ForgotPasswordEmailSentPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password-success" element={<ResetPasswordSuccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-2fa" element={<TwoFactorAuthPage />} />
        <Route path="/google-signin-success" element={<GoogleSigninSuccessPage />} />

        {/* User Private Routes và DashboardLayout*/}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/profile" element={<UserProfilePage />}>
              <Route index element={<Navigate to="info" replace />} />
              <Route path="info" element={<UserProfileInfoForm />} />
              <Route path="security" element={<UserSecurityContent />} />
            </Route>
            {/* Các trang khác của user có thể thêm ở đây */}
          </Route>
        </Route>

        {/* Admin Private Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/users" element={<UserListPage />} />
            {/* Các trang khác của admin có thể thêm ở đây */}
          </Route>
        </Route>

        {/* Route mặc định */}
        {/* <Route 
          path="/" 
          element={
            isAuthenticated 
              ? (user?.roles?.includes('Admin') ? <Navigate to="/admin/users" replace /> : <Navigate to="/profile" replace />)
              : <Navigate to="/login" replace />
          } 
        /> */}

        {/* Trang 404 */}
        <Route path="*" element={
          <PublicPageLayout> {/* Có thể bọc trang 404 bằng layout chung */}
            <Box sx={{textAlign: 'center', py: 5}}>
              <Typography variant="h3">404</Typography>
              <Typography variant="h6">Page Not Found</Typography>
              <Typography sx={{mt:2}}>Xin lỗi, chúng tôi không tìm thấy trang bạn yêu cầu.</Typography>
            </Box>
          </PublicPageLayout>
        } />
      </Routes>
  );
}

export default App;