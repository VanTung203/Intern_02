import apiClient from '../api/apiClient';

// Lấy danh sách thủ tục hành chính
const getThuTucHanhChinh = () => {
  return apiClient.get('/thutuchanhchinh');
};

// Upload một file đính kèm
const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Nộp toàn bộ hồ sơ
const submitHoSo = (data) => {
  return apiClient.post('/hoso/submit', data);
};

const getHoSoDetails = (receiptNumber, cccd = null) => {
  // Sử dụng 'params' để axios tự động tạo query string ?receiptNumber=...&cccd=...
  return apiClient.get('/hoso/details', {
    params: {
      receiptNumber,
      cccd, // axios sẽ tự bỏ qua nếu cccd là null
    },
  });
};

// Hai hàm cho việc cập nhật hồ sơ
const getMySubmissions = () => {
  return apiClient.get('/hoso/my-submissions');
};

const updateHoSo = (soBienNhan, data) => {
  return apiClient.put(`/hoso/update/${soBienNhan}`, data);
};

const hoSoService = {
  getThuTucHanhChinh,
  uploadFile,
  submitHoSo,
  getHoSoDetails,
  getMySubmissions,
  updateHoSo,
};



export default hoSoService;