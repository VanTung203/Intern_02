// src/components/homepage/NewsSection.js
import React from 'react';
import Slider from 'react-slick';
// --- THÊM IMPORT CardActionArea VÀ Link ---
import { Box, Typography, Card, CardContent, CardActionArea } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NewsSection = ({ news }) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 3,
        autoplay: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
                Bản tin
            </Typography>
            <Slider {...settings}>
                {news.map((article) => (
                    <Box key={article.id} sx={{ px: 2 }}>
                        {/* 
                          Thay đổi ở đây: 
                          - Card sẽ có chiều cao 100% để linh hoạt theo Box cha.
                          - Bọc toàn bộ CardContent bằng CardActionArea.
                          - Dùng props 'component' và 'to' để biến CardActionArea thành một link điều hướng.
                        */}
                        <Card sx={{ height: 220, display: 'flex', flexDirection: 'column' }}>
                            <CardActionArea 
                                component={RouterLink} 
                                to={`/ban-tin/${article.id}`}
                                // Thêm style để CardActionArea chiếm toàn bộ không gian của Card
                                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                            >
                                <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                                    <Typography 
                                        gutterBottom 
                                        variant="h6" 
                                        component="div" 
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            display: '-webkit-box',
                                            '-webkit-box-orient': 'vertical',
                                            '-webkit-line-clamp': '2',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            minHeight: '3.5em'
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
                                            '-webkit-line-clamp': '4',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {article.moTaNgan}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Box>
                ))}
            </Slider>
        </Box>
    );
}

export default NewsSection;