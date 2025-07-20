import React from 'react';
import { Box, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

const Step2_NhapThongTin = ({ formData, onDataChange, errors, showValidation }) => {
    const { nguoiNopDon, thongTinThuaDat } = formData;

    const handleChange = (section, event) => {
        const { name, value } = event.target;
        const updatedSectionData = {
            ...formData[section],
            [name]: value
        };
        onDataChange({ [section]: updatedSectionData });
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>2. Nhập thông tin</Typography>
            
            {/* <<< Grid container chính, đảm bảo bố cục 2 cột >>> */}
            <Grid container spacing={4} sx={{ mt: 1 }}>

                {/* === CỘT BÊN TRÁI: THÔNG TIN NGƯỜI NỘP === */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ border: '1px solid', borderColor: 'divider', p: 3, borderRadius: 2, height: '100%' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2.5 }}>
                            <PersonOutlineIcon sx={{ mr: 1 }} />
                            THÔNG TIN NGƯỜI NỘP
                        </Typography>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    required // <<< YÊU CẦU BẮT BUỘC
                                    name="hoTen"
                                    label="Họ tên"
                                    fullWidth
                                    value={nguoiNopDon.hoTen || ''}
                                    onChange={(e) => handleChange('nguoiNopDon', e)}
                                    // <<< HIỂN THỊ LỖI >>>
                                    error={showValidation && !!errors.hoTen}
                                    helperText={showValidation && errors.hoTen}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Giới tính</InputLabel>
                                    <Select
                                        name="gioiTinh"
                                        value={nguoiNopDon.gioiTinh || 1}
                                        label="Giới tính"
                                        onChange={(e) => handleChange('nguoiNopDon', e)}
                                    >
                                        <MenuItem value={1}>Nam</MenuItem>
                                        <MenuItem value={2}>Nữ</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="ngaySinh"
                                    label="Ngày sinh"
                                    type="date"
                                    fullWidth
                                    value={nguoiNopDon.ngaySinh || ''}
                                    onChange={(e) => handleChange('nguoiNopDon', e)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <TextField
                                    name="namSinh"
                                    label="Năm sinh"
                                    type="number"
                                    fullWidth
                                    value={nguoiNopDon.namSinh || ''}
                                    onChange={(e) => handleChange('nguoiNopDon', e)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required // <<< YÊU CẦU BẮT BUỘC
                                    name="soCCCD"
                                    label="Số CCCD"
                                    fullWidth
                                    value={nguoiNopDon.soCCCD || ''}
                                    onChange={(e) => handleChange('nguoiNopDon', e)}
                                    // <<< HIỂN THỊ LỖI >>>
                                    error={showValidation && !!errors.soCCCD}
                                    helperText={showValidation && errors.soCCCD}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required // <<< YÊU CẦU BẮT BUỘC
                                    name="soDienThoai"
                                    label="Số điện thoại"
                                    fullWidth
                                    value={nguoiNopDon.soDienThoai || ''}
                                    onChange={(e) => handleChange('nguoiNopDon', e)}
                                    // <<< HIỂN THỊ LỖI >>>
                                    error={showValidation && !!errors.soDienThoai}
                                    helperText={showValidation && errors.soDienThoai}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="email"
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    value={nguoiNopDon.email || ''}
                                    onChange={(e) => handleChange('nguoiNopDon', e)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="diaChi"
                                    label="Địa chỉ"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={nguoiNopDon.diaChi || ''}
                                    onChange={(e) => handleChange('nguoiNopDon', e)}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                {/* === CỘT BÊN PHẢI: THÔNG TIN THỬA ĐẤT === */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ border: '1px solid', borderColor: 'divider', p: 3, borderRadius: 2, height: '100%' }}>
                         <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 2.5 }}>
                            <MapOutlinedIcon sx={{ mr: 1 }} />
                            THÔNG TIN THỬA ĐẤT
                        </Typography>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <TextField
                                    required // <<< YÊU CẦU BẮT BUỘC
                                    name="soThuTuThua"
                                    label="Số thứ tự thửa"
                                    fullWidth
                                    value={thongTinThuaDat.soThuTuThua || ''}
                                    onChange={(e) => handleChange('thongTinThuaDat', e)}
                                    // <<< HIỂN THỊ LỖI >>>
                                    error={showValidation && !!errors.soThuTuThua}
                                    helperText={showValidation && errors.soThuTuThua}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required // <<< YÊU CẦU BẮT BUỘC
                                    name="soHieuToBanDo"
                                    label="Số hiệu tờ bản đồ"
                                    fullWidth
                                    value={thongTinThuaDat.soHieuToBanDo || ''}
                                    onChange={(e) => handleChange('thongTinThuaDat', e)}
                                    // <<< HIỂN THỊ LỖI >>>
                                    error={showValidation && !!errors.soHieuToBanDo}
                                    helperText={showValidation && errors.soHieuToBanDo}
                                />
                            </Grid>
                             <Grid item xs={12}>
                                <TextField
                                    name="diaChi"
                                    label="Địa chỉ chi tiết"
                                    multiline
                                    rows={4} // Tăng chiều cao một chút cho cân đối
                                    fullWidth
                                    value={thongTinThuaDat.diaChi || ''}
                                    onChange={(e) => handleChange('thongTinThuaDat', e)}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Step2_NhapThongTin;