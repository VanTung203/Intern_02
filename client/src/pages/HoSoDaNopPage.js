import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert, Chip } from '@mui/material';
import hoSoService from '../services/hoSoService';

const HoSoDaNopPage = () => {
    const [hoSoList, setHoSoList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHoSo = async () => {
            try {
                const response = await hoSoService.getMySubmissions();
                setHoSoList(response.data);
            } catch (err) {
                setError('Không thể tải danh sách hồ sơ. Vui lòng thử lại.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHoSo();
    }, []);

    const getStatusChip = (status) => {
        switch (status) {
            case 'Đã tiếp nhận': return <Chip label={status} color="info" size="small" />;
            case 'Đã trả kết quả': return <Chip label={status} color="success" size="small" />;
            case 'Bị từ chối': return <Chip label={status} color="error" size="small" />;
            default: return <Chip label={status} color="default" size="small" />; // Đã nộp
        }
    };

    if (loading) return <Container sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Hồ sơ đã nộp</Typography>
            <Paper sx={{ p: 2, boxShadow: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                                <TableCell>Số biên nhận</TableCell>
                                <TableCell>Tên thủ tục</TableCell>
                                <TableCell>Ngày nộp</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell align="right">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {hoSoList.length === 0 ? (
                                <TableRow><TableCell colSpan={5} align="center">Bạn chưa nộp hồ sơ nào.</TableCell></TableRow>
                            ) : (
                                hoSoList.map((hoSo) => (
                                    <TableRow key={hoSo.soBienNhan}>
                                        <TableCell>{hoSo.soBienNhan}</TableCell>
                                        <TableCell>{hoSo.tenThuTuc}</TableCell>
                                        <TableCell>{new Date(hoSo.ngayNop).toLocaleDateString('vi-VN')}</TableCell>
                                        <TableCell>{getStatusChip(hoSo.trangThai)}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate(`/chinh-sua-ho-so/${hoSo.soBienNhan}`)}
                                                // Chỉ cho phép sửa khi hồ sơ ở trạng thái "Đã nộp"
                                                disabled={hoSo.trangThai !== 'Đã nộp'}
                                            >
                                                Chỉnh sửa
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default HoSoDaNopPage;