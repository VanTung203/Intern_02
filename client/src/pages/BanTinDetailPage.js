import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import homepageService from '../services/homepageService';

const BanTinDetailPage = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const response = await homepageService.getNewsById(id);
                setArticle(response.data);
                setError('');
            } catch (err) {
                setError('Không tìm thấy bản tin hoặc đã có lỗi xảy ra.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
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
                <Button 
                    component={RouterLink} 
                    to="/ban-tin" 
                    startIcon={<ArrowBackIcon />} 
                    sx={{ mt: 2 }}
                >
                    Quay lại danh sách
                </Button>
            </Container>
        );
    }

    if (!article) {
        return null; // Hoặc một thông báo "Không có dữ liệu"
    }
    
    // Format ngày đăng cho dễ đọc
    const formattedDate = new Date(article.ngayDang).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <Button 
                component={RouterLink} 
                to="/ban-tin" 
                startIcon={<ArrowBackIcon />} 
                sx={{ mb: 2 }}
            >
                Quay lại danh sách
            </Button>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {article.tieuDe}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                    Ngày đăng: {formattedDate}
                </Typography>
                <Box 
                    component="div" 
                    sx={{ 
                        mt: 2, 
                        // Cấu hình để các đoạn văn bản xuống dòng đúng cách
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word',
                        lineHeight: 1.7,
                        fontSize: '1.1rem'
                    }}
                >
                    {article.noiDung}
                </Box>
            </Paper>
        </Container>
    );
};

export default BanTinDetailPage;