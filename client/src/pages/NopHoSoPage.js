import React, { useState, useEffect } from 'react';
import { 
    Box, Paper, Typography, Button, CircularProgress, Container, Alert, Grid, Card, CardContent, CardActions,
    Modal, IconButton, Fade
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

// --- THAY ĐỔI IMPORT THEO YÊU CẦU MỚI ---
import Step1ChonThuTuc from '../components/hoso/Step1_ChonThuTuc';
import Step2_1_ThongTinNguoiNop from '../components/hoso/Step2_1_ThongTinNguoiNop'; // <<< TÊN FILE MỚI
import Step2_2_ThongTinThuaDat from '../components/hoso/Step2_2_ThongTinThuaDat'; // <<< TÊN FILE MỚI
import Step3_DinhKemGiayTo from '../components/hoso/Step3_DinhKemGiayTo'; // <<< GIỮ NGUYÊN TÊN FILE
import Step5_HoanThanh from '../components/hoso/Step5_HoanThanh';
import hoSoService from '../services/hoSoService';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '1000px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '90vh',
    overflowY: 'auto'
};

const SectionCard = ({ title, isCompleted, onEdit, children }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} variant="outlined">
        <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {isCompleted ? 
                    <CheckCircleIcon color="success" sx={{ mr: 1.5 }} /> :
                    <EditIcon color="disabled" sx={{ mr: 1.5 }} />
                }
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ pl: '32px', color: 'text.secondary' }}>
                {children}
            </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button size="small" variant="text" onClick={onEdit} startIcon={<EditIcon />}>
                {isCompleted ? 'Chỉnh sửa' : 'Bắt đầu'}
            </Button>
        </CardActions>
    </Card>
);

