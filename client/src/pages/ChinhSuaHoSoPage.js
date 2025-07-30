import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import hoSoService from '../services/hoSoService';
// Tái sử dụng các component form
import Step2_1_ThongTinNguoiNop from '../components/hoso/Step2_1_ThongTinNguoiNop';
import Step2_2_ThongTinThuaDat from '../components/hoso/Step2_2_ThongTinThuaDat';
import Step3_DinhKemGiayTo from '../components/hoso/Step3_DinhKemGiayTo';
import { useAuth } from '../context/AuthContext';

const ChinhSuaHoSoPage = () => {
    const { soBienNhan } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    
    useEffect(() => {
        const fetchHoSoDetails = async () => {
            try {
                // Gọi hàm getHoSoDetails mà không cần cccd.
                // Vì đã đăng nhập, backend sẽ tự xác thực bằng token.
                const response = await hoSoService.getHoSoDetails(soBienNhan); 
                setFormData(response.data);
            } catch (err) {
                setError('Không thể tải thông tin hồ sơ hoặc bạn không có quyền truy cập.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHoSoDetails();
    }, [soBienNhan]);

    const handleDataChange = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');
        try {
            const payload = {
                nguoiNopDon: formData.nguoiNopDon,
                thongTinThuaDat: formData.thongTinThuaDat,
                giayToDinhKem: formData.giayToDinhKem,
            };
            await hoSoService.updateHoSo(soBienNhan, payload);
            setSubmitSuccess('Cập nhật hồ sơ thành công!');
            setTimeout(() => navigate('/ho-so-da-nop'), 2000);
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <Container sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
    if (!formData) return <Container sx={{ py: 4 }}><Alert severity="warning">Không có dữ liệu hồ sơ.</Alert></Container>;
    
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper sx={{ p: 4, boxShadow: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Chỉnh sửa hồ sơ: {soBienNhan}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>Thủ tục: {formData.tenThuTucHanhChinh}</Typography>
                
                <Box sx={{ my: 4 }}><Step2_1_ThongTinNguoiNop formData={formData} onDataChange={handleDataChange} /></Box>
                <Box sx={{ my: 4 }}><Step2_2_ThongTinThuaDat formData={formData} onDataChange={handleDataChange} /></Box>
                <Box sx={{ my: 4 }}><Step3_DinhKemGiayTo formData={formData} onDataChange={handleDataChange} /></Box>
                
                <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                    {submitSuccess && <Alert severity="success" sx={{ mb: 2 }}>{submitSuccess}</Alert>}
                    <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate('/ho-so-da-nop')}>Quay lại</Button>
                    <Button variant="contained" size="large" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Lưu thay đổi'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ChinhSuaHoSoPage;