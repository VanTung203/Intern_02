import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" align="center" sx={{ fontWeight: 'bold' }}>
          CỔNG DỊCH VỤ CÔNG ĐẤT ĐAI
        </Typography>
        {/* <Typography variant="body2" color="text.secondary" align="center">
          {'Bản quyền © '}
          {new Date().getFullYear()}
          {'.'}
        </Typography> */}
      </Container>
    </Box>
  );
};

export default Footer;