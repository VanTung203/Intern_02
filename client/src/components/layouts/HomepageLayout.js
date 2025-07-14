import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from '../homepage/Header'; 
import Footer from '../homepage/Footer';

const HomepageLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet /> {/* Đây là nơi nội dung của các trang con (như HomePage) sẽ được hiển thị */}
      </Container>
      <Footer />
    </Box>
  );
};

export default HomepageLayout;