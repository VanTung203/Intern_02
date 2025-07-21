import React, { useState } from 'react';
import {
    Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, CircularProgress, Link as MuiLink, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import hoSoService from '../../services/hoSoService';

const Step3_DinhKemGiayTo = ({ formData, onDataChange, errors, showValidation }) => {
    const [uploadingState, setUploadingState] = useState({});

    // Hàm thêm một dòng giấy tờ mới (rỗng)
    const handleAddRow = () => {
        const newGiayTo = {
            tenLoaiGiayTo: '',
            duongDanTapTin: '',
            fileName: ''
        };
        const updatedGiayToDinhKem = [...formData.giayToDinhKem, newGiayTo];
        onDataChange({ giayToDinhKem: updatedGiayToDinhKem });
    };

    // Hàm xóa một dòng giấy tờ
    const handleRemoveRow = (indexToRemove) => {
        const updatedGiayToDinhKem = formData.giayToDinhKem.filter((_, index) => index !== indexToRemove);
        onDataChange({ giayToDinhKem: updatedGiayToDinhKem });
    };

    // Hàm xử lý khi người dùng nhập tên giấy tờ
    const handleNameChange = (event, index) => {
        const updatedGiayToDinhKem = formData.giayToDinhKem.map((item, i) => {
            if (i === index) {
                return { ...item, tenLoaiGiayTo: event.target.value };
            }
            return item;
        });
        onDataChange({ giayToDinhKem: updatedGiayToDinhKem });
    };

    // Hàm xử lý upload file
    const handleFileUpload = async (event, index) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingState(prev => ({ ...prev, [index]: { uploading: true, error: null } }));
        try {
            const response = await hoSoService.uploadFile(file);
            const { url, fileName } = response.data;

            const updatedGiayToDinhKem = formData.giayToDinhKem.map((item, i) => {
                if (i === index) {
                    return { ...item, duongDanTapTin: url, fileName: fileName };
                }
                return item;
            });
            onDataChange({ giayToDinhKem: updatedGiayToDinhKem });
        } catch (err) {
            console.error("File upload error:", err);
            setUploadingState(prev => ({ ...prev, [index]: { uploading: false, error: 'Tải lên thất bại' } }));
        } finally {
            setUploadingState(prev => ({ ...prev, [index]: { uploading: false } }));
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>3. Đính kèm giấy tờ</Typography>
            
            {showValidation && errors.giayTo && (
                <Alert severity="error" sx={{ mb: 2 }}>{errors.giayTo}</Alert>
            )}
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: 'grey.200' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tên giấy tờ *</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tập tin đính kèm *</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>#</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formData.giayToDinhKem.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <Typography color="text.secondary" sx={{ py: 3 }}>
                                        Chưa có giấy tờ nào. Vui lòng nhấn "+ Thêm giấy tờ đính kèm".
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}

                        {formData.giayToDinhKem.map((giayTo, index) => {
                            const hasNameError = showValidation && !giayTo.tenLoaiGiayTo.trim();
                            const hasFileError = showValidation && !giayTo.duongDanTapTin;

                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            variant="standard"
                                            placeholder="Nhập tên giấy tờ..."
                                            value={giayTo.tenLoaiGiayTo}
                                            onChange={(e) => handleNameChange(e, index)}
                                            error={hasNameError}
                                            helperText={hasNameError ? "Tên giấy tờ là bắt buộc" : ""}
                                        />
                                    </TableCell>
                                    <TableCell align="center" sx={{ minWidth: 160 }}>
                                        {giayTo.duongDanTapTin ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
                                                <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                                                <MuiLink href={giayTo.duongDanTapTin} target="_blank" rel="noopener noreferrer" variant="body2">{giayTo.fileName}</MuiLink>
                                            </Box>
                                        ) : (
                                            <Button
                                                component="label"
                                                variant="outlined"
                                                size="small"
                                                startIcon={uploadingState[index]?.uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                                disabled={uploadingState[index]?.uploading}
                                                color={hasFileError ? 'error' : 'primary'}
                                            >
                                                Tải lên
                                                <input type="file" hidden onChange={(e) => handleFileUpload(e, index)} />
                                            </Button>
                                        )}
                                        {uploadingState[index]?.error && <Typography color="error" variant="caption">{uploadingState[index].error}</Typography>}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleRemoveRow(index)} color="error" size="small">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        
                        <TableRow>
                            <TableCell colSpan={3} sx={{ borderBottom: 'none' }}>
                                <Button startIcon={<AddIcon />} onClick={handleAddRow} sx={{ color: 'text.secondary' }}>
                                    Thêm giấy tờ đính kèm
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Step3_DinhKemGiayTo;