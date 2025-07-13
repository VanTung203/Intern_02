// src/components/homepage/LookupSection.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from '@mui/material';
import homepageService from '../../services/homepageService'; // Import service

const LookupSection = () => {
    const [receiptNumber, setReceiptNumber] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLookup = async () => {
        if (!receiptNumber.trim()) {
            setError('Vui lòng nhập số biên nhận.');
            setLookupResult(null);
            return;
        }
        setLoading(true);
        setError('');
        setLookupResult(null);
        try {
            const response = await homepageService.lookupHoSo(receiptNumber);
            setLookupResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không tìm thấy hồ sơ hoặc có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Mục tra cứu nhanh thông tin hồ sơ
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                <TextField 
                    variant="outlined"
                    placeholder="Nhập số biên nhận hồ sơ"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLookup()} // Cho phép nhấn Enter để tìm
                    sx={{ width: '50%', mr: 1 }}
                />
                <Button variant="contained" size="large" onClick={handleLookup} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Tìm kiếm'}
                </Button>
            </Box>

            {/* Hiển thị kết quả tìm kiếm */}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {lookupResult && (
                <Alert severity="success" sx={{ mt: 2, textAlign: 'left' }}>
                    <Typography variant="subtitle1"><strong>Kết quả tra cứu:</strong></Typography>
                    <Typography><strong>Số biên nhận:</strong> {lookupResult.soBienNhan}</Typography>
                    <Typography><strong>Ngày nộp:</strong> {new Date(lookupResult.ngayNopHoSo).toLocaleDateString('vi-VN')}</Typography>
                    <Typography><strong>Trạng thái:</strong> {lookupResult.trangThaiHoSo === 1 ? 'Đang thụ lý' : 'Đã trả'}</Typography>
                </Alert>
            )}
        </Paper>
    );
}
export default LookupSection;