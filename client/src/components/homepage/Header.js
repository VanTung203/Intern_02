import React from 'react';
// <<< THÊM Link VÀO IMPORT >>>
import { AppBar, Toolbar, Typography, Button, Box, Link, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import logo from '../../assets/logo_Vietbando.png'; // Đảm bảo đường dẫn này đúng

const Header = () => {
  return (
    <>
      {/* Thanh Header trên cùng */}
      <AppBar position="static" color="default" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* <<< BỌC LOGO VÀ TIÊU ĐỀ TRONG LINK >>> */}
            <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, textDecoration: 'none', color: 'text.primary' }}>
              <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '16px' }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                CỔNG DỊCH VỤ CÔNG ĐẤT ĐAI
              </Typography>
            </Link>
            <Box>
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="outlined" 
                sx={{ 
                  mr: 1,
                  borderColor: 'grey.800', // Màu viền
                  color: 'grey.800', // Màu chữ
                  '&:hover': {
                    borderColor: 'grey.900',
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                Đăng ký
              </Button>
              <Button 
                component={RouterLink} 
                to="/login" 
                variant="contained" 
                sx={{
                  backgroundColor: 'grey.800', // Màu nền
                  '&:hover': {
                    backgroundColor: 'grey.900' // Màu nền khi hover
                  }
                }}
              >
                Đăng nhập
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Thanh điều hướng */}
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'grey.800' }}>
        <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ justifyContent: 'center' }}>
                <Button component={RouterLink} to="/" sx={{ color: 'white' }} startIcon={<HomeIcon />}>
                    Trang chủ
                </Button>
                <Button component={RouterLink} to="/nop-ho-so" sx={{ color: 'grey.300' }}>Nộp hồ sơ</Button>
                <Button component={RouterLink} to="/tra-cuu-ho-so" sx={{ color: 'grey.300' }}>Thông tin hồ sơ</Button>
                <Button component={RouterLink} to="/tra-cuu-thua-dat" sx={{ color: 'grey.300' }}>Thông tin thửa đất</Button>
                <Button component={RouterLink} to="/ban-tin" sx={{ color: 'grey.300' }}>Bản tin pháp luật</Button>
                <Button component={RouterLink} to="/van-ban" sx={{ color: 'grey.300' }}>Văn bản pháp luật</Button>
            </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Header;