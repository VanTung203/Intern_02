import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, List, ListItemButton, ListItemText, Divider, Paper } from '@mui/material';
import homepageService from '../services/homepageService';

const VanBanListPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                const response = await homepageService.getAllLegalDocuments();
                setDocuments(response.data);
                setError('');
            } catch (err) {
                setError('Không thể tải danh sách văn bản. Vui lòng thử lại sau.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
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
                Văn bản Pháp luật
            </Typography>
            <Paper elevation={2}>
                <List sx={{ p: 0 }}>
                    {documents.length > 0 ? (
                        documents.map((doc, index) => (
                            <React.Fragment key={doc.id}>
                                <ListItemButton component={RouterLink} to={`/van-ban/${doc.id}`}>
                                    <ListItemText
                                        primary={doc.tieuDe}
                                        primaryTypographyProps={{ sx: { fontWeight: '500' } }}
                                        secondary={`Số hiệu: ${doc.soHieuVanBan} - Ngày ban hành: ${new Date(doc.ngayBanHanh).toLocaleDateString('vi-VN')}`}
                                    />
                                </ListItemButton>
                                {index < documents.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Typography sx={{ p: 3, textAlign: 'center' }}>Chưa có văn bản nào.</Typography>
                    )}
                </List>
            </Paper>
        </Container>
    );
};

export default VanBanListPage;