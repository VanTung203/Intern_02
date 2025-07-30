import React, { useState } from 'react';
import {
    Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, CircularProgress, Alert,
    Modal, Fade, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import hoSoService from '../../services/hoSoService';

// Style cho Modal xem trước file
const viewerModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', md: '80%' }, // Responsive
    height: { xs: '80%', md: '90%' },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 2,
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column'
};

const Step3_DinhKemGiayTo = ({ formData, onDataChange, errors, showValidation }) => {
    const [uploadingState, setUploadingState] = useState({});

    const [viewingFile, setViewingFile] = useState(null); // State để lưu thông tin file đang xem

    const [fileError, setFileError] = useState(''); // State cho lỗi validation ở client
    // Các quy tắc này nên đồng bộ với appsettings.json ở backend
    const allowedFileTypes = ".pdf, .doc, .docx, .jpg, .jpeg, .png";
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    const handleOpenFileViewer = (file) => {
        setViewingFile(file);
    };

    const handleCloseFileViewer = () => {
        setViewingFile(null);
    };

    // Hàm kiểm tra xem file có thể xem trực tiếp trong trình duyệt không
    const isViewableInBrowser = (fileName) => {
        if (!fileName) return false;
        const lowerCaseName = fileName.toLowerCase();
        const viewableExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.svg', '.webp'];
        return viewableExtensions.some(ext => lowerCaseName.endsWith(ext));
    };

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

        // Dọn dẹp input để người dùng có thể chọn lại cùng file nếu bị lỗi
        const inputElement = event.target;

        // VALIDATION PHÍA CLIENT
        const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
        if (!allowedExtensions.includes(fileExtension)) {
            setFileError(`Loại file không hợp lệ. Chỉ chấp nhận: ${allowedFileTypes}`);
            inputElement.value = ""; // Reset input
            return;
        }

        if (file.size > maxFileSize) {
            setFileError(`Kích thước file quá lớn. Tối đa cho phép là ${maxFileSize / 1024 / 1024}MB.`);
            inputElement.value = ""; // Reset input
            return;
        }

        setUploadingState(prev => ({ ...prev, [index]: { uploading: true, error: null } }));
        try {
            const response = await hoSoService.uploadFile(file);
            const { url, fileName } = response.data;

            // <<< THÊM DÒNG NÀY ĐỂ DEBUG >>>
            console.log("URL trả về từ backend:", url); 

            const updatedGiayToDinhKem = formData.giayToDinhKem.map((item, i) => {
                if (i === index) {
                    return { ...item, duongDanTapTin: url, fileName: fileName };
                }
                return item;
            });
            onDataChange({ giayToDinhKem: updatedGiayToDinhKem });
        } catch (err) {
            console.error("File upload error:", err.response?.data || err);
            // Hiển thị lỗi từ server nếu có (ví dụ: backend thay đổi quy tắc)
            const serverErrorMessage = err.response?.data?.message || 'Tải lên thất bại';
            setUploadingState(prev => ({ ...prev, [index]: { uploading: false, error: serverErrorMessage } }));
        } finally {
            setUploadingState(prev => ({ ...prev, [index]: { uploading: false } }));
            inputElement.value = ""; // Reset input sau khi upload xong
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>4. Đính kèm giấy tờ</Typography>
            
            {showValidation && errors.giayTo && (
                <Alert severity="error" sx={{ mb: 2 }}>{errors.giayTo}</Alert>
            )}
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: 'grey.200' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tên giấy tờ *</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Tập tin đính kèm *</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
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
                                                <Button 
                                                    size="small" 
                                                    variant="text" 
                                                    onClick={() => handleOpenFileViewer(giayTo)}
                                                    sx={{ textTransform: 'none', p: 0.2, fontWeight: 500 }}
                                                >
                                                    {giayTo.fileName || 'file_da_upload.pdf'}
                                                </Button>
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
                                                <input type="file" hidden onChange={(e) => handleFileUpload(e, index)} accept={allowedFileTypes} />
                                            </Button>
                                        )}
                                        {uploadingState[index]?.error && <Typography color="error" variant="caption">{uploadingState[index].error}</Typography>}
                                    </TableCell>
                                    <TableCell align="right">
                                            <IconButton onClick={() => handleOpenFileViewer(giayTo)} color="primary" size="small" disabled={!giayTo.duongDanTapTin}>
                                                <VisibilityIcon />
                                            </IconButton>
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

            <Modal open={!!viewingFile} onClose={handleCloseFileViewer} closeAfterTransition>
                <Fade in={!!viewingFile}>
                    <Box sx={viewerModalStyle}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
                            <Typography variant="h6" noWrap>{viewingFile?.fileName}</Typography>
                            <IconButton onClick={handleCloseFileViewer}><CloseIcon /></IconButton>
                        </Box>

                        {viewingFile && isViewableInBrowser(viewingFile.fileName) ? (
                            // Dùng iframe để hiển thị PDF, ảnh...
                            <iframe 
                                src={viewingFile.duongDanTapTin}
                                title={viewingFile.fileName}
                                style={{ width: '100%', height: '100%', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                        ) : (
                            // Fallback cho các file không xem được (Word, Excel...)
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: 'grey.100', borderRadius: '4px' }}>
                                <Typography sx={{ mb: 2 }}>Trình duyệt không thể hiển thị trực tiếp file này.</Typography>
                                <Button
                                    variant="contained"
                                    component="a" // Dùng như thẻ <a>
                                    href={viewingFile?.duongDanTapTin}
                                    download // Thuộc tính này sẽ trigger việc tải file
                                >
                                    Tải về: {viewingFile?.fileName}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* <<< THÊM COMPONENT Snackbar ĐỂ HIỂN THỊ LỖI >>> */}
            <Snackbar
                open={!!fileError}
                autoHideDuration={6000}
                onClose={() => setFileError('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setFileError('')} severity="error" sx={{ width: '100%' }}>
                    {fileError}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Step3_DinhKemGiayTo;