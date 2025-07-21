import React from 'react';
import {
    Box, Grid, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MapIcon from '@mui/icons-material/Map';
import GavelIcon from '@mui/icons-material/Gavel';
import AttachFileIcon from '@mui/icons-material/AttachFile';

// Component con để hiển thị một cặp Label-Value
const InfoRow = ({ label, value, isMissing = false }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, py: 0.5 }}>
        <Typography variant="body2" color="text.secondary">{label}:</Typography>
        <Typography 
            variant="body2" 
            sx={{ 
                fontWeight: 500, 
                textAlign: 'right', 
                color: isMissing ? 'error.main' : 'text.primary' 
            }}
        >
            {value || '(Chưa có thông tin)'}
        </Typography>
    </Box>
);

const Step4_XemLaiVaNop = ({ formData, thuTucList }) => {
    const { nguoiNopDon, thongTinThuaDat, giayToDinhKem, maThuTucHanhChinh } = formData;

    // Tìm tên thủ tục từ mã
    const selectedThuTuc = thuTucList.find(tt => tt.id === maThuTucHanhChinh);

    return (
        <Box>
            <Typography variant="h6" gutterBottom>4. Kiểm tra và xác nhận thông tin hồ sơ</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Vui lòng kiểm tra kỹ các thông tin dưới đây. Nhấn "Nộp hồ sơ" để hoàn tất.
            </Typography>

            <Grid container spacing={3}>
                {/* === CỘT BÊN TRÁI === */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2.5, height: '100%' }} variant="outlined">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} /> THÔNG TIN NGƯỜI NỘP
                        </Typography>
                        <InfoRow label="Họ tên" value={nguoiNopDon.hoTen} isMissing={!nguoiNopDon.hoTen} />
                        <InfoRow label="Giới tính" value={nguoiNopDon.gioiTinh === 1 ? 'Nam' : 'Nữ'} />
                        <InfoRow label="Ngày sinh" value={nguoiNopDon.ngaySinh ? new Date(nguoiNopDon.ngaySinh).toLocaleDateString('vi-VN') : ''} />
                        <InfoRow label="Năm sinh" value={nguoiNopDon.namSinh} />
                        <InfoRow label="Số CCCD" value={nguoiNopDon.soCCCD} isMissing={!nguoiNopDon.soCCCD} />
                        <InfoRow label="Số điện thoại" value={nguoiNopDon.soDienThoai} isMissing={!nguoiNopDon.soDienThoai} />
                        <InfoRow label="Email" value={nguoiNopDon.email} />
                        <InfoRow label="Địa chỉ" value={nguoiNopDon.diaChi} />
                    </Paper>
                </Grid>

                {/* === CỘT BÊN PHẢI === */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2.5, mb: 3 }} variant="outlined">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                            <GavelIcon sx={{ mr: 1, color: 'primary.main' }} /> THỦ TỤC HÀNH CHÍNH
                        </Typography>
                        <Typography variant="body2" color={!selectedThuTuc ? 'error.main' : 'text.primary'}>{selectedThuTuc?.ten || 'Chưa chọn thủ tục'}</Typography>
                    </Paper>
                    
                    <Paper sx={{ p: 2.5 }} variant="outlined">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                            <AttachFileIcon sx={{ mr: 1, color: 'primary.main' }} /> GIẤY TỜ ĐÍNH KÈM
                        </Typography>
                        <List dense sx={{ p: 0 }}>
                            {giayToDinhKem.length > 0 ? giayToDinhKem.map((file, index) => (
                                <ListItem key={index} sx={{ px: 0 }}>
                                    <ListItemIcon sx={{minWidth: 32}}><AttachFileIcon fontSize="small" color="primary"/></ListItemIcon>
                                    <ListItemText primary={file.tenLoaiGiayTo} secondary={file.fileName} />
                                </ListItem>
                            )) : (
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemText primary="Không có giấy tờ nào được đính kèm." />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>

                 {/* --- Thông tin thửa đất (có thể đặt ở cột trái hoặc dưới cùng) --- */}
                 <Grid item xs={12}>
                    <Paper sx={{ p: 2.5 }} variant="outlined">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                            <MapIcon sx={{ mr: 1, color: 'primary.main' }} /> THÔNG TIN THỬA ĐẤT
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><InfoRow label="Số thứ tự thửa" value={thongTinThuaDat.soThuTuThua} isMissing={!thongTinThuaDat.soThuTuThua} /></Grid>
                            <Grid item xs={6}><InfoRow label="Số hiệu tờ bản đồ" value={thongTinThuaDat.soHieuToBanDo} isMissing={!thongTinThuaDat.soHieuToBanDo} /></Grid>
                            <Grid item xs={12}><InfoRow label="Địa chỉ" value={thongTinThuaDat.diaChi} /></Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Step4_XemLaiVaNop;