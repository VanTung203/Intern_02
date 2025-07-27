// src/components/homepage/NewsSection.js
import React from 'react';
import Slider from 'react-slick';
import { Box, Typography, Card, CardContent } from '@mui/material';

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
                Tin tức
            </Typography>
            <Slider {...settings}>
                {news.map((article) => (
                    <Box key={article.id} sx={{ px: 2 }}>
                        <Card sx={{ height: 220, display: 'flex', flexDirection: 'column' }}> {/* Đặt chiều cao cố định cho Card */}
                            <CardContent sx={{ flexGrow: 1 }}> {/* Cho phép CardContent co giãn để lấp đầy thẻ */}
                                <Typography 
                                    gutterBottom 
                                    variant="h6" 
                                    component="div" 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        // Dùng clamp để giới hạn số dòng hiển thị của tiêu đề
                                        display: '-webkit-box',
                                        '-webkit-box-orient': 'vertical',
                                        '-webkit-line-clamp': '2',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        minHeight: '3.5em' // Đảm bảo chiều cao tối thiểu cho 2 dòng
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
                                        '-webkit-line-clamp': '4', // Giới hạn mô tả trong 4 dòng
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {article.moTaNgan}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Slider>
        </Box>
    );
}

export default NewsSection;