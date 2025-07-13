import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 4, // Tăng khoảng cách với nội dung trên
        backgroundColor: 'grey.800', // <<< ÁP DỤNG MÀU NỀN MỚI
        color: 'grey.300' // Chữ màu xám nhạt
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" align="center" sx={{ fontWeight: 'bold', color: 'white' }}>
          CỔNG DỊCH VỤ CÔNG ĐẤT ĐAI
        </Typography>
        {/* <Typography variant="body2" align="center">
          {'Bản quyền © '}
          {new Date().getFullYear()}
          {'.'}
        </Typography> */}
      </Container>
    </Box>
  );
};

export default Footer;