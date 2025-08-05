import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Grid, Card, CardActionArea, CardContent, CircularProgress, Alert } from '@mui/material';
import homepageService from '../services/homepageService';

const BanTinListPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await homepageService.getAllNews();
                setNews(response.data);
                setError('');
            } catch (err) {
                setError('Không thể tải danh sách bản tin. Vui lòng thử lại sau.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ my: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Bản tin pháp luật
            </Typography>
            <Grid container spacing={3}>
                {news.length > 0 ? (
                    news.map((article) => (
                        <Grid item xs={12} sm={6} md={4} key={article.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardActionArea component={RouterLink} to={`/ban-tin/${article.id}`} sx={{ flexGrow: 1 }}>
                                    <CardContent>
                                        <Typography 
                                            gutterBottom 
                                            variant="h6" 
                                            component="div"
                                            sx={{
                                                fontWeight: 'bold',
                                                display: '-webkit-box',
                                                '-webkit-box-orient': 'vertical',
                                                '-webkit-line-clamp': '2', // Giới hạn 2 dòng
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                minHeight: '3.5em' // Đảm bảo chiều cao tối thiểu cho tiêu đề 2 dòng
                                            }}
                                        >
                                            {article.tieuDe}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary"
                                            sx={{
                                                display: '-webkit-box',
                                                '-webkit-box-orient': 'vertical',
                                                '-webkit-line-clamp': '4', // Giới hạn 4 dòng
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            {article.moTaNgan}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography sx={{ mx: 'auto', mt: 4 }}>Chưa có bản tin nào.</Typography>
                )}
            </Grid>
        </Container>
    );
};

export default BanTinListPage;