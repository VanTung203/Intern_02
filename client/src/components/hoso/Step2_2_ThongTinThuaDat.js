import React from 'react';
import { Box, Grid, TextField, Typography, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
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
      onMapClick({
        soThuTuThua: String(Math.floor(lat * 1000) % 100),
        soHieuToBanDo: String(Math.floor(lng * 1000) % 50),
        diaChi: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
      });
    },
  });
  return null;
};

// Đổi tên component cho khớp với tên file
const Step2_2_ThongTinThuaDat = ({ formData, onDataChange, errors, showValidation }) => {
    const { thongTinThuaDat } = formData;

    const handleChange = (event) => {
        const { name, value } = event.target;
        const updatedSectionData = {
            ...thongTinThuaDat,
            [name]: value
        };
        onDataChange({ thongTinThuaDat: updatedSectionData });
    };

    const handleMapSelect = (data) => {
        onDataChange({ thongTinThuaDat: { ...thongTinThuaDat, ...data } });
    };

    const markerPosition = () => {
        try {
            if (thongTinThuaDat.diaChi && thongTinThuaDat.diaChi.includes('Lat:')) {
                const lat = parseFloat(thongTinThuaDat.diaChi.match(/Lat: ([\d.-]+)/)[1]);
                const lng = parseFloat(thongTinThuaDat.diaChi.match(/Lng: ([\d.-]+)/)[1]);
                return [lat, lng];
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    return (
        <Box>
             <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <MapOutlinedIcon sx={{ mr: 1 }} />
              3. THÔNG TIN THỬA ĐẤT
            </Typography>
            <Paper sx={{ p: 3, borderRadius: 2 }} variant="outlined">
                <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={2.5}>
                        <TextField
                            required
                            name="soThuTuThua"
                            label="Số thứ tự thửa"
                            fullWidth
                            value={thongTinThuaDat.soThuTuThua || ''}
                            onChange={handleChange}
                            error={showValidation && !!errors.soThuTuThua}
                            helperText={showValidation && errors.soThuTuThua}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2.5}>
                        <TextField
                            required
                            name="soHieuToBanDo"
                            label="Số hiệu tờ bản đồ"
                            fullWidth
                            value={thongTinThuaDat.soHieuToBanDo || ''}
                            onChange={handleChange}
                            error={showValidation && !!errors.soHieuToBanDo}
                            helperText={showValidation && errors.soHieuToBanDo}
                        />
                    </Grid>
                    <Grid item xs={12} sm={7}>
                        <TextField
                            name="diaChi"
                            label="Địa chỉ chi tiết thửa đất"
                            // multiline
                            // rows={2}
                            fullWidth
                            value={thongTinThuaDat.diaChi || ''}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mb: 1 }}>🗺️ Click trên bản đồ để chọn vị trí thửa đất:</Typography>
                        <MapContainer center={[10.762622, 106.660172]} zoom={13} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
                            <TileLayer
                                attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapClickHandler onMapClick={handleMapSelect} />
                            {markerPosition() && <Marker position={markerPosition()} />}
                        </MapContainer>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default Step2_2_ThongTinThuaDat;