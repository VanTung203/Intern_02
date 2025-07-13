import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

// Import logo từ thư mục public
import logo from '../../assets/logo_Vietbando.png';

const Header = () => {
  return (
    <>
      {/* Thanh Header trên cùng */}
      <AppBar position="static" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '16px' }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                CỔNG DỊCH VỤ CÔNG ĐẤT ĐAI
              </Typography>
            </Box>
            <Box>
              <Button component={RouterLink} to="/register" variant="outlined" sx={{ mr: 1 }}>
                Đăng ký
              </Button>
              <Button component={RouterLink} to="/login" variant="contained" color="primary">
                Đăng nhập
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Thanh điều hướng */}
      <AppBar position="static" sx={{ backgroundColor: '#f5f5f5' }} elevation={0}>
        <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ justifyContent: 'center' }}>
                <Button component={RouterLink} to="/" color="inherit" startIcon={<HomeIcon />}>
                    Trang chủ
                </Button>
                <Button component={RouterLink} to="/nop-ho-so" color="inherit">Nộp hồ sơ</Button>
                <Button component={RouterLink} to="/tra-cuu-ho-so" color="inherit">Thông tin hồ sơ</Button>
                <Button component={RouterLink} to="/tra-cuu-thua-dat" color="inherit">Thông tin thửa đất</Button>
                <Button component={RouterLink} to="/ban-tin" color="inherit">Bản tin pháp luật</Button>
                <Button component={RouterLink} to="/van-ban" color="inherit">Văn bản pháp luật</Button>
            </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Header;