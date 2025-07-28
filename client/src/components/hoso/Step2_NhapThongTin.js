import React from 'react';
import {
  Box, Grid, TextField, Typography, FormControl,
  InputLabel, Select, MenuItem, Paper
} from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

// Fix icon lỗi khi dùng leaflet với React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      // Giả lập: gán lat,lng thành số thửa, tờ bản đồ
      onMapClick({
        soThuTuThua: String(Math.floor(lat * 1000) % 100),
        soHieuToBanDo: String(Math.floor(lng * 1000) % 50),
        diaChi: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
      });
    },
  });
  return null;
};

const Step2_NhapThongTin = ({ formData, onDataChange, errors, showValidation }) => {
  const { nguoiNopDon, thongTinThuaDat } = formData;

  const handleChange = (section, event) => {
    const { name, value } = event.target;
    const updatedSectionData = {
      ...formData[section],
      [name]: value
    };
    onDataChange({ [section]: updatedSectionData });
  };

  const handleMapSelect = (data) => {
    onDataChange({ thongTinThuaDat: { ...formData.thongTinThuaDat, ...data } });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>2. Nhập thông tin</Typography>
      <Grid container spacing={4}>

        {/* === THÔNG TIN NGƯỜI NỘP === */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
              <PersonOutlineIcon sx={{ mr: 1 }} />
              THÔNG TIN NGƯỜI NỘP
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  required
                  name="hoTen"
                  label="Họ tên"
                  fullWidth
                  value={nguoiNopDon.hoTen || ''}
                  onChange={(e) => handleChange('nguoiNopDon', e)}
                  error={showValidation && !!errors.hoTen}
                  helperText={showValidation && errors.hoTen}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    name="gioiTinh"
                    value={nguoiNopDon.gioiTinh || 1}
                    label="Giới tính"
                    onChange={(e) => handleChange('nguoiNopDon', e)}
                  >
                    <MenuItem value={1}>Nam</MenuItem>
                    <MenuItem value={2}>Nữ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="ngaySinh"
                  label="Ngày sinh"
                  type="date"
                  fullWidth
                  value={nguoiNopDon.ngaySinh || ''}
                  onChange={(e) => handleChange('nguoiNopDon', e)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="namSinh"
                  label="Năm sinh"
                  type="number"
                  fullWidth
                  value={nguoiNopDon.namSinh || ''}
                  onChange={(e) => handleChange('nguoiNopDon', e)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  name="soCCCD"
                  label="Số CCCD"
                  fullWidth
                  value={nguoiNopDon.soCCCD || ''}
                  onChange={(e) => handleChange('nguoiNopDon', e)}
                  error={showValidation && !!errors.soCCCD}
                  helperText={showValidation && errors.soCCCD}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  name="soDienThoai"
                  label="Số điện thoại"
                  fullWidth
                  value={nguoiNopDon.soDienThoai || ''}
                  onChange={(e) => handleChange('nguoiNopDon', e)}
                  error={showValidation && !!errors.soDienThoai}
                  helperText={showValidation && errors.soDienThoai}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  value={nguoiNopDon.email || ''}
                  onChange={(e) => handleChange('nguoiNopDon', e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="diaChi"
                  label="Địa chỉ"
                  multiline
                  rows={3}
                  fullWidth
                  value={nguoiNopDon.diaChi || ''}
                  onChange={(e) => handleChange('nguoiNopDon', e)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* === THÔNG TIN THỬA ĐẤT + BẢN ĐỒ === */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
              <MapOutlinedIcon sx={{ mr: 1 }} />
              THÔNG TIN THỬA ĐẤT
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  name="soThuTuThua"
                  label="Số thứ tự thửa"
                  fullWidth
                  value={thongTinThuaDat.soThuTuThua || ''}
                  onChange={(e) => handleChange('thongTinThuaDat', e)}
                  error={showValidation && !!errors.soThuTuThua}
                  helperText={showValidation && errors.soThuTuThua}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  name="soHieuToBanDo"
                  label="Số hiệu tờ bản đồ"
                  fullWidth
                  value={thongTinThuaDat.soHieuToBanDo || ''}
                  onChange={(e) => handleChange('thongTinThuaDat', e)}
                  error={showValidation && !!errors.soHieuToBanDo}
                  helperText={showValidation && errors.soHieuToBanDo}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="diaChi"
                  label="Địa chỉ chi tiết"
                  multiline
                  rows={3}
                  fullWidth
                  value={thongTinThuaDat.diaChi || ''}
                  onChange={(e) => handleChange('thongTinThuaDat', e)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>🗺️ Click trên bản đồ để chọn vị trí thửa đất:</Typography>
                <MapContainer center={[10.762622, 106.660172]} zoom={13} style={{ height: '250px', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onMapClick={handleMapSelect} />
                  {thongTinThuaDat.diaChi && (
                    <Marker position={[
                      parseFloat(thongTinThuaDat.diaChi.match(/Lat: ([\d.-]+)/)?.[1]),
                      parseFloat(thongTinThuaDat.diaChi.match(/Lng: ([\d.-]+)/)?.[1])
                    ]} />
                  )}
                </MapContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Step2_NhapThongTin;
