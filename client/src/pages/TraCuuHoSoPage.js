// File: client/src/pages/TraCuuHoSoPage.js
// Mục đích: Chứa form cho người dùng nhập thông tin tra cứu và hiển thị kết quả.

import React, { useState } from 'react';
import { 
    Container, Paper, Typography, TextField, Button, Box, CircularProgress, Alert, Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import hoSoService from '../services/hoSoService';
import HoSoDetailsDisplay from '../components/hoso/HoSoDetailsDisplay';

const TraCuuHoSoPage = () => {
    const [receiptNumber, setReceiptNumber] = useState('');
    const [cccd, setCccd] = useState('');
    const [hoSoData, setHoSoData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!receiptNumber || !cccd) {
            setError('Vui lòng nhập đầy đủ Số biên nhận và Số CCCD.');
            return;
        }

        setIsLoading(true);
        setError('');
        setHoSoData(null);

        try {
            const response = await hoSoService.getHoSoDetails(receiptNumber, cccd);
            setHoSoData(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 1 }}>
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Tra cứu thông tin hồ sơ
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Nhập Số biên nhận và Số CCCD để xem chi tiết và tiến độ xử lý hồ sơ của bạn.
                </Typography>

                <Box component="form" onSubmit={handleSearch} noValidate>
                    <Grid container spacing={2}> 
                        <Grid item xs={12} sm={5}>
                            <TextField
                                fullWidth
                                // Loại bỏ thuộc tính margin="normal" vì spacing của Grid đã xử lý khoảng cách
                                label="Số biên nhận"
                                value={receiptNumber}
                                onChange={(e) => setReceiptNumber(e.target.value)}
                                required
                                error={!!error && !receiptNumber}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <TextField
                                fullWidth
                                // Loại bỏ thuộc tính margin="normal"
                                label="Số CCCD"
                                value={cccd}
                                onChange={(e) => setCccd(e.target.value)}
                                required
                                error={!!error && !cccd}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}> {/* Thêm một Grid item mới cho nút */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={<SearchIcon />}
                                disabled={isLoading}
                                sx={{ backgroundColor: 'grey.800', '&:hover': { backgroundColor: 'grey.900' } }}
                            >
                                {isLoading ? <CircularProgress size={16} color="inherit" /> : 'Tra cứu'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Vùng hiển thị kết quả hoặc lỗi */}
            <Box sx={{ mt: 2 }}>
                {error && <Alert severity="error">{error}</Alert>}
                {hoSoData && <HoSoDetailsDisplay data={hoSoData} />}
            </Box>
        </Container>
    );
};

export default TraCuuHoSoPage;