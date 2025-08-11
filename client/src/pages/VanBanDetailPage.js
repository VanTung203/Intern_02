// client/src/pages/VanBanDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { 
    Container, Typography, Box, CircularProgress, Alert, Paper, Button, Divider, 
    Menu, MenuItem 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import homepageService from '../services/homepageService';

const VanBanDetailPage = () => {
    const { id } = useParams();
    const [legalDoc, setLegalDoc] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- THÊM STATE ĐỂ QUẢN LÝ MENU ---
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    // Hàm để mở menu
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    // Hàm để đóng menu
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        const fetchDocument = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await homepageService.getLegalDocumentById(id);
                setLegalDoc(response.data); 
                setError('');
            } catch (err) {
                setError('Không tìm thấy văn bản hoặc đã có lỗi xảy ra.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocument();
    }, [id]);

    // Hàm tạo tên file động
    const getFileName = (extension) => {
        if (!legalDoc) return `van-ban.${extension}`;
        return `VBPL_${legalDoc.soHieuVanBan.replace(/[/\\?%*:|"<>]/g, '-')}.${extension}`;
    }

    // --- HÀM TẢI FILE .TXT (Đổi tên từ handleDownload) ---
    const handleDownloadTXT = () => {
        if (!legalDoc) return; 
        const formattedDate = new Date(legalDoc.ngayBanHanh).toLocaleDateString('vi-VN');
        const fileContent = `TIÊU ĐỀ: ${legalDoc.tieuDe}\n\nSỐ HIỆU: ${legalDoc.soHieuVanBan}\nNGÀY BAN HÀNH: ${formattedDate}\n\n------------------------------------------\n\n${legalDoc.noiDungVanBan}`;
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = getFileName('txt');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        handleMenuClose(); // Đóng menu sau khi click
    };

    // --- HÀM MỚI ĐỂ TẢI FILE .DOC ---
    const handleDownloadDOC = () => {
        if (!legalDoc) return;
        const formattedDate = new Date(legalDoc.ngayBanHanh).toLocaleDateString('vi-VN');
        
        // Tạo nội dung dưới dạng một chuỗi HTML
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; }
                    p { white-space: pre-wrap; line-height: 1.5; }
                </style>
            </head>
            <body>
                <h1>${legalDoc.tieuDe}</h1>
                <p><strong>Số hiệu:</strong> ${legalDoc.soHieuVanBan}</p>
                <p><strong>Ngày ban hành:</strong> ${formattedDate}</p>
                <hr/>
                <p>${legalDoc.noiDungVanBan}</p>
            </body>
            </html>
        `;

        // Tạo Blob với kiểu 'application/msword'
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = getFileName('doc');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        handleMenuClose(); // Đóng menu sau khi click
    };


    if (loading) {
        return ( <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box> );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ my: 4 }}>
                <Alert severity="error">{error}</Alert>
                {/* <Button component={RouterLink} to="/van-ban" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
                    Quay lại danh sách
                </Button> */}
            </Container>
        );
    }
    
    if (!legalDoc) {
        return null;
    }
    
    const formattedDate = new Date(legalDoc.ngayBanHanh).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });

    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                {/* <Button component={RouterLink} to="/van-ban" startIcon={<ArrowBackIcon />}>
                    Quay lại danh sách
                </Button> */}
                
                {/* --- THAY ĐỔI GIAO DIỆN: NÚT TẢI VỀ GIỜ SẼ MỞ MENU --- */}
                <Button 
                    variant="contained" 
                    startIcon={<DownloadIcon />} 
                    onClick={handleMenuClick}
                    id="download-button"
                    aria-controls={openMenu ? 'download-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                >
                    Tải về
                </Button>
                <Menu
                    id="download-menu"
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleMenuClose}
                    MenuListProps={{
                      'aria-labelledby': 'download-button',
                    }}
                >
                    <MenuItem onClick={handleDownloadDOC}>Dưới dạng Word (.doc)</MenuItem>
                    <MenuItem onClick={handleDownloadTXT}>Dưới dạng văn bản thô (.txt)</MenuItem>
                </Menu>
            </Box>

            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    {legalDoc.tieuDe}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary', my: 2 }}>
                    <Typography variant="body2">Số hiệu: {legalDoc.soHieuVanBan}</Typography>
                    <Typography variant="body2">Ngày ban hành: {formattedDate}</Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box 
                    component="div" 
                    sx={{ 
                        mt: 2, 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word',
                        lineHeight: 1.7,
                    }}
                >
                    {legalDoc.noiDungVanBan}
                </Box>
            </Paper>
        </Container>
    );
};

export default VanBanDetailPage;