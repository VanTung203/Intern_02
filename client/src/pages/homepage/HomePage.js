import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import homepageService from '../../services/homepageService';
// Chúng ta sẽ tạo các component này ngay sau đây
import StatisticsSection from '../../components/homepage/StatisticsSection';
import LookupSection from '../../components/homepage/LookupSection';
import NewsSection from '../../components/homepage/NewsSection';
import LegalDocumentsSection from '../../components/homepage/LegalDocumentsSection';

const HomePage = () => {
    const [stats, setStats] = useState(null);
    const [news, setNews] = useState([]);
    const [legalDocs, setLegalDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomepageData = async () => {
            try {
                setLoading(true);
                // Gọi đồng thời các API để tăng tốc độ tải trang
                const [statsRes, newsRes, legalDocsRes] = await Promise.all([
                    homepageService.getStatistics(),
                    homepageService.getRecentNews(6), // Lấy 6 tin để carousel có thể trượt
                    homepageService.getRecentLegalDocuments(5)
                ]);

                setStats(statsRes.data);
                setNews(newsRes.data);
                setLegalDocs(legalDocsRes.data);

            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
                // Có thể thêm state để hiển thị thông báo lỗi trên UI
            } finally {
                setLoading(false);
            }
        };

        fetchHomepageData();
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần khi component mount

    if (loading) {
        return <Typography align="center" sx={{ mt: 4 }}>Đang tải dữ liệu trang chủ...</Typography>;
    }

    return (
        <Box>
            {/* Mục tra cứu nhanh */}
            <LookupSection />

            {/* Mục tin tức */}
            <NewsSection news={news} />

            {/* Phần nội dung chính: Thống kê và Văn bản */}
            <Grid container spacing={10} sx={{ mt: 4 }}>
                <Grid item xs={12} md={4}>
                    <StatisticsSection stats={stats} />
                </Grid>
                <Grid item xs={12} md={8}>
                    <LegalDocumentsSection legalDocs={legalDocs} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomePage;