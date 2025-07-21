import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

const Step5_HoanThanh = ({ soBienNhan }) => {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 5 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>Nộp hồ sơ thành công!</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                Hồ sơ đã được tiếp nhận thành công. Vui lòng sử dụng mã số bên dưới để tra cứu.
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
                <Typography variant="body2" color="text.secondary">Mã hồ sơ:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>{soBienNhan}</Typography>
            </Paper>
            <Button variant="contained" onClick={() => navigate('/')}>
                Về trang chủ
            </Button>
        </Box>
    );
};

export default Step5_HoanThanh;