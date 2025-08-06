// client/src/components/homepage/LegalDocumentsSection.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, ListItemButton } from '@mui/material';

const LegalDocumentsSection = ({ legalDocs }) => {
    return (
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Văn bản pháp luật
            </Typography>
            <List sx={{ p: 0 }}>
                {legalDocs.map((doc, index) => (
                    <React.Fragment key={doc.id}>
                        {/* Thay ListItem bằng ListItemButton để có hiệu ứng và khả năng điều hướng */}
                        <ListItemButton 
                            component={RouterLink} 
                            to={`/van-ban/${doc.id}`}
                        >
                            <ListItemText 
                                primary={doc.tieuDe}
                                primaryTypographyProps={{ 
                                    sx: { 
                                        fontWeight: '500',
                                        // Giới hạn tiêu đề trong 2 dòng
                                        display: '-webkit-box',
                                        '-webkit-box-orient': 'vertical',
                                        '-webkit-line-clamp': '1',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    } 
                                }}
                                secondary={`Số hiệu: ${doc.soHieuVanBan} - Ngày: ${new Date(doc.ngayBanHanh).toLocaleDateString('vi-VN')}`}
                            />
                        </ListItemButton>
                        {index < legalDocs.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
}

export default LegalDocumentsSection;