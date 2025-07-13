import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const StatBox = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">{label}:</Typography>
        <Box sx={{ display: 'flex', gap: '4px', mt: 0.5 }}>
            {value.toString().padStart(6, '0').split('').map((digit, index) => (
                <Paper key={index} elevation={2} sx={{ p: 1, width: '2.2rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {digit}
                </Paper>
            ))}
        </Box>
    </Box>
);

const StatisticsSection = ({ stats }) => {
    // <<< BỎ BỌC Paper Ở ĐÂY, CHỈ DÙNG Box >>>
    return (
        <Box sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: '12px', backgroundColor: 'background.paper' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid', borderColor: 'grey.500', pb: 1, mb: 3 }}>
                CỔNG DỊCH VỤ CÔNG ĐẤT ĐAI
            </Typography>
            <Box>
                <StatBox label="Số hồ sơ tiếp nhận" value={stats?.soHoSoTiepNhan || 0} />
                <StatBox label="Số hồ sơ đã trả" value={stats?.soHoSoDaTra || 0} />
                <StatBox label="Số hồ sơ đang thụ lý" value={stats?.soHoSoDangThuLy || 0} />
            </Box>
        </Box>
    );
}
export default StatisticsSection;