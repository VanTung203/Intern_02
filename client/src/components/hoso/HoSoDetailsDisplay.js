// File: client/src/components/hoso/HoSoDetailsDisplay.js
// Mục đích: Hiển thị chi tiết thông tin hồ sơ sau khi tra cứu thành công.

import React from 'react';
import {
    Box, Grid, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MapIcon from '@mui/icons-material/Map';
import GavelIcon from '@mui/icons-material/Gavel';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ArticleIcon from '@mui/icons-material/Article';

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

// Component chính để hiển thị
const HoSoDetailsDisplay = ({ data }) => {
    if (!data) return null;

    const { 
      soBienNhan, 
      ngayNopHoSo, 
      tenTrangThaiHoSo,
      lyDoTuChoi,
      tenThuTucHanhChinh,
      nguoiNopDon, 
      thongTinThuaDat, 
      giayToDinhKem 
    } = data;
    
    const getStatusColor = (status) => {
        if (status?.includes('Đã trả')) return 'success';
        if (status?.includes('từ chối') || status?.includes('Yêu cầu')) return 'error';
        return 'info';
    };

    return (
        <Paper sx={{ p: 3, mt: 4, border: '1px solid', borderColor: 'divider' }} variant="outlined">
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Kết quả tra cứu hồ sơ
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
                {/* --- Thông tin chung của hồ sơ --- */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2.5 }} variant="outlined" >
                         <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                            <ArticleIcon sx={{ mr: 1, color: 'primary.main' }} /> THÔNG TIN HỒ SƠ
                        </Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}><InfoRow label="Số biên nhận" value={soBienNhan} /></Grid>
                            <Grid item xs={12} sm={6}><InfoRow label="Ngày nộp" value={new Date(ngayNopHoSo).toLocaleString('vi-VN')} /></Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Trạng thái:</Typography>
                                    <Chip label={tenTrangThaiHoSo} color={getStatusColor(tenTrangThaiHoSo)} size="small" />
                                </Box>
                            </Grid>
                             {lyDoTuChoi && (
                                <Grid item xs={12}><InfoRow label="Lý do từ chối/bổ sung" value={lyDoTuChoi} isMissing={true} /></Grid>
                            )}
                        </Grid>
                    </Paper>
                </Grid>
                
                {/* --- Người nộp --- */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2.5, height: '100%' }} variant="outlined">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} /> THÔNG TIN NGƯỜI NỘP
                        </Typography>
                        <InfoRow label="Họ tên" value={nguoiNopDon.hoTen} />
                        <InfoRow label="Giới tính" value={nguoiNopDon.gioiTinh === 1 ? 'Nam' : 'Nữ'} />
                        <InfoRow label="Ngày sinh" value={nguoiNopDon.ngaySinh ? new Date(nguoiNopDon.ngaySinh).toLocaleDateString('vi-VN') : ''} />
                        <InfoRow label="Số CCCD" value={nguoiNopDon.soCCCD} />
                        <InfoRow label="Số điện thoại" value={nguoiNopDon.soDienThoai} />
                        <InfoRow label="Email" value={nguoiNopDon.email} />
                        <InfoRow label="Địa chỉ" value={nguoiNopDon.diaChi} />
                    </Paper>
                </Grid>

                {/* --- Thủ tục & Giấy tờ --- */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2.5, mb: 3 }} variant="outlined">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                            <GavelIcon sx={{ mr: 1, color: 'primary.main' }} /> THỦ TỤC HÀNH CHÍNH
                        </Typography>
                        <Typography variant="body2">{tenThuTucHanhChinh}</Typography>
                    </Paper>
                    
                    <Paper sx={{ p: 2.5, height: 'calc(100% - 110px)' }} variant="outlined">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                            <AttachFileIcon sx={{ mr: 1, color: 'primary.main' }} /> GIẤY TỜ ĐÍNH KÈM
                        </Typography>
                        <List dense sx={{ p: 0, overflowY: 'auto', maxHeight: 200 }}>
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

                 {/* --- Thông tin thửa đất --- */}
                 <Grid item xs={12}>
                    <Paper sx={{ p: 2.5 }} variant="outlined">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                            <MapIcon sx={{ mr: 1, color: 'primary.main' }} /> THÔNG TIN THỬA ĐẤT
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><InfoRow label="Số thứ tự thửa" value={thongTinThuaDat.soThuTuThua} /></Grid>
                            <Grid item xs={6}><InfoRow label="Số hiệu tờ bản đồ" value={thongTinThuaDat.soHieuToBanDo} /></Grid>
                            <Grid item xs={12}><InfoRow label="Địa chỉ" value={thongTinThuaDat.diaChi} /></Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default HoSoDetailsDisplay;