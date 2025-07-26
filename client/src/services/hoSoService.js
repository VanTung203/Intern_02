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

const getHoSoDetails = (receiptNumber, cccd) => {
  // Sử dụng 'params' để axios tự động tạo query string ?receiptNumber=...&cccd=...
  return apiClient.get('/hoso/details', {
    params: {
      receiptNumber,
      cccd,
    },
  });
};

const hoSoService = {
  getThuTucHanhChinh,
  uploadFile,
  submitHoSo,
  getHoSoDetails,
};



export default hoSoService;