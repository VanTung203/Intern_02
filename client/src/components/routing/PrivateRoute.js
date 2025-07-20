// client/src/components/routing/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return isAuthenticated ? (
        // Nếu đã đăng nhập, cho phép render các route con (Outlet)
        <Outlet /> 
    ) : (
        // Nếu chưa đăng nhập, chuyển hướng đến /login
        // và truyền 'location' hiện tại vào state 'from'
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default PrivateRoute;