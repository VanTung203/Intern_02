import axios from 'axios';

const locationApiClient = axios.create({
  baseURL: 'https://provinces.open-api.vn/api',
});

const getProvinces = () => {
  return locationApiClient.get('/p/');
};

const getDistrictsByProvinceCode = (provinceCode) => {
  return locationApiClient.get(`/p/${provinceCode}?depth=2`);
};

const getWardsByDistrictCode = (districtCode) => {
  return locationApiClient.get(`/d/${districtCode}?depth=2`);
};

const locationService = {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
};

export default locationService;