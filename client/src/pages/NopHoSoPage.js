import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Paper, Typography, Button, CircularProgress, Container, Alert } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Step1ChonThuTuc from '../components/hoso/Step1_ChonThuTuc';
import Step2_NhapThongTin from '../components/hoso/Step2_NhapThongTin';

const steps = ['Chọn thủ tục', 'Nhập thông tin', 'Đính kèm giấy tờ', 'Xem lại và nộp', 'Hoàn thành'];

const NopHoSoPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        maThuTucHanhChinh: '',
        nguoiNopDon: {
            hoTen: '',
            gioiTinh: 1,
            ngaySinh: '',
            namSinh: '',
            soCCCD: '',
            soDienThoai: '',
            email: '',
            diaChi: ''
        },
        thongTinThuaDat: {
            soThuTuThua: '',
            soHieuToBanDo: '',
            diaChi: ''
        },
        giayToDinhKem: [],
    });
    const [soBienNhan, setSoBienNhan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // <<< STATE ĐỂ LƯU LỖI VALIDATION >>>
    const [errors, setErrors] = useState({});
    // <<< STATE ĐỂ BIẾT KHI NÀO CẦN HIỂN THỊ LỖI >>>
    const [showValidation, setShowValidation] = useState(false);

    const handleDataChange = (stepData) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            ...stepData
        }));
        // Khi người dùng thay đổi dữ liệu, ta có thể ẩn thông báo lỗi cũ đi
        if (showValidation) {
            setShowValidation(false);
            setErrors({});
        }
    };

    const validateStep = () => {
        let tempErrors = {};
        let isValid = true;

        if (activeStep === 0) {
            if (!formData.maThuTucHanhChinh) {
                tempErrors.maThuTucHanhChinh = "Vui lòng chọn một thủ tục hành chính.";
                isValid = false;
            }
        } else if (activeStep === 1) {
            const { nguoiNopDon, thongTinThuaDat } = formData;
            if (!nguoiNopDon.hoTen?.trim()) tempErrors.hoTen = "Họ tên là bắt buộc.";
            if (!nguoiNopDon.soCCCD?.trim()) tempErrors.soCCCD = "Số CCCD là bắt buộc.";
            if (!nguoiNopDon.soDienThoai?.trim()) tempErrors.soDienThoai = "Số điện thoại là bắt buộc.";
            if (!thongTinThuaDat.soThuTuThua?.trim()) tempErrors.soThuTuThua = "Số thứ tự thửa là bắt buộc.";
            if (!thongTinThuaDat.soHieuToBanDo?.trim()) tempErrors.soHieuToBanDo = "Số hiệu tờ bản đồ là bắt buộc.";
            
            if (Object.keys(tempErrors).length > 0) isValid = false;
        }
        
        setErrors(tempErrors);
        return isValid;
    };
    
    const handleNext = () => {
        setShowValidation(true); // Bật chế độ hiển thị lỗi
        const isStepValid = validateStep();

        if (isStepValid) {
            setShowValidation(false); // Tắt hiển thị lỗi khi qua bước mới
            setErrors({}); // Xóa lỗi cũ
            if (activeStep === steps.length - 2) {
                console.log("Submitting form:", formData);
            }
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setShowValidation(false); // Không hiển thị lỗi khi quay lại
        setErrors({});
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };
    
    const getStepContent = (step) => {
        switch (step) {
            case 0:
                // Truyền các props cần thiết xuống
                return <Step1ChonThuTuc formData={formData} onDataChange={handleDataChange} errors={errors} showValidation={showValidation} />;
            case 1:
                return <Step2_NhapThongTin formData={formData} onDataChange={handleDataChange} errors={errors} showValidation={showValidation} />;
            case 2:
                return <Typography>Nội dung Bước 3: Đính kèm giấy tờ</Typography>; 
            case 3:
                return <Typography>Nội dung Bước 4: Xem lại và nộp</Typography>; 
            case 4:
                return <Typography>Hoàn thành! Mã hồ sơ của bạn là: {soBienNhan}</Typography>;
            default:
                return <Typography>Bước không xác định</Typography>;
        }
    };

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 3, my: 3, boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)' }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box minHeight="400px">
                    {getStepContent(activeStep)}
                </Box>
                
                {activeStep < steps.length - 1 && (
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button
                            variant="outlined"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            startIcon={<ArrowBackIcon />}
                            sx={{ color: 'text.secondary', borderColor: 'text.secondary' }}
                        >
                            Quay lại
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            endIcon={isSubmitting ? null : <ArrowForwardIcon />}
                            disabled={isSubmitting} // Chỉ disable khi đang submit
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (activeStep === steps.length - 2 ? 'Nộp hồ sơ' : 'Tiếp tục')}
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default NopHoSoPage;