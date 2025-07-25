// client/src/services/userService.js
import apiClient from '../api/apiClient'; // Import instance chung

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/user/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/user/me/profile', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadAvatar = async (formDataFile) => {
  try {
    const response = await apiClient.post('/user/me/avatar', formDataFile, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// CÁC HÀM BẬT/TẮT 2FA
export const enableTwoFactor = async () => {
  try {
    // Endpoint này cần token xác thực
    const response = await apiClient.post('/user/me/security/enable-2fa');
    return response.data; // Mong đợi { message: "...", recoveryCodes?: [...] }
  } catch (error) {
    console.error("API Error - Enable 2FA in userService:", error.response?.data || error.message);
    throw error;
  }
};

export const disableTwoFactor = async () => {
  try {
    // Endpoint này cần token xác thực
    const response = await apiClient.post('/user/me/security/disable-2fa');
    return response.data; // Mong đợi { message: "..." }
  } catch (error) {
    console.error("API Error - Disable 2FA in userService:", error.response?.data || error.message);
    throw error;
  }
};

// Tìm kiếm tài khoản
export const getAllUsers = async (searchQuery, status) => {
  try {
    const params = {};
    if (searchQuery) {
        params.searchQuery = searchQuery;
    }
    if (status && status !== 'all') { // Chỉ gửi status nếu nó không phải 'all'
        params.status = status;
    }

    const response = await apiClient.get('/user/all', { params });
    return response.data;
  } catch (error) {
    console.error("API Error - Get All Users in userService:", error.response?.data || error.message);
    throw error;
  }
};

// Chức năng tạo tài khoản (của Admin)
export const createUserByAdmin = async (userData) => {
  try {
    // API này cần token của Admin để xác thực
    const response = await apiClient.post('/user/create', userData);
    return response.data; // Mong đợi { message: "...", user: {...} }
  } catch (error) {
    console.error("API Error - Create User in userService:", error.response?.data || error.message);
    throw error;
  }
};

// Gọi API cho chức năng Đặt lại mật khẩu của tài khoản (Admin)
export const resetPasswordByAdmin = async (userId, passwordData) => {
  try {
    const response = await apiClient.post(`/user/${userId}/admin-reset-password`, passwordData);
    return response.data; // Mong đợi { message: "..." }
  } catch (error) {
    console.error("API Error - Admin Reset Password in userService:", error.response?.data || error.message);
    throw error;
  }
};

// Gọi API cho chức năng Khóa/ Mở khóa tài khoản
export const lockUser = async (userId) => {
  try {
    const response = await apiClient.post(`/user/${userId}/lock`);
    return response.data; // Mong đợi { message: "..." }
  } catch (error) {
    console.error("API Error - Lock User in userService:", error.response?.data || error.message);
    throw error;
  }
};

export const unlockUser = async (userId) => {
  try {
    const response = await apiClient.post(`/user/${userId}/unlock`);
    return response.data; // Mong đợi { message: "..." }
  } catch (error) {
    console.error("API Error - Unlock User in userService:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/user/${userId}`);
    return response.data; // Mong đợi { message: "..." }
  } catch (error) {
    console.error("API Error - Delete User in userService:", error.response?.data || error.message);
    throw error;
  }
};