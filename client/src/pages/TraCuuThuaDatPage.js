// File: client/src/pages/TraCuuThuaDatPage.js

import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import CSS của Leaflet
import L from 'leaflet';

import thuaDatService from '../services/thuaDatService';

// --- Fix lỗi icon mặc định của Leaflet khi dùng với Webpack ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
// -----------------------------------------------------------

// Component để tự động di chuyển và zoom bản đồ
const ChangeMapView = ({ geoJsonData }) => {
    const map = useMap();
    useEffect(() => {
        if (geoJsonData) {
            const layer = L.geoJSON(geoJsonData);
            map.flyToBounds(layer.getBounds());
        }
    }, [geoJsonData, map]);
    return null;
};

const TraCuuThuaDatPage = () => {
    const [soTo, setSoTo] = useState('');
    const [soThua, setSoThua] = useState('');
    const [thuaDatData, setThuaDatData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Vị trí mặc định của bản đồ (ví dụ: trung tâm Hà Nội)
    const defaultPosition = [21.028511, 105.804817];

    const handleSearch = async (e) => {
        e.preventDefault();

        // 1. Thêm validation ở frontend để chặn request không cần thiết
        if (!soTo.trim() || !soThua.trim()) {
            setError("Vui lòng nhập đầy đủ Số tờ bản đồ và Số thứ tự thửa.");
            return; // Dừng hàm tại đây
        }

        setIsLoading(true);
        setError('');
        setThuaDatData(null);

        try {
            const response = await thuaDatService.lookupThuaDat(soTo, soThua);
            setThuaDatData(response.data);
        } catch (err) {
            // 2. Xử lý lỗi một cách an toàn, đảm bảo `errorMessage` luôn là một chuỗi
            const errorMessage = 
                err.response?.data?.message || // Lỗi tùy chỉnh từ service của bạn
                err.response?.data?.title ||   // Lỗi mặc định của ASP.NET Core (ví dụ: "Bad Request")
                err.response?.data ||          // Nếu lỗi chỉ là một chuỗi
                'Đã có lỗi xảy ra. Vui lòng thử lại.';
            
            // Đảm bảo chỉ set chuỗi, không set object
            setError(typeof errorMessage === 'string' ? errorMessage : 'Lỗi không xác định.');
            
        } finally {
            setIsLoading(false);
        }
    };
    
    // Xử lý popup khi click vào hình thể thửa đất
    const onEachFeature = (feature, layer) => {
        if (feature.properties) {
            const popupContent = `
                <p><strong>Số tờ:</strong> ${feature.properties.soHieuToBanDo}</p>
                <p><strong>Số thửa:</strong> ${feature.properties.soThuTuThua}</p>
                <p><strong>Địa chỉ:</strong> ${feature.properties.diaChi}</p>
            `;
            layer.bindPopup(popupContent);
        }
    };
    
    // Gộp DTO vào đúng định dạng GeoJSON mà component <GeoJSON> cần
    const geoJsonFeature = thuaDatData ? {
        type: "Feature",
        properties: {
            soHieuToBanDo: thuaDatData.soHieuToBanDo,
            soThuTuThua: thuaDatData.soThuTuThua,
            diaChi: thuaDatData.diaChi,
        },
        geometry: {
            type: "Polygon",
            // Truy cập vào đúng đường dẫn để lấy mảng tọa độ
            coordinates: [
                thuaDatData.geometry.coordinates.exterior.positions.map(p => [p.x, p.y])
            ]
        },
    } : null;

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Tra cứu thông tin thửa đất
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Nhập Số tờ bản đồ và Số thứ tự thửa để tìm kiếm và xem vị trí trên bản đồ.
                </Typography>
                <Box component="form" onSubmit={handleSearch} noValidate>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={5}>
                            <TextField fullWidth label="Số thứ tự thửa" value={soThua} onChange={(e) => setSoThua(e.target.value)} required />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <TextField fullWidth label="Số tờ bản đồ" value={soTo} onChange={(e) => setSoTo(e.target.value)} required />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button type="submit" fullWidth variant="contained" size="large" startIcon={<SearchIcon />} disabled={isLoading}>
                                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Tìm'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Paper sx={{ height: '65vh', width: '100%' }}>
                <MapContainer center={defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {geoJsonFeature && (
                        <GeoJSON 
                            key={thuaDatData.soHieuToBanDo + '-' + thuaDatData.soThuTuThua} // key để re-render khi dữ liệu thay đổi
                            data={geoJsonFeature} 
                            onEachFeature={onEachFeature}
                        />
                    )}
                    <ChangeMapView geoJsonData={geoJsonFeature} />
                </MapContainer>
            </Paper>
        </Box>
    );
};

export default TraCuuThuaDatPage;