import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, RadioGroup, FormControlLabel, Radio, CircularProgress, Alert } from '@mui/material';
import hoSoService from '../../services/hoSoService';
import LocationSelector from './LocationSelector';

const Step1ChonThuTuc = ({ formData, onDataChange }) => {
    const [thuTucList, setThuTucList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchThuTuc = async () => {
            try {
                const response = await hoSoService.getThuTucHanhChinh();
                // Thêm bước kiểm tra để đảm bảo dữ liệu hợp lệ
                if (Array.isArray(response.data)) {
                    setThuTucList(response.data);
                } else {
                    setError('Dữ liệu thủ tục trả về không hợp lệ.');
                }
            } catch (err) {
                setError('Không thể tải danh sách thủ tục hành chính.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchThuTuc();
    }, []);

    const handleLocationSelected = (locationData) => {
        console.log("Location selected:", locationData);
    }

    const filteredThuTuc = thuTucList.filter(tt => 
        // Thêm kiểm tra tt và tt.ten tồn tại trước khi gọi toLowerCase
        tt && tt.ten && tt.ten.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectThuTuc = (event) => {
        onDataChange({ maThuTucHanhChinh: event.target.value });
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>1. Chọn thủ tục</Typography>
            
            {/* <<< TÍCH HỢP LOCATIONSELECTOR VÀO ĐÂY >>> */}
            <LocationSelector onLocationChange={handleLocationSelected} />
            
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                Lọc thủ tục theo khu vực (sẽ được phát triển).
            </Typography>

            <Box sx={{ border: '1px solid', borderColor: 'divider', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>THỦ TỤC HÀNH CHÍNH</Typography>
                <TextField 
                    fullWidth
                    variant="standard"
                    placeholder="Tìm thủ tục hành chính..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ my: 2 }}
                />
                <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <RadioGroup
                        value={formData.maThuTucHanhChinh}
                        onChange={handleSelectThuTuc}
                    >
                        {filteredThuTuc.map(tt => (
                            // Đảm bảo tt.id và tt.ten không phải là null/undefined
                            tt && tt.id && (
                                <FormControlLabel 
                                    key={tt.id} 
                                    value={tt.id} 
                                    control={<Radio />} 
                                    label={tt.ten} 
                                />
                            )
                        ))}
                    </RadioGroup>
                </Box>
            </Box>
        </Box>
    );
};

export default Step1ChonThuTuc;