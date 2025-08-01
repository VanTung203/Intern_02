import apiClient from '../api/apiClient';

// Lấy dữ liệu thống kê từ backend
const getStatistics = () => {
  return apiClient.get('/homepage/statistics');
};

// Lấy danh sách tin tức mới nhất
// Tham số limit cho phép chúng ta tùy chỉnh số lượng tin tức muốn lấy
const getRecentNews = (limit = 9) => {
  return apiClient.get(`/homepage/news?limit=${limit}`);
};

// Lấy danh sách văn bản pháp luật mới nhất
const getRecentLegalDocuments = (limit = 5) => {
  return apiClient.get(`/homepage/legal-documents?limit=${limit}`);
};

// COMMENT do hàm này bây giờ đã chuyển qua hoSoService.js
// // Tra cứu nhanh hồ sơ theo số biên nhận
// const lookupHoSo = (receiptNumber) => {
//     return apiClient.get(`/hoso/lookup?receiptNumber=${receiptNumber}`);
// }

const homepageService = {
  getStatistics,
  getRecentNews,
  getRecentLegalDocuments,
  // lookupHoSo,
};

export default homepageService;