const NopHoSoPage = () => {
    const [formData, setFormData] = useState({
        maThuTucHanhChinh: '',
        nguoiNopDon: { hoTen: '', gioiTinh: 1, ngaySinh: '', namSinh: '', soCCCD: '', soDienThoai: '', email: '', diaChi: '' },
        thongTinThuaDat: { soThuTuThua: '', soHieuToBanDo: '', diaChi: '' },
        giayToDinhKem: [],
    });
    const [thuTucList, setThuTucList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submissionResult, setSubmissionResult] = useState(null);

    // --- THAY ĐỔI STATE: 4 MỤC ---
    const [completedSections, setCompletedSections] = useState({
        thuTuc: false,
        nguoiNop: false,
        thuaDat: false,
        giayTo: false,
    });
    const [editingSection, setEditingSection] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

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
        setFormData(prev => ({ ...prev, ...stepData }));
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors({});
        }
    };
    
    const handleOpenModal = (section) => setEditingSection(section);
    const handleCloseModal = () => {
        setEditingSection(null);
        setValidationErrors({});
    };

    // --- THAY ĐỔI VALIDATION: TÁCH LOGIC ---
    const handleSaveSection = (section) => {
        let isValid = true;
        let errors = {};

        if (section === 'thuTuc') {
            if (!formData.maThuTucHanhChinh) {
                errors.maThuTucHanhChinh = "Vui lòng chọn một thủ tục hành chính.";
                isValid = false;
            }
        } else if (section === 'nguoiNop') {
            const { nguoiNopDon } = formData;
            // Kiểm tra các trường bắt buộc
            if (!nguoiNopDon.hoTen?.trim()) errors.hoTen = "Họ tên là bắt buộc.";
            if (!nguoiNopDon.soCCCD?.trim()) errors.soCCCD = "Số CCCD là bắt buộc.";
            if (!nguoiNopDon.soDienThoai?.trim()) errors.soDienThoai = "Số điện thoại là bắt buộc.";

            // Kiểm tra định dạng chi tiết
            if (nguoiNopDon.soCCCD?.trim() && nguoiNopDon.soCCCD.length !== 12) {
                errors.soCCCD = "Số CCCD phải có đúng 12 ký tự.";
            }
            if (nguoiNopDon.soDienThoai?.trim() && !/^0[0-9]{9,10}$/.test(nguoiNopDon.soDienThoai)) {
                errors.soDienThoai = "Số điện thoại phải bắt đầu bằng 0 và có 10-11 chữ số.";
            }
            if (nguoiNopDon.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nguoiNopDon.email)) {
                errors.email = "Định dạng email không hợp lệ.";
            }

            if (Object.keys(errors).length > 0) isValid = false;
        } else if (section === 'thuaDat') {
            const { thongTinThuaDat } = formData;
            if (!thongTinThuaDat.soThuTuThua?.trim()) errors.soThuTuThua = "Số thứ tự thửa là bắt buộc.";
            if (!thongTinThuaDat.soHieuToBanDo?.trim()) errors.soHieuToBanDo = "Số hiệu tờ bản đồ là bắt buộc.";

            // Kiểm tra định dạng số
            if (thongTinThuaDat.soThuTuThua?.trim() && !/^[0-9]+$/.test(thongTinThuaDat.soThuTuThua)) {
                errors.soThuTuThua = "Số thứ tự thửa chỉ được chứa ký tự số.";
            }
             if (thongTinThuaDat.soHieuToBanDo?.trim() && !/^[0-9]+$/.test(thongTinThuaDat.soHieuToBanDo)) {
                errors.soHieuToBanDo = "Số hiệu tờ bản đồ chỉ được chứa ký tự số.";
            }

            if (Object.keys(errors).length > 0) isValid = false;
        } else if (section === 'giayTo') {
            if (formData.giayToDinhKem.length === 0) {
                errors.giayTo = "Vui lòng thêm ít nhất một giấy tờ đính kèm.";
                isValid = false;
            } else if (!formData.giayToDinhKem.every(gt => gt.tenLoaiGiayTo.trim() && gt.duongDanTapTin)) {
                errors.giayTo = "Vui lòng nhập tên và tải lên đầy đủ tập tin cho tất cả các giấy tờ.";
                isValid = false;
            }
        }

        if (isValid) {
            setCompletedSections(prev => ({ ...prev, [section]: true }));
            handleCloseModal();
        } else {
            setValidationErrors(errors);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        const payload = {
            maThuTucHanhChinh: formData.maThuTucHanhChinh,
            nguoiNopDon: {
                hoTen: formData.nguoiNopDon.hoTen,
                gioiTinh: parseInt(formData.nguoiNopDon.gioiTinh, 10),
                ngaySinh: formData.nguoiNopDon.ngaySinh || null,
                namSinh: formData.nguoiNopDon.namSinh ? parseInt(formData.nguoiNopDon.namSinh, 10) : null,
                soCCCD: formData.nguoiNopDon.soCCCD,
                soDienThoai: formData.nguoiNopDon.soDienThoai,
                diaChi: formData.nguoiNopDon.diaChi || null,
                email: formData.nguoiNopDon.email || null, 
            },
            thongTinThuaDat: {
                soThuTuThua: formData.thongTinThuaDat.soThuTuThua,
                soHieuToBanDo: formData.thongTinThuaDat.soHieuToBanDo,
                diaChi: formData.thongTinThuaDat.diaChi || null,
            },
            giayToDinhKem: formData.giayToDinhKem.map(gt => ({
                tenLoaiGiayTo: gt.tenLoaiGiayTo,
                duongDanTapTin: gt.duongDanTapTin
            })),
        };

        try {
            const response = await hoSoService.submitHoSo(payload);
            setSubmissionResult({ soBienNhan: response.data.soBienNhan });
        } catch (error) {
            console.error("Submit error:", error.response?.data || error);
            // Xử lý lỗi validation từ backend (dự phòng) hoặc các lỗi server khác
            const backendErrors = error.response?.data?.errors;
            if (error.response?.status === 400 && backendErrors) {
                 setSubmitError("Nộp hồ sơ thất bại. Vui lòng kiểm tra lại các thông tin đã cung cấp.");
            } else {
                 setSubmitError(error.response?.data?.message || "Nộp hồ sơ thất bại. Vui lòng thử lại.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submissionResult) {
        return <Step5_HoanThanh soBienNhan={submissionResult.soBienNhan} />;
    }

    const selectedThuTuc = thuTucList.find(tt => tt.id === formData.maThuTucHanhChinh);
    const isAllSectionsCompleted = Object.values(completedSections).every(Boolean);

    return (
        <Container maxWidth="lg" sx={{ py: 1 }}>
            <Paper sx={{ p: { xs: 2, md: 4 }, boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Bảng điều khiển Hồ sơ
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Hoàn thành các mục dưới đây để nộp hồ sơ của bạn.
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={3}>
                        <SectionCard title="1. Thủ tục hành chính" isCompleted={completedSections.thuTuc} onEdit={() => handleOpenModal('thuTuc')}>
                            {completedSections.thuTuc && selectedThuTuc ? (
                                <Typography variant="body2">{selectedThuTuc.ten}</Typography>
                            ) : (
                                <Typography variant="body2">Chọn thủ tục bạn muốn thực hiện.</Typography>
                            )}
                        </SectionCard>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <SectionCard title="2. Thông tin người nộp" isCompleted={completedSections.nguoiNop} onEdit={() => handleOpenModal('nguoiNop')}>
                            {completedSections.nguoiNop ? (
                                <Typography variant="body2"><b>Người nộp:</b> {formData.nguoiNopDon.hoTen}</Typography>
                            ) : (
                                <Typography variant="body2">Cung cấp thông tin cá nhân của người nộp đơn.</Typography>
                            )}
                        </SectionCard>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <SectionCard title="3. Thông tin thửa đất" isCompleted={completedSections.thuaDat} onEdit={() => handleOpenModal('thuaDat')}>
                            {completedSections.thuaDat ? (
                                 <Typography variant="body2"><b>Số thửa:</b> {formData.thongTinThuaDat.soThuTuThua}, <b>Tờ BĐ:</b> {formData.thongTinThuaDat.soHieuToBanDo}</Typography>
                            ) : (
                                <Typography variant="body2">Cung cấp thông tin về thửa đất liên quan.</Typography>
                            )}
                        </SectionCard>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <SectionCard title="4. Giấy tờ đính kèm" isCompleted={completedSections.giayTo} onEdit={() => handleOpenModal('giayTo')}>
                            {completedSections.giayTo ? (
                                <Typography variant="body2">Đã đính kèm {formData.giayToDinhKem.length} giấy tờ.</Typography>
                            ) : (
                                <Typography variant="body2">Tải lên các giấy tờ cần thiết cho hồ sơ.</Typography>
                            )}
                        </SectionCard>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={!isAllSectionsCompleted || isSubmitting}
                        sx={{ minWidth: 200 }}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Nộp hồ sơ'}
                    </Button>
                    {!isAllSectionsCompleted && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                            Vui lòng hoàn thành tất cả các mục để nộp hồ sơ.
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* --- THAY ĐỔI LOGIC RENDER MODAL THEO TÊN COMPONENT MỚI --- */}
            {['thuTuc', 'nguoiNop', 'thuaDat', 'giayTo'].map(sectionName => (
                <Modal key={sectionName} open={editingSection === sectionName} onClose={handleCloseModal} closeAfterTransition>
                    <Fade in={editingSection === sectionName}>
                        <Box sx={modalStyle}>
                            <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
                                <CloseIcon />
                            </IconButton>
                            
                            {sectionName === 'thuTuc' && (
                                <Step1ChonThuTuc formData={formData} onDataChange={handleDataChange} errors={validationErrors} showValidation={Object.keys(validationErrors).length > 0} thuTucList={thuTucList} />
                            )}
                            {sectionName === 'nguoiNop' && (
                                <Step2_1_ThongTinNguoiNop formData={formData} onDataChange={handleDataChange} errors={validationErrors} showValidation={Object.keys(validationErrors).length > 0} />
                            )}
                             {sectionName === 'thuaDat' && (
                                <Step2_2_ThongTinThuaDat formData={formData} onDataChange={handleDataChange} errors={validationErrors} showValidation={Object.keys(validationErrors).length > 0} />
                            )}
                            {sectionName === 'giayTo' && (
                                <Step3_DinhKemGiayTo formData={formData} onDataChange={handleDataChange} errors={validationErrors} showValidation={Object.keys(validationErrors).length > 0} />
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Button variant="outlined" onClick={handleCloseModal} sx={{ mr: 2 }}>
                                    Hủy bỏ
                                </Button>
                                <Button variant="contained" onClick={() => handleSaveSection(sectionName)}>
                                    Lưu & Hoàn thành mục này
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
                </Modal>
            ))}
        </Container>
    );
};

export default NopHoSoPage;