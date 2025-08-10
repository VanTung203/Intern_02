import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Button, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import homepageService from '../services/homepageService';

const VanBanDetailPage = () => {
    const { id } = useParams();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDocument = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await homepageService.getLegalDocumentById(id);
                setDocument(response.data);
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ my: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button component={RouterLink} to="/van-ban" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
                    Quay lại danh sách
                </Button>
            </Container>
        );
    }

    if (!document) {
        return null;
    }
    
    const formattedDate = new Date(document.ngayBanHanh).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });

    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            {/* <Button component={RouterLink} to="/van-ban" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Quay lại danh sách
            </Button> */}
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    {document.tieuDe}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary', my: 2 }}>
                    <Typography variant="body2">Số hiệu: {document.soHieuVanBan}</Typography>
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
                    {document.noiDungVanBan}
                </Box>
            </Paper>
        </Container>
    );
};

export default VanBanDetailPage;