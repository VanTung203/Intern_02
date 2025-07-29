import React from 'react';
import { Box, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

// Đổi tên component cho khớp với tên file
const Step2_1_ThongTinNguoiNop = ({ formData, onDataChange, errors, showValidation }) => {
    const { nguoiNopDon } = formData;

    const handleChange = (event) => {
        const { name, value } = event.target;
        const updatedSectionData = {
            ...nguoiNopDon,
            [name]: value
        };
        onDataChange({ nguoiNopDon: updatedSectionData });
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <PersonOutlineIcon sx={{ mr: 1 }} />
                2. THÔNG TIN NGƯỜI NỘP
            </Typography>
            <Paper sx={{ p: 3, borderRadius: 2 }} variant="outlined">
                <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            required
                            name="hoTen"
                            label="Họ tên"
                            fullWidth
                            value={nguoiNopDon.hoTen || ''}
                            onChange={handleChange}
                            error={showValidation && !!errors.hoTen}
                            helperText={showValidation && errors.hoTen}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Giới tính</InputLabel>
                            <Select name="gioiTinh" value={nguoiNopDon.gioiTinh || 1} label="Giới tính" onChange={handleChange}>
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
                            onChange={handleChange}
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
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            name="soCCCD"
                            label="Số CCCD"
                            fullWidth
                            value={nguoiNopDon.soCCCD || ''}
                            onChange={handleChange}
                            error={showValidation && !!errors.soCCCD}
                            helperText={showValidation && errors.soCCCD}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            name="soDienThoai"
                            label="Số điện thoại"
                            fullWidth
                            value={nguoiNopDon.soDienThoai || ''}
                            onChange={handleChange}
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
                            onChange={handleChange}
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
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default Step2_1_ThongTinNguoiNop;