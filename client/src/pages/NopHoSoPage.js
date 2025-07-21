import React, { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Paper, Typography, Button, CircularProgress, Container, Alert } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Step1ChonThuTuc from '../components/hoso/Step1_ChonThuTuc';
import Step2_NhapThongTin from '../components/hoso/Step2_NhapThongTin';
import Step3_DinhKemGiayTo from '../components/hoso/Step3_DinhKemGiayTo';
import Step4_XemLaiVaNop from '../components/hoso/Step4_XemLaiVaNop'; // <<< IMPORT MỚI
import Step5_HoanThanh from '../components/hoso/Step5_HoanThanh';   // <<< IMPORT MỚI
import hoSoService from '../services/hoSoService';

const steps = ['Chọn thủ tục', 'Nhập thông tin', 'Đính kèm giấy tờ', 'Kiểm tra hồ sơ', 'Hoàn thành'];

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

    // <<< THÊM CÁC STATE NÀY VÀO >>>
    const [thuTucList, setThuTucList] = useState([]);
    const [submitError, setSubmitError] = useState('');

    // <<< THÊM useEffect ĐỂ TẢI DANH SÁCH THỦ TỤC >>>
    useEffect(() => {
        const fetchThuTuc = async () => {
            try {
                const response = await hoSoService.getThuTucHanhChinh();
                if (Array.isArray(response.data)) {
                    setThuTucList(response.data);
                }
            } catch (err) {
                console.error("Không thể tải danh sách thủ tục:", err);
            }
        };
        fetchThuTuc();
    }, []);

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
        } 
        else if (activeStep === 1) {
            const { nguoiNopDon, thongTinThuaDat } = formData;
            if (!nguoiNopDon.hoTen?.trim()) tempErrors.hoTen = "Họ tên là bắt buộc.";
            if (!nguoiNopDon.soCCCD?.trim()) tempErrors.soCCCD = "Số CCCD là bắt buộc.";
            if (!nguoiNopDon.soDienThoai?.trim()) tempErrors.soDienThoai = "Số điện thoại là bắt buộc.";
            if (!thongTinThuaDat.soThuTuThua?.trim()) tempErrors.soThuTuThua = "Số thứ tự thửa là bắt buộc.";
            if (!thongTinThuaDat.soHieuToBanDo?.trim()) tempErrors.soHieuToBanDo = "Số hiệu tờ bản đồ là bắt buộc.";
            
            if (Object.keys(tempErrors).length > 0) isValid = false;
        }
        // Validation cho BƯỚC 3: Đính kèm giấy tờ
        else if (activeStep === 2) {
            // Yêu cầu phải có ít nhất 1 giấy tờ
            if (formData.giayToDinhKem.length === 0) {
                tempErrors.giayTo = "Vui lòng thêm ít nhất một giấy tờ đính kèm.";
                isValid = false;
            } else {
                // Kiểm tra xem tất cả các dòng đã thêm có hợp lệ không
                const isAllRowsValid = formData.giayToDinhKem.every(gt => 
                    gt.tenLoaiGiayTo.trim() !== '' && gt.duongDanTapTin !== ''
                );
                if (!isAllRowsValid) {
                    tempErrors.giayTo = "Vui lòng nhập tên và tải lên đầy đủ tập tin cho tất cả các giấy tờ.";
                    isValid = false;
                }
            }
        }
 
        setErrors(tempErrors);
        return isValid;
    };
    
    const handleNext = async () => {
        const isCurrentStepValid = validateStep();
        setShowValidation(true); 

        if (isCurrentStepValid) {
            // setShowValidation(false);
            // setErrors({});
            
            // Xử lý submit ở bước "Kiểm tra hồ sơ" (index 3)
            if (activeStep === steps.length - 2) { 
                setIsSubmitting(true);
                setSubmitError('');
                
                const payload = {
                    maThuTucHanhChinh: formData.maThuTucHanhChinh,
                    // Object NguoiNopDon lồng nhau
                    nguoiNopDon: {
                        hoTen: formData.nguoiNopDon.hoTen,
                        gioiTinh: parseInt(formData.nguoiNopDon.gioiTinh, 10),
                        ngaySinh: formData.nguoiNopDon.ngaySinh || null,
                        namSinh: formData.nguoiNopDon.namSinh ? parseInt(formData.nguoiNopDon.namSinh, 10) : null,
                        soCCCD: formData.nguoiNopDon.soCCCD,
                        diaChi: formData.nguoiNopDon.diaChi,
                        soDienThoai: formData.nguoiNopDon.soDienThoai,
                        email: formData.nguoiNopDon.email,
                    },
                    // Object ThongTinThuaDat lồng nhau
                    thongTinThuaDat: {
                        soThuTuThua: formData.thongTinThuaDat.soThuTuThua,
                        soHieuToBanDo: formData.thongTinThuaDat.soHieuToBanDo,
                        diaChi: formData.thongTinThuaDat.diaChi,
                    },
                    giayToDinhKem: formData.giayToDinhKem.map(gt => ({
                        tenLoaiGiayTo: gt.tenLoaiGiayTo,
                        duongDanTapTin: gt.duongDanTapTin
                    })),
                };

                console.log("Submitting NESTED payload:", JSON.stringify(payload, null, 2));

                try {
                    const response = await hoSoService.submitHoSo(payload);
                    setSoBienNhan(response.data.soBienNhan);
                    setActiveStep((prev) => prev + 1);
                } catch (error) {
                    console.error("Submit error:", error.response?.data || error);
                    setSubmitError(error.response?.data?.message || "Nộp hồ sơ thất bại. Vui lòng thử lại.");
                } finally {
                    setIsSubmitting(false);
                }
            } else {
                setActiveStep((prev) => prev + 1);
            }
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
                // Thêm prop thuTucList
                return <Step1ChonThuTuc formData={formData} onDataChange={handleDataChange} errors={errors} showValidation={showValidation} thuTucList={thuTucList} />;
            case 1:
                return <Step2_NhapThongTin formData={formData} onDataChange={handleDataChange} errors={errors} showValidation={showValidation} />;
            case 2:
                return <Step3_DinhKemGiayTo formData={formData} onDataChange={handleDataChange} errors={errors} showValidation={showValidation} />;
            case 3:
                // Thêm Step4
                return <Step4_XemLaiVaNop formData={formData} thuTucList={thuTucList} />; 
            case 4:
                // Thêm Step5
                return <Step5_HoanThanh soBienNhan={soBienNhan} />;
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
                    {/* Thêm hiển thị lỗi submit */}
                    {submitError && activeStep === 3 && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
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