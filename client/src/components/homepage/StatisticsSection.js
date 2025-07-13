import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

const StatBox = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">{label}:</Typography>
        <Box sx={{ display: 'flex', gap: '4px', mt: 0.5 }}>
            {value.toString().padStart(6, '0').split('').map((digit, index) => (
                <Paper key={index} elevation={2} sx={{ p: 1, width: '2rem', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {digit}
                </Paper>
            ))}
        </Box>
    </Box>
);

const StatisticsSection = ({ stats }) => {
    return (
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                CỔNG DỊCH VỤ CÔNG ĐẤT ĐAI
            </Typography>
            <Box sx={{ mt: 3 }}>
                <StatBox label="Số hồ sơ tiếp nhận" value={stats?.soHoSoTiepNhan || 0} />
                <StatBox label="Số hồ sơ đã trả" value={stats?.soHoSoDaTra || 0} />
                <StatBox label="Số hồ sơ đang thụ lý" value={stats?.soHoSoDangThuLy || 0} />
            </Box>
        </Paper>
    );
}
export default StatisticsSection;