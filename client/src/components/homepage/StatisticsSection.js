// File: client/src/components/homepage/StatisticsSection.js
// Thay thế toàn bộ nội dung file này
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

// Component con để hiển thị một dòng thống kê
const StatBox = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">{label}:</Typography>
        <Box sx={{ display: 'flex', gap: '10px', mt: 0.5 }}>
            {/* Đảm bảo value là một số trước khi gọi toString() */}
            {(typeof value === 'number' ? value : 0).toString().padStart(6, '0').split('').map((digit, index) => (
                <Paper key={index} elevation={2} sx={{ p: 1, width: '2.5rem', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
                    {digit}
                </Paper>
            ))}
        </Box>
    </Box>
);

const StatisticsSection = ({ stats }) => {
    return (
        <Box sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: '12px', backgroundColor: 'background.paper' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid', borderColor: 'grey.500', pb: 1, mb: 3 }}>
                THỐNG KÊ HỒ SƠ
            </Typography>
            <Box>
                {/* Sử dụng tên thuộc tính mới từ DTO */}
                <StatBox label="Tổng số hồ sơ" value={stats?.tongSoHoSo} />
                <StatBox label="Chờ tiếp nhận" value={stats?.soHoSoChoTiepNhan} />
                <StatBox label="Đang thụ lý" value={stats?.soHoSoDangThuLy} />
                <StatBox label="Đã trả kết quả" value={stats?.soHoSoDaTra} />
            </Box>
        </Box>
    );
}

export default StatisticsSection;