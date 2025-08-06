// client/src/services/homepageService.js
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

// Lấy tất cả bản tin
const getAllNews = () => {
    return apiClient.get('/homepage/news/all');
}

// Lấy chi tiết một bản tin theo ID
const getNewsById = (id) => {
    return apiClient.get(`/homepage/news/${id}`);
}

// Lấy tất cả văn bản pháp luật
const getAllLegalDocuments = () => {
    return apiClient.get('/homepage/legal-documents/all');
}

// Lấy chi tiết một văn bản pháp luật theo ID
const getLegalDocumentById = (id) => {
    return apiClient.get(`/homepage/legal-documents/${id}`);
}

// COMMENT do hàm này bây giờ đã chuyển qua hoSoService.js
// // Tra cứu nhanh hồ sơ theo số biên nhận
// const lookupHoSo = (receiptNumber) => {
//     return apiClient.get(`/hoso/lookup?receiptNumber=${receiptNumber}`);
// }

const homepageService = {
  getStatistics,
  getRecentNews,
  getRecentLegalDocuments,
  getAllNews,
  getNewsById,
  getAllLegalDocuments,
  getLegalDocumentById,
  // lookupHoSo,
};

export default homepageService;