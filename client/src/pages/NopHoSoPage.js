import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Paper, Typography, Button, CircularProgress, Container } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import các component cho từng bước
import Step1ChonThuTuc from '../components/hoso/Step1_ChonThuTuc';
// (Sau này chúng ta sẽ import thêm các component Step khác ở đây)

const steps = ['Chọn thủ tục', 'Nhập thông tin', 'Đính kèm giấy tờ', 'Xem lại và nộp', 'Hoàn thành'];

const NopHoSoPage = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        maThuTucHanhChinh: '',
        nguoiNopDon: {
            hoTen: '',
            gioiTinh: 1,
            ngaySinh: null,
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

    console.log("NopHoSoPage re-rendered. Current formData:", formData);
    const [soBienNhan, setSoBienNhan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hàm này sẽ nhận dữ liệu từ các bước con và cập nhật vào state formData
    const handleDataChange = (stepData) => {
        console.log("handleDataChange called with:", stepData); // Kiểm tra xem hàm có được gọi không
        setFormData(prevFormData => ({
            ...prevFormData,
            ...stepData
        }));
    };
    
    const handleNext = () => {
        // (Logic này sẽ được hoàn thiện sau)
        if (activeStep === steps.length - 2) {
            console.log("Submitting form:", formData);
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                // Truyền formData và hàm callback onDataChange xuống cho component con
                return <Step1ChonThuTuc formData={formData} onDataChange={handleDataChange} />;
            case 1:
                return <Typography>Nội dung Bước 2: Nhập thông tin</Typography>; // Placeholder
            case 2:
                return <Typography>Nội dung Bước 3: Đính kèm giấy tờ</Typography>; // Placeholder
            case 3:
                return <Typography>Nội dung Bước 4: Xem lại và nộp</Typography>; // Placeholder
            case 4:
                return <Typography>Hoàn thành! Mã hồ sơ của bạn là: {soBienNhan}</Typography>; // Placeholder
            default:
                return <Typography>Bước không xác định</Typography>;
        }
    };

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 3, my: 3, boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)' }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label, index) => {
                        const stepProps = {};
                        const labelProps = {};
                        return (
                            <Step key={label} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>

                <Box minHeight="400px">
                    {getStepContent(activeStep)}
                </Box>
                
                {/* Nút điều hướng */}
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
                            disabled={isSubmitting || (activeStep === 0 && !formData.maThuTucHanhChinh)}
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