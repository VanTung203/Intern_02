import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Logout from '@mui/icons-material/Logout';

const UserMenu = () => {
  const { user, logoutAction } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logoutAction();
  };

  // Đảm bảo roles là một mảng để tránh lỗi .includes
  const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
  const isAdmin = userRoles.includes('Admin');

  return (
    <Box>
      <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'grey.800' }}>
            {user?.email?.[0]?.toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
      >
        <Box sx={{ p: '12px 16px' }}>
            <Typography variant="subtitle1" noWrap>{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>{user?.email}</Typography>
        </Box>
        <Divider />
        
        {isAdmin ? (
            <MenuItem component={RouterLink} to="/admin/users" onClick={handleClose}>
                <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
                Giao diện quản trị
            </MenuItem>
        ) : (
            <MenuItem component={RouterLink} to="/profile/info" onClick={handleClose}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                Thông tin tài khoản
            </MenuItem>
        )}
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;