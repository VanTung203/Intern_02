import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import hoSoService from '../../services/hoSoService';
import ReCAPTCHA from "react-google-recaptcha";

// <<< THÊM CSS ĐỂ ĐIỀU KHIỂN LOGO >>>
const recaptchaBadgeStyle = {
    visibility: 'hidden', // Mặc định ẩn logo
};

const LookupSection = () => {
    const [receiptNumber, setReceiptNumber] = useState('');
    const [lookupResult, setLookupResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const recaptchaRef = useRef(null);

    // Dùng ref để theo dõi trạng thái loading mà không gây re-render
    const isLoadingRef = useRef(false);

    // Dùng ref để lưu trữ ID của timeout
    const timeoutIdRef = useRef(null);

    // Giữ cho ref luôn đồng bộ với state
    isLoadingRef.current = loading;

    const handleLookupClick = () => {
        if (loading) return;
        setError('');
        setLookupResult(null);

        if (!receiptNumber.trim()) {
            setError('Vui lòng nhập số biên nhận.');
            return;
        }
        
        setLoading(true);
        
        if (recaptchaRef.current) {
            // Hiển thị logo ngay trước khi execute
            const badge = document.querySelector('.grecaptcha-badge');
            if (badge) badge.style.visibility = 'visible';

            // LOGIC TIMEOUT
            // Đặt một "đồng hồ hẹn giờ". Nếu sau 100 giây mà chưa có kết quả,
            // nó sẽ tự động hủy và báo lỗi hết hạn.
            timeoutIdRef.current = setTimeout(() => {
                if (isLoadingRef.current) { // Chỉ hủy nếu vẫn đang loading
                    setError('Xác thực CAPTCHA hết hạn. Vui lòng thử lại.');
                    setLoading(false);
                    const badge = document.querySelector('.grecaptcha-badge');
                    if (badge) badge.style.visibility = 'hidden';
                    // Đóng cửa sổ giải test
                    recaptchaRef.current.reset(); 
                }
            }, 100000); // 100 giây, hơi ít hơn 2 phút cho an toàn
            
            recaptchaRef.current.reset();
            recaptchaRef.current.execute();
        }
    };
    
    const onRecaptchaChange = async (recaptchaToken) => {
        // Hủy bỏ đồng hồ hẹn giờ ngay khi có token
        clearTimeout(timeoutIdRef.current); 
        
        // Ẩn logo ngay sau khi có token
        const badge = document.querySelector('.grecaptcha-badge');
        if (badge) badge.style.visibility = 'hidden';

        // Bỏ qua các lần gọi "timeout" tự động của reCAPTCHA nếu không phải đang loading
        if (!isLoadingRef.current) {
            return; 
        }

        if (!recaptchaToken) {
            setError('Xác thực CAPTCHA hết hạn. Vui lòng thử lại.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                receiptNumber: receiptNumber,
                recaptchaToken: recaptchaToken,
            };
            const response = await hoSoService.lookupHoSo(payload);
            setLookupResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không tìm thấy hồ sơ hoặc có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };
    
    // Sử dụng useEffect để ẩn logo khi component bị unmount, đồng thời dọn dẹp timeout khi component bị unmount
    useEffect(() => {
        return () => {
            clearTimeout(timeoutIdRef.current);
            const badge = document.querySelector('.grecaptcha-badge');
            if (badge) badge.style.visibility = 'hidden';
        };
    }, []);


    return (
        <Paper elevation={2} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
            {/* Component ReCAPTCHA được render cố định, nhưng logo của nó sẽ được kiểm soát bởi CSS */}
            <ReCAPTCHA
                ref={recaptchaRef}
                size="invisible"
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={onRecaptchaChange}
                onErrored={() => {
                    setError("Lỗi kết nối tới reCAPTCHA. Vui lòng thử lại.");
                    setLoading(false);
                    const badge = document.querySelector('.grecaptcha-badge');
                    if (badge) badge.style.visibility = 'hidden'; // Ẩn logo khi có lỗi
                }}
                badge="bottomright" // Chỉ định vị trí badge
                style={recaptchaBadgeStyle} // Áp dụng style mặc định
            />

            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Tra cứu nhanh thông tin hồ sơ
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                <TextField 
                    variant="outlined"
                    placeholder="Nhập số biên nhận hồ sơ"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !loading && handleLookupClick()}
                    sx={{ width: '60%', mr: 1 }}
                />
                <Button 
                    variant="contained" 
                    size="large" 
                    onClick={handleLookupClick}
                    disabled={loading} 
                    startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
                    sx={{ backgroundColor: 'grey.800', '&:hover': { backgroundColor: 'grey.900' } }}
                >
                    {loading ? 'Đang tra cứu...' : 'Tìm kiếm'}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {lookupResult && (
                <Alert severity="success" sx={{ mt: 2, textAlign: 'left' }}>
                    <Typography variant="subtitle1"><strong>Kết quả tra cứu:</strong></Typography>
                    <Typography><strong>Số biên nhận:</strong> {lookupResult.soBienNhan}</Typography>
                    <Typography><strong>Ngày nộp:</strong> {new Date(lookupResult.ngayNopHoSo).toLocaleDateString('vi-VN')}</Typography>
                    <Typography><strong>Trạng thái:</strong> {lookupResult.tenTrangThaiHoSo}</Typography>
                </Alert>
            )}
        </Paper>
    );
}
export default LookupSection;