import React, { useState, useEffect } from 'react';
import { 
    Box, Paper, Typography, Button, CircularProgress, Container, Alert, Grid, Card, CardContent, CardActions,
    Modal, IconButton, Fade
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

// Giữ nguyên các component con
import Step1ChonThuTuc from '../components/hoso/Step1_ChonThuTuc';
import Step2_NhapThongTin from '../components/hoso/Step2_NhapThongTin';
import Step3_DinhKemGiayTo from '../components/hoso/Step3_DinhKemGiayTo';
import Step5_HoanThanh from '../components/hoso/Step5_HoanThanh';
import hoSoService from '../services/hoSoService';

// --- BẮT ĐẦU PHẦN CODE MỚI ---

// Style cho Modal (hộp thoại chỉnh sửa)
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

// Component thẻ cho từng phần của Dashboard
const SectionCard = ({ title, icon, isCompleted, onEdit, children }) => (
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
            <Box sx={{ pl: '32px' /* Căn lề với icon */, color: 'text.secondary' }}>
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
    // --- State quản lý dữ liệu (giữ nguyên) ---
    const [formData, setFormData] = useState({
        maThuTucHanhChinh: '',
        nguoiNopDon: { hoTen: '', gioiTinh: 1, ngaySinh: '', namSinh: '', soCCCD: '', soDienThoai: '', email: '', diaChi: '' },
        thongTinThuaDat: { soThuTuThua: '', soHieuToBanDo: '', diaChi: '' },
        giayToDinhKem: [],
    });
    const [thuTucList, setThuTucList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submissionResult, setSubmissionResult] = useState(null); // Lưu kết quả sau khi nộp thành công

    // --- State quản lý giao diện Dashboard ---
    const [completedSections, setCompletedSections] = useState({
        thuTuc: false,
        thongTin: false,
        giayTo: false,
    });
    const [editingSection, setEditingSection] = useState(null); // 'thuTuc', 'thongTin', 'giayTo', or null
    const [validationErrors, setValidationErrors] = useState({});

    // Tải danh sách thủ tục (giữ nguyên)
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

    // Hàm cập nhật dữ liệu (giữ nguyên)
    const handleDataChange = (stepData) => {
        setFormData(prev => ({ ...prev, ...stepData }));
        // Khi người dùng sửa, xóa lỗi cũ đi
        if (Object.keys(validationErrors).length > 0) {
            setValidationErrors({});
        }
    };
    
    // --- Logic cho Dashboard ---

    const handleOpenModal = (section) => setEditingSection(section);
    const handleCloseModal = () => {
        setEditingSection(null);
        setValidationErrors({}); // Xóa lỗi khi đóng modal
    };

    // Hàm kiểm tra và lưu từng phần
    const handleSaveSection = (section) => {
        let isValid = true;
        let errors = {};

        // 1. Validation cho từng phần
        if (section === 'thuTuc') {
            if (!formData.maThuTucHanhChinh) {
                errors.maThuTucHanhChinh = "Vui lòng chọn một thủ tục hành chính.";
                isValid = false;
            }
        } else if (section === 'thongTin') {
            const { nguoiNopDon, thongTinThuaDat } = formData;
            if (!nguoiNopDon.hoTen?.trim()) errors.hoTen = "Họ tên là bắt buộc.";
            if (!nguoiNopDon.soCCCD?.trim()) errors.soCCCD = "Số CCCD là bắt buộc.";
            if (!nguoiNopDon.soDienThoai?.trim()) errors.soDienThoai = "Số điện thoại là bắt buộc.";
            if (!thongTinThuaDat.soThuTuThua?.trim()) errors.soThuTuThua = "Số thứ tự thửa là bắt buộc.";
            if (!thongTinThuaDat.soHieuToBanDo?.trim()) errors.soHieuToBanDo = "Số hiệu tờ bản đồ là bắt buộc.";
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

        // 2. Cập nhật state nếu hợp lệ
        if (isValid) {
            setCompletedSections(prev => ({ ...prev, [section]: true }));
            handleCloseModal();
        } else {
            setValidationErrors(errors);
        }
    };

    // Hàm Nộp hồ sơ cuối cùng
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');

        // Payload
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

        try {
            const response = await hoSoService.submitHoSo(payload);
            setSubmissionResult({ soBienNhan: response.data.soBienNhan });
        } catch (error) {
            console.error("Submit error:", error.response?.data || error);
            setSubmitError(error.response?.data?.message || "Nộp hồ sơ thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Nếu đã nộp thành công, hiển thị trang hoàn thành
    if (submissionResult) {
        return <Step5_HoanThanh soBienNhan={submissionResult.soBienNhan} />;
    }

    const selectedThuTuc = thuTucList.find(tt => tt.id === formData.maThuTucHanhChinh);
    const isAllSectionsCompleted = Object.values(completedSections).every(Boolean);

    return (
        <Container maxWidth="lg" sx={{ py: 1 }}>
            <Paper sx={{ p: { xs: 2, md: 4 }, boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)' }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Bảng hồ sơ
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Hoàn thành các mục dưới đây để nộp hồ sơ của bạn.
                </Typography>
                
                <Grid container spacing={3}>
                    {/* Card 1: Chọn thủ tục */}
                    <Grid item xs={12} md={4}>
                        <SectionCard title="1. Thủ tục hành chính" isCompleted={completedSections.thuTuc} onEdit={() => handleOpenModal('thuTuc')}>
                            {completedSections.thuTuc && selectedThuTuc ? (
                                <Typography variant="body2">{selectedThuTuc.ten}</Typography>
                            ) : (
                                <Typography variant="body2">Vui lòng chọn thủ tục bạn muốn thực hiện.</Typography>
                            )}
                        </SectionCard>
                    </Grid>

                    {/* Card 2: Nhập thông tin */}
                    <Grid item xs={12} md={4}>
                        <SectionCard title="2. Thông tin hồ sơ" isCompleted={completedSections.thongTin} onEdit={() => handleOpenModal('thongTin')}>
                            {completedSections.thongTin ? (
                                <>
                                    <Typography variant="body2"><b>Người nộp:</b> {formData.nguoiNopDon.hoTen}</Typography>
                                    <Typography variant="body2"><b>Số CCCD:</b> {formData.nguoiNopDon.soCCCD}</Typography>
                                </>
                            ) : (
                                <Typography variant="body2">Cung cấp thông tin người nộp và thông tin thửa đất.</Typography>
                            )}
                        </SectionCard>
                    </Grid>

                    {/* Card 3: Đính kèm giấy tờ */}
                    <Grid item xs={12} md={4}>
                        <SectionCard title="3. Giấy tờ đính kèm" isCompleted={completedSections.giayTo} onEdit={() => handleOpenModal('giayTo')}>
                            {completedSections.giayTo ? (
                                <Typography variant="body2">Đã đính kèm {formData.giayToDinhKem.length} giấy tờ.</Typography>
                            ) : (
                                <Typography variant="body2">Tải lên các giấy tờ cần thiết cho hồ sơ của bạn.</Typography>
                            )}
                        </SectionCard>
                    </Grid>
                </Grid>

                {/* Nút nộp hồ sơ cuối cùng */}
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

            {/* --- MODALS ĐỂ CHỈNH SỬA --- */}
            {['thuTuc', 'thongTin', 'giayTo'].map(sectionName => (
                <Modal
                    key={sectionName}
                    open={editingSection === sectionName}
                    onClose={handleCloseModal}
                    closeAfterTransition
                >
                    <Fade in={editingSection === sectionName}>
                        <Box sx={modalStyle}>
                            <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', top: 8, right: 8 }}>
                                <CloseIcon />
                            </IconButton>
                            
                            {/* Render component tương ứng */}
                            {sectionName === 'thuTuc' && (
                                <Step1ChonThuTuc formData={formData} onDataChange={handleDataChange} errors={validationErrors} showValidation={Object.keys(validationErrors).length > 0} thuTucList={thuTucList} />
                            )}
                            {sectionName === 'thongTin' && (
                                <Step2_NhapThongTin formData={formData} onDataChange={handleDataChange} errors={validationErrors} showValidation={Object.keys(validationErrors).length > 0} />
